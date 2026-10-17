const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { initializeNotificationSession } = require("../src/notificationSession");

class IPC extends EventEmitter {
    handlers = new Map();
    handle(channel, fn) { this.handlers.set(channel, fn); }
    invoke(channel, event, value) { return this.handlers.get(channel)(event, value); }
}

const setup = () => {
    const workers = new EventEmitter();
    workers.getAllRunning = () => ({});
    const session = {
        serviceWorkers: workers, preloads: [],
        registerPreloadScript(script) { this.preloads.push(script); return String(this.preloads.length); },
        unregisterPreloadScript() {},
        setPermissionCheckHandler(fn) { this.check = fn; },
        setPermissionRequestHandler(fn) { this.request = fn; }
    };
    const contents = new EventEmitter();
    const messages = [];
    const frame = { url: "https://chat.google.com/", send: (...args) => messages.push(args) };
    contents.mainFrame = { framesInSubtree: [frame] };
    contents.ipc = new IPC();
    contents.session = session;
    contents.isDestroyed = () => false;
    contents.loadURL = async (url) => { contents.url = url; };
    const config = { enableNativeNotifications: true, showNotificationPreview: true, unread: "Unread" };
    const changes = new EventEmitter();
    const displayed = [];
    let focused = 0;
    const manager = {
        getSettings: () => ({ ...config }),
        onSettingsChanged: (fn) => { changes.on("settings", fn); return () => changes.off("settings", fn); },
        showMainWindow: () => { focused++; },
        createNotification(options, handlers) {
            const notification = { options, handlers, closed: false,
                close() { this.closed = true; handlers.close?.(); } };
            displayed.push(notification);
            return notification;
        }
    };
    initializeNotificationSession({ webContents: contents }, manager);
    const event = { sender: contents, senderFrame: frame, type: "frame" };
    const options = { id: "message-1", scope: "https://chat.google.com/", title: "Anna", body: "Hi", tag: "" };
    return { contents, session, config, changes, manager, displayed, event, options, frame, messages, focused: () => focused };
};

test("checks frame ownership and exact origins for config, activation and delivery", () => {
    const { contents, event, options, displayed, focused } = setup();
    const foreign = { ...event, senderFrame: { url: "https://chat.google.com.attacker.test/" } };
    contents.ipc.emit("gchat:notification-settings", foreign);
    assert.equal(foreign.returnValue, null);
    contents.ipc.emit("gchat:notification-activate", foreign);
    assert.equal(foreign.returnValue, false);
    assert.equal(focused(), 0);
    assert.throws(() => contents.ipc.invoke("gchat:notification-show", foreign, options));
    assert.throws(() => contents.ipc.invoke("gchat:notification-show", { ...event, sender: {} }, options));
    assert.equal(displayed.length, 0);
});

test("rechecks privacy and permissions at delivery, including cached browser grants", () => {
    const { contents, session, event, options, config, displayed } = setup();
    config.showNotificationPreview = false;
    contents.ipc.invoke("gchat:notification-show", event, options);
    assert.equal(displayed[0].options.title, "Google Chat");
    assert.equal(displayed[0].options.body, "Unread");
    config.enableNativeNotifications = false;
    assert.throws(() => contents.ipc.invoke("gchat:notification-show", event, { ...options, id: "next" }));
    assert.equal(session.check(null, "notifications", "https://chat.google.com"), false);
    config.enableNativeNotifications = true;
    assert.equal(session.check(null, "notifications", "https://chat.google.com"), true);
    assert.equal(session.check(null, "notifications", "https://accounts.google.com"), false);
    let granted;
    session.request(null, "notifications", (value) => { granted = value; }, { requestingUrl: "https://example.org/" });
    assert.equal(granted, false);
});

test("validates persistent scope and presentation without permitting cross-origin routing", () => {
    const { contents, event, options, displayed } = setup();
    assert.throws(() => contents.ipc.invoke("gchat:notification-show", event, { ...options, scope: "https://mail.google.com/" }));
    assert.throws(() => contents.ipc.invoke("gchat:notification-show", event, { ...options, title: {} }));
    assert.throws(() => contents.ipc.invoke("gchat:notification-show", event, { ...options, id: "a".repeat(101) }));
    contents.ipc.emit("gchat:notification-activate", event, "https://example.org/");
    assert.equal(contents.url, undefined);
    assert.equal(event.returnValue, false);
    assert.equal(displayed.length, 0);
});

test("same registration/tag replaces a notification and privacy changes dismiss all", () => {
    const { contents, event, options, displayed, config, changes, messages } = setup();
    contents.ipc.invoke("gchat:notification-show", event, { ...options, tag: "conversation" });
    contents.ipc.invoke("gchat:notification-show", event, { ...options, id: "message-2", tag: "conversation" });
    assert.equal(displayed[0].closed, true);
    assert.equal(displayed[1].closed, false);
    config.showNotificationPreview = false;
    changes.emit("settings", { ...config });
    assert.equal(displayed[1].closed, true);
    assert.equal(messages.at(-1)[0], "gchat:notification-settings");
    contents.emit("destroyed");
});

test("worker clicks retain the worker until async handler acknowledgement", () => {
    const { session, contents, options, displayed } = setup();
    let ends = 0;
    const worker = { ipc: new IPC(), versionId: 7, scope: options.scope,
        scriptURL: "https://chat.google.com/sw.js", isDestroyed: () => false,
        send() {}, startTask: () => ({ end: () => { ends++; } }) };
    session.serviceWorkers.getWorkerFromVersionID = () => worker;
    session.serviceWorkers.emit("running-status-changed", { versionId: 7, runningStatus: "starting" });
    const event = { type: "service-worker", session, serviceWorker: worker };
    worker.ipc.invoke("gchat:notification-show", event, options);
    displayed[0].handlers.click();
    assert.equal(ends, 0);
    worker.ipc.emit("gchat:notification-event-done", event, options.id);
    assert.equal(ends, 1);
    worker.ipc.emit("gchat:notification-event-done", event, options.id);
    assert.equal(ends, 1, "duplicate acknowledgement must not release twice");
    contents.emit("destroyed");
});

test("another frame cannot close an existing notification", () => {
    const { contents, event, options, displayed } = setup();
    contents.ipc.invoke("gchat:notification-show", event, options);
    contents.ipc.emit("gchat:notification-close", { ...event, senderFrame: { url: "https://chat.google.com/" } }, options.id);
    assert.equal(displayed[0].closed, false);
    contents.ipc.emit("gchat:notification-close", event, options.id);
    assert.equal(displayed[0].closed, true);
    contents.emit("destroyed");
});

test("frame timers expire independently and reject untrusted or invalid requests", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const { contents, event, messages } = setup();
    contents.ipc.emit("gchat:notification-timer", event, "preview", 3);
    contents.ipc.emit("gchat:notification-timer", event, "generic", 5);
    contents.ipc.emit("gchat:notification-timer", event, "invalid", 999999);
    contents.ipc.emit("gchat:notification-timer", { ...event, sender: {} }, "foreign", 1);
    t.mock.timers.tick(2999);
    assert.deepEqual(messages, []);
    t.mock.timers.tick(1);
    assert.deepEqual(messages, [["gchat:notification-expire", "preview"]]);
    t.mock.timers.tick(2000);
    assert.deepEqual(messages.at(-1), ["gchat:notification-expire", "generic"]);
    assert.equal(messages.length, 2);
    contents.emit("destroyed");
});

test("frame timers cancel on close, privacy changes and destruction", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const { contents, event, messages, config, changes } = setup();
    contents.ipc.emit("gchat:notification-timer", event, "cancelled", 3);
    contents.ipc.emit("gchat:notification-cancel-timer", event, "cancelled");
    contents.ipc.emit("gchat:notification-timer", event, "private", 3);
    config.showNotificationPreview = false;
    changes.emit("settings", { ...config });
    t.mock.timers.tick(10000);
    assert.equal(messages.filter(([channel]) => channel === "gchat:notification-expire").length, 0);
    contents.ipc.emit("gchat:notification-timer", event, "destroyed", 3);
    contents.emit("destroyed");
    t.mock.timers.tick(10000);
    assert.equal(messages.filter(([channel]) => channel === "gchat:notification-expire").length, 0);
});

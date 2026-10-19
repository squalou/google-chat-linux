const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { installNotificationAdapter } = require("../src/notificationPreload");
const { isChatOrigin, isChatNavigation } = require("../src/notificationPolicy");

const createRealm = ({ worker = false, href = "https://chat.google.com/u/0/" } = {}) => {
    const created = [];
    class NativeNotification extends EventTarget {
        static permission = "granted";
        static requestPermission() { return Promise.resolve("granted"); }
        constructor(title, options) {
            super(); this.title = title; this.options = options; created.push(this);
        }
        close() { this.closed = true; this.dispatchEvent(new Event("close")); }
    }
    class ServiceWorkerRegistration { constructor() { this.scope = "https://chat.google.com/"; } }
    const settings = { enableNativeNotifications: true, showNotificationPreview: true, unread: "Masz nieprzeczytane wiadomości" };
    const calls = [];
    const timers = new Map();
    const target = new EventTarget();
    const realm = vm.createContext({
        URL, Event, EventTarget, DOMException, structuredClone, crypto: require("node:crypto").webcrypto,
        Notification: NativeNotification, ServiceWorkerRegistration,
        location: { href }, ...(worker ? {} : { window: {} }),
        addEventListener: target.addEventListener.bind(target), dispatchEvent: target.dispatchEvent.bind(target),
        clients: { openWindow: (url) => { calls.push(["external", url]); }, matchAll: async () => [{ url: "https://chat.google.com/", id: "main" }] },
        setTimeout, clearTimeout,
        bridge: {
            settings: () => ({ ...settings }),
            activate: (...args) => { calls.push(["activate", ...args]); return true; },
            show: async (options) => { calls.push(["show", options]); },
            close: (id) => calls.push(["close", id]),
            startTimer: (id, seconds) => timers.set(id, seconds),
            cancelTimer: (id) => timers.delete(id)
        }
    });
    const adapter = vm.runInContext(`(${installNotificationAdapter})(bridge)`, realm);
    return { realm, adapter, settings, calls, created, NativeNotification, target, timers };
};

test("keeps native Notification objects, sender, room, content and routing data", async () => {
    const { realm, created, NativeNotification } = createRealm();
    vm.runInContext('new Notification("Anna · Project room", {body: "Hello 👋", tag: "message-1", data: {url: "/room/1"}})', realm);
    assert.ok(created[0] instanceof NativeNotification);
    assert.equal(created[0].title, "Anna · Project room");
    assert.equal(created[0].options.body, "Hello 👋");
    assert.equal(created[0].options.data.url, "/room/1");
    assert.equal(vm.runInContext('Notification.permission', realm), "granted");
    assert.equal(await vm.runInContext('Notification.requestPermission()', realm), "granted");
});

test("focuses before Google's original click handler", () => {
    const { realm, calls, created } = createRealm();
    realm.onClick = () => calls.push(["google-click"]);
    vm.runInContext('new Notification("Anna", {body:"Hi"}).addEventListener("click", onClick)', realm);
    created[0].dispatchEvent(new Event("click"));
    assert.deepEqual(calls, [["activate"], ["google-click"]]);
});

test("redacts text, images and actions while retaining Google routing data", () => {
    const { realm, settings, created } = createRealm();
    settings.showNotificationPreview = false;
    vm.runInContext('new Notification("Anna", {body:"Secret", icon:"private-avatar", image:"private-image", badge:"private-badge", actions:[{title:"Secret"}], data:{id:42}})', realm);
    assert.equal(created[0].title, "Google Chat");
    assert.equal(created[0].options.body, settings.unread);
    for (const key of ["icon", "image", "badge"]) assert.equal(created[0].options[key], undefined);
    assert.equal(created[0].options.actions.length, 0);
    assert.equal(created[0].options.data.id, 42);
});

test("uses localized fallback without inventing a sender", () => {
    const { realm, created, settings } = createRealm();
    vm.runInContext('new Notification("Anna", {}); new Notification("", {body:"  "})', realm);
    assert.equal(created[0].title, "Anna");
    assert.equal(created[0].options.body, settings.unread);
    assert.equal(created[1].title, "Google Chat");
});

for (const source of ["constructor", "frame", "worker"]) {
    test(`${source} previews are bounded without splitting Unicode graphemes`, async () => {
        const { realm, created, calls } = createRealm({ worker: source === "worker" });
        const cases = [
            ["short body", "Hello 👋", "Hello 👋"],
            ["exact ASCII limit", "a".repeat(1024), "a".repeat(1024)],
            ["one past the limit", "a".repeat(1025), "a".repeat(1023) + "…"],
            ["body larger than the IPC input limit", "a".repeat(100000), "a".repeat(1023) + "…"],
            ["exact astral limit", "👋".repeat(1024), "👋".repeat(1024)],
            ["exact emoji sequence limit", "👋🏽".repeat(512), "👋🏽".repeat(512)],
            ["astral overflow", "👋".repeat(1025), "👋".repeat(1023) + "…"],
            ["skin tone", "a".repeat(1022) + "👋🏽x", "a".repeat(1022) + "…"],
            ["flag", "a".repeat(1022) + "🇵🇱x", "a".repeat(1022) + "…"],
            ["joined family", "a".repeat(1020) + "👨‍👩‍👧‍👦x", "a".repeat(1020) + "…"],
            ["combining accent", "a".repeat(1022) + "e\u0301x", "a".repeat(1022) + "…"],
            ["single oversized grapheme", "e" + "\u0301".repeat(1024), "…"]
        ];
        for (const [label, body, expected] of cases) {
            realm.body = body;
            if (source === "constructor") {
                vm.runInContext('new Notification("Anna · Team", {body, data:{url:"/room/42"}})', realm);
                const notification = created.at(-1);
                assert.equal(notification.options.body, expected, label);
                assert.equal(notification.title, "Anna · Team");
                assert.equal(notification.options.data.url, "/room/42");
            } else {
                await vm.runInContext('globalThis.registration = new ServiceWorkerRegistration(); registration.showNotification("Anna · Team", {body, data:{url:"/room/42"}})', realm);
                assert.equal(calls.at(-1)[1].body, expected, label);
                assert.equal(calls.at(-1)[1].title, "Anna · Team");
                const notifications = await vm.runInContext('registration.getNotifications()', realm);
                assert.equal(notifications.at(-1).body, body, "only the displayed preview is shortened");
                assert.equal(notifications.at(-1).data.url, "/room/42");
            }
            assert.ok(Array.from(expected).length <= 1024, label);
        }
    });
}

test("truncated worker previews retain the original body and routing in Google's click handler", async () => {
    const { realm, adapter, target, calls } = createRealm({ worker: true });
    const body = "👋🏽".repeat(1000);
    realm.body = body;
    let clicked;
    target.addEventListener("notificationclick", (event) => {
        clicked = event.notification;
        event.waitUntil(vm.runInContext('clients.openWindow("/room/42")', realm));
    });
    await vm.runInContext('new ServiceWorkerRegistration().showNotification("Anna", {body, data:{url:"/room/42"}})', realm);
    assert.equal(calls[0][1].body, "👋🏽".repeat(511) + "…");
    await adapter.event(calls[0][1].id, "click");
    assert.equal(clicked.body, body);
    assert.equal(clicked.data.url, "/room/42");
    assert.deepEqual(calls[1], ["activate", "https://chat.google.com/room/42"]);
});

test("settings updates close existing notifications and future notifications use fresh settings", () => {
    const { realm, settings, created, adapter } = createRealm();
    vm.runInContext('new Notification("Anna", {body:"Hi"})', realm);
    settings.showNotificationPreview = false;
    adapter.update(settings);
    assert.equal(created[0].closed, true);
    vm.runInContext('new Notification("Anna", {body:"Hi again"})', realm);
    assert.equal(created[1].title, "Google Chat");
    settings.enableNativeNotifications = false;
    vm.runInContext('new Notification("Anna", {body:"Disabled"})', realm);
    assert.equal(created[2].closed, true);
});

test("installing twice does not wrap or deliver twice", () => {
    const { realm, created } = createRealm();
    vm.runInContext(`(${installNotificationAdapter})(bridge); new Notification("Anna", {body:"Hi"})`, realm);
    assert.equal(created.length, 1);
});

for (const worker of [false, true]) {
    test(`showNotification bridges exactly once in a ${worker ? "worker" : "frame"} and respects settings`, async () => {
        const { realm, calls, settings } = createRealm({ worker });
        await vm.runInContext('globalThis.registration = new ServiceWorkerRegistration(); registration.showNotification("Anna", {body:"Hello 👋", tag:"message", data:{id:7}})', realm);
        assert.equal(calls.length, 1);
        assert.equal(calls[0][0], "show");
        assert.equal(calls[0][1].title, "Anna");
        assert.equal(calls[0][1].body, "Hello 👋");
        assert.equal(calls[0][1].data, undefined, "routing data stays in the realm");
        const notifications = await vm.runInContext('registration.getNotifications({tag:"message"})', realm);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].data.id, 7);
        settings.enableNativeNotifications = false;
        await assert.rejects(vm.runInContext('registration.showNotification("Anna")', realm), { name: "NotAllowedError" });
        assert.equal(calls.length, 1);
    });
}

test("worker click retains notification data and waits for Google's async handler", async () => {
    const { realm, adapter, target, calls } = createRealm({ worker: true });
    let data;
    let finished = false;
    target.addEventListener("notificationclick", (event) => {
        data = event.notification.data;
        event.waitUntil(Promise.resolve().then(() => { finished = true; }));
    });
    await vm.runInContext('new ServiceWorkerRegistration().showNotification("Anna", {data:{url:"/room/42"}})', realm);
    await adapter.event(calls[0][1].id, "click");
    assert.equal(data.url, "/room/42");
    assert.equal(finished, true);
    await vm.runInContext('clients.openWindow("/room/42")', realm);
    assert.deepEqual(calls[1], ["activate", "https://chat.google.com/room/42"]);
});

test("rejects lookalike origins, credentials, insecure URLs and arbitrary navigation", () => {
    for (const url of ["https://chat.google.com.attacker.test/", "http://chat.google.com/", "https://chat.google.com:444/", "https://user:pass@chat.google.com/", "javascript:alert(1)", "bad"]) {
        assert.equal(isChatOrigin(url), false, url);
        assert.equal(isChatNavigation(url), false, url);
    }
    assert.equal(isChatNavigation("https://chat.google.com/u/0/#chat/room/42"), true);
    assert.equal(isChatNavigation("https://mail.google.com/chat/u/0/#chat/room/42"), true);
    assert.equal(isChatNavigation("https://mail.google.com/mail/u/0/"), false);
    assert.equal(createRealm({ href: "https://accounts.google.com/" }).adapter, null);
});

test("timed page notifications request persistence and expire via the main-process timer", () => {
    const { realm, settings, created, adapter, timers } = createRealm();
    settings.notificationDurationSeconds = 10;
    vm.runInContext('new Notification("Anna", {body:"Hello"})', realm);
    assert.equal(created[0].options.requireInteraction, true);
    assert.equal(timers.size, 0, "count from display, not construction");
    created[0].dispatchEvent(new Event("show"));
    const [id, seconds] = [...timers][0];
    assert.equal(seconds, 10);
    adapter.expire(id);
    assert.equal(created[0].closed, true);
    assert.equal(timers.size, 0);
});

test("manual dismissal has no timer; system default retains Google's interaction setting", () => {
    const { realm, settings, created, timers } = createRealm();
    settings.notificationDurationSeconds = -1;
    vm.runInContext('new Notification("Anna", {body:"Hello"})', realm);
    created[0].dispatchEvent(new Event("show"));
    assert.equal(created[0].options.requireInteraction, true);
    assert.equal(timers.size, 0);
    settings.notificationDurationSeconds = 0;
    vm.runInContext('new Notification("Anna", {requireInteraction:false})', realm);
    assert.equal(created[1].options.requireInteraction, false);
});

test("a duration-only update does not dismiss an existing generic notification", () => {
    const { realm, settings, adapter, created } = createRealm();
    settings.showNotificationPreview = false;
    adapter.update({ ...settings });
    vm.runInContext('new Notification("Anna", {body:"Hello"})', realm);
    adapter.update({ ...settings, notificationDurationSeconds: 5 });
    assert.equal(created[0].closed, undefined);
});

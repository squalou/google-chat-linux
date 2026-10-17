const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const vm = require("node:vm");
const fs = require("node:fs");
const source = fs.readFileSync(require.resolve("../src/notifications"), "utf8");

const setup = ({ deferShow = false, noCloseEvent = false } = {}) => {
    const created = [];
    class NativeNotification extends EventEmitter {
        static isSupported = () => true;
        constructor(options) { super(); this.options = options; created.push(this); }
        show() { this.shown = true; if (!deferShow) this.emit("show"); }
        close() { this.closed = true; if (!noCloseEvent) this.emit("close"); }
    }
    const context = vm.createContext({ module: { exports: {} }, console,
        setTimeout: (...args) => setTimeout(...args), clearTimeout: (...args) => clearTimeout(...args),
        require: (name) => name === "electron" ? { Notification: NativeNotification } :
            name === "./paths" ? { normal: () => "app-icon" } :
                name.startsWith("./") ? require("../src/" + name.slice(2)) : require(name)
    });
    vm.runInContext(source, context);
    return { manager: context.module.exports, created };
};

test("manager honors preview defaults, localizes fallback and closes notifications on settings changes", () => {
    const { manager, created } = setup();
    assert.equal(manager.getSettings().showNotificationPreview, true);
    assert.equal(manager.getSettings().enableNativeNotifications, true);
    manager.setNotificationLanguage("pl");
    manager.showTestNotification();
    assert.equal(created[0].options.body, "Natywne powiadomienia działają poprawnie");
    manager.setShowNotificationPreview(false);
    assert.equal(created[0].closed, true);
    manager.showTestNotification();
    assert.equal(created[1].options.body, "Masz nieprzeczytane wiadomości w Google Chat");
    manager.setNativeNotificationsEnabled(false);
    assert.equal(created[1].closed, true);
    manager.showTestNotification();
    assert.equal(created.length, 2);
});

test("native clicks restore and focus the main window before original click work", () => {
    const { manager, created } = setup();
    const calls = [];
    manager.setMainWindow({ isDestroyed: () => false, isMinimized: () => true,
        restore: () => calls.push("restore"), show: () => calls.push("show"), focus: () => calls.push("focus") });
    manager.createNotification({ title: "Anna", body: "Hello" }, { click: () => calls.push("original") });
    created[0].emit("click");
    assert.deepEqual(calls, ["restore", "show", "focus", "original"]);
});

test("preview and generic native notifications use independent durations", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const { manager, created } = setup();
    manager.setNotificationDurations(3, 10);
    manager.createNotification({ title: "Anna", body: "Hello" });
    assert.equal(created[0].options.timeoutType, "never");
    t.mock.timers.tick(2999);
    assert.equal(created[0].closed, undefined);
    t.mock.timers.tick(1);
    assert.equal(created[0].closed, true);
    manager.setShowNotificationPreview(false);
    manager.showTestNotification();
    t.mock.timers.tick(9999);
    assert.equal(created[1].closed, undefined);
    t.mock.timers.tick(1);
    assert.equal(created[1].closed, true);
});

test("native timeout starts on display and releases even without a platform close event", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const { manager, created } = setup({ deferShow: true, noCloseEvent: true });
    let closes = 0;
    manager.setNotificationDurations(5, 10);
    manager.createNotification({}, { close: () => { closes++; } });
    t.mock.timers.tick(60000);
    assert.equal(created[0].closed, undefined);
    created[0].emit("show");
    t.mock.timers.tick(5000);
    assert.equal(created[0].closed, true);
    assert.equal(closes, 1);
    created[0].emit("close");
    assert.equal(closes, 1);
});

test("duration changes apply to future notifications and manual dismissal has no expiry", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const { manager, created } = setup();
    manager.setNotificationDurations(10, 3);
    manager.showTestNotification();
    manager.setNotificationDurations(-1, 5);
    manager.showTestNotification();
    t.mock.timers.tick(10000);
    assert.equal(created[0].closed, true);
    assert.equal(created[1].closed, undefined);
    assert.equal(created[1].options.timeoutType, "never");
    manager.closeAllNotifications();
    assert.equal(created[1].closed, true);
});

// Isolated Electron integration checks. Fixtures are synthetic, not captured
// Google Chat traffic. No login/profile data or network connection is used.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

if (!process.versions.electron) {
    const { spawnSync } = require("node:child_process");
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "gchat-notification-test-"));
    const env = { ...process.env };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.ELECTRON_DISABLE_SANDBOX;
    const result = spawnSync(require("electron"), [__filename, profile], { env, stdio: "inherit", timeout: 45000 });
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
    process.exit(result.status ?? 1);
}

const { app, BrowserWindow, session, Menu } = require("electron");
const { EventEmitter } = require("node:events");
const { initializeNotificationSession } = require("../src/notificationSession");
const { getNotificationDuration } = require("../src/notificationDuration");
app.setPath("userData", process.argv[2]);
app.setPath("appData", process.argv[2]);
app.commandLine.appendSwitch("disable-gpu");

const workerScript = `
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
self.addEventListener('message', event => {
    if (event.data?.type === 'notify') event.waitUntil(
        registration.showNotification(event.data.title, {
            body: event.data.body, tag: 'worker', data: {url: '/room/42'}
        }).then(() => event.ports[0].postMessage('shown'))
          .catch(error => event.ports[0].postMessage(error.name))
    );
});
self.addEventListener('notificationclick', event => {
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
`;

const waitFor = async (predicate) => {
    for (let i = 0; i < 250; i++) {
        if (await predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error("Timed out waiting for notification event");
};

const timeout = setTimeout(() => { console.error("Notification integration test timed out"); app.exit(1); }, 30000);
app.whenReady().then(async () => {
    const config = { enableNativeNotifications: true, showNotificationPreview: true, unread: "Unread test messages" };
    const changes = new EventEmitter();
    const displayed = [];
    let focused = 0;
    const manager = {
        getSettings: () => ({ ...config, notificationDurationSeconds: getNotificationDuration(config) }),
        onSettingsChanged: (fn) => { changes.on("settings", fn); return () => changes.off("settings", fn); },
        showMainWindow: () => { focused++; },
        createNotification: (options, handlers) => {
            const notification = { options, handlers, closed: false,
                close() { this.closed = true; handlers.close?.(); } };
            displayed.push(notification);
            return notification;
        }
    };
    const ses = session.fromPartition("notification-test");
    // A display fixture for timer checks independent of an installed OS daemon.
    // All other pages below still use Chromium's real Notification objects.
    const timingPreload = path.join(process.argv[2], "timing-preload.js");
    fs.writeFileSync(timingPreload, `require('electron').contextBridge.executeInMainWorld({func: () => {
        if (location.pathname !== '/timing-fixture') return;
        globalThis.Notification = class extends EventTarget {
            constructor(title, options) { super(); this.title = title; this.options = options;
                this.closed = false; queueMicrotask(() => this.dispatchEvent(new Event('show'))); }
            close() { this.closed = true; this.dispatchEvent(new Event('close')); }
        };
    }});`);
    ses.registerPreloadScript({ type: "frame", filePath: timingPreload });
    await ses.protocol.handle("https", (request) => new Response(
        new URL(request.url).pathname === "/sw.js" ? workerScript : "<!doctype html><title>Notification fixture</title>",
        { headers: { "Content-Type": new URL(request.url).pathname === "/sw.js" ? "application/javascript" : "text/html" } }
    ));
    const win = new BrowserWindow({ show: false, webPreferences: {
        session: ses, sandbox: true, contextIsolation: true, nodeIntegration: false, nodeIntegrationInSubFrames: true
    } });
    const errors = [];
    win.webContents.on("preload-error", (_event, _file, error) => errors.push(error.message));
    win.webContents.on("console-message", (event) => {
        if (event.level === "error") console.error("Synthetic fixture:", event.message);
    });
    initializeNotificationSession(win, manager);
    const execute = (code) => win.webContents.executeJavaScript(code).catch((error) => {
        console.error("Synthetic fixture execution failed:", code);
        throw error;
    });
    await win.loadURL("https://chat.google.com/");

    // Real Chromium Notification instances; close immediately to avoid test banners.
    const native = await execute(`(() => {
        const n = new Notification('Anna · Team', {body: 'Hello 👋'});
        let clicked = false; n.onclick = () => { clicked = true; };
        n.dispatchEvent(new Event('click')); n.close();
        return {title:n.title, body:n.body, native:n instanceof Notification, clicked, permission:Notification.permission};
    })()`);
    assert.deepEqual(native, { title: "Anna · Team", body: "Hello 👋", native: true, clicked: true, permission: "granted" });
    assert.equal(focused, 1);

    config.notificationPreviewDurationSeconds = 1;
    config.notificationGenericDurationSeconds = 2;
    changes.emit("settings", manager.getSettings());
    await execute(`(async () => {
        const f = document.createElement('iframe'); f.src = 'https://chat.google.com/timing-fixture'; f.id = 'timing';
        const loaded = new Promise(resolve => { f.onload = resolve; }); document.body.append(f); await loaded;
        f.contentWindow.timed = new f.contentWindow.Notification('Timed preview', {body:'Hello'});
    })()`);
    const timing = "document.getElementById('timing').contentWindow";
    assert.equal(await execute(`${timing}.timed.options.requireInteraction`), true);
    await waitFor(() => execute(`${timing}.timed.closed`));
    config.showNotificationPreview = false;
    changes.emit("settings", manager.getSettings());
    await execute(`${timing}.generic = new (${timing}.Notification)('Generic', {body:'Private'}); void 0`);
    assert.equal(await execute(`${timing}.generic.title`), "Google Chat");
    await new Promise((resolve) => setTimeout(resolve, 1100));
    assert.equal(await execute(`${timing}.generic.closed`), false, "generic duration is independently two seconds");
    await waitFor(() => execute(`${timing}.generic.closed`));
    config.showNotificationPreview = true;
    config.notificationPreviewDurationSeconds = 0;
    config.notificationGenericDurationSeconds = 0;
    changes.emit("settings", manager.getSettings());

    // A Google Chat iframe must receive its adapter before its page scripts.
    assert.equal(await execute(`(async () => {
        const f = document.createElement('iframe'); f.src = 'https://chat.google.com/frame';
        const loaded = new Promise(resolve => { f.onload = resolve; }); document.body.append(f); await loaded;
        const n = new f.contentWindow.Notification('Iframe sender', {body:'Iframe body'});
        const body = n.body; n.close(); return body;
    })()`), "Iframe body");

    await execute(`(async () => {
        await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true}));
    })()`);
    const notifyWorker = (title = "Worker sender", body = "Worker body") => execute(`new Promise(resolve => {
        const channel = new MessageChannel(); channel.port1.onmessage = e => {channel.port1.close(); resolve(e.data);};
        navigator.serviceWorker.controller.postMessage(${JSON.stringify({ type: "notify", title, body })}, [channel.port2]);
    })`);
    assert.equal(await notifyWorker(), "shown");
    assert.equal(displayed.length, 1);
    assert.equal(displayed[0].options.title, "Worker sender");
    assert.equal(displayed[0].options.body, "Worker body");
    displayed[0].handlers.click();
    await waitFor(() => win.webContents.getURL() === "https://chat.google.com/room/42");
    assert.ok(focused >= 2);

    // Document showNotification() must relay its click to the owning worker too.
    await execute(`(async () => {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Document sender', {body:'Document body', data:{url:'/room/42?from=document'}});
    })()`);
    assert.equal(displayed.length, 2);
    displayed[1].handlers.click();
    // The worker fixture deliberately uses the supplied data, not a guessed URL.
    await waitFor(() => win.webContents.getURL().includes("from=document"));

    // Exercise actual stop/start cycles: Electron retains the worker's IPC
    // emitter, so registrations must be removed before the next start.
    win.webContents.debugger.attach("1.3");
    await win.webContents.debugger.sendCommand("ServiceWorker.enable");
    for (let cycle = 0; cycle < 3; cycle++) {
        const [version] = Object.keys(ses.serviceWorkers.getAllRunning());
        const stopped = new Promise((resolve) => {
            const listener = ({ versionId, runningStatus }) => {
                if (String(versionId) !== version || runningStatus !== "stopped") return;
                ses.serviceWorkers.off("running-status-changed", listener);
                resolve();
            };
            ses.serviceWorkers.on("running-status-changed", listener);
        });
        await win.webContents.debugger.sendCommand("ServiceWorker.stopWorker", { versionId: version });
        await stopped;
        await ses.serviceWorkers.startWorkerForScope("https://chat.google.com/");
        const count = displayed.length;
        assert.equal(await notifyWorker(`Restart ${cycle}`, "After restart"), "shown");
        assert.equal(displayed.length, count + 1);
        assert.equal(displayed.at(-1).options.title, `Restart ${cycle}`);
        displayed.at(-1).close();
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    win.webContents.debugger.detach();

    config.showNotificationPreview = false;
    changes.emit("settings", { ...config });
    assert.deepEqual(await execute(`(() => {
        const n = new Notification('Secret sender', {body:'Secret text', icon:'https://chat.google.com/avatar'});
        const result = {title:n.title, body:n.body, icon:n.icon}; n.close(); return result;
    })()`), { title: "Google Chat", body: config.unread, icon: "" });
    assert.equal(await notifyWorker("Private sender", "Private body"), "shown");
    assert.equal(displayed.at(-1).options.title, "Google Chat");
    assert.equal(displayed.at(-1).options.body, config.unread);

    config.enableNativeNotifications = false;
    changes.emit("settings", { ...config });
    assert.equal(displayed.at(-1).closed, true);
    const count = displayed.length;
    assert.equal(await notifyWorker(), "NotAllowedError");
    assert.equal(displayed.length, count);
    assert.equal(await execute("Notification.permission"), "denied");

    config.enableNativeNotifications = true;
    config.showNotificationPreview = true;
    changes.emit("settings", { ...config });
    assert.equal(await notifyWorker("Another sender", "Another message"), "shown");
    assert.equal(displayed.at(-1).options.title, "Another sender");
    assert.equal(displayed.at(-1).options.body, "Another message");
    assert.deepEqual(errors, []);
    win.destroy();

    // Exercise the real application menu and on-disk settings in this temp profile.
    const initialConfig = { bounds: { width: 900, height: 600 }, startHidden: true,
        keepMinimized: true, useTray: false, iconTheme: "default", enableNativeNotifications: true,
        showNotificationPreview: true, notificationPreviewDurationSeconds: 0, notificationGenericDurationSeconds: 0 };
    const configFile = path.join(process.argv[2], "google-hangouts-chat-linux.json");
    fs.writeFileSync(configFile, JSON.stringify(initialConfig));
    await session.defaultSession.protocol.handle("https", () => new Response("<!doctype html><title>Menu fixture</title>",
        { headers: { "Content-Type": "text/html" } }));
    const WindowManager = require("../src/window");
    const menuWindow = WindowManager.initializeWindow(initialConfig);
    const durationMenu = () => Menu.getApplicationMenu().items.find((item) => item.label === "Menu")
        .submenu.items.find((item) => item.label === "Notification duration").submenu;
    durationMenu().items[0].submenu.items.find((item) => item.label === "5 seconds").click();
    durationMenu().items[1].submenu.items.find((item) => item.label === "15 seconds").click();
    assert.equal(durationMenu().items[0].submenu.items.find((item) => item.label === "5 seconds").checked, true);
    assert.equal(durationMenu().items[1].submenu.items.find((item) => item.label === "15 seconds").checked, true);
    const saved = JSON.parse(fs.readFileSync(configFile));
    assert.equal(saved.notificationPreviewDurationSeconds, 5);
    assert.equal(saved.notificationGenericDurationSeconds, 15);
    menuWindow.destroy();
    clearTimeout(timeout);
    console.log(`PASS: Electron ${process.versions.electron}: native objects, iframe, worker/document delivery, clicks, worker restarts, separate duration timers, menu persistence, live privacy and disable/re-enable (synthetic fixtures; no tray).`);
    app.quit();
}).catch((error) => { console.error(error); app.exit(1); });

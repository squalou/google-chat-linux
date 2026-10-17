const path = require("node:path");
const { isChatOrigin, isChatNavigation } = require("./notificationPolicy");
const { normalizeNotificationDuration } = require("./notificationDuration");

// This session belongs to the app's one main window, independently of the tray.
const initializeNotificationSession = (window, manager) => {
    const contents = window.webContents;
    const session = contents.session;
    const workers = session.serviceWorkers;
    const workerBindings = new Set();
    const ipcBindings = new Map();
    const persistent = new Map();
    const pendingEvents = new Map();
    const frameTimers = new Map();
    let previousSettings = manager.getSettings();
    const cancelFrameTimer = (id) => {
        clearTimeout(frameTimers.get(id)?.timer);
        frameTimers.delete(id);
    };
    const preloads = ["frame", "service-worker"].map((type) => session.registerPreloadScript({
        type, filePath: path.join(__dirname, "notificationPreload.js")
    }));

    const trustedFrame = (event) => event.sender === contents &&
        !contents.isDestroyed() && isChatOrigin(event.senderFrame?.url);
    const trustedWorker = (event) => event.session === session && event.serviceWorker &&
        !event.serviceWorker.isDestroyed() && isChatOrigin(event.serviceWorker.scope) &&
        isChatOrigin(event.serviceWorker.scriptURL);
    const trusted = (event) => event.type === "service-worker" ? trustedWorker(event) : trustedFrame(event);
    const owner = (event) => event.type === "service-worker" ? event.serviceWorker : event.senderFrame;
    const send = (target, channel, ...args) => {
        try { target.send(channel, ...args); } catch { /* The frame/worker has gone away. */ }
    };
    const finishEvent = (id) => {
        const task = pendingEvents.get(id);
        if (!task) return;
        clearTimeout(task.timer);
        try { task.end?.(); } catch { /* Worker already stopped. */ }
        pendingEvents.delete(id);
    };
    const finish = (id) => {
        const entry = persistent.get(id);
        if (!entry) return;
        persistent.delete(id);
        if (!pendingEvents.has(id)) {
            try { entry.task?.end(); } catch { /* Worker already stopped. */ }
        }
    };
    const dismiss = (id) => {
        const entry = persistent.get(id);
        if (!entry) return;
        // Remove before close(): some platforms emit close synchronously.
        persistent.delete(id);
        entry.notification.close();
        try { entry.task?.end(); } catch { /* Worker stopped. */ }
    };
    const dispatch = (id, type) => {
        const entry = persistent.get(id);
        if (!entry || pendingEvents.has(id)) return;
        pendingEvents.set(id, {
            target: entry.target, end: () => entry.task?.end(),
            timer: setTimeout(() => finishEvent(id), 15000)
        });
        send(entry.target, "gchat:notification-event", id, type);
        persistent.delete(id);
    };

    const bind = (ipc) => {
        if (ipcBindings.has(ipc)) return;
        const listeners = [];
        const on = (channel, listener) => {
            ipc.on(channel, listener);
            listeners.push([channel, listener]);
        };
        on("gchat:notification-settings", (event) => {
            event.returnValue = trusted(event) ? manager.getSettings() : null;
        });
        on("gchat:notification-activate", (event, url) => {
            event.returnValue = false;
            if (!trusted(event)) return;
            manager.showMainWindow();
            if (url !== undefined) {
                if (!isChatNavigation(url)) return;
                void contents.loadURL(url).catch(() => {});
            }
            event.returnValue = true;
        });
        ipc.handle("gchat:notification-show", (event, options) => {
            if (!trusted(event) || !manager.getSettings().enableNativeNotifications) {
                throw new Error("Notifications are disabled or unavailable");
            }
            const target = owner(event);
            const scope = options?.scope;
            const origin = event.type === "service-worker" ? event.serviceWorker.scope : event.senderFrame.url;
            if (!options || typeof options.id !== "string" || options.id.length > 100 ||
                !isChatOrigin(scope) || new URL(scope).origin !== new URL(origin).origin ||
                typeof options.title !== "string" || typeof options.body !== "string" ||
                options.title.length > 4096 || options.body.length > 65536 ||
                typeof options.tag !== "string" || options.tag.length > 4096 || persistent.has(options.id)) {
                throw new Error("Invalid notification");
            }
            const config = manager.getSettings();
            // Defend against an in-flight show racing a privacy change.
            const title = config.showNotificationPreview ? options.title : "Google Chat";
            const body = config.showNotificationPreview ? options.body : config.unread;
            for (const [id, entry] of persistent) {
                if (options.tag && entry.scope === scope && entry.tag === options.tag) {
                    dismiss(id);
                    send(entry.target, "gchat:notification-event", id, "close");
                }
            }
            const task = event.type === "service-worker" ? target.startTask() : undefined;
            const id = options.id;
            let notification;
            try {
                notification = manager.createNotification({
                    title, body, silent: Boolean(options.silent),
                    timeoutType: options.requireInteraction ? "never" : "default"
                }, {
                    click: () => { dispatch(id, "click"); notification.close(); },
                    close: () => dispatch(id, "close"),
                    failed: () => { finish(id); send(target, "gchat:notification-event", id, "close"); }
                });
            } catch {
                task?.end();
                throw new Error("Native notifications are unavailable");
            }
            if (!notification) {
                task?.end();
                throw new Error("Native notifications are unavailable");
            }
            persistent.set(id, { target, notification, task, scope, tag: options.tag });
        });
        on("gchat:notification-close", (event, id) => {
            const entry = persistent.get(id);
            if (!trusted(event) || !entry || entry.target !== owner(event)) return;
            dismiss(id);
        });
        on("gchat:notification-event-done", (event, id) => {
            if (trusted(event) && pendingEvents.get(id)?.target === owner(event)) finishEvent(id);
        });
        ipcBindings.set(ipc, () => {
            for (const [channel, listener] of listeners) ipc.removeListener(channel, listener);
            ipc.removeHandler("gchat:notification-show");
            ipcBindings.delete(ipc);
        });
    };
    bind(contents.ipc);
    contents.ipc.on("gchat:notification-timer", (event, id, seconds) => {
        if (!trustedFrame(event) || typeof id !== "string" || id.length > 100 ||
            normalizeNotificationDuration(seconds) <= 0 || !manager.getSettings().enableNativeNotifications) return;
        if (frameTimers.has(id) && frameTimers.get(id).target !== event.senderFrame) return;
        cancelFrameTimer(id);
        const target = event.senderFrame;
        const timer = setTimeout(() => {
            frameTimers.delete(id);
            send(target, "gchat:notification-expire", id);
        }, seconds * 1000);
        timer.unref?.();
        frameTimers.set(id, { target, timer });
    });
    contents.ipc.on("gchat:notification-cancel-timer", (event, id) => {
        if (trustedFrame(event) && frameTimers.get(id)?.target === event.senderFrame) cancelFrameTimer(id);
    });
    const bindWorker = (worker) => {
        if (!worker || workerBindings.has(worker) || !isChatOrigin(worker.scope) || !isChatOrigin(worker.scriptURL)) return;
        // Electron can reuse the same IPC emitter after a worker stops.
        // Bind by emitter identity, and remove our handlers at the stop boundary.
        if (ipcBindings.has(worker.ipc)) return;
        bind(worker.ipc);
        workerBindings.add(worker);
    };
    const onWorkerStatus = ({ versionId, runningStatus }) => {
        if (runningStatus === "starting") bindWorker(workers.getWorkerFromVersionID(versionId));
        if (runningStatus === "stopped") {
            for (const worker of workerBindings) {
                if (worker.versionId !== versionId) continue;
                for (const [id, entry] of persistent) {
                    if (entry.target === worker) {
                        persistent.delete(id);
                        entry.notification.close();
                    }
                }
                for (const [id, entry] of pendingEvents) {
                    if (entry.target === worker) finishEvent(id);
                }
                ipcBindings.get(worker.ipc)?.();
                workerBindings.delete(worker);
            }
        }
    };
    workers.on("running-status-changed", onWorkerStatus);
    for (const id of Object.keys(workers.getAllRunning())) bindWorker(workers.getWorkerFromVersionID(Number(id)));

    const stopWatching = manager.onSettingsChanged((config) => {
        if (!config.enableNativeNotifications || (previousSettings.showNotificationPreview && !config.showNotificationPreview)) {
            for (const id of persistent.keys()) dismiss(id);
            for (const id of frameTimers.keys()) cancelFrameTimer(id);
        }
        previousSettings = config;
        if (!contents.isDestroyed()) {
            for (const frame of contents.mainFrame.framesInSubtree) {
                if (isChatOrigin(frame.url)) send(frame, "gchat:notification-settings", config);
            }
        }
        for (const worker of workerBindings) send(worker, "gchat:notification-settings", config);
    });

    // Preserve Electron's pre-existing default for other permissions. Check
    // notification grants on every display, including cached grants.
    session.setPermissionCheckHandler((_contents, permission, origin) => permission !== "notifications" ||
        (isChatOrigin(origin) && manager.getSettings().enableNativeNotifications));
    session.setPermissionRequestHandler((_contents, permission, callback, details) => {
        callback(permission !== "notifications" ||
            (isChatOrigin(details.requestingUrl) && manager.getSettings().enableNativeNotifications));
    });

    contents.once("destroyed", () => {
        stopWatching();
        workers.off("running-status-changed", onWorkerStatus);
        for (const unbind of [...ipcBindings.values()]) unbind();
        workerBindings.clear();
        for (const id of persistent.keys()) dismiss(id);
        for (const id of pendingEvents.keys()) finishEvent(id);
        for (const id of frameTimers.keys()) cancelFrameTimer(id);
        for (const id of preloads) session.unregisterPreloadScript(id);
        session.setPermissionCheckHandler(null);
        session.setPermissionRequestHandler(null);
    });
};

module.exports = { initializeNotificationSession };

// This file is also a sandboxed service-worker preload: keep it self-contained.
// Electron serializes this function into the page/worker's main world.
function installNotificationAdapter(bridge) {
    const key = Symbol.for("google-chat-linux.notification-adapter");
    if (globalThis[key]) return globalThis[key];
    const url = new URL(location.href);
    if (url.protocol !== "https:" || !["chat.google.com", "mail.google.com"].includes(url.host)) {
        return null;
    }

    const NativeNotification = globalThis.Notification;
    const active = new Map();
    const persistent = new Map();
    let sequence = 0;
    const token = crypto.randomUUID();
    const settings = () => bridge.settings();
    let previousSettings = settings();
    if (!previousSettings) return null;
    const present = (title, options, config) => {
        const copy = { ...options };
        if (!config.showNotificationPreview) {
            // Images/actions can contain private content too. Keep routing data.
            delete copy.icon;
            delete copy.image;
            delete copy.badge;
            copy.actions = [];
            return ["Google Chat", { ...copy, body: config.unread }];
        }
        return [String(title || "Google Chat"), {
            ...copy,
            body: copy.body == null || String(copy.body).trim() === "" ? config.unread : String(copy.body)
        }];
    };

    if (NativeNotification && typeof window !== "undefined") {
        // A Proxy returns the actual native instance: onclick, EventTarget,
        // permission, requestPermission, tags and close() retain browser semantics.
        globalThis.Notification = new Proxy(NativeNotification, {
            construct(target, args, newTarget) {
                const config = settings();
                const [title, options] = present(args[0], args[1], config);
                const duration = config.notificationDurationSeconds ?? 0;
                if (duration !== 0) options.requireInteraction = true;
                const notification = Reflect.construct(target, [title, options], newTarget);
                const id = `${token}:${++sequence}`;
                active.set(id, notification);
                const release = () => { if (active.delete(id)) bridge.cancelTimer(id); };
                const originalClose = notification.close.bind(notification);
                notification.close = () => { release(); originalClose(); };
                notification.addEventListener("show", () => {
                    // A main-process timer keeps working while a renderer is hidden.
                    if (active.has(id) && duration > 0) bridge.startTimer(id, duration);
                });
                notification.addEventListener("click", () => { bridge.cancelTimer(id); bridge.activate(); }, { capture: true });
                for (const type of ["close", "error"]) {
                    notification.addEventListener(type, release, { once: true });
                }
                // Main-process permission checks also suppress cached grants.
                if (!config.enableNativeNotifications) notification.close();
                return notification;
            }
        });
    }

    const registrationPrototype = globalThis.ServiceWorkerRegistration?.prototype;
    if (registrationPrototype) {
        registrationPrototype.showNotification = async function (title, options = {}) {
            options = options ?? {};
            const config = settings();
            if (!config.enableNativeNotifications) {
                throw new DOMException("Notifications are disabled", "NotAllowedError");
            }
            const id = `${token}:${++sequence}`;
            // Keep data and routing in this realm. Only presentation crosses IPC.
            const notification = Object.freeze({
                ...options, title: String(title), body: String(options.body ?? ""),
                tag: String(options.tag ?? ""), data: structuredClone(options.data ?? null),
                close: () => { persistent.delete(id); bridge.close(id); }
            });
            persistent.set(id, { notification, registration: this });
            const [displayTitle, displayOptions] = present(title, options, config);
            try {
                await bridge.show({ id, scope: this.scope, title: displayTitle,
                    body: displayOptions.body, tag: notification.tag,
                    silent: Boolean(options.silent), requireInteraction: Boolean(options.requireInteraction) });
            } catch (error) {
                persistent.delete(id);
                throw error;
            }
        };
        registrationPrototype.getNotifications = async function (options = {}) {
            return [...persistent.values()]
                .filter((entry) => entry.registration.scope === this.scope &&
                    (options.tag === undefined || entry.notification.tag === String(options.tag)))
                .map((entry) => entry.notification);
        };
    }

    const isWorker = typeof window === "undefined";
    // Electron 39 doesn't implement persistent notifications. Forward native
    // clicks to the original worker handlers, retaining data and waitUntil().
    const dispatchPersistentEvent = async (id, type) => {
        const entry = persistent.get(id);
        if (!entry) return;
        persistent.delete(id);
        const eventType = type === "click" ? "notificationclick" : "notificationclose";
        if (isWorker) {
            const pending = [];
            const event = new Event(eventType);
            Object.defineProperties(event, {
                notification: { value: entry.notification }, action: { value: "" },
                waitUntil: { value: (promise) => pending.push(Promise.resolve(promise)) }
            });
            globalThis.dispatchEvent(event);
            await Promise.allSettled(pending);
        } else {
            // showNotification() called by a document still belongs to its worker.
            const worker = entry.registration.active;
            if (!worker) return;
            await new Promise((resolve) => {
                const channel = new MessageChannel();
                const timer = setTimeout(() => { channel.port1.close(); resolve(); }, 10000);
                channel.port1.onmessage = () => { clearTimeout(timer); channel.port1.close(); resolve(); };
                worker.postMessage({ type: "gchat-notification-event", eventType,
                    notification: { ...entry.notification, close: undefined } }, [channel.port2]);
            });
        }
    };

    if (isWorker) {
        globalThis.addEventListener("message", (event) => {
            const data = event.data;
            if (data?.type !== "gchat-notification-event" || !event.ports?.[0] ||
                !["notificationclick", "notificationclose"].includes(data.eventType)) return;
            // Only clients on the same trusted Google origin can relay a click.
            if (!event.source?.url || new URL(event.source.url).origin !== url.origin) return;
            event.stopImmediatePropagation();
            const pending = [];
            const notificationEvent = new Event(data.eventType);
            Object.defineProperties(notificationEvent, {
                notification: { value: { ...data.notification, close() {} } },
                action: { value: "" },
                waitUntil: { value: (promise) => pending.push(Promise.resolve(promise)) }
            });
            globalThis.dispatchEvent(notificationEvent);
            event.waitUntil(Promise.allSettled(pending).then(() => event.ports[0].postMessage(true)));
        });

        const originalOpenWindow = clients.openWindow.bind(clients);
        clients.openWindow = async (value) => {
            const destination = new URL(value, location.href).href;
            if (bridge.activate(destination)) {
                const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
                return windows.find((client) => new URL(client.url).origin === new URL(destination).origin) ?? null;
            }
            return originalOpenWindow(value);
        };
    }

    const controller = {
        update(config) {
            if (!config.enableNativeNotifications || (previousSettings.showNotificationPreview && !config.showNotificationPreview)) {
                for (const notification of active.values()) notification.close();
                active.clear();
                persistent.clear();
            }
            previousSettings = config;
        },
        expire(id) { active.get(id)?.close(); },
        event: dispatchPersistentEvent
    };
    Object.defineProperty(globalThis, key, { value: controller });
    return controller;
}

if (typeof module !== "undefined") module.exports = { installNotificationAdapter };

if (typeof process !== "undefined" && process.versions?.electron) {
    const { contextBridge, ipcRenderer } = require("electron");
    const adapter = contextBridge.executeInMainWorld({
        func: installNotificationAdapter,
        args: [{
            settings: () => ipcRenderer.sendSync("gchat:notification-settings"),
            activate: (url) => ipcRenderer.sendSync("gchat:notification-activate", url),
            show: (options) => ipcRenderer.invoke("gchat:notification-show", options),
            close: (id) => ipcRenderer.send("gchat:notification-close", id),
            startTimer: (id, seconds) => ipcRenderer.send("gchat:notification-timer", id, seconds),
            cancelTimer: (id) => ipcRenderer.send("gchat:notification-cancel-timer", id)
        }]
    });
    if (adapter) {
        ipcRenderer.on("gchat:notification-settings", (_event, config) => adapter.update(config));
        ipcRenderer.on("gchat:notification-expire", (_event, id) => adapter.expire(id));
        ipcRenderer.on("gchat:notification-event", (_event, id, type) => {
            Promise.resolve(adapter.event(id, type)).catch(() => {}).finally(() => {
                ipcRenderer.send("gchat:notification-event-done", id);
            });
        });
    }
}

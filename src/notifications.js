const { Notification } = require("electron");
const { EventEmitter } = require("node:events");
const pathsManifest = require("./paths");
const { NOTIFICATION_LANGUAGES, normalizeNotificationLanguage, getNotificationMessages } = require("./notificationMessages");
const { normalizeNotificationDuration, getNotificationDuration } = require("./notificationDuration");

let mainWindow;
let notificationLanguage = NOTIFICATION_LANGUAGES.ENGLISH;
let nativeNotificationsEnabled = true;
let showNotificationPreview = true;
let notificationPreviewDurationSeconds = 0;
let notificationGenericDurationSeconds = 0;
const activeNotifications = new Set();
const changes = new EventEmitter();

const showMainWindow = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
};

const createNotification = (options, handlers = {}) => {
    if (!nativeNotificationsEnabled || !Notification.isSupported()) return undefined;
    const duration = getNotificationDuration(getSettings());
    const notification = new Notification({ icon: pathsManifest.normal(), ...options,
        ...(duration !== 0 ? { timeoutType: "never" } : {}) });
    let timer;
    let closed = false;
    const release = () => { clearTimeout(timer); activeNotifications.delete(notification); };
    const finishClose = () => {
        if (closed) return;
        closed = true;
        release();
        handlers.close?.();
    };
    const originalClose = notification.close.bind(notification);
    notification.close = () => { originalClose(); finishClose(); };
    activeNotifications.add(notification);
    notification.on("show", () => {
        clearTimeout(timer);
        if (!closed && duration > 0) timer = setTimeout(() => notification.close(), duration * 1000);
    });
    notification.on("click", () => {
        release();
        showMainWindow();
        handlers.click?.();
    });
    notification.on("close", finishClose);
    notification.on("failed", () => {
        // OS errors may contain presentation data. Do not log them.
        console.error("Failed to show native notification");
        closed = true;
        release();
        handlers.failed?.();
    });
    notification.show();
    return notification;
};

const closeAllNotifications = () => {
    for (const notification of [...activeNotifications]) notification.close();
    activeNotifications.clear();
};

const getSettings = () => ({
    enableNativeNotifications: nativeNotificationsEnabled,
    showNotificationPreview,
    notificationPreviewDurationSeconds,
    notificationGenericDurationSeconds,
    notificationDurationSeconds: getNotificationDuration({ showNotificationPreview,
        notificationPreviewDurationSeconds, notificationGenericDurationSeconds }),
    unread: getNotificationMessages(notificationLanguage).unread
});

const publishSettings = () => changes.emit("settings", getSettings());
const setNotificationLanguage = (language) => {
    notificationLanguage = normalizeNotificationLanguage(language);
    publishSettings();
};
const setNativeNotificationsEnabled = (enabled) => {
    nativeNotificationsEnabled = Boolean(enabled);
    publishSettings();
    if (!nativeNotificationsEnabled) closeAllNotifications();
};
const setShowNotificationPreview = (enabled) => {
    showNotificationPreview = Boolean(enabled);
    publishSettings();
    if (!showNotificationPreview) closeAllNotifications();
};
const setNotificationDurations = (previewSeconds, genericSeconds) => {
    notificationPreviewDurationSeconds = normalizeNotificationDuration(previewSeconds);
    notificationGenericDurationSeconds = normalizeNotificationDuration(genericSeconds);
    publishSettings();
};

const showTestNotification = () => {
    const messages = getNotificationMessages(notificationLanguage);
    createNotification({ title: "Google Chat", body: showNotificationPreview ? messages.test : messages.unread });
};

module.exports = {
    setMainWindow: (window) => { mainWindow = window; },
    setNotificationLanguage,
    setNativeNotificationsEnabled,
    setShowNotificationPreview,
    setNotificationDurations,
    getSettings,
    onSettingsChanged: (listener) => {
        changes.on("settings", listener);
        return () => changes.off("settings", listener);
    },
    showMainWindow,
    createNotification,
    closeAllNotifications,
    showTestNotification
};

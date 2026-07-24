const { Notification } = require("electron");
const pathsManifest = require("./paths");
const { UNREAD_ACTIONS, transitionUnreadState } = require("./faviconState");
const {
    NOTIFICATION_LANGUAGES,
    normalizeNotificationLanguage,
    getNotificationMessages
} = require("./notificationMessages");

let mainWindow;
let hasUnread = false;
let unreadNotification;
let notificationLanguage = NOTIFICATION_LANGUAGES.ENGLISH;
let nativeNotificationsEnabled = true;
const activeNotifications = new Set();

const showMainWindow = () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }

    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
};

const retainNotification = (notification, isUnreadNotification = false) => {
    activeNotifications.add(notification);

    const release = () => {
        activeNotifications.delete(notification);
        if (isUnreadNotification && unreadNotification === notification) {
            unreadNotification = undefined;
        }
    };

    notification.on("click", () => {
        showMainWindow();
        release();
    });
    notification.on("close", release);
    notification.on("failed", (event, error) => {
        console.error("Failed to show native notification:", error);
        release();
    });

    return notification;
};

const createNotification = (options, isUnreadNotification = false) => {
    if (!Notification.isSupported()) {
        console.warn("Native notifications are not supported on this system");
        return undefined;
    }

    const notification = retainNotification(
        new Notification({
            icon: pathsManifest.normal(),
            ...options
        }),
        isUnreadNotification
    );
    notification.show();
    return notification;
};

const setMainWindow = (windowObj) => {
    mainWindow = windowObj;
};

const setNotificationLanguage = (language) => {
    notificationLanguage = normalizeNotificationLanguage(language);
};

const closeAllNotifications = () => {
    for (const notification of [...activeNotifications]) {
        notification.close();
    }
    activeNotifications.clear();
    unreadNotification = undefined;
};

const setNativeNotificationsEnabled = (enabled) => {
    nativeNotificationsEnabled = Boolean(enabled);
    hasUnread = false;

    if (!nativeNotificationsEnabled) {
        closeAllNotifications();
    }
};

const updateUnreadState = (iconType) => {
    const nextState = transitionUnreadState(hasUnread, iconType, nativeNotificationsEnabled);
    hasUnread = nextState.hasUnread;

    if (nextState.action === UNREAD_ACTIONS.SHOW) {
        const messages = getNotificationMessages(notificationLanguage);
        unreadNotification = createNotification({
            title: "Google Chat",
            body: messages.unread,
            timeoutType: "never"
        }, true);
    } else if (nextState.action === UNREAD_ACTIONS.CLOSE) {
        unreadNotification?.close();
        unreadNotification = undefined;
    }
};

const showTestNotification = () => {
    if (!nativeNotificationsEnabled) {
        return;
    }

    const messages = getNotificationMessages(notificationLanguage);
    createNotification({
        title: "Google Chat",
        body: messages.test
    });
};

module.exports = {
    setMainWindow,
    setNotificationLanguage,
    setNativeNotificationsEnabled,
    updateUnreadState,
    showTestNotification
};

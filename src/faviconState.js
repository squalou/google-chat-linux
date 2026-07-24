const ICON_TYPES = Object.freeze({
    NORMAL: "NORMAL",
    ATTENTION: "ATTENTION",
    OFFLINE: "OFFLINE"
});

const UNREAD_ACTIONS = Object.freeze({
    SHOW: "SHOW",
    CLOSE: "CLOSE",
    NONE: "NONE"
});

const classifyFavicon = (href = "") => {
    if (href.match(/logo_favicon_no_dot/) ||
        href.match(/favicon_chat_new_non_notif_r/) ||
        href.match(/favicon_chat_r/)) {
        return ICON_TYPES.NORMAL;
    }

    if (href.match(/logo_favicon_dot/) ||
        href.match(/favicon_chat_new_notif_r/)) {
        return ICON_TYPES.ATTENTION;
    }

    return ICON_TYPES.OFFLINE;
};

const transitionUnreadState = (hasUnread, iconType, notificationsEnabled = true) => {
    if (!notificationsEnabled) {
        return {
            hasUnread: false,
            action: UNREAD_ACTIONS.NONE
        };
    }

    if (iconType === ICON_TYPES.ATTENTION && !hasUnread) {
        return {
            hasUnread: true,
            action: UNREAD_ACTIONS.SHOW
        };
    }

    if (iconType === ICON_TYPES.NORMAL && hasUnread) {
        return {
            hasUnread: false,
            action: UNREAD_ACTIONS.CLOSE
        };
    }

    return {
        hasUnread,
        action: UNREAD_ACTIONS.NONE
    };
};

module.exports = {
    ICON_TYPES,
    UNREAD_ACTIONS,
    classifyFavicon,
    transitionUnreadState
};

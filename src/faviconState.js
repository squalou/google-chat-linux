const ICON_TYPES = Object.freeze({
    NORMAL: "NORMAL",
    ATTENTION: "ATTENTION",
    OFFLINE: "OFFLINE"
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

module.exports = { ICON_TYPES, classifyFavicon };

const isChatOrigin = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password &&
            (url.host === "chat.google.com" || url.host === "mail.google.com");
    } catch {
        return false;
    }
};

const isChatNavigation = (value) => {
    if (!isChatOrigin(value)) return false;
    const url = new URL(value);
    return url.hostname === "chat.google.com" || /^\/chat(?:\/|$)/.test(url.pathname);
};

module.exports = { isChatOrigin, isChatNavigation };

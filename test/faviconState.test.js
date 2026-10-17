const test = require("node:test");
const assert = require("node:assert/strict");
const {
    ICON_TYPES,
    classifyFavicon
} = require("../src/faviconState");

test("classifies current Google Chat normal favicon variants", () => {
    assert.equal(
        classifyFavicon("https://chat.google.com/logo_favicon_no_dot_2026.png"),
        ICON_TYPES.NORMAL
    );
    assert.equal(
        classifyFavicon("https://chat.google.com/favicon_chat_new_non_notif_r.png"),
        ICON_TYPES.NORMAL
    );
    assert.equal(
        classifyFavicon("https://chat.google.com/favicon_chat_r.png"),
        ICON_TYPES.NORMAL
    );
});

test("classifies current Google Chat attention favicon variants", () => {
    assert.equal(
        classifyFavicon("https://chat.google.com/logo_favicon_dot_2026.png"),
        ICON_TYPES.ATTENTION
    );
    assert.equal(
        classifyFavicon("https://chat.google.com/favicon_chat_new_notif_r.png"),
        ICON_TYPES.ATTENTION
    );
});

test("classifies an absent or unknown favicon as offline", () => {
    assert.equal(classifyFavicon(), ICON_TYPES.OFFLINE);
    assert.equal(
        classifyFavicon("data:image/png;base64,unknown"),
        ICON_TYPES.OFFLINE
    );
});

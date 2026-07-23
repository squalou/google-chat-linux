const test = require("node:test");
const assert = require("node:assert/strict");
const {
    ICON_TYPES,
    UNREAD_ACTIONS,
    classifyFavicon,
    transitionUnreadState
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

test("shows only once while the favicon remains in attention state", () => {
    const first = transitionUnreadState(false, ICON_TYPES.ATTENTION);
    assert.deepEqual(first, {
        hasUnread: true,
        action: UNREAD_ACTIONS.SHOW
    });

    assert.deepEqual(
        transitionUnreadState(first.hasUnread, ICON_TYPES.ATTENTION),
        {
            hasUnread: true,
            action: UNREAD_ACTIONS.NONE
        }
    );
});

test("offline preserves unread state and normal clears it", () => {
    const offline = transitionUnreadState(true, ICON_TYPES.OFFLINE);
    assert.deepEqual(offline, {
        hasUnread: true,
        action: UNREAD_ACTIONS.NONE
    });

    assert.deepEqual(
        transitionUnreadState(offline.hasUnread, ICON_TYPES.NORMAL),
        {
            hasUnread: false,
            action: UNREAD_ACTIONS.CLOSE
        }
    );
});

test("a new attention cycle shows another notification after clearing", () => {
    const cleared = transitionUnreadState(true, ICON_TYPES.NORMAL);
    assert.deepEqual(
        transitionUnreadState(cleared.hasUnread, ICON_TYPES.ATTENTION),
        {
            hasUnread: true,
            action: UNREAD_ACTIONS.SHOW
        }
    );
});

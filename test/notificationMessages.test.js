const test = require("node:test");
const assert = require("node:assert/strict");
const {
    NOTIFICATION_LANGUAGES,
    normalizeNotificationLanguage,
    getNotificationMessages
} = require("../src/notificationMessages");

test("uses English notification messages by default", () => {
    assert.equal(normalizeNotificationLanguage(), NOTIFICATION_LANGUAGES.ENGLISH);
    assert.deepEqual(getNotificationMessages(), {
        unread: "You have unread messages in Google Chat",
        test: "Native notifications are working correctly"
    });
});

test("provides Polish notification messages when selected", () => {
    assert.deepEqual(getNotificationMessages(NOTIFICATION_LANGUAGES.POLISH), {
        unread: "Masz nieprzeczytane wiadomości w Google Chat",
        test: "Natywne powiadomienia działają poprawnie"
    });
});

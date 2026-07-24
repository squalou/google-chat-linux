const test = require("node:test");
const assert = require("node:assert/strict");
const {
    NOTIFICATION_LANGUAGES,
    NOTIFICATION_LANGUAGE_OPTIONS,
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

test("provides messages for every selectable notification language", () => {
    const languageCodes = NOTIFICATION_LANGUAGE_OPTIONS.map(({ code }) => code);
    assert.equal(new Set(languageCodes).size, languageCodes.length);

    for (const { code, label } of NOTIFICATION_LANGUAGE_OPTIONS) {
        assert.equal(normalizeNotificationLanguage(code), code, label);

        const messages = getNotificationMessages(code);
        assert.ok(messages.unread.length > 0, `${label} unread message`);
        assert.ok(messages.test.length > 0, `${label} test message`);
    }
});

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeNotificationDuration, getNotificationDuration, NOTIFICATION_DURATION_OPTIONS } = require("../src/notificationDuration");

test("duration settings support system default, manual dismissal and bounded custom seconds", () => {
    for (const seconds of [undefined, null, "5", NaN, Infinity, -2, 0.5, 3601]) {
        assert.equal(normalizeNotificationDuration(seconds), 0);
    }
    for (const seconds of [-1, 0, 1, 3, 5, 10, 27, 3600]) {
        assert.equal(normalizeNotificationDuration(seconds), seconds);
    }
    for (const { seconds } of NOTIFICATION_DURATION_OPTIONS) assert.equal(normalizeNotificationDuration(seconds), seconds);
});

test("selects the duration for the active privacy mode", () => {
    const settings = { notificationPreviewDurationSeconds: 5, notificationGenericDurationSeconds: 15 };
    assert.equal(getNotificationDuration({ ...settings, showNotificationPreview: true }), 5);
    assert.equal(getNotificationDuration({ ...settings, showNotificationPreview: false }), 15);
    assert.equal(getNotificationDuration({ showNotificationPreview: true }), 0);
});

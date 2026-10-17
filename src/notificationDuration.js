// Seconds: 0 preserves Google's/system behavior; -1 requests manual dismissal.
const NOTIFICATION_DURATION_OPTIONS = Object.freeze([
    { seconds: 0, label: "System default" },
    ...[3, 5, 10, 15, 30, 60].map((seconds) => ({ seconds, label: `${seconds} seconds` })),
    { seconds: -1, label: "Until dismissed" }
]);

const normalizeNotificationDuration = (seconds) => {
    return Number.isInteger(seconds) && seconds >= -1 && seconds <= 3600 ? seconds : 0;
};

const getNotificationDuration = (settings) => normalizeNotificationDuration(
    settings.showNotificationPreview ? settings.notificationPreviewDurationSeconds : settings.notificationGenericDurationSeconds
);

module.exports = { NOTIFICATION_DURATION_OPTIONS, normalizeNotificationDuration, getNotificationDuration };

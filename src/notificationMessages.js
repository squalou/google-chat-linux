const NOTIFICATION_LANGUAGES = Object.freeze({
    ENGLISH: "en",
    POLISH: "pl"
});

const MESSAGES = Object.freeze({
    [NOTIFICATION_LANGUAGES.ENGLISH]: Object.freeze({
        unread: "You have unread messages in Google Chat",
        test: "Native notifications are working correctly"
    }),
    [NOTIFICATION_LANGUAGES.POLISH]: Object.freeze({
        unread: "Masz nieprzeczytane wiadomości w Google Chat",
        test: "Natywne powiadomienia działają poprawnie"
    })
});

const normalizeNotificationLanguage = (language) => {
    return MESSAGES[language] ? language : NOTIFICATION_LANGUAGES.ENGLISH;
};

const getNotificationMessages = (language) => {
    return MESSAGES[normalizeNotificationLanguage(language)];
};

module.exports = {
    NOTIFICATION_LANGUAGES,
    normalizeNotificationLanguage,
    getNotificationMessages
};

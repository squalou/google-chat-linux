const NOTIFICATION_LANGUAGES = Object.freeze({
    ENGLISH: "en",
    GERMAN: "de",
    SPANISH: "es",
    FRENCH: "fr",
    ITALIAN: "it",
    DUTCH: "nl",
    POLISH: "pl",
    PORTUGUESE: "pt"
});

const MESSAGES = Object.freeze({
    [NOTIFICATION_LANGUAGES.ENGLISH]: Object.freeze({
        unread: "You have unread messages in Google Chat",
        test: "Native notifications are working correctly"
    }),
    [NOTIFICATION_LANGUAGES.GERMAN]: Object.freeze({
        unread: "Du hast ungelesene Nachrichten in Google Chat",
        test: "Native Benachrichtigungen funktionieren korrekt"
    }),
    [NOTIFICATION_LANGUAGES.SPANISH]: Object.freeze({
        unread: "Tienes mensajes sin leer en Google Chat",
        test: "Las notificaciones nativas funcionan correctamente"
    }),
    [NOTIFICATION_LANGUAGES.FRENCH]: Object.freeze({
        unread: "Vous avez des messages non lus dans Google Chat",
        test: "Les notifications natives fonctionnent correctement"
    }),
    [NOTIFICATION_LANGUAGES.ITALIAN]: Object.freeze({
        unread: "Hai messaggi non letti in Google Chat",
        test: "Le notifiche native funzionano correttamente"
    }),
    [NOTIFICATION_LANGUAGES.DUTCH]: Object.freeze({
        unread: "Je hebt ongelezen berichten in Google Chat",
        test: "Native meldingen werken correct"
    }),
    [NOTIFICATION_LANGUAGES.POLISH]: Object.freeze({
        unread: "Masz nieprzeczytane wiadomości w Google Chat",
        test: "Natywne powiadomienia działają poprawnie"
    }),
    [NOTIFICATION_LANGUAGES.PORTUGUESE]: Object.freeze({
        unread: "Há mensagens não lidas no Google Chat",
        test: "As notificações nativas funcionam corretamente"
    })
});

const NOTIFICATION_LANGUAGE_OPTIONS = Object.freeze([
    Object.freeze({ code: NOTIFICATION_LANGUAGES.ENGLISH, label: "English" }),
    Object.freeze({ code: NOTIFICATION_LANGUAGES.GERMAN, label: "Deutsch" }),
    Object.freeze({ code: NOTIFICATION_LANGUAGES.SPANISH, label: "Español" }),
    Object.freeze({ code: NOTIFICATION_LANGUAGES.FRENCH, label: "Français" }),
    Object.freeze({ code: NOTIFICATION_LANGUAGES.ITALIAN, label: "Italiano" }),
    Object.freeze({ code: NOTIFICATION_LANGUAGES.DUTCH, label: "Nederlands" }),
    Object.freeze({ code: NOTIFICATION_LANGUAGES.POLISH, label: "Polski" }),
    Object.freeze({ code: NOTIFICATION_LANGUAGES.PORTUGUESE, label: "Português" })
]);

const normalizeNotificationLanguage = (language) => {
    return MESSAGES[language] ? language : NOTIFICATION_LANGUAGES.ENGLISH;
};

const getNotificationMessages = (language) => {
    return MESSAGES[normalizeNotificationLanguage(language)];
};

module.exports = {
    NOTIFICATION_LANGUAGES,
    NOTIFICATION_LANGUAGE_OPTIONS,
    normalizeNotificationLanguage,
    getNotificationMessages
};

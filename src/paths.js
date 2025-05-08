const path = require("path");
const { app } = require("electron");

let theme = 'default';
const iconPathTemplate = `\`icon/\${theme}/\${iconName}\``;
const evalIconPath = (theme, iconName) => {
    return eval(iconPathTemplate);
}

const setIconTheme = (t) => {
    theme = t;
}


const normal = () => {
    return path.resolve(process.resourcesPath, evalIconPath(theme, "normal-64.png"))
}
const badge = () => {
    return path.resolve(process.resourcesPath, evalIconPath(theme, "badge-64.png"))
}
const offline = () => {
    return path.resolve(process.resourcesPath, evalIconPath(theme, "offline-64.png"))
}

module.exports = {
    "configsPath": path.resolve(app.getPath("appData"), "google-chat-linux.json"),
    "OVERLAY_NEW_NOTIF": path.resolve(process.resourcesPath, "icon/overlay-new-xs.png"),
    normal: normal,
    badge: badge,
    offline: offline,
    setIconTheme: setIconTheme
}

const path = require("path");
const {app} = require("electron");

module.exports = {
	"configsPath" : path.join(app.getPath("appData"), "google-hangouts-chat-linux.json"),
	"theme": path.join(__dirname, "./theme.js"),
	"iconPath" : path.join(__dirname, "../assets/icon/icon.png"),
	"ICON_NO_NEW_MSG" : path.join(__dirname, "../assets/icon/chat-favicon-no-new-256dp.png"),
	"ICON_NEW_NON_NOTIF_MSG" : path.join(__dirname, "../assets/icon/chat-favicon-new-non-notif-256dp.png"),
	"ICON_NEW_NOTIF_MSG" : path.join(__dirname, "../assets/icon/chat-favicon-new-notif-256dp.png"),
	"ICON_OFFLINE_MSG" : path.join(__dirname, "../assets/icon/chat-favicon-offline-256dp.png")
}
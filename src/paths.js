const path = require("path");
const {app} = require("electron");

module.exports = {
	"configsPath" : path.join(app.getPath("appData"), "google-hangouts-chat-linux.json"),
	"iconPath" : path.join(__dirname, "../assets/icon/icon.png"),
	"NORMAL" : path.join(__dirname, "../assets/icon/normal-64.png"),
	"BADGE" : path.join(__dirname, "../assets/icon/badge-64.png"),
	"OFFLINE" : path.join(__dirname, "../assets/icon/offline-64.png")
}
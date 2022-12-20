const path = require("path");
const {app} = require("electron");

module.exports = {
	"configsPath" : path.resolve(app.getPath("appData"), "google-hangouts-chat-linux.json"),
	"iconPath" : path.resolve(__dirname, "../assets/icon/icon.png"),
	"NORMAL" : path.resolve(__dirname, "../assets/icon/normal-64.png"),
	"BADGE" : path.resolve(__dirname, "../assets/icon/badge-64.png"),
	"OFFLINE" : path.resolve(__dirname,"../assets/icon/offline-64.png")
}

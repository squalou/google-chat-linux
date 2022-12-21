const path = require("path");
const {app} = require("electron");

module.exports = {
	"configsPath" : path.resolve(app.getPath("appData"), "google-hangouts-chat-linux.json"),
	"iconPath" : path.resolve(process.resourcesPath, "icon/icon.png"),
	"NORMAL" : path.resolve(process.resourcesPath, "icon/normal-64.png"),
	"BADGE" : path.resolve(process.resourcesPath, "icon/badge-64.png"),
	"OFFLINE" : path.resolve(process.resourcesPath, "icon/offline-64.png")
}

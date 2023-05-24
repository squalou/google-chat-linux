const {Tray, Menu, ipcMain} = require("electron");
//const path = require("path");
const pathsManifest = require("./paths");
const WindowManager = require('./window');
let mainWindow;
let systemTrayIcon;
const onShowEntryClicked = () => {
	(! mainWindow.isVisible() || mainWindow.isMinimized()) ? mainWindow.show() : mainWindow.hide();
}

const onSystemTrayIconClicked = () => {
	(! mainWindow.isVisible() || mainWindow.isMinimized() || ! mainWindow.isFocused()) ? mainWindow.show() : mainWindow.hide();
}

const buildContextMenu = () => {
	const template = [
		{
			"label": "Show/Hide",
			"click": () => {
				onShowEntryClicked();
			},
		}, {
			label: 'Force reload', click: function () {
				WindowManager.onForceReloadClicked();
			}
		}, {
			type: 'separator'
        }, {
			type: 'separator'
		}, {
			"label": WindowManager.getThirdPartyAuthLoginMode() ? "Regular mode after auth (restart)" : "Use third party auth mode (restart)",
			"click": () => {
				WindowManager.onToggleThirdPartyAuthLoginMode();
				buildContextMenu();
			}
		}, {
			type: 'separator'
        }, {
			"label": "Quit",
			"click": () => {
				WindowManager.onQuitEntryClicked();
			}
		}
	]

	const contextMenu = Menu.buildFromTemplate(template);
	systemTrayIcon.setContextMenu(contextMenu);
	systemTrayIcon.setToolTip(process.title);
	systemTrayIcon.setTitle(process.title);

	systemTrayIcon.on("click", () => {
		onSystemTrayIconClicked();
	});

	return systemTrayIcon;
}

const initializeTray = (windowObj) => {
	// pb : favicon object changes so the observer .... cannot observe ! or even be initialized
	// -> moved things to ipcRenderer preload mechanism in faviconChange.js - thank you ankurk91 :-)
	// see https://github.com/ankurk91/google-chat-electron.git
	try {
		systemTrayIcon = new Tray(pathsManifest.OFFLINE);
	} catch (e){
		console.log(e)
		console.log("set Tray icon failed !")
	}
	mainWindow = windowObj;
	return buildContextMenu();

};

ipcMain.on('favicon-changed', (evt, href) => {
	var itype = "";
    if (href.match(/favicon_chat_new_non_notif_r2/) ||
		href.match(/favicon_chat_r2/)) {
		itype = "NORMAL";
	}else if (href.match(/favicon_chat_new_notif_r2/)) {
		itype = "ATTENTION";
	}else {
		itype = "OFFLINE";
	}
    setIcon(itype);
});

function iconForType(iconType) {
	if (iconType == "NORMAL") {
		return pathsManifest.NORMAL;
	}else if (iconType == "ATTENTION") {
		return pathsManifest.BADGE;
	}else{
		return pathsManifest.OFFLINE;
	}
}

const setIcon = (iconType) => {
	const i = iconForType(iconType)
	try {
		systemTrayIcon.setImage(i);
	}catch (e){
		//do nothing ... fails on some distribs / OS / window managers
		console.log("Failed to update window icon :-(")
		console.log(e)
	}
	WindowManager.updateIcon(i);

	if (iconType == "ATTENTION") {
		WindowManager.setOverlayIcon();
	}else{
		WindowManager.cleanOverlayIcon();
	}
}
	

module.exports = {
	initializeTray: initializeTray
};
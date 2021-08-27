const {Tray, Menu, ipcMain} = require("electron");
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

const buildContextMenu = (mainWindow) => {
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
			"label": WindowManager.getIsThemed() ? "Remove theme (restart)" : "Apply theme",
			"click": () => {
				WindowManager.onToggleThemeClicked(mainWindow);
				buildContextMenu();
			}
		}, {
			type: 'separator'
        }, {
			"label": WindowManager.getUseOldUrl() ? "Use current ugly UI (restart)" : "Use previous chat UI (restart)",
			"click": () => {
				WindowManager.onToggleUseOldUrl();
				buildContextMenu();
			}
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

const initializeTray = (windowObj, config) => {
	// pb : favicon object changes so the observer .... cannot observe ! or even be initialized
	// -> moved things to ipcRenderer preload mechanism in faviconChange.js - thank you ankurk91 :-)
	// see https://github.com/ankurk91/google-chat-electron.git
	if (config && config.useOldUrl){
		systemTrayIcon = new Tray(pathsManifest.ICON_OFFLINE_MSG);
	}else{
		systemTrayIcon = new Tray(pathsManifest.OFFLINE);
	}
	mainWindow = windowObj;
	return buildContextMenu(windowObj);

};

ipcMain.on('favicon-changed', (evt, href) => {
	var itype = "";
	let oldStyle = false;
	if (href.match(/chat-favicon-no-new/)) {
		itype = "NORMAL";
		oldStyle = true;
	}else if (href.match(/chat-favicon-new-non-notif/)) {
		itype = "UNREAD";
		oldStyle = true;
	}else if (href.match(/chat-favicon-new-notif/)) {
		itype = "ATTENTION";
		oldStyle = true;
	}else if (href.match(/^data:image\/png;base64,iVBOR.+/)) {
		itype = "OFFLINE";
		oldStyle = true;
	}else if (href.match(/favicon_chat_r2/) ||
    	href.match(/favicon_chat_new_non_notif_r2/)) {
		itype = "NORMAL";
	}else if (href.match(/favicon_chat_new_notif_r2/)) {
		itype = "ATTENTION";
	}else {
		itype = "OFFLINE";
	}
	setIcon(itype, oldStyle);
});

function iconForType(iconType, oldStyle) {
	if (oldStyle){
		if (iconType == "NORMAL") {
			return pathsManifest.ICON_NO_NEW_MSG;
		}else if (iconType == "UNREAD") {
			return pathsManifest.ICON_NEW_NON_NOTIF_MSG;
		}else if (iconType == "ATTENTION") {
			return pathsManifest.ICON_NEW_NOTIF_MSG;
		} else {
			return pathsManifest.ICON_OFFLINE_MSG;
		}
	}else{
		if (iconType == "NORMAL") {
			return pathsManifest.NORMAL;
		}else if (iconType == "ATTENTION") {
			return pathsManifest.BADGE;
		}else{
			return pathsManifest.OFFLINE;
		}
	}
}

const setIcon = (iconType, oldStyle) => {
	const i = iconForType(iconType, oldStyle)
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
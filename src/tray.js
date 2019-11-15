const {app, Tray, Menu, ipcMain} = require("electron");
const pathsManifest = require("./paths");
const WindowManager = require('./window');
const WindowManager2 = require('./hiddenWindow');
const fs = require('fs');
let mainWindow;
let systemTrayIcon;

const onShowEntryClicked = () => {
	(! mainWindow.isVisible() || mainWindow.isMinimized()) ? mainWindow.show() : mainWindow.hide();
}

const onQuitEntryClicked = () => {
	WindowManager.setIsQuitting(true);
	app.quit();
}

const onToggleThemeClicked = (mainWindow) => {
	WindowManager.setIsThemed(!WindowManager.getIsThemed());
	const theme = fs.readFileSync(pathsManifest.theme, 'utf8');
	if (WindowManager.getIsThemed() ){
		mainWindow.webContents.executeJavaScript(theme);
	}
	if (!WindowManager.getIsThemed() ){
		onQuitEntryClicked();
	}
	buildContextMenu();
}

const onSystemTrayIconClicked = () => {
	(! mainWindow.isVisible() || mainWindow.isMinimized()) ? mainWindow.show() : mainWindow.focus();
}

const buildContextMenu = (mainWindow) => {
	const template = [
		{
			"label": WindowManager.getIsThemed() ? "Remove theme (restart)" : "Apply theme",
			"click": () => {
				onToggleThemeClicked(mainWindow);
			}
		}, {
			 type: 'separator'
		}, {
			label: 'Force reload', click: function () {
				mainWindow.webContents.reload();
			}
		}, {
			"label": "Show/Hide",
			"click": () => {
				onShowEntryClicked();
			},

		}, {
			"label": "Quit",
			"click": () => {
				onQuitEntryClicked();
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

const initializeTray = (windowObj, windowObj2) => {
	systemTrayIcon = new Tray(pathsManifest.ICON_OFFLINE_MSG);
	mainWindow = windowObj;
	hiddenWindow = windowObj2;
	// this requires nodeIntegration: true but breaks Ctrl K, so we use another windowObj
	hiddenWindow.webContents.on('dom-ready', () => {
	    hiddenWindow.webContents.executeJavaScript('var ipc; try{var ipc = require(\'electron\').ipcRenderer; var fi = document.querySelector("link#favicon256"); console.log(fi); ipc.send("favicon-changed", fi.href); var callback = function(mutationList) { ipc.send("favicon-changed", fi.href); }; var observer = new MutationObserver(callback); observer.observe(fi, { attributes: true });}catch (e){console.log(e)};');
	});

	return buildContextMenu(mainWindow);

};

ipcMain.on('favicon-changed', (evt, href) => {
       var itype = "";
       if (href.match(/chat-favicon-no-new/)) {
         itype = "NORMAL";
       }else if (href.match(/chat-favicon-new-non-notif/)) {
         itype = "UNREAD";
       }else if (href.match(/chat-favicon-new-notif/)) {
         itype = "ATTENTION";
       }else if (href.match(/^data:image\/png;base64,iVBOR.+/)) {
         itype = "OFFLINE";
       }
       setIcon(itype);
  });

function iconForType(iconType) {
       if (iconType == "NORMAL") {
         return pathsManifest.ICON_NO_NEW_MSG;
       }else if (iconType == "UNREAD") {
         return pathsManifest.ICON_NEW_NON_NOTIF_MSG;
       }else if (iconType == "ATTENTION") {
         return pathsManifest.ICON_NEW_NOTIF_MSG;
       }
       return pathsManifest.ICON_OFFLINE_MSG;
  }

const setIcon = (iconType) => {
       systemTrayIcon.setImage(iconForType(iconType));
}
	

module.exports = {
	initializeTray: initializeTray
};
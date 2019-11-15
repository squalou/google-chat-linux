const {BrowserWindow, ipcMain, shell} = require("electron");
const pathsManifest = require('./paths');
const fs = require('fs');
let mainWindow;
ipcMain.on('open-link', (evt, href) => {
	shell.openExternal(href);
});

const getBrowserWindowOptions = () => {
	return {
		"title": process.title,
		"autoHideMenuBar": true,
		"webPreferences": {
			"nodeIntegration": true,
			"sandbox": false

		},
		"show": false,
		"backgroundColor": "#262727",
		"icon": pathsManifest.iconPath,
	}
}

const getExtraOptions = () => {
	return {
		"name": "Google Hangouts Chat for Linux",
		"url": "https://chat.google.com",
		"openLocally": true
	};
}

const initializeWindow = (config) => {
	const bwOptions = getBrowserWindowOptions();
	const extraOptions = getExtraOptions();
	mainWindow = new BrowserWindow(bwOptions);
	mainWindow.loadURL(extraOptions.url);
	mainWindow.hide();
	return mainWindow;
}

module.exports = {
	initializeWindow: initializeWindow
}

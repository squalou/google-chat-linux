const {BrowserWindow, ipcMain, shell} = require("electron");
const pathsManifest = require('./paths');
const ConfigManager = require('./configs');
const fs = require('fs');
let mainWindow;
let isQuitting= false;

ipcMain.on('open-link', (evt, href) => {
	shell.openExternal(href);
});

const setIsQuitting = (b) => {
	isQuitting = b;
};

const getBrowserWindowOptions = () => {
	return {
		"title": process.title,
		"autoHideMenuBar": true,
		"webPreferences": {
			"nodeIntegration": false,
			"sandbox": true

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

const handleTheme = (windowObj) => {
	const theme = fs.readFileSync(pathsManifest.theme, 'utf8');
	windowObj.webContents.executeJavaScript(theme);
	windowObj.show();
}

const handleRedirect = (e, url) => {
	// leave redirect for double auth mechanisme, trap crappy blocked url link
	if (url == "about:blank#blocked") {

	} else if (! url.includes("accounts/SetOSID?authuser=0&continue=https%3A%2F%2Fchat.google.com")){
		shell.openExternal(url);
		e.preventDefault();
	}
};

const initializeWindow = (config) => {
	const bwOptions = (config && config.bounds) ? Object.assign(getBrowserWindowOptions(), config.bounds) : getBrowserWindowOptions()
	const extraOptions = getExtraOptions();

	mainWindow = new BrowserWindow(bwOptions);
	mainWindow.loadURL(extraOptions.url);

	mainWindow.once('ready-to-show', () => {
		handleTheme(mainWindow);
	});

	mainWindow.on('close', (e) => {
		if(isQuitting){
			let isMaximized = mainWindow.isMaximized();
			configsData = {};
			configsData.bounds = mainWindow.getBounds();
			configsData.wasMaximized = isMaximized;
			ConfigManager.updateConfigs(configsData);
		}else{
			e.preventDefault();
			mainWindow.hide();
		}
	});

	mainWindow.webContents.on('will-navigate', handleRedirect);
	mainWindow.webContents.on('new-window', handleRedirect);

	return mainWindow;
}

module.exports = {
	initializeWindow: initializeWindow,
	setIsQuitting: setIsQuitting
}
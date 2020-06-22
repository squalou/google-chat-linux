const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const pathsManifest = require('./paths');
const ConfigManager = require('./configs');
const fs = require('fs');
let mainWindow;
let isQuitting = false;
let keepMinimized = true;
let startHidden = true;
let isThemed = false;

ipcMain.on('open-link', (evt, href) => {
	shell.openExternal(href);
});

const setIsQuitting = (b) => {
	isQuitting = b;
};
const getIsThemed = () => {
	return isThemed
};
const setIsThemed = (b) => {
	isThemed = b;
};

const onKeepMinimizedClicked = (keep) => {
	if (keep !== keepMinimized){
		keepMinimized = keep;
		app.relaunch();
		onQuitEntryClicked();
	}
}

const onQuitEntryClicked = () => {
	setIsQuitting(true);
	app.quit();
}

const onToggleThemeClicked = () => {
	setIsThemed(!getIsThemed());
	const theme = fs.readFileSync(pathsManifest.theme, 'utf8');
	if (getIsThemed() ){
		mainWindow.webContents.executeJavaScript(theme);
	}
	if (!getIsThemed() ){
		app.relaunch()
		onQuitEntryClicked();
	}
}

const onForceReloadClicked = () => {
	mainWindow.webContents.reload();
}

const updateIcon = (icon) => {
	try{
		mainWindow.setIcon(icon);
	}catch (e){
		//do nothing ... fails on some distribs / OS / window managers
		console.log("Failed to update window icon :-(")
		console.log(e)
	}
}

const setOverlayIcon = () => {
	try{
		mainWindow.setOverlayIcon(pathsManifest.OVERLAY_NEW_NOTIF, "!");
	}catch (e){
		//do nothing ... fails on some distribs / OS / window managers
		console.log(e)
	}
}

const cleanOverlayIcon = () => {
	try{
		mainWindow.setOverlayIcon(null, "");
	}catch (e){
		//do nothing ... fails on some distribs / OS / window managers
		console.log(e)
	}
}

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

const handleTheme = (mainWindow) => {
	if (isThemed){
		const theme = fs.readFileSync(pathsManifest.theme, 'utf8');
		mainWindow.webContents.executeJavaScript(theme)
	}
	if (!startHidden) {
		mainWindow.show();
	}
}

const handleRedirect = (e, url) => {
	// leave redirect for double auth mechanisme, trap crappy blocked url link
	if (url == "about:blank#blocked") {
s
	} else if (! url.includes("accounts/SetOSID?authuser=0&continue=https%3A%2F%2Fchat.google.com")){
		shell.openExternal(url);
		e.preventDefault();
	}
};

const initializeWindow = (config) => {
	const bwOptions = (config && config.bounds) ? Object.assign(getBrowserWindowOptions(), config.bounds) : getBrowserWindowOptions()
	const extraOptions = getExtraOptions();
	isThemed = (config && config.isThemed);
	keepMinimized = (config && config.keepMinimized)
	startHidden = (config && config.startHidden)

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
			configsData.isThemed = isThemed;
			configsData.keepMinimized = keepMinimized;
			configsData.startHidden = startHidden;
			ConfigManager.updateConfigs(configsData);
		}else{
			e.preventDefault();
			if (keepMinimized){
				mainWindow.minimize()
			}else{
				mainWindow.hide();
			}
		}
	});

	mainWindow.webContents.on('will-navigate', handleRedirect);
	mainWindow.webContents.on('new-window', handleRedirect);

	buildMenu(mainWindow);

	return mainWindow;
}


const getHideTick = () => {
	if (keepMinimized){
		return '☐';
	}else{
		return '☑';
	}
}

const getShowTick = () => {
	if (keepMinimized){
		return '☑';
	}else{
		return '☐';
	}
}

const buildMenu = (mainWindow) => {
	const template = [
		{
			label: 'Menu',
			submenu: [
				{
					label: 'Force reload', 
					click: () => {
						onForceReloadClicked();
					}
				}, {
					label: getIsThemed() ? "Remove theme (restart)" : "Apply theme",
					click: () => {
						onToggleThemeClicked();
					}
				}, {
					type: 'separator'
				}, {
					label: "Quit",
					accelerator: 'CommandOrControl+Q',
					click: () => {
						onQuitEntryClicked();
					}
				}
			]
		},{
			label: 'View',
			submenu: [
				{
					label: getHideTick() + ' Hide from windows list when minimized (restart)', 
					click: () => {
						onKeepMinimizedClicked(false);
					}
				}, {
					label: getShowTick() + ' Show in windows list when minimized (restart)', 
					click: () => {
						onKeepMinimizedClicked(true);
					}
				}
			]
		},{
			label: 'About',
			submenu: [
				{
					label: app.name + ' '+ app.getVersion() 
				},{
					label: 'electron '+process.versions.electron
				}

			]
		},{
			label: 'DevTools',
			accelerator: 'CommandOrControl+Shift+I',
			click: () => {
				mainWindow.webContents.openDevTools();;
			}

		}
	]
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

module.exports = {
	initializeWindow: initializeWindow,
	getIsThemed: getIsThemed,
	onForceReloadClicked: onForceReloadClicked,
	onToggleThemeClicked: onToggleThemeClicked,
	onQuitEntryClicked: onQuitEntryClicked,
	updateIcon: updateIcon,
	setOverlayIcon: setOverlayIcon,
	cleanOverlayIcon: cleanOverlayIcon
}

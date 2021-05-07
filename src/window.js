const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const { session } = require('electron')
const pathsManifest = require('./paths');
const ConfigManager = require('./configs');
const fs = require('fs');
const { platform } = require("process");
let mainWindow;
let isQuitting = false;
let keepMinimized = true;
let startHidden = true;
let isThemed = false;
let isDarkTheme = true;
let enableKeyboardShortcuts = false;
let enableNodeIntegration = true;
let openUrlInside = false;
let useXdgOpen = false;
let thirdPartyAuthLoginMode = false;
let useOldUrl = false;

const urlNotRedirected = ["accounts/SetOSID?authuser=0&continue=https%3A%2F%2Fchat.google.com"
						,"accounts.google.com/signin",
						"https://chat.google.com/"]

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

const getIsDarkTheme = () => {
	return isDarkTheme
};
const setIsDarkTheme = (b) => {
	isDarkTheme = b;
};

const getOpenUrlInside = () => {
	return openUrlInside;
};

const setOpenUrlInside = (b) => {
	openUrlInside = b;
};

const getUseXdgOpen = () => {
	return useXdgOpen;
};

const setUseXdgOpen = (b) => {
	useXdgOpen = b;
};

const getUseOldUrl = () => {
	return useOldUrl;
};

const setUseOldUrl = (b) => {
	useOldUrl = b;
};

const getEnableKeyboardShortcuts = () => {
	return enableKeyboardShortcuts;
};

const setEnableKeyboardShortcuts = (b) => {
	enableKeyboardShortcuts = b;
};

const getEnableNodeIntegration = () => {
	return enableNodeIntegration;
};

const setEnableNodeIntegration = (b) => {
	enableNodeIntegration = b;
};

const getThirdPartyAuthLoginMode = () => {
	return thirdPartyAuthLoginMode;
};

const setThirdPartyAuthLoginMode = (b) => {
	thirdPartyAuthLoginMode = b;
};

const onKeepMinimizedClicked = (keep) => {
	if (keep !== keepMinimized){
		keepMinimized = keep;
		app.relaunch();
		onQuitEntryClicked();
	}
}

const onStartHiddenClicked = () => {
	startHidden = !startHidden;
	app.relaunch();
	onQuitEntryClicked();
}

const onUseDarkThemeClicked = () => {
	setIsDarkTheme(! getIsDarkTheme());
	if (getIsThemed()){
		app.relaunch();
	}
}

const onQuitEntryClicked = () => {
	setIsQuitting(true);
	app.quit();
}

const onToggleThemeClicked = (window) => {
	setIsThemed(!getIsThemed());
	applyTheme(window)
	if (!getIsThemed() ){
		app.relaunch()
		onQuitEntryClicked();
	}
}

const onToggleThirdPartyAuthLoginMode = () => {
	setThirdPartyAuthLoginMode(!getThirdPartyAuthLoginMode());
	if (getThirdPartyAuthLoginMode()){
		setOpenUrlInside(true);
		setEnableNodeIntegration(false);
	} else {
		setOpenUrlInside(false);
		setEnableNodeIntegration(true);
	}
	app.relaunch();
	onQuitEntryClicked();
}

const onToggleOpenUrlInside = () => {
	setOpenUrlInside(!getOpenUrlInside());
	buildMenu();
}

const onToggleUseXdgOpen = () => {
	setUseXdgOpen(!getUseXdgOpen());
	if (getUseXdgOpen()){
		setOpenUrlInside(false);
	}
	buildMenu();
}

const onToggleUseOldUrl = () => {
	console.log("before toggle "+getUseOldUrl())
	setUseOldUrl(!getUseOldUrl());
	console.log("after toggle "+getUseOldUrl())
	app.relaunch();
	onQuitEntryClicked();
}

const onToggleKeyboardShortcuts = () => {
	setEnableKeyboardShortcuts(!getEnableKeyboardShortcuts());
	app.relaunch();
	onQuitEntryClicked();
}

const onToggleNodeIntegration = () => {
	setEnableNodeIntegration(!getEnableNodeIntegration());
	app.relaunch();
	onQuitEntryClicked();
}

const onForceReloadClicked = () => {
	mainWindow.webContents.reload();
	applyTheme();
}

const themeFile = () => {
	if (getIsDarkTheme()){
		return fs.readFileSync(pathsManifest.darktheme, 'utf8');
	}else{
		return fs.readFileSync(pathsManifest.theme, 'utf8');
	}
}

const applyTheme = () => {
	if (getIsThemed() ){
		mainWindow.webContents.executeJavaScript(themeFile());
		buildMenu()
	}
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

const getBrowserWindowOptions = (config) => {
	return {
		"title": process.title,
		"autoHideMenuBar": true,
		"webPreferences": {
			"nodeIntegration": config.enableNodeIntegration,
			"contextIsolation": false,
			"sandbox": false,
			"spellcheck": true
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
		"oldUrl": "https://chat.google.com/?shell=8&lfhs=2",
		"openLocally": true
	};
}

const handleTheme = () => {
	applyTheme();
	if (!startHidden) {
		mainWindow.show();
	}
}

const doNotRedirect = (url) => {
	return urlNotRedirected.some((e)=>url.includes(e))
}

const handleRedirect = (e, url) => {
	// leave redirect for double auth mechanism, trap crappy blocked url link
	if (url.includes("about:blank")) {
		e.preventDefault();
	} else if ( ! openUrlInside && ! doNotRedirect(url)){
		if (process.platform === 'linux' && getUseXdgOpen()){
			require('child_process').exec('xdg-open ' + url);
		}else{
			shell.openExternal(url);
		}
		e.preventDefault();
	}
};

const initializeWindow = (config) => {
	const bwOptions = (config && config.bounds) ? Object.assign(getBrowserWindowOptions(config), config.bounds) : getBrowserWindowOptions()
	const extraOptions = getExtraOptions();
	isThemed = (config && config.isThemed);
	isDarkTheme = (config && config.isDarkTheme);
	keepMinimized = (config && config.keepMinimized);
	startHidden = (config && config.startHidden);
	enableKeyboardShortcuts = (config && config.enableKeyboardShortcuts);
	enableNodeIntegration = (config && config.enableNodeIntegration);
	openUrlInside = (config && config.openUrlInside);
	useXdgOpen = (config && config.useXdgOpen);
	thirdPartyAuthLoginMode = (config && config.thirdPartyAuthLoginMode);
	useOldUrl = (config && config.useOldUrl);

	mainWindow = new BrowserWindow(bwOptions);
	if (useOldUrl){
		mainWindow.loadURL(extraOptions.oldUrl);
	}else{
		mainWindow.loadURL(extraOptions.url);
	}

	if (config.languages !== undefined){
		const ses = mainWindow.webContents.session
		ses.setSpellCheckerLanguages(config.languages)
	}
	mainWindow.once('ready-to-show', () => {
		handleTheme();
	});

	mainWindow.on('close', (e) => {
		if(isQuitting){
			let isMaximized = mainWindow.isMaximized();
			configsData = {};
			configsData.bounds = mainWindow.getBounds();
			configsData.wasMaximized = isMaximized;
			configsData.isThemed = isThemed;
			configsData.isDarkTheme = isDarkTheme;
			configsData.keepMinimized = keepMinimized;
			configsData.startHidden = startHidden;
			configsData.enableKeyboardShortcuts = enableKeyboardShortcuts;
			configsData.enableNodeIntegration = enableNodeIntegration;
			configsData.openUrlInside = openUrlInside;
			configsData.useXdgOpen = useXdgOpen;
			configsData.thirdPartyAuthLoginMode = thirdPartyAuthLoginMode;
			configsData.useOldUrl = useOldUrl;
		    
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

	buildMenu();

	return mainWindow;
}


const getHideTick = () => {
	return keepMinimized ? '☐' : '☑';
}

const getShowTick = () => {
	return keepMinimized ? '☑' : '☐';
}

const getStartHiddenTick = () => {
	return startHidden ? '☑' : '☐';
}

const getOpenUrlInsideTick= () => {
	return getOpenUrlInside() ? '☐' : '☑';
}

const getUseXdgOpenTick= () => {
	return getUseXdgOpen() ? '☑' : '☐';
}

const getIsDarkThemeTick= () => {
	return getIsDarkTheme() ? '☑' : '☐' ;
}

const getUseOldUrlTick= () => {
	return getUseOldUrl() ? '☑' : '☐' ;
}

const menuSubMenu= () => {

	return [
		{
			label: 'Force reload',
			click: () => {
				onForceReloadClicked();
			}
		},{
			label: getUseOldUrlTick() +	" Use old version of chat, to restore themes and notifications",
			click: () => {
				onToggleUseOldUrl();
			}
		},{
			label: getIsThemed() ? "Remove theme (restart)" : "Apply theme",
			click: () => {
				onToggleThemeClicked();
			}
		}, {
			label: getEnableKeyboardShortcuts() ? "Disable alt left/right shortcuts (restart)" : "Enable alt left/right shortcuts (restart)",
			click: () => {
				onToggleKeyboardShortcuts();
			}
		}, {
			type: 'separator'
		},{
			label: getThirdPartyAuthLoginMode() ? "Back to regular mode after auth (restart)" : "Use third party auth mode (restart)",
			click: () => {
				onToggleThirdPartyAuthLoginMode();
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
	];
}

const viewSubMenu= () => {
	if (platform === 'win32'){
		return [
			{
				label: getIsDarkThemeTick() + ' Use dark theme',
				click: () => {
					onUseDarkThemeClicked();
				}
			}, {
				type: 'separator'
			}, {
				label: getStartHiddenTick() + ' Start hidden (restart)',
				click: () => {
					onStartHiddenClicked();
				}
			}
		]
	} else {
		return [
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
			}, {
				type: 'separator'
			}, {
				label: getIsDarkThemeTick() + ' Use dark theme',
				click: () => {
					onUseDarkThemeClicked();
				}
			}, {
				type: 'separator'
			}, {
				label: getStartHiddenTick() + ' Start hidden (restart)',
				click: () => {
					onStartHiddenClicked();
				}
			}
		]
	}
}

const advancedSubMenu= () => {
	let mn = []
	mn.push({
		label: 'You should probably not tweak things here :-)',
	});
	mn.push({
		type: 'separator'
	});
	mn.push({
		label: getOpenUrlInsideTick() +	" Open URLs in external default browser",
		click: () => {
			onToggleOpenUrlInside();
		}
	});
	if (process.platform === 'linux'){
		mn.push({
			label: getUseXdgOpenTick() +	" Open URLs using xdg-open rather than default method",
			click: () => {
				onToggleUseXdgOpen();
			}
		});
	}
	mn.push({
		label: getEnableNodeIntegration() ? "Disable Node integration (breaks icon color change) (restart)" : "Enable Node integration (enables icon color change) (restart)",
		click: () => {
			onToggleNodeIntegration();
		}
	});
	return mn;
}

const buildMenu = () => {
	const template = [
		{
			label: 'Menu',
			submenu: menuSubMenu()
		},{
			label: 'View',
			submenu: viewSubMenu()
		},{
			label: 'Advanced',
			submenu: advancedSubMenu()
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
	getEnableKeyboardShortcuts: getEnableKeyboardShortcuts,
	onToggleKeyboardShortcuts: onToggleKeyboardShortcuts,
	onForceReloadClicked: onForceReloadClicked,
	onToggleThemeClicked: onToggleThemeClicked,
	onQuitEntryClicked: onQuitEntryClicked,
	onToggleThirdPartyAuthLoginMode: onToggleThirdPartyAuthLoginMode,
	getThirdPartyAuthLoginMode: getThirdPartyAuthLoginMode,
	onToggleUseOldUrl: onToggleUseOldUrl,
	getUseOldUrl: getUseOldUrl,
	updateIcon: updateIcon,
	setOverlayIcon: setOverlayIcon,
	cleanOverlayIcon: cleanOverlayIcon
}

const {app} = require('electron');
const WindowManager = require('./window');
const WindowManager2 = require('./hiddenWindow');
const TrayManager = require('./tray');
const KeyboardManager = require('./keyboard');
const ConfigManager = require('./configs');
const ContextMenu = require('./contextmenu');
const applicationVersion = require('./../package.json').version;
let mainWindow, hiddenWindow, systemTrayIcon, config, contextMenu;

process.title = 'Google Chat Linux (Unofficial)';
console.log(process.title + ' - v' + applicationVersion);
console.log('Node.js runtime version:', process.version);

const initialize = () => {
	config = ConfigManager.loadConfigs();
	
	if(!mainWindow) {
		mainWindow = WindowManager.initializeWindow(config);
	}	
	
	// the hiddentwindow has nodeIntegration=true and is used in Tray to change systray icon
	if(!hiddenWindow) {
		hiddenWindow = WindowManager2.initializeWindow(config);
	}

	if(!contextMenu) {
		contextMenu = ContextMenu.initializeContextMenu(mainWindow);
	}

	if(!systemTrayIcon) {
		systemTrayIcon = TrayManager.initializeTray(mainWindow, hiddenWindow, config);
	}


	KeyboardManager.registerKeyboardShortcuts(mainWindow);
	
};

app.on("ready", initialize);
app.on("activate", initialize);

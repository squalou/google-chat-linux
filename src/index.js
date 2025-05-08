const { app, Tray } = require('electron');
const WindowManager = require('./window');
const TrayManager = require('./tray');
const KeyboardManager = require('./keyboard');
const ConfigManager = require('./configs');
const ContextMenu = require('./contextmenu');
const applicationVersion = require('./../package.json').version;
let mainWindow, systemTrayIcon, config, contextMenu;

process.env.NODE_OPTIONS = "--no-force-async-hooks-checks";
process.env.ELECTRON_DISABLE_SANDBOX = true;
process.env.GTK_USE_PORTAL = 1;

process.title = 'Google Chat Linux';
console.log(process.title + ' - v' + applicationVersion);
console.log('Node.js runtime version:', process.version);
console.log('runtime platform : ', process.platform);

const initialize = () => {
    app.allowRendererProcessReuse = true;
    config = ConfigManager.loadConfigs();

    if (!mainWindow) {
        mainWindow = WindowManager.initializeWindow(config);
    }

    if (!contextMenu) {
        contextMenu = ContextMenu.initializeContextMenu(mainWindow);
    }

    if (!systemTrayIcon) {
        systemTrayIcon = TrayManager.initializeTray(mainWindow);
    }

    mainWindow.on('page-title-updated', function(e) { e.preventDefault() });

    if (WindowManager.getEnableKeyboardShortcuts()) {
        KeyboardManager.registerKeyboardShortcuts(mainWindow);
    }

};

if (process.platform === 'win32') {
    // Force single window, add Quit on taskbar for windows
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.quit();
    } else {
        app.on('second-instance', (event, argv) => {
            if (process.platform === 'win32' && argv.includes('--quit')) {
                // Needs to be delayed to not interfere with mainWindow.restore();
                setTimeout(() => {
                    console.log('Quitting via Task');
                    WindowManager.onQuitEntryClicked()
                    app.quit();
                }, 10);
            }
        });
    }

    app.setUserTasks([
        {
            program: process.execPath,
            arguments: '--quit',
            iconIndex: 0,
            title: "Quit"
        }
    ]);
}

app.on("ready", initialize);
app.on("activate", initialize);

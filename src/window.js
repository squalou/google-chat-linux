const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const path = require("path");
const pathsManifest = require("./paths");
const { platform } = require("process");
const ConfigManager = require("./configs");

let mainWindow;
let isQuitting = false;
let keepMinimized = true;
let startHidden = true;
let enableKeyboardShortcuts = false;
let enableNodeIntegration = true;
let openUrlInside = false;
let useXdgOpen = false;
let thirdPartyAuthLoginMode = false;

const noRedirectUrlArrayHardcoded = ["accounts/SetOSID?authuser=0&continue=https%3A%2F%2Fchat.google.com"
    , "accounts.google.com"
    , "accounts.youtube.com"
    , "mail.google.com/ServiceLogin"
    , "mail.google.com/chat"
    , "https://chat.google.com/"
];

const dirty_start_redirect_url = 'https://www.google.com/url?';
const dirty_end_redirect_url_array = ['&source=chat&', '&uct=', '&usg='];

let urlNotRedirectedTmp;
if (process.env.NO_REDIRECT_URL) {
    urlNotRedirectedTmp = noRedirectUrlArrayHardcoded.concat(process.env.NO_REDIRECT_URL.toString().split(","));
} else {
    urlNotRedirectedTmp = noRedirectUrlArrayHardcoded;
}
const urlNotRedirected = urlNotRedirectedTmp;
console.log("not redirected urls:");
console.log(urlNotRedirected);

const clean_url = (url) => {
    //console.log("cleaning url "+url);
    init_url = url;
    try {
        if (url.startsWith(dirty_start_redirect_url)) {
            url = url.substr(dirty_start_redirect_url.length);
            // now that initial dirt is away, there are still chars to remove. Find first http string and remove what's before
            ht = url.indexOf('http');
            url = url.substr(ht);
        }
        //console.log("cleaning url step 1 "+url);
        dirty_end_redirect_url_array.forEach(d => {
            e = url.indexOf(d);
            if (e > 0) {
                url = url.substr(0, e);
            }
        })
        url = decodeURIComponent(url);
        //console.log("cleaning url step 2 "+url);
        console.log("cleaning url from " + init_url + " to " + url);
        return url;
    }
    catch (e) {
        console.log("error while cleaning url " + url + "\n" + e);
        return init_url;
    }
}

ipcMain.on('open-link', (evt, href) => {
    href = clean_url(href);
    shell.openExternal(href);
});

const setIsQuitting = (b) => {
    isQuitting = b;
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
    if (keep !== keepMinimized) {
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

const onQuitEntryClicked = () => {
    setIsQuitting(true);
    app.quit();
}

const onToggleThirdPartyAuthLoginMode = () => {
    setThirdPartyAuthLoginMode(!getThirdPartyAuthLoginMode());
    if (getThirdPartyAuthLoginMode()) {
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
    if (getUseXdgOpen()) {
        setOpenUrlInside(false);
    }
    buildMenu();
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
}

const updateIcon = (icon) => {
    try {
        mainWindow.setIcon(icon);
    } catch (e) {
        //do nothing ... fails on some distribs / OS / window managers
        console.log("Failed to update window icon :-(")
        console.log(e)
    }
}

const setOverlayIcon = () => {
    try {
        mainWindow.setOverlayIcon(pathsManifest.OVERLAY_NEW_NOTIF, "!");
    } catch (e) {
        //do nothing ... fails on some distribs / OS / window managers
        //console.log(e)
    }
}

const cleanOverlayIcon = () => {
    try {
        mainWindow.setOverlayIcon(null, "");
    } catch (e) {
        //do nothing ... fails on some distribs / OS / window managers
        //console.log(e)
    }
}

const getBrowserWindowOptions = (config) => {
    // sandbox still required for url opens
    return {
        "title": process.title,
        "autoHideMenuBar": true,
        "webPreferences": {
            "nodeIntegration": config.enableNodeIntegration,
            "contextIsolation": true,
            "sandbox": false,
            "spellcheck": true,
            "preload": path.join(__dirname, 'faviconChanged.js'),
        },
        "show": false,
        "backgroundColor": "#262727",
        "icon": pathsManifest.NORMAL,
    }
}

const getExtraOptions = () => {
    return {
        "name": "Google Hangouts Chat for Linux",
        "url": "https://mail.google.com/chat/u/0",
        "openLocally": true
    };
}

const doNotRedirect = (url) => {
    return urlNotRedirected.some((e) => url.includes(e));
}

const downloadUrl = (url) => {
    var isDownloadAttachment =  url.startsWith("https://chat.google.com/") && url.indexOf("get_attachment_url?url_type=DOWNLOAD_URL")>-1;
    // console.log("is it a download url : " + isDownloadAttachment);
    return isDownloadAttachment;
}

const handleRedirect = (e, url) => {
    // return true if redirect was trapped here, else false, in order to continue with 'default' behaviour (useful for download attachements)
    //
    // leave redirect for double auth mechanism, trap crappy blocked url link
    // console.log(url)
    // console.log(e)
    var handled = false;
    if (e !== undefined && url.includes("about:blank")) {
        handled = true;
        e.preventDefault();
    } else if (!downloadUrl(url) && !openUrlInside && !doNotRedirect(url)) {
        handled = true;
        url = clean_url(url);
        if (process.platform === 'linux' && getUseXdgOpen()) {
            require('child_process').exec('xdg-open ' + url);
        } else {
            shell.openExternal(url);
        }
        if (e !== undefined) e.preventDefault();
    }
    return handled;
};

const getURL = (commandLine) => {
    const foundItem = commandLine.find(item => item.startsWith('gchat://'));
    return foundItem ? foundItem.replace('gchat://', 'https://') : null;
};

const initializeWindow = (config) => {
    const gotTheLock = app.requestSingleInstanceLock(undefined)
    if (!gotTheLock) {
        console.log("Another instance is already running ! aborting");
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
             if (mainWindow) {
                if (mainWindow.isMinimized()) { mainWindow.restore() }
                mainWindow.show()
                mainWindow.focus()
                const url = getURL(commandLine)
                if (url) {
                    mainWindow.loadURL(url)
                }
            }
        })
    }
    const bwOptions = (config && config.bounds) ? Object.assign(getBrowserWindowOptions(config), config.bounds) : getBrowserWindowOptions()
    const extraOptions = getExtraOptions();
    keepMinimized = (config && config.keepMinimized);
    startHidden = (config && config.startHidden);
    enableKeyboardShortcuts = (config && config.enableKeyboardShortcuts);
    enableNodeIntegration = (config && config.enableNodeIntegration);
    openUrlInside = (config && config.openUrlInside);
    useXdgOpen = (config && config.useXdgOpen);
    thirdPartyAuthLoginMode = (config && config.thirdPartyAuthLoginMode);

    mainWindow = new BrowserWindow(bwOptions);

    let url = getURL(process.argv)
    if (!url) {
        url = extraOptions.url
    }
    mainWindow.loadURL(url);

    if (config.languages !== undefined) {
        const ses = mainWindow.webContents.session
        ses.setSpellCheckerLanguages(config.languages)
    }
    mainWindow.once('ready-to-show', () => {
        if (!startHidden) {
            mainWindow.show();
        }

        const customCss = ConfigManager.loadCustomCss();
        if (customCss === '') {
            console.log('No custom CSS found');
        }
        else {
            mainWindow.webContents.insertCSS(customCss, {
                cssOrigin: 'author'
            }).then(result => {
                console.log('Custom CSS injected', result);
            });
        }
    });

    mainWindow.on('close', (e) => {
        if (isQuitting) {
            let isMaximized = mainWindow.isMaximized();
            configsData = {};
            configsData.bounds = mainWindow.getBounds();
            configsData.wasMaximized = isMaximized;
            configsData.keepMinimized = keepMinimized;
            configsData.startHidden = startHidden;
            configsData.enableKeyboardShortcuts = enableKeyboardShortcuts;
            configsData.enableNodeIntegration = enableNodeIntegration;
            configsData.openUrlInside = openUrlInside;
            configsData.useXdgOpen = useXdgOpen;
            configsData.thirdPartyAuthLoginMode = thirdPartyAuthLoginMode;

            ConfigManager.updateConfigs(configsData);
        } else {
            e.preventDefault();
            if (keepMinimized) {
                mainWindow.minimize()
            } else {
                mainWindow.hide();
            }
        }
    });

    mainWindow.webContents.on('will-navigate', handleRedirect);
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (handleRedirect(undefined, url)){
            return { action: 'deny' };
        } else {
            return { action: 'allow' };
        }
    });

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

const getOpenUrlInsideTick = () => {
    return getOpenUrlInside() ? '☐' : '☑';
}

const getUseXdgOpenTick = () => {
    return getUseXdgOpen() ? '☑' : '☐';
}

const menuSubMenu = () => {

    return [
        {
            label: 'Force reload',
            click: () => {
                onForceReloadClicked();
            }
        }, {
            label: getEnableKeyboardShortcuts() ? "Disable alt left/right shortcuts (restart)" : "Enable alt left/right shortcuts (restart)",
            click: () => {
                onToggleKeyboardShortcuts();
            }
        }, {
            type: 'separator'
        }, {
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

const viewSubMenu = () => {
    if (platform === 'win32') {
        return [
            {
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
                label: getStartHiddenTick() + ' Start hidden (restart)',
                click: () => {
                    onStartHiddenClicked();
                }
            }
        ]
    }
}

const advancedSubMenu = () => {
    let mn = []
    mn.push({
        label: 'You should probably not tweak things here :-)',
    });
    mn.push({
        type: 'separator'
    });
    mn.push({
        label: getOpenUrlInsideTick() + " Open URLs in external default browser",
        click: () => {
            onToggleOpenUrlInside();
        }
    });
    if (process.platform === 'linux') {
        mn.push({
            label: getUseXdgOpenTick() + " Open URLs using xdg-open rather than default method",
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
        }, {
            label: 'View',
            submenu: viewSubMenu()
        }, {
            label: 'Advanced',
            submenu: advancedSubMenu()
        }, {
            label: 'About',
            submenu: [
                {
                    label: app.name + ' ' + app.getVersion()
                }, {
                    label: 'electron ' + process.versions.electron
                }

            ]
        }, {
            label: 'DevTools',
            accelerator: 'CommandOrControl+Shift+I',
            click: () => {
                mainWindow.webContents.openDevTools();
            }

        }
    ]
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

module.exports = {
    initializeWindow: initializeWindow,
    getEnableKeyboardShortcuts: getEnableKeyboardShortcuts,
    onToggleKeyboardShortcuts: onToggleKeyboardShortcuts,
    onForceReloadClicked: onForceReloadClicked,
    onQuitEntryClicked: onQuitEntryClicked,
    onToggleThirdPartyAuthLoginMode: onToggleThirdPartyAuthLoginMode,
    getThirdPartyAuthLoginMode: getThirdPartyAuthLoginMode,
    updateIcon: updateIcon,
    setOverlayIcon: setOverlayIcon,
    cleanOverlayIcon: cleanOverlayIcon
}

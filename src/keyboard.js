const { globalShortcut } = require("electron");
let mainWindow;

const goBack = () => {
    if (mainWindow.webContents.canGoBack()) {
        mainWindow.webContents.goBack();
    }
}

const goForward = () => {
    if (mainWindow.webContents.canGoForward()) {
        mainWindow.webContents.goForward();
    }
}

const zoomIn = () => {
  const currentZoom = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
};

const zoomOut = () => {
  const currentZoom = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.setZoomFactor(currentZoom - 0.1);
};

const registerKeyboardShortcuts = (windowObj) => {
    mainWindow = windowObj;

    globalShortcut.register("Alt+Right", () => {
        goForward();
    });

    globalShortcut.register("Alt+Left", () => {
        goBack();
    });

    // Handle different keyboard layouts for zoom-in and zoom-out
    // for example: on some layouts,
    // the "+" key may be represented as "Shift+=" and in some other just as "+"
    mainWindow.webContents.on("before-input-event", (event, input) => {
        const isMac = process.platform === "darwin";
        const commandOrControl = isMac ? input.meta : input.control;
        const isZoomInShortcut = (commandOrControl && input.key === "+");
        const isZoomOutShortcut = (commandOrControl && input.key === "-");

        if (isZoomInShortcut) {
            zoomIn();
            event.preventDefault();
            return
        }
        if (isZoomOutShortcut) {
            zoomOut();
            event.preventDefault();
            return
        }
    });
};

module.exports = {
    "registerKeyboardShortcuts": registerKeyboardShortcuts
}
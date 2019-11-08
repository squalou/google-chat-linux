const {globalShortcut} = require("electron");
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

const registerKeyboardShortcuts = (windowObj) => {
	mainWindow = windowObj;
	
	globalShortcut.register("Alt+Right", () => {
		goForward();
	});

	globalShortcut.register("Alt+Left", () => {
		goBack();
	});
};

module.exports = {
	"registerKeyboardShortcuts": registerKeyboardShortcuts
}
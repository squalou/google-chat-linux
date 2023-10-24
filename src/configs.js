const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const pathsManifest = require("./paths");
const process = require("process");

const setConfigDefaults = (configuration) => {
    configuration.keepMinimized = configuration.keepMinimized === undefined ? true : configuration.keepMinimized;
    configuration.startHidden = configuration.startHidden === undefined ? false : configuration.startHidden;
    configuration.enableKeyboardShortcuts = configuration.enableKeyboardShortcuts === undefined ? false : configuration.enableKeyboardShortcuts;
    configuration.enableNodeIntegration = configuration.enableNodeIntegration === undefined ? true : configuration.enableNodeIntegration;
    configuration.openUrlInside = configuration.openUrlInside === undefined ? false : configuration.openUrlInside;
    configuration.useXdgOpen = configuration.useXdgOpen === undefined ? false : configuration.useXdgOpen;
    configuration.thirdPartyAuthLoginMode = configuration.thirdPartyAuthLoginMode === undefined ? false : configuration.thirdPartyAuthLoginMode;
    configuration.useOldUrl = configuration.useOldUrl === undefined ? false : configuration.useOldUrl;
    configuration.languages = configuration.languages === undefined ? undefined : configuration.languages;
    if (process.platform === 'win32') {
        configuration.keepMinimized = true;
    }
    console.log(configuration)
    console.log("?disable-gpu:" + app.commandLine.hasSwitch('disable-gpu'));
}

const loadConfigs = () => {
    try {
        c = JSON.parse(fs.readFileSync(pathsManifest.configsPath, "utf8"));
        setConfigDefaults(c);
        return c;
    } catch (e) {
        console.error(e);
        const defconfig = '{"bounds":{"x":456,"y":229,"width":1105,"height":757},"wasMaximized":false}'
        fs.writeFileSync(pathsManifest.configsPath, defconfig, 'utf8');
        c = JSON.parse(defconfig, "utf-8");
        setConfigDefaults(c);
        return c;
    }
}

const loadCustomCss = () => {
    const userDataPath = app.getPath('userData');
    const customCssFilePath = path.join(userDataPath, 'custom.css');

    if (fs.existsSync(customCssFilePath)) {
        try {
            const customCss = fs.readFileSync(customCssFilePath, 'utf8');
            return customCss;
        } catch (error) {
            console.error('Error reading custom.css file:', error);
            return '';
        }
    } else {
        console.log(`No custom.css file found in ${userDataPath}`);
        fs.writeFileSync(customCssFilePath, '/* Custom CSS for Google Chat */', 'utf8');
        return '';
    }
}

const updateConfigs = (updateData) => {
    let configs = loadConfigs();
    configs = Object.assign({}, configs, updateData);
    saveConfigs(configs);
}

const saveConfigs = (configData) => {
    try {
        fs.writeFileSync(pathsManifest.configsPath, JSON.stringify(configData), 'utf8');
    } catch (e) {
        console.error(e);
        return;
    }
}

module.exports = {
    "loadConfigs": loadConfigs,
    "updateConfigs": updateConfigs,
    "saveConfigs": saveConfigs,
    "loadCustomCss": loadCustomCss
}
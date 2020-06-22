const {app} = require("electron");
const fs = require("fs");
const pathsManifest = require("./paths");

const loadConfigs = () => {
	try {
		return JSON.parse(fs.readFileSync(pathsManifest.configsPath, "utf8"));
	} catch (e) {
		console.error(e);
		const defconfig = '{"bounds":{"x":456,"y":229,"width":1105,"height":757},"wasMaximized":false,"isThemed":false,"keepMinimized":true,"startHidden":false}'
		fs.writeFileSync(pathsManifest.configsPath,defconfig, 'utf8');
		return JSON.parse(defconfig, "utf-8")
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
	"saveConfigs": saveConfigs
}
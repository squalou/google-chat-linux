const {app} = require("electron");
const fs = require("fs");
const pathsManifest = require("./paths");

const loadConfigs = () => {
	try {
		return JSON.parse(fs.readFileSync(pathsManifest.configsPath, "utf8"));
	} catch (e) {
		console.error(e);
		return null;
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
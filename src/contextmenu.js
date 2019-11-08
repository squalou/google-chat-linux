const contextMenu = require('electron-context-menu');

const initializeContextMenu = () => {
	contextMenu({		
		showInspectElement: false,
		showCopyImageAddress: true,
		showSaveImageAs: true,		
	});
}

module.exports = {
	initializeContextMenu: initializeContextMenu,
}
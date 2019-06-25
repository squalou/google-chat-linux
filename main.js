'use strict';

const electron = require('electron');
var app = electron.app;  // Module to control application life.
var WrappedWindow = require('./wrappedWindow');

// Report crashes to our server.
//electron.crashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  mainWindow = WrappedWindow({
    name: 'Google Hangouts Chat',
    url: 'https://chat.google.com/',
    openLocally: false
  });
});

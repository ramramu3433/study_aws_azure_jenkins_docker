"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
var appStateFileName = "appState.json";
var defaultAppState = {
    lastWindowState: {
        rect: {
            x: 0,
            y: 0,
            width: 1000,
            height: 768
        },
        maximized: false
    }
};
/**
 * Retrieves the saved application state of the last session.
 * If no saved state is found, the default state is returned.
 *
 * Allows us load window state from the previous sessions. Normally we'd use
 * existing methods of saving app settings on the frontend. But saving info
 * about the window requires access to the Electron APIs, which the front end
 * doesn't have.
 */
function getSavedOrDefaultAppState() {
    try {
        var storageFile = path.join(electron_1.app.getPath("userData"), appStateFileName);
        var storageData = JSON.parse(fs.readFileSync(storageFile, "utf-8"));
        return storageData || defaultAppState;
    }
    catch (error) {
        console.error("An error ocurred while retrieving previous app state:\n" + error);
        return defaultAppState;
    }
}
exports.getSavedOrDefaultAppState = getSavedOrDefaultAppState;
/**
 * Saves the current state of the application to disk.
 *
 * Allows us to save the window state between sessions. Normally we'd use
 * existing methods of saving app settings on the frontend. But saving info
 * about the window requires access to the Electron APIs, which the front end
 * doesn't have.
 */
function saveAppState(mainWindow) {
    // Save window position and dimensions
    var bounds = mainWindow.getBounds();
    // Overwrite only the saved window position/dimensions
    var currentState = getSavedOrDefaultAppState();
    if (mainWindow.isMaximized()) {
        currentState.lastWindowState.maximized = true;
    }
    else {
        currentState.lastWindowState.maximized = false;
        currentState.lastWindowState.rect = bounds;
    }
    try {
        var storageFile = path.join(electron_1.app.getPath("userData"), appStateFileName);
        fs.writeFileSync(storageFile, JSON.stringify(currentState));
    }
    catch (error) {
        console.error("An error occurred while saving current app state:\n" + error);
    }
}
exports.saveAppState = saveAppState;

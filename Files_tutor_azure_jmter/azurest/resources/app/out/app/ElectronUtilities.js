"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module ElectronUtilities
 * Utilities functions that depend on being an Electron process
 */
var Constants = require("./Constants");
var electron_1 = require("electron");
/**
 * Clears the cookie jar.
 */
function clearCookieJar(window) {
    if (isRendererProcess()) {
        electron_1.ipcRenderer.send(Constants.ClearCookieJarIpcChannel);
    }
    else {
        console.assert(!!window, "A BrowserWindow instance is needed to clear the cookies!");
        if (window) {
            window.webContents.session.clearStorageData({ storages: ["cookies"] });
        }
    }
}
exports.clearCookieJar = clearCookieJar;
/**
 * Downloads the specified file from url to local path.
 */
function downloadFile(url, path, jobId, callback) {
    if (isRendererProcess()) {
        electron_1.ipcRenderer.send(Constants.DownloadFileIpcChannel, url, path, jobId);
    }
    else {
        downloadWindow = downloadWindow ? downloadWindow : new electron_1.BrowserWindow({ show: false });
        downloadWindow.webContents.session.once("will-download", function (event, item, webContents) {
            item.setSavePath(path);
            item.once("done", function (event, state) {
                if (callback) {
                    callback(jobId, state);
                }
            });
        });
        downloadWindow.webContents.downloadURL(url);
    }
}
exports.downloadFile = downloadFile;
function isRendererProcess() {
    return process.type === "renderer";
}
var downloadWindow;

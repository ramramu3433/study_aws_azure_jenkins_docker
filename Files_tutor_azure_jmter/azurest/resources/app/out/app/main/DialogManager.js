"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var DialogRegistry_1 = require("./DialogRegistry");
var ExceptionSerialization_1 = require("../renderer/Components/Errors/ExceptionSerialization");
var electron_1 = require("electron");
var url = require("url");
var path = require("path");
var appRootPath = "../..";
var manifestRootPath = "../dialogs";
var DialogManager = (function () {
    function DialogManager(appWindow) {
        var _this = this;
        this.disposing = false;
        this.parentWindow = appWindow;
        electron_1.ipcMain.on("get-dialog-result", function (e, id, shellInfo, args) {
            console.log("Received message 'get-dialog-result'");
            try {
                _this.openDialog(id, shellInfo, args);
            }
            catch (error) {
                _this.finalize(error);
            }
        });
        electron_1.ipcMain.on("did-get-dialog-result", function (e, error, result) {
            console.log("Received message 'did-get-dialog-result'");
            _this.finalize(error, result);
        });
        electron_1.ipcMain.on("dialog-execute-operation", function (e, messageID, namespace, args) {
            console.log("Received message 'dialog-execute-operation'");
            _this.parentWindow.webContents.send("execute-operation", messageID, namespace, args);
        });
        electron_1.ipcMain.on("did-execute-operation", function (e, messageID, error, result) {
            console.log("Received message 'did-execute-operation'");
            if (!!_this.dialogWindow) {
                _this.dialogWindow.webContents.send("dialog-did-execute-operation", messageID, error, result);
            }
        });
        electron_1.ipcMain.on("dialog-theme-change", function (e, newTheme) {
            console.log("Received message 'dialog-theme-change'");
            if (!!_this.dialogWindow) {
                _this.dialogWindow.webContents.send("dialog-theme-change", newTheme);
            }
        });
        electron_1.ipcMain.on("dialog-zoom-change", function (e, zoomFactor) {
            console.log("Received message 'dialog-zoom-change'");
            if (!!_this.dialogWindow) {
                _this.dialogWindow.webContents.send("dialog-zoom-change", zoomFactor);
            }
        });
    }
    DialogManager.prototype.getDialogManifest = function (id) {
        var manifestPath = DialogRegistry_1.default[id];
        if (!manifestPath) {
            throw new Error("The dialog id '" + id + "' is not registered");
        }
        manifestPath = path.join(manifestRootPath, manifestPath);
        try {
            return require(manifestPath);
        }
        catch (error) {
            throw new Error("Unable to load dialog manifest for ID '" + id + "': " + error);
        }
    };
    DialogManager.prototype.openDialog = function (id, shellInfo, args) {
        var _this = this;
        if (this.isDialogOpen()) {
            throw new Error("A dialog is already open. Make sure you're not opening a dialog from another dialog and that all other dialogs are closed.");
        }
        var manifest = this.getDialogManifest(id);
        var htmlPath = url.format({
            protocol: "file",
            slashes: true,
            pathname: path.join(__dirname, appRootPath, manifest.view)
        });
        var preloadPath = path.join(__dirname, appRootPath, "app/dialogs/Common/DialogView.js");
        this.dialogWindow = new electron_1.BrowserWindow({
            backgroundColor: "transparent",
            frame: true,
            center: true,
            height: manifest.dimensions.height || 500,
            width: manifest.dimensions.width || 500,
            minHeight: manifest.dimensions.height || 500,
            minWidth: manifest.dimensions.width || 500,
            minimizable: false,
            maximizable: false,
            modal: true,
            parent: this.parentWindow,
            resizable: true,
            show: false,
            skipTaskbar: true,
            useContentSize: true,
            webPreferences: {
                preload: preloadPath
            }
        });
        this.dialogWindow.setMenuBarVisibility(false);
        this.dialogWindow.loadURL(htmlPath);
        electron_1.ipcMain.once("dialog-ready", function () {
            console.log("Received message 'dialog-ready'");
            // For some reason, setting the webPreferences.zoomFactor option at
            // window creation doesn't work, so we need to send the zoom factor
            // to the dialog manually.
            _this.dialogWindow.webContents.send("dialog-init", shellInfo, {
                viewModel: path.join(__dirname, appRootPath, manifest.viewModel),
                args: args
            });
        });
        electron_1.ipcMain.once("dialog-did-init", function (event, error) {
            console.log("Received message 'dialog-did-init'");
            if (!!error) {
                _this.finalize(error);
            }
            else {
                // 50 ms delay before showing is a workaround for flash of unstyled content.
                // Although everything in the dialog is initialized at this point, the dialog
                // window may not have finished rendering with the correct theme colors.
                setTimeout(function () {
                    _this.dialogWindow.show();
                    _this.dialogWindow.webContents.send("dialog-shown");
                }, 50);
            }
        });
        this.dialogWindow.once("closed", function (e) {
            console.log("Received message 'closed'");
            _this.finalize();
        });
        this.dialogWindow.webContents.once("crashed", function (e) {
            console.log("Received message 'crashed'");
            _this.finalize("The dialog renderer process crashed");
        });
    };
    DialogManager.prototype.isDialogOpen = function () {
        return !!this.dialogWindow;
    };
    DialogManager.prototype.finalize = function (error, result) {
        if (!this.disposing) {
            this.disposing = true;
            if (!!error) {
                console.error(error);
            }
            var serializedError = !!error ? ExceptionSerialization_1.default.serialize(error) : undefined;
            this.parentWindow.webContents.send("did-get-dialog-result", serializedError, result);
            // Don't try to close the window if it's already been destroyed.s
            if (!!this.dialogWindow && !this.dialogWindow.isDestroyed()) {
                this.dialogWindow.close();
            }
            this.dialogWindow = null;
            this.disposing = false;
        }
    };
    return DialogManager;
}());
exports.default = DialogManager;

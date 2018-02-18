"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var q = require("q");
var electron_1 = require("electron");
var MessageBoxManager = (function () {
    function MessageBoxManager() {
    }
    /**
     * Displays a system message box.
     *
     * @param title
     * @param message
     * @param messageType
     * @param buttons Optional. An array of strings containing labes for buttons to show in the message box.
     */
    MessageBoxManager.prototype.showMessageBox = function (title, message, messageType, buttons) {
        if (buttons === void 0) { buttons = ["OK"]; }
        return q.Promise(function (resolve, reject) {
            var focusedWindow = electron_1.remote.BrowserWindow.getFocusedWindow();
            electron_1.remote.dialog.showMessageBox(focusedWindow, {
                type: messageType,
                message: message,
                title: title,
                cancelId: -1,
                buttons: buttons
            }, resolve);
        });
    };
    return MessageBoxManager;
}());
var instance = new MessageBoxManager();
exports.default = instance;

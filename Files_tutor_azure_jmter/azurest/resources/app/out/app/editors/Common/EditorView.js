"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Host_1 = require("./Host");
var WebpageThemeManager_1 = require("../../common/WebpageThemeManager");
var electron_1 = require("electron");
var ko = require("knockout");
window.onload = function () {
    electron_1.ipcRenderer.sendToHost("webview-ready");
    electron_1.ipcRenderer.once("webview-init-request", function (e, vmModuleName, parameters) {
        if (!!vmModuleName) {
            try {
                var vmModule = require(vmModuleName);
                if (!vmModule.default || typeof vmModule.default !== "function") {
                    throw new Error("The view model at '" + vmModuleName + "' does not have a class as a default export");
                }
                var viewModel = new vmModule.default(parameters);
                ko.applyBindings(viewModel);
            }
            catch (error) {
                electron_1.ipcRenderer.sendToHost("webview-init-response", error.message);
            }
        }
        Host_1.default.executeOperation("Environment.Theming.getTheme", {})
            .then(function (theme) {
            WebpageThemeManager_1.default.setTheme(theme);
            electron_1.ipcRenderer.sendToHost("webview-init-response");
        });
    });
};

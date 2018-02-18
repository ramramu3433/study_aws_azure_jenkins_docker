"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is the start-up code for the Electron renderer process for our single BrowserWindow which hosts
 *   the entire Storage Explorer window contents.
 */
// Handle any uncaught exception and send the information to the main process.
var electron_1 = require("electron");
var electron_2 = require("electron");
process.on("uncaughtException", function (err) {
    electron_1.ipcRenderer.send(constants.UncaughtExceptionRendererEvent, err.message, err.name, err.stack, err.source);
});
process.on("unhandledRejection", function (error) {
    // Print out any promises with unhandled rejections
    console.error("UNHANDLED PROMISE REJECTION: ");
    console.error(error);
});
// Standarize current directoy to avoid different expectations depending
// on where the app is running from a package or debug.
// Right now we standarize to "out" folder, so path "./app/index.js" will resolve to
// "{ABSOLUTE PATH TO OUT FOLDER}/app/index.js"
var path = require("path");
process.chdir(path.resolve(__dirname, "../.."));
var ko = require("knockout");
// Make sure host is initialized.
require("./marshalers/CloudExplorerProxyMarshaler");
// Setup custom Knockout bindings.
require("./UI/Bindings/DaytonaBinding");
require("./UI/Bindings/WebviewBinding");
require("./UI/Bindings/IconBinding");
require("./UI/Bindings/AccessibilityBinding");
// Make sure host is initialized.
require("./marshalers/CloudExplorerProxyMarshaler");
var ProxySettingsManager_1 = require("./common/ProxySettingsManager");
var constants = require("../Constants");
var menuManager = require("./MenuManager");
var ShellViewModel_1 = require("./UI/ShellViewModel");
var updatesManager = require("./Updates/UpdatesManager");
var releaseNotesManager = require("./ReleaseNotesManager");
var StartupManager_1 = require("./startup/StartupManager");
var utilities = require("../Utilities");
var SslCertificateManager_1 = require("./SslCertificateManager");
var SessionManager_1 = require("./SessionManagement/SessionManager");
// Configure the app menu for this window.
menuManager.configureAppMenu();
// Apply bindings
ko.applyBindings(ShellViewModel_1.default);
electron_1.ipcRenderer.on("deep-link-clicked", function (event, url) {
    global[constants.macParams] = url;
    if (StartupManager_1.default.validateDeeplink(url)) {
        StartupManager_1.default.navigateToResource();
    }
});
electron_1.ipcRenderer.on("SessionManagement", function (event, arg) {
    if (arg === "endSession") {
        SessionManager_1.default.endSession()
            .then(function () {
            electron_1.ipcRenderer.send("SessionManagement", "sessionEnded");
        });
    }
});
// If user starts Storage Explorer from a deeplink, navigate to the resource directly bypass any additional dialogs.
if (StartupManager_1.default.validateDeeplink()) {
    StartupManager_1.default.navigateToResource();
}
else {
    ShellViewModel_1.default.showEulaDialogIfNeeded()
        .then(function (dialogShowed) {
        if (dialogShowed) {
            // If EULA dialog was shown before, we need to wait until the animation is finished.
            // TODO: Use a custom binding to notify when the animation is finished from jQuery library.
            setTimeout(ShellViewModel_1.default.showConnectDialogIfNeeded, 500);
        }
        else {
            ShellViewModel_1.default.showConnectDialogIfNeeded();
        }
    });
    ShellViewModel_1.default.showNpsDialogIfNeeded();
}
// Look for updates periodically
if (!utilities.isDebug()) {
    updatesManager.monitorUpdates();
}
// check to see if running a preview build, if so:
// 1. change window title
// 2. add user to insiders group
// 3. reconfigure the app menu to include the insiders options
var packageInfo = require("../../../package.json");
if (packageInfo.isPreview) {
    electron_2.remote.getCurrentWindow().setTitle(packageInfo.displayName + " (Preview)");
    var userIsInsider = !!updatesManager.getUpdateGroupPercentile("insiders");
    if (!userIsInsider) {
        updatesManager.setUpdateGroup("insiders", Math.floor((Math.random() * 100) + 1));
    }
    menuManager.configureAppMenu();
}
// Add any user provided ssl certs to the node CA, this needs to be done
// before any HTTPS requests are made.
SslCertificateManager_1.default.loadTrustedCerts();
// Apply existing proxy settings.
// This needs to be done early before any HTTP/S requests are made.
ProxySettingsManager_1.default.loadProxySettings()
    .then(function (savedProxySettings) {
    if (savedProxySettings.useProxy) {
        return ProxySettingsManager_1.default.setProxySettings(savedProxySettings);
    }
})
    .catch(function (error) { return ShellViewModel_1.default.infoBarViewModel.showSingleLink(error.message, null, constants.InfoBarTypes.errorLink); });
releaseNotesManager.didUpdateSinceLastRun();
var gcIntervalSeconds = electron_2.remote.getGlobal(constants.sharedObjectName).stgexpGC;
if (gcIntervalSeconds) {
    setInterval(function () {
        console.log("STGEXP_GC: Requesting GC");
        window.gc();
    }, gcIntervalSeconds * 1000);
}

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is the start-up code for the Electron main process
 */
require("msint-identity-aad-electron");
var electron_1 = require("electron");
var constants = require("./Constants");
var electronUtilities = require("./ElectronUtilities");
var telemetryManager = require("./renderer/telemetry/TelemetryManager");
var q = require("q");
var AppSettingsHelper = require("./AppSettingsHelper");
var DialogManager_1 = require("./main/DialogManager");
var os = require("os");
var SingleInstanceManager_1 = require("./renderer/Components/SingleInstance/SingleInstanceManager");
var process = require("process");
var NodeIPCFactory_1 = require("./renderer/Components/IPC/Node/NodeIPCFactory");
var child_process_1 = require("child_process");
var packageInfo = require("../../package.json");
var mainWindow;
var dialogManager;
var pipeName = NodeIPCFactory_1.default.mainIPCHandle(electron_1.app.getPath("userData"), packageInfo.appName, packageInfo.version);
var forceNewInstance = process.argv.some(function (value) { return value === "-n"; });
var singleInstanceManager = new SingleInstanceManager_1.default(pipeName, forceNewInstance);
/**
 * Flags to pass to the Chromium V8 JavaScript engine
 *
 *   --expose_gc = exposes a "window.gc()" method to request garbage collection
 */
var v8Flags = "--expose_gc";
electron_1.app.commandLine.appendSwitch("--js-flags", v8Flags);
function showErrorMessage(title, message, buttons, cancelId) {
    return q.Promise(function (resolve, reject) {
        var focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
        electron_1.dialog.showMessageBox(focusedWindow, {
            type: "error",
            message: message,
            title: title,
            cancelId: cancelId,
            buttons: buttons
        }, resolve);
    });
}
function uncaughtJSErrorHandler(event, message, name, stack, source) {
    telemetryManager.sendError("StorageExplorerUncaughtJSError", {
        message: message,
        name: name,
        stack: stack,
        source: source
    });
    return showErrorMessage("Storage Explorer Error", // Localize
    "An unexpected error occurred:\n\n" + (stack || message || name), // Localize
    ["Restart", "Close Application", "Ignore"], // Localize
    2).then(function (response) {
        switch (response) {
            case 0:
                // The user wants to restart, create the window again
                createMainWindow();
                break;
            case 1:
                // The user wants to close the app.
                process.exit(-1);
                break;
        }
    });
}
;
function rendererProcessCrashHandler() {
    telemetryManager.sendError("StorageExplorerRendererProcessCrash");
    return showErrorMessage("Storage Explorer has stopped working", // Localize
    "A problem caused Storage Explorer to stop working correctly (the renderer process crashed). Storage Explorer can try to restart the program.", // Localize
    ["Restart", "Close Application"], // Localize
    1).then(function (response) {
        switch (response) {
            case 0:
                //  The user wants to restart, create the window again
                createMainWindow();
                break;
            default:
                // The user wants to close the app.
                process.exit(-1);
        }
    });
}
;
function mainProcessGPUCrashHandler() {
    telemetryManager.sendError("StorageExplorerMainProcessGPUCrash");
    return showErrorMessage("Storage Explorer has stopped working", // Localize
    "A problem caused Storage Explorer to stop working correctly (the GPU process crashed). Please close and restart the application.", // Localize
    ["Close Application"], 0).then(function () {
        process.exit(-1);
    });
}
;
function onMainWindowClosed() {
    mainWindow = null;
    electron_1.app.quit();
}
;
function openNewWindow() {
    child_process_1.spawn(process.execPath, ["-n"], { detached: true, stdio: "ignore" });
}
function createMainWindow() {
    // Destroy the window if it was open already.
    if (mainWindow) {
        mainWindow.removeListener("closed", onMainWindowClosed);
        mainWindow.close();
        mainWindow = null;
    }
    /*
     * As of Electron 1.4.4, width/height cannot be >= minWidth/minHeight, see
     * issue #7735 in the Electron github repo for more information.
     * As of Electron 1.4.4, the version of Chrome powering Electron does not
     * respect Windows scaling very well. Until Electron is updated to use
     * a new Chrome, we have decided to not use minWidth and minHeight. See
     * issue #6571 in the Electron github repo for more information.
     */
    // var minWidth = Math.min(1000, width - 1);
    // var minHeight = Math.min(768, height - 1);
    // Create the window
    var windowOptions = {
        title: packageInfo.displayName,
        // minWidth: minWidth,
        // minHeight: minHeight,
        icon: __dirname + "/icon.png" // Linux icon on launcher
    };
    var appState = AppSettingsHelper.getSavedOrDefaultAppState();
    var rect = appState.lastWindowState.rect;
    var display = electron_1.screen.getDisplayMatching(rect);
    // Clamp the final window position (ensures the window doesn't appear too far off screen)
    var targetPos = {
        min: {
            x: display.workArea.x,
            y: display.workArea.y
        },
        max: {
            x: Math.max(display.workArea.x, display.workArea.x + display.workArea.width - rect.width),
            y: Math.max(display.workArea.y, display.workArea.y + display.workArea.height - rect.height)
        }
    };
    windowOptions.x = Math.min(Math.max(rect.x, targetPos.min.x), targetPos.max.x);
    windowOptions.y = Math.min(Math.max(rect.y, targetPos.min.y), targetPos.max.y);
    windowOptions.width = rect.width;
    windowOptions.height = rect.height;
    mainWindow = new electron_1.BrowserWindow(windowOptions);
    if (appState.lastWindowState.maximized) {
        mainWindow.maximize();
    }
    // Enable this to show developer tools if there is an exception before the application is fully initialized
    // mainWindow.webContents.toggleDevTools();
    var preventBubbling = function (e) {
        e.preventDefault();
        return false;
    };
    // Prevent the window to navigate to other pages.
    // i.e: When droping a file to the app.
    mainWindow.webContents.on("will-navigate", preventBubbling);
    var sessionEnded = false;
    mainWindow.on("close", function (event) {
        if (!sessionEnded) {
            preventBubbling(event);
            mainWindow.webContents.send("SessionManagement", "endSession");
        }
        else {
            // In case of application shutdown during the process of an account sign-in, clear all cookies (271343).
            electronUtilities.clearCookieJar(mainWindow);
            // Save window position and dimensions
            AppSettingsHelper.saveAppState(mainWindow);
        }
    });
    electron_1.ipcMain.on("SessionManagement", function (evnt, args) {
        if (args === "sessionEnded") {
            sessionEnded = true;
            singleInstanceManager.end()
                .then(function () {
                electron_1.app.quit();
            });
        }
    });
    electron_1.ipcMain.on("open-new-window", function (evnt, args) {
        openNewWindow();
    });
    // Remove the reference of the window to avoid memory leaks
    // when the app is closed.
    mainWindow.on("closed", onMainWindowClosed);
    // Handle process crashes unexpectly
    // Documentation: http://electron.atom.io/docs/all/#event-crashed
    mainWindow.webContents.on("crashed", rendererProcessCrashHandler);
    // Load the main page.
    mainWindow.loadURL("file://" + __dirname + "/renderer/index.html");
    dialogManager = new DialogManager_1.default(mainWindow);
}
function finishSetup() {
    // Set the AppId early once the app is ready.
    // This allowes the OS to identify the app instance and
    // not confuse it with another Electron app.
    // This needs to be executed right after the app is ready.
    electron_1.app.setAppUserModelId("com.microsoft.StorageExplorer");
    // Prevent the default Menu to appear
    var menuConfig = electron_1.Menu.buildFromTemplate([]);
    electron_1.Menu.setApplicationMenu(menuConfig);
    if (os.platform() === "win32") {
        electron_1.app.setJumpList([{
                type: "tasks",
                items: [
                    {
                        type: "task",
                        title: "New Window",
                        description: "Opens a new window",
                        program: process.execPath,
                        args: "-n",
                        iconPath: process.execPath,
                        iconIndex: 0
                    }
                ]
            }]);
    }
    else if (os.platform() === "darwin") {
        var dockMenu = electron_1.Menu.buildFromTemplate([
            {
                label: "New Window", click: function () {
                    openNewWindow();
                }
            }
        ]);
        electron_1.app.dock.setMenu(dockMenu);
    }
    createMainWindow();
}
function setup() {
    // Handle gpu process crashes unexpectly
    // Documentation: http://electron.atom.io/docs/all/#event-gpu-process-crashed
    electron_1.app.on("gpu-process-crashed", mainProcessGPUCrashHandler);
    // To get custom url proocol in OSX, we need to listen to the open-url event
    // before the ready event since your app is registered to URL schemes
    electron_1.app.on("open-url", function (event, url) {
        global[constants.macParams] = url;
        // If StorageExplorer is already open, notify the renderer process by passing the new deeplink url
        if (mainWindow) {
            mainWindow.focus(); // To prevent the app from losing focus when full screen on OSX
            mainWindow.webContents.send("deep-link-clicked", url);
        }
    });
    electron_1.app.on("open-file", function (event, path) {
        global[constants.macParams] = path;
        // If StorageExplorer is already open, notify the renderer process by passing the new deeplink url
        if (mainWindow) {
            mainWindow.focus(); // To prevent the app from losing focus when full screen on OSX
            mainWindow.webContents.send("deep-link-clicked", path);
        }
    });
    process.on("unhandledRejection", function (error) {
        // Print out any promises with unhandled rejections
        console.error("UNHANDLED PROMISE REJECTION: ");
        console.error(error);
    });
    // Handle uncaught exceptions from renderer processes
    electron_1.ipcMain.on(constants.UncaughtExceptionRendererEvent, uncaughtJSErrorHandler);
    // Clears the cookie jar upon request from renderer processes (271343).
    electron_1.ipcMain.on(constants.ClearCookieJarIpcChannel, function () { electronUtilities.clearCookieJar(mainWindow); });
    // Downloads a file upon request from renderer processes.
    electron_1.ipcMain.on(constants.DownloadFileIpcChannel, function (event, url, path, jobId) {
        electronUtilities.downloadFile(url, path, jobId, function (callbackJobId, state) {
            event.sender.send(constants.DownloadDoneIpcChannel, callbackJobId, state);
        });
    });
    // Save shared state
    global[constants.sharedObjectName] = {
        args: process.argv,
        stgexpGC: Number(process.env.STGEXP_GC || 0) // GC interval in seconds
    };
    if (electron_1.app.isReady()) {
        finishSetup();
    }
    else {
        electron_1.app.on("ready", function () {
            finishSetup();
        });
    }
}
function onStartupArgsReceived(args) {
    if (!!mainWindow) {
        var deepLinkArg = args.filter(function (arg) { return arg.indexOf("storageexplorer://") === 0; })[0];
        if (!!deepLinkArg) {
            mainWindow.webContents.send("deep-link-clicked", deepLinkArg);
        }
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.focus();
    }
    return Promise.resolve(undefined);
}
singleInstanceManager.ensureSingleInstance(onStartupArgsReceived)
    .then(function (result) {
    if (result.shouldExit) {
        electron_1.app.quit();
    }
    else {
        setup();
    }
})
    .catch(function (error) {
    // ignore the error, go ahead and run setup
    setup();
});

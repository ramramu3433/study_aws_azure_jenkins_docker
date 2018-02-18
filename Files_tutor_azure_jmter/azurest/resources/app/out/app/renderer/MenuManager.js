"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ProxySettingsManager_1 = require("./common/ProxySettingsManager");
var SessionManager_1 = require("./SessionManagement/SessionManager");
var ShellViewModel_1 = require("./UI/ShellViewModel");
var SslCertificateManager_1 = require("./SslCertificateManager");
var StorageApiSettingManager_1 = require("./StorageApiSettingManager");
var ThemeManager_1 = require("./UI/ThemeManager");
var ZoomLevelManager_1 = require("./ZoomLevelManager");
var electron_1 = require("electron");
var TestManager_1 = require("./Components/TestManager/TestManager");
var NotificationBarManager = require("./NotificationBarManager");
var TelemetryManager = require("./telemetry/TelemetryManager");
var constants = require("../Constants");
var releaseNotesManager = require("./ReleaseNotesManager");
var Utilities = require("../Utilities");
var updatesManager = require("./Updates/UpdatesManager");
var packageInfo = require("../../../package.json");
var host = global.host;
// Localize the UI text on this file.
/**
 * Opens the web site with the privacy statements.
 */
function openPrivacyStatement() {
    electron_1.shell.openExternal("https://go.microsoft.com/fwlink/?LinkID=528096&clcid=0x409");
}
function openTroubleshooting() {
    electron_1.shell.openExternal("https://go.microsoft.com/fwlink/?linkid=854150");
}
/**
 * Opens a new dialog window with information about the app.
 */
function openAboutDialog() {
    var userId = Utilities.loadSettings("Standalone_Telemetry_UserId");
    var detailMessage = "\nVersion: " + electron_1.remote.app.getVersion() + "\n"
        + ("\nPlatform: " + (packageInfo.platform ? packageInfo.platform : ""))
        + ("\nBuild Number: " + (packageInfo.buildNumber ? packageInfo.buildNumber : ""))
        + ("\nCommit: " + (packageInfo.commit ? packageInfo.commit : ""))
        + ("\nSupport Id: " + userId)
        + "\n\nCopyright (C) 2016 Microsoft. All rights reserved.";
    electron_1.remote.dialog.showMessageBox(null, {
        message: packageInfo.displayName,
        detail: detailMessage,
        buttons: ["OK"]
    }, function (result) { return null; });
}
/**
 * Opens a new dialog window with information about the app.
 */
function openDocumentation() {
    electron_1.shell.openExternal("https://go.microsoft.com/fwlink/?linkid=841879");
}
function openNewWindow() {
    electron_1.ipcRenderer.send("open-new-window");
}
/**
 * Configures the app menu.
 * This will be shared across multiple windows.
 */
function configureAppMenu() {
    var userIsInsider = !!updatesManager.getUpdateGroupPercentile("insiders");
    var menuTemplate = [];
    var aboutSubmenu = {
        label: "About",
        click: openAboutDialog
    };
    var releaseNotesSubMenu = {
        label: "View Release Notes",
        click: releaseNotesManager.openReleaseNotes
    };
    var documentationSubMenu = {
        label: "Documentation",
        click: openDocumentation
    };
    var troubleshootingSubMenu = {
        label: "Troubleshooting Guide",
        click: openTroubleshooting
    };
    var checkUpdatesSubmenu = {
        label: "Check For Updates",
        click: updatesManager.notifyUserOfUpdates
    };
    var newWindow = {
        label: "New Window",
        accelerator: "CmdOrCtrl+Shift+N",
        click: openNewWindow
    };
    var moreFrequentUpdatesSubmenu;
    if (!userIsInsider) {
        moreFrequentUpdatesSubmenu = {
            label: "Opt In To Insider Builds",
            click: function () {
                userIsInsider = true;
                updatesManager.setUpdateGroup("insiders", Math.floor((Math.random() * 100) + 1));
                updatesManager.notifyUserOfUpdates();
                configureAppMenu();
            }
        };
    }
    else {
        moreFrequentUpdatesSubmenu = {
            label: "Insider Builds",
            submenu: [
                {
                    label: "Opt Out Of Insider Builds",
                    click: function () {
                        userIsInsider = false;
                        updatesManager.removeUpdateGroup("insiders");
                        configureAppMenu();
                    }
                },
                {
                    label: "Roll Back To Public Build",
                    click: function () {
                        updatesManager.installPreviousVersion();
                    }
                }
            ]
        };
    }
    var proxySettingsSubmenu = {
        label: "Configure Proxy",
        click: function () {
            return ProxySettingsManager_1.default.loadProxySettings()
                .then(function (settings) { return host.executeOperation("Environment.Dialogs.getDialogResult", { id: "proxySettings", parameters: settings }); })
                .then(function (result) {
                if (!!result) {
                    return ProxySettingsManager_1.default.saveProxySettings(result)
                        .then(function () { return ProxySettingsManager_1.default.setProxySettings(result); })
                        .then(function () { return TelemetryManager.sendEvent("StorageExplorer.ProxySettings.apply", { settings: result.useProxy ? "custom" : "none" }); });
                }
            })
                .catch(function (error) {
                NotificationBarManager.showSingleLink(error.message || error, null, constants.InfoBarTypes.errorLink);
            });
        }
    };
    var sslCertificatesSubmenu = {
        label: "SSL Certificates",
        submenu: [
            {
                label: "Import Certificates",
                click: function () { return SslCertificateManager_1.default.addCertificatesViaDailog(); }
            },
            {
                label: "View Imported Certificates",
                click: function () { return SslCertificateManager_1.default.showTrustedCerts(); }
            }
        ]
    };
    var privacyStatementSubMenu = {
        label: "Privacy Statement",
        click: openPrivacyStatement
    };
    var devToolsSubMenu = {
        label: "Toggle Developer Tools",
        accelerator: (function () {
            return "F12";
        })(),
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                focusedWindow.webContents.toggleDevTools();
            }
        }
    };
    var reloadSubMenu = {
        label: "Reload",
        accelerator: (function () {
            return "Ctrl+R";
        })(),
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                SessionManager_1.default.endSession().then(function () {
                    focusedWindow.reload();
                });
            }
        }
    };
    var sendFeedbackSubMenu = {
        label: "Send Feedback",
        click: ShellViewModel_1.default.sendFeedback
    };
    var separator = { type: "separator" };
    var helpMenu = {
        label: "&Help",
        submenu: []
    };
    var defaultApiVersion = StorageApiSettingManager_1.default.getDefaultVersion();
    var azureStackApiVersion = StorageApiSettingManager_1.default.getAzureStackApiVersion();
    var currentApiVersion = StorageApiSettingManager_1.default.loadStorageApiSetting() || defaultApiVersion;
    var storageApiMenu = {
        label: "Target Azure Stack",
        type: "checkbox",
        checked: currentApiVersion === azureStackApiVersion,
        click: function () {
            if (currentApiVersion === azureStackApiVersion) {
                StorageApiSettingManager_1.default.resetStorageApiSetting();
            }
            else {
                StorageApiSettingManager_1.default.saveStorageApiSetting(azureStackApiVersion);
            }
            // we call configureAppMenu here to undo the flipping of "checked" because we don't actually change the setting until we restart
            configureAppMenu();
        }
    };
    if (Utilities.isWin()) {
        // Add Edit menu
        menuTemplate.push({
            label: "&File",
            submenu: [
                newWindow,
                {
                    label: "Quit",
                    accelerator: "CmdOrCtrl+Shift+W",
                    role: "quit"
                }
            ]
        });
    }
    // In OSX the first menu item is always the one with the App name,
    // we put the about there. In windows the about dialog is in the help
    // menu.
    if (Utilities.isOSX()) {
        var osxAppMenu = [
            newWindow,
            separator,
            aboutSubmenu,
            checkUpdatesSubmenu,
            moreFrequentUpdatesSubmenu,
            separator,
            {
                label: "Quit",
                accelerator: "Command+Q",
                click: function () { electron_1.remote.app.quit(); }
            }
        ];
        menuTemplate.push({
            submenu: osxAppMenu
        });
        helpMenu.submenu.push(documentationSubMenu, troubleshootingSubMenu, releaseNotesSubMenu, sendFeedbackSubMenu, separator, devToolsSubMenu, reloadSubMenu, separator, privacyStatementSubMenu);
    }
    else {
        helpMenu.submenu.push(documentationSubMenu, troubleshootingSubMenu, releaseNotesSubMenu, sendFeedbackSubMenu, separator, checkUpdatesSubmenu, moreFrequentUpdatesSubmenu, separator, devToolsSubMenu, reloadSubMenu, separator, privacyStatementSubMenu, aboutSubmenu);
    }
    // Add Edit menu
    menuTemplate.push({
        label: "&Edit",
        submenu: [
            {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                role: "copy"
            },
            {
                label: "Cut",
                accelerator: "CmdOrCtrl+X",
                role: "cut"
            },
            {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                role: "paste"
            },
            separator,
            proxySettingsSubmenu,
            sslCertificatesSubmenu,
            storageApiMenu
        ]
    });
    // Add View menu
    menuTemplate.push({
        label: "&View",
        submenu: [
            {
                label: "Explorer",
                accelerator: "CommandOrControl+Shift+E",
                click: ShellViewModel_1.default.openTreeView
            },
            {
                label: "Account Mangement",
                accelerator: "CommandOrControl+Shift+A",
                click: ShellViewModel_1.default.openAccountPanel
            },
            {
                label: "Toggle Side Bar",
                accelerator: "CommandOrControl+B",
                click: ShellViewModel_1.default.toggleSideBar
            },
            separator,
            {
                label: "Zoom In",
                accelerator: "CmdOrCtrl+=",
                click: function () { return ZoomLevelManager_1.default.increaseZoom(); }
            },
            {
                label: "Zoom Out",
                accelerator: "CmdOrCtrl+-",
                click: function () { return ZoomLevelManager_1.default.decreaseZoom(); }
            },
            {
                label: "Reset Zoom",
                click: function () { return ZoomLevelManager_1.default.resetZoom(); }
            },
            separator,
            {
                label: "Themes",
                submenu: [
                    {
                        label: "Light (default)",
                        click: function () { return ThemeManager_1.default.setTheme("default"); }
                    },
                    {
                        label: "Dark",
                        click: function () { return ThemeManager_1.default.setTheme("dark"); }
                    },
                    {
                        label: "High Contrast - Black",
                        click: function () { return ThemeManager_1.default.setTheme("hc-black"); }
                    },
                    {
                        label: "High Contrast - White",
                        click: function () { return ThemeManager_1.default.setTheme("hc-white"); }
                    }
                ]
            }
        ]
    });
    menuTemplate.push(helpMenu);
    if (Utilities.isDebug()) {
        var testManager = new TestManager_1.Remote();
        var testMenu = {
            label: "&Test Menu",
            submenu: [
                {
                    label: "Run All",
                    click: function () { return testManager.runAll(); }
                }
            ]
        };
        testManager.getTestGroups().then(function (testGroups) {
            testGroups.forEach(function (testGroup) {
                var testGroupMenu = {
                    label: testGroup.name,
                    submenu: [
                        {
                            label: "Run All",
                            click: function () { return testGroup.runAll(); }
                        }
                    ]
                };
                testGroup.getTests().forEach(function (test) {
                    testGroupMenu.submenu.push({
                        label: "Run " + test.name,
                        click: function () { return test.run(); }
                    });
                });
                testMenu.submenu.push(testGroupMenu);
            });
            menuTemplate.push(testMenu);
            var appMenu = electron_1.remote.Menu.buildFromTemplate(menuTemplate);
            electron_1.remote.Menu.setApplicationMenu(appMenu);
        });
    }
    var appMenu = electron_1.remote.Menu.buildFromTemplate(menuTemplate);
    electron_1.remote.Menu.setApplicationMenu(appMenu);
}
exports.configureAppMenu = configureAppMenu;

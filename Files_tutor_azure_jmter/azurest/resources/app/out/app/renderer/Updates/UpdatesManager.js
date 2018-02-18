"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var constants = require("../../Constants");
var httpRequest = require("../HttpRequest");
var notificationBarManager = require("../NotificationBarManager");
var Utilities = require("../../Utilities");
var ReleaseNotesManager = require("../ReleaseNotesManager");
var electronUtilities = require("../../ElectronUtilities");
var os = require("os");
var Q = require("q");
var telemetryManager = require("../telemetry/TelemetryManager");
var electron_1 = require("electron");
var VersionFile_1 = require("./VersionFile");
var packageInfo = require("../../../../package.json");
var versionFileUrl = "https://go.microsoft.com/fwlink/?linkid=851767";
var downloadPageUrl = "https://go.microsoft.com/fwlink/?LinkId=723579";
var defaultDownloadUrls = {
    windows: "https://go.microsoft.com/fwlink/?LinkId=708343",
    linux: "https://go.microsoft.com/fwlink/?LinkId=722418",
    mac: "https://go.microsoft.com/fwlink/?LinkId=708342"
};
var initialDelay = 10 * 1000;
var updateCheckSpan = 60 * 60 * 1000;
// We compare against the last version we know,
// at initialization the app version is the last we know.
var lastVersionChecked = packageInfo.intVersion;
// If the user clicked "Later" on update notification, do not bug in this session.
var doNotBug = false;
var updateGroups = getUpdateGroupsSetting();
/**
 * Checks for an update periodically.
 * It compares the latests version in the
 * server with the latest checked version.
 */
function checkForUpdatesPeriodically() {
    if (doNotBug) {
        return Q.resolve(null);
    }
    var nextCheck = function () {
        setTimeout(checkForUpdatesPeriodically, updateCheckSpan);
    };
    return getVersionFile()
        .then(function (file) {
        return file.getLatestVersion().then(function (latestUpdate) {
            if (!!latestUpdate) {
                return showUpdateNotification(latestUpdate)
                    .then(function () {
                    lastVersionChecked = latestUpdate.version;
                });
            }
        });
    }).then(nextCheck, nextCheck);
}
/**
 * Shows a notification of a new update
 * available to the user.
 */
function showUpdateNotification(update) {
    var localFilePath = generateDownloadFilePath(update.displayName);
    return downloadUpdate(localFilePath, update.downloadUrls).then(function (state) {
        var promptAction = "Close";
        telemetryManager.sendEvent("StorageExplorer.AutoDownloadUpdate", { "Result": state });
        if (state === "completed") {
            var infoBarMessage = update.displayName + " of Storage Explorer is available.";
            if (update.isPreview) {
                infoBarMessage = "Preview version " + infoBarMessage;
            }
            else {
                infoBarMessage = "Version " + infoBarMessage;
            }
            notificationBarManager.showMultiLink(infoBarMessage, [Utilities.isWin() ? "Install" : "Open", "View Release Notes", "Later"], constants.InfoBarTypes.other) // Localize
                .then(function (clicked) {
                if (clicked === 0) {
                    promptAction = "Install";
                    openOrRunUpdate(localFilePath);
                }
                else if (clicked === 1) {
                    promptAction = "ViewReleaseNotes";
                    ReleaseNotesManager.openRemoteReleaseNotes(update.displayName);
                }
                else if (clicked === 2) {
                    promptAction = "Later";
                    doNotBug = true;
                }
                telemetryManager.sendEvent("StorageExplorer.UpdatePromptAction", { "Action": promptAction });
            });
        }
        else {
            notificationBarManager.showMultiLink("An update to Storage Explorer is available.", ["Download", "View Release Notes"], constants.InfoBarTypes.other) // Localize
                .then(function (clicked) {
                if (clicked === 0) {
                    promptAction = "ManualDownload";
                    electron_1.shell.openExternal(downloadPageUrl);
                }
                else if (clicked === 1) {
                    promptAction = "ViewReleaseNotes";
                    ReleaseNotesManager.openRemoteReleaseNotes(update.displayName);
                }
                telemetryManager.sendEvent("StorageExplorer.UpdatePromptAction", { "Action": promptAction });
            });
        }
    });
}
function downloadUpdate(localFilePath, targetUrls) {
    var downloadJobId = Utilities.guid();
    var deferred = Q.defer();
    var targetUrl = getCorrectDownloadUrl(targetUrls);
    var listener = function (event, jobId, state) {
        if (jobId === downloadJobId) {
            electron_1.ipcRenderer.removeListener(constants.DownloadDoneIpcChannel, listener);
            deferred.resolve(state);
        }
    };
    electron_1.ipcRenderer.on(constants.DownloadDoneIpcChannel, listener);
    electronUtilities.downloadFile(targetUrl, localFilePath, downloadJobId);
    return deferred.promise;
}
function generateDownloadFilePath(versionNumber) {
    var targetFolder = os.tmpdir();
    var localFilePath = "";
    if (Utilities.isWin()) {
        localFilePath = targetFolder + "\\" + "StorageExplorer." + versionNumber + ".exe";
    }
    else if (Utilities.isOSX()) {
        localFilePath = targetFolder + "/" + "StorageExplorer." + versionNumber + ".zip";
    }
    else if (Utilities.isLinux()) {
        localFilePath = targetFolder + "/" + "StorageExplorer." + versionNumber + ".tar.gz";
    }
    else {
        console.assert(false, "Can't decide what OS we are running on!");
    }
    return localFilePath;
}
function openOrRunUpdate(localFilePath) {
    if (Utilities.isWin()) {
        electron_1.shell.openExternal(localFilePath);
        electron_1.remote.app.quit();
    }
    else {
        // On macOS or Linux just open the archive file.
        electron_1.shell.openItem(localFilePath);
    }
}
/**
 * Queries the server for the latest version number
 * of the app.
 */
function getVersionFile() {
    return httpRequest.request({
        url: versionFileUrl
    }).then(function (body) {
        return new VersionFile_1.default(JSON.parse(body).versions, updateGroups, packageInfo.intVersion);
    });
}
exports.getVersionFile = getVersionFile;
/**
 * Notifies the user if there is a new update.
 */
function notifyUserOfUpdates() {
    return getVersionFile()
        .then(function (file) {
        return file.getLatestVersion();
    })
        .then(function (latestUpdate) {
        if (!!latestUpdate) {
            return showUpdateNotification(latestUpdate);
        }
        else {
            return notificationBarManager.showSingleLink("There is no update available.", null, constants.InfoBarTypes.other) // Localize
                .then(function () { return; });
        }
    });
}
exports.notifyUserOfUpdates = notifyUserOfUpdates;
/**
 * Monitors if there is an update for the app.
 */
function monitorUpdates() {
    setTimeout(checkForUpdatesPeriodically, initialDelay);
}
exports.monitorUpdates = monitorUpdates;
function getUpdateGroupsSetting() {
    var updateGroupsSettingsKey = "Standalone_RolloutPercentile_v1";
    var updateGroups = Utilities.loadSettings(updateGroupsSettingsKey);
    // userId setting is inited in telemetryManager
    var userId = Utilities.loadSettings("Standalone_Telemetry_UserId");
    if (!updateGroups) {
        updateGroups = {
            "default": {
                name: "default",
                percentage: Math.floor((Math.random() * 100) + 1)
            },
            userId: {
                name: userId,
                percentage: 100
            }
        };
    }
    ;
    Utilities.saveSettings(updateGroupsSettingsKey, updateGroups);
    telemetryManager.sendEvent("StorageExplorer.UpdatesManager.InitUpdateGroups", { updateGroups: JSON.stringify(updateGroups) });
    return updateGroups;
}
exports.getUpdateGroupsSetting = getUpdateGroupsSetting;
function setUpdateGroup(groupName, percentile) {
    updateGroups[groupName] = {
        name: groupName,
        percentage: percentile
    };
    saveUpdateGroups();
}
exports.setUpdateGroup = setUpdateGroup;
function removeUpdateGroup(groupName) {
    delete updateGroups[groupName];
    saveUpdateGroups();
}
exports.removeUpdateGroup = removeUpdateGroup;
function getUpdateGroupPercentile(groupName) {
    if (!updateGroups[groupName]) {
        return null;
    }
    return updateGroups[groupName].percentage;
}
exports.getUpdateGroupPercentile = getUpdateGroupPercentile;
function saveUpdateGroups() {
    var updateGroupSettingsKey = "Standalone_RolloutPercentile_v1";
    telemetryManager.sendEvent("StorageExplorer.UpdatesManagerSaveUpdateGroups", { updateGroups: JSON.stringify(updateGroups) });
    Utilities.saveSettings(updateGroupSettingsKey, updateGroups);
}
function getCorrectDownloadUrl(urls) {
    if (!urls) {
        urls = defaultDownloadUrls;
    }
    if (Utilities.isWin()) {
        return urls.windows;
    }
    else if (Utilities.isOSX()) {
        return urls.mac;
    }
    else if (Utilities.isLinux()) {
        return urls.linux;
    }
    else {
        console.assert(false, "Can't decide what OS we are running on!");
    }
}
function installPreviousVersion() {
    return getVersionFile()
        .then(function (file) {
        return file.getVersionPreviousTo(packageInfo.intVersion);
    })
        .then(function (previousVersion) {
        if (!!previousVersion) {
            var localFilePath_1 = generateDownloadFilePath("previous");
            return downloadUpdate(localFilePath_1, previousVersion.downloadUrls)
                .then(function (state) {
                var promptAction = "Cancel";
                telemetryManager.sendEvent("StorageExplorer.AutoDownloadUpdate", { "Result": state });
                if (state === "completed") {
                    notificationBarManager.showSingleLink("Previous version downloaded.", Utilities.isWin() ? "Install" : "Open", constants.InfoBarTypes.other, "Cancel") // Localize
                        .then(function (clicked) {
                        if (clicked) {
                            promptAction = "Install";
                            openOrRunUpdate(localFilePath_1);
                        }
                        telemetryManager.sendEvent("StorageExplorer.InstallPreviousAction", { "Action": promptAction });
                    });
                }
                else {
                    notificationBarManager.showSingleLink("Unable to download previous version.", "", constants.InfoBarTypes.other) // Localize
                        .then(function (clicked) {
                        telemetryManager.sendEvent("StorageExplorer.InstallPreviousAction", { "Action": "failedToDownlaod" });
                    });
                }
            });
        }
        else {
            notificationBarManager.showSingleLink("No previous version available.", "", constants.InfoBarTypes.other); // Localize
        }
    });
}
exports.installPreviousVersion = installPreviousVersion;

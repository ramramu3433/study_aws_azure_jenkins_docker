"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ProxySettingsManager_1 = require("../common/ProxySettingsManager");
var child_process = require("child_process");
var fs = require("fs");
var Path = require("path");
var Q = require("q");
var _string = require("underscore.string");
var electron_1 = require("electron");
var LocalStorageHelper = require("../common/LocalStorageHelper");
var dialogsManager = require("../DialogsManager");
var fileOperationHelper = require("../common/FileOperationHelper");
var notificationBarManager = require("../NotificationBarManager");
var utilities = require("../../Utilities");
var empty = function () { return; };
// The main thing driving the value of this is that we will run this many concurrent instances of the fs.stat() function at once
var maxResultsPerSegment = 100;
;
var savedEnumerationResults = Object.create(null);
var lastTokenIndex = 0;
function releaseEnumeratedFilesOnDisk(continuationToken) {
    delete savedEnumerationResults[continuationToken];
}
/**
 * Returns a list of IFileInfo for all files in a disk folder (no recursion).
 * Files ending with the environment separator are folders
 */
function enumerateFilesOnDiskSegmented(folderPath, continuationToken) {
    return enumerateFilesOnDiskSegmentedHelper(folderPath, continuationToken);
}
function enumerateFilesOnDiskSegmentedHelper(folderPath, continuationToken) {
    var resolvedFolderPath = Path.resolve(folderPath);
    var processPaths = function (fileNames) {
        var promises = fileNames.map(function (fileName) {
            var fullPath = Path.join(resolvedFolderPath, fileName);
            return Q.ninvoke(fs, "stat", fullPath).then(function (stat) {
                if (stat.isFile()) {
                    return {
                        name: fileName,
                        size: stat.size
                    };
                }
                else if (stat.isDirectory()) {
                    return {
                        name: fileName + Path.sep,
                        size: 0
                    };
                }
                else {
                    console.error("Neither file nor directory?");
                }
            });
        });
        return Q.all(promises);
    };
    var savedResult = savedEnumerationResults[continuationToken];
    if (savedResult) {
        // Get the segment that has already been processing
        var thisSegmentProcessedPromise = savedResult.nextSegmentOfProcessedPaths;
        // Start processing the next segment
        var nextSegmentRelativePaths = savedResult.relativePaths.splice(0, maxResultsPerSegment);
        savedResult.nextSegmentOfProcessedPaths = processPaths(nextSegmentRelativePaths);
        return thisSegmentProcessedPromise.then(function (segment) {
            if (!segment.length) {
                // No more results
                delete savedEnumerationResults[continuationToken];
                continuationToken = null;
            }
            return {
                result: segment,
                continuationToken: continuationToken
            };
        });
    }
    else {
        // Create new continuation token for this result
        continuationToken = "enumerateFilesInFolderSegmented-" + "#" + (++lastTokenIndex) + "-" + folderPath;
        // Enumerate files on disk.
        // PERF: Unfortunately, node.js has no way to stream the results, so we will get one big giant array of strings,
        //   which might be a problem if there is a large number of files in a single folder.
        return Q.ninvoke(fs, "readdir", resolvedFolderPath).then(function (relativePaths) {
            var firstSegmentRelativePaths = relativePaths.splice(0, maxResultsPerSegment), savedResult = {
                nextSegmentOfProcessedPaths: processPaths(firstSegmentRelativePaths),
                relativePaths: relativePaths
            };
            savedEnumerationResults[continuationToken] = savedResult;
            // Now that we have things set up for the first batch, call back to enumerateFilesOnDiskSegmentedHelper to process it
            return enumerateFilesOnDiskSegmentedHelper(folderPath, continuationToken);
        });
    }
}
function openUrl(url) {
    electron_1.shell.openExternal(url);
}
function getFileProperties(filePaths, propertyFilters) {
    if (propertyFilters === void 0) { propertyFilters = []; }
    try {
        var result = [];
        filePaths.forEach(function (filePath) {
            var properties = fs.statSync(filePath);
            if (propertyFilters && propertyFilters.length) {
                var filteredProperties = {};
                propertyFilters.forEach(function (filter) {
                    filteredProperties[filter] = properties[filter];
                });
                result.push(filteredProperties);
            }
            else {
                result.push(properties);
            }
        });
        return Q.resolve(result);
    }
    catch (error) {
        return Q.reject(error);
    }
}
function doesFileExist(path) {
    return getPathType(path)
        .then(function (pathType) {
        return pathType === "file";
    });
}
function doesFolderExist(path) {
    return getPathType(path)
        .then(function (pathType) {
        return pathType === "folder";
    });
}
/**
 * Returns "folder" or "file, or null if the path doesn't exist
 */
function getPathType(path) {
    return Q.Promise(function (resolve, reject) {
        // Get info on the folder to see if it exists
        fs.stat(path, function (err, stats) {
            if (err && err.code === "ENOENT") {
                // Path doesn't exist
                resolve(null);
            }
            else if (err) {
                // This path is a bit ambiguous.  The call failed for some reason,
                //   could be security.  Probably best to pretend it doesn't exist
                //   and let the call to try to create it fail.
                reject(null);
            }
            else {
                resolve(stats.isDirectory() ? "folder" : stats.isFile() ? "file" : null);
            }
        });
    });
}
function ensureFolderExists(path) {
    // First check the entire path so we're not hitting the OS for each folder level
    // unless necessary.
    return doesFolderExist(path)
        .then(function (exists) {
        if (!exists) {
            // Create the folder structure one level at a time.
            return createFolders(path);
        }
    });
}
function createFolders(path) {
    // Remove trailing slash/backslash
    while (path && path[path.length - 1] === "/" || path[path.length - 1] === "\\") {
        path = path.substr(0, path.length - 1);
    }
    if (path) {
        var paths = path.split(/\/|\\/);
        var parentPath = paths.slice(0, paths.length - 1).join("/");
        // Create parent folders recursively first
        return createFolders(parentPath)
            .then(function () {
            // Now create the final part of the path
            return doesFolderExist(path).then(function (alreadyExists) {
                if (!alreadyExists) {
                    return createSingleFolder(path);
                }
                else {
                    return Q.resolve(null);
                }
            });
        });
    }
    else {
        return Q.resolve(null);
    }
}
function createSingleFolder(path) {
    return Q.Promise(function (resolve, reject) {
        fs.mkdir(path, function (err) {
            if (err) {
                if (err.code === "EEXIST") {
                    // Folder must have been created after
                    // the stat call.
                    resolve();
                }
                else {
                    reject(err);
                }
            }
            else {
                resolve();
            }
        });
    });
}
function openFolder(path) {
    return Q.Promise(function (resolve, reject) {
        var command;
        if (utilities.isOSX()) {
            command = "open";
        }
        else if (utilities.isWin()) {
            command = "explorer";
            var pathArray = path.split("\\");
            if (_string.isBlank(pathArray[pathArray.length - 1])) {
                pathArray.pop();
            }
            path = pathArray.join("\\");
        }
        else if (utilities.isLinux()) {
            command = "xdg-open";
        }
        else {
            reject(new Error("Platform is not supported."));
        }
        var spawnSync = child_process.spawnSync;
        try {
            spawnSync(command, [path]);
        }
        catch (error) {
            reject(error);
        }
        resolve();
    });
}
function showItemInFolder(path) {
    electron_1.shell.showItemInFolder(path);
}
function clipboardSetData(format, data) {
    electron_1.clipboard.clear();
    if (format === "text") {
        electron_1.clipboard.writeText(data);
    }
    else if (format === "html") {
        // TODO: Why isn't this in typings?
        electron_1.clipboard.writeHtml(data);
    }
    else {
        // HTML doesn't support custom formats.
        // Fake a custom format by writing out the serialized data into
        //   the clipboard as text.  If the user types CTRL+V in a text editor,
        //   they will see the raw serialized data.
        var dataObject = {};
        dataObject[format] = data;
        electron_1.clipboard.write({ text: JSON.stringify(dataObject) });
    }
}
// TODO: Combine with clipboardSetData
function clipboardSetMultiple(data) {
    electron_1.clipboard.clear();
    electron_1.clipboard.write(data);
}
function clipboardContainsData(format) {
    return !!deserializeClipboardData(format);
}
function clipboardGetData(format) {
    return deserializeClipboardData(format);
}
function deserializeClipboardData(format) {
    if (format === "text") {
        return electron_1.clipboard.readText();
    }
    else if (format === "html") {
        // TODO: Why isn't this in typings?
        return electron_1.clipboard.readHtml();
    }
    else {
        try {
            var json = electron_1.clipboard.readText();
            if (!json || json[0] !== "{" || json[json.length - 1] !== "}") {
                return null;
            }
            var dataObject = JSON.parse(json);
            return dataObject[format];
        }
        catch (e) {
            return null;
        }
    }
}
function saveConfidentialData(key, data) {
    return LocalStorageHelper.saveConfidentialData(key, data);
}
function getConfidentialData(key) {
    return LocalStorageHelper.getConfidentialData(key);
}
function deleteConfidentialData(key) {
    return LocalStorageHelper.deleteConfidentialData(key);
}
function isAzureSdkInstalled() {
    // we return true because we have the Azure Storage node library installed.
    return Q.resolve(true);
}
var environmentMarshaler = {
    IsAzureSdkInstalled: isAzureSdkInstalled,
    closeInfoBar: notificationBarManager.close,
    dismissDialog: dialogsManager.dismissDialog,
    doesFileExist: doesFileExist,
    doesFolderExist: doesFolderExist,
    ensureFolderExists: ensureFolderExists,
    enumerateFilesOnDiskSegmented: enumerateFilesOnDiskSegmented,
    releaseEnumeratedFilesOnDisk: releaseEnumeratedFilesOnDisk,
    getHostProcessId: empty,
    openFolder: openFolder,
    showItemInFolder: showItemInFolder,
    openDialog: dialogsManager.openDialog,
    openFileEditor: empty,
    openServerExplorer: empty,
    openUrl: openUrl,
    promptYesNo: dialogsManager.showYesNoMessageBox,
    showInfobarMessage: notificationBarManager.showSingleLink,
    showInfobarMessages: notificationBarManager.showMultiLink,
    getInfoBarType: notificationBarManager.getInfoBarType,
    showMessageBox: dialogsManager.showOkMessageBox,
    showOpenDialog: dialogsManager.showOpenDialog,
    showSaveFileDialog: dialogsManager.showSaveFileDialog,
    getFileProperties: getFileProperties,
    clipboardSetData: clipboardSetData,
    clipboardSetMultiple: clipboardSetMultiple,
    clipboardContainsData: clipboardContainsData,
    clipboardGetData: clipboardGetData,
    saveConfidentialData: saveConfidentialData,
    getConfidentialData: getConfidentialData,
    deleteConfidentialData: deleteConfidentialData,
    getTempDirectory: fileOperationHelper.getTempDirectory,
    openFileWithDefaultApplication: fileOperationHelper.openFileWithDefaultApplication,
    tryOpenFileSafely: fileOperationHelper.tryOpenFileSafely,
    readLines: fileOperationHelper.readLines,
    writeCsvToFile: fileOperationHelper.writeCsvToFile,
    appendCsvToFile: fileOperationHelper.appendCsvToFile,
    writeToFile: fileOperationHelper.writeToFile,
    appendToFile: fileOperationHelper.appendToFile,
    deleteFile: fileOperationHelper.deleteFile,
    renameFile: fileOperationHelper.renameFile,
    setProxySettings: ProxySettingsManager_1.default.setProxySettings,
    saveProxySettings: ProxySettingsManager_1.default.saveProxySettings,
    loadProxySettings: ProxySettingsManager_1.default.loadProxySettings
};
module.exports = environmentMarshaler;

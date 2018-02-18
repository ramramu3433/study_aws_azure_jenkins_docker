"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ShellViewModel_1 = require("./UI/ShellViewModel");
var Path = require("path");
var q = require("q");
var electron_1 = require("electron");
var Utilities = require("../Utilities");
// TODO: One day this list of dialogs will be properly handled using
// the manifest information. Keep it in here for now.
var _dialogKeys = {
    "feedbackdialog": "./app/renderer/manifests/FeedbackDialog.json",
    "euladialog": "./app/renderer/manifests/EulaDialog.json",
    "npsdialog": "./app/renderer/manifests/NpsDialog.json",
    "generatesharedaccesssignaturedialog": "./app/renderer/manifests/GenerateSharedAccessSignatureDialog.json",
    "manageaccesscontrollistdialog": "./app/renderer/manifests/ManageAccessControlListDialog.json",
    "uploadblobsdialog": "./app/renderer/manifests/UploadBlobsDialog.json",
    "uploadazurefilesdialog": "./app/renderer/manifests/UploadAzureFilesDialog.json",
    "conflictsdialog": "./app/renderer/manifests/ConflictsDialog.json",
    "setcontainerpublicaccessleveldialog": "./app/renderer/manifests/SetContainerPublicAccessLevelDialog.json",
    "showflobpropertiesdialog": "./app/renderer/manifests/FlobPropertiesDialog.json",
    "entityeditordialog": "./app/renderer/manifests/EntityEditorDialog.json",
    // "querybuilderdialog": "./app/renderer/manifests/QueryBuilderDialog.json",
    "importentitiesdialog": "./app/renderer/manifests/ImportEntitiesDialog.json",
    "addmessagedialog": "./app/renderer/manifests/AddMessageDialog.json",
    "viewmessagedialog": "./app/renderer/manifests/ViewMessageDialog.json",
    "customizecolumnsdialog": "./app/renderer/manifests/CustomizeColumnsDialog.json",
    "adddirectorydialog": "./app/renderer/manifests/AddDirectoryDialog.json",
    "connectfilesharedialog": "./app/renderer/manifests/ConnectFileShareDialog.json",
    "connectdialog": "./app/renderer/manifests/ConnectDialog.json",
    "customtimestampquerydialog": "./app/renderer/manifests/CustomTimestampQueryDialog.json",
    "queryselectdialog": "./app/renderer/manifests/QuerySelectDialog.json",
    "proxysettingsdialog": "./app/renderer/manifests/ProxySettingsDialog.json",
    "renamedialog": "./app/renderer/manifests/RenameDialog.json",
    "corssettingsdialog": "./app/renderer/manifests/CorsSettingsDialog.json",
    "optiondialog": "./app/renderer/manifests/OptionDialog.json"
};
var _openedDialogInfo;
var packageInfo = require("../../../package.json");
var lastUsedPaths = {
    open: "",
    save: ""
};
function openDialog(options) {
    return q.Promise(function (resolve, reject) {
        var dialogKey = _dialogKeys[options.id && options.id.toLowerCase()];
        if (!dialogKey) {
            reject(new Error("Dialog not found."));
        }
        if (_openedDialogInfo) {
            dismissDialog(null);
        }
        _openedDialogInfo = {
            rejectPromise: reject,
            resolvePromise: resolve,
            close: null
        };
        ShellViewModel_1.default.openDaytonaDialog(dialogKey, options.parameters);
        _openedDialogInfo.close = function () { return ShellViewModel_1.default.closeDaytonaDialog(); };
    });
}
exports.openDialog = openDialog;
function dismissDialog(parameters) {
    if (_openedDialogInfo) {
        // Give some time to prevent keyup event to trigger after dismissing the dialog by pressing Enter
        setTimeout(function () {
            if (_openedDialogInfo) {
                if (_openedDialogInfo.resolvePromise) {
                    _openedDialogInfo.resolvePromise(parameters);
                }
                if (_openedDialogInfo.close) {
                    _openedDialogInfo.close();
                }
                _openedDialogInfo = null;
            }
        }, 200);
    }
}
exports.dismissDialog = dismissDialog;
function showYesNoMessageBox(message, iconType) {
    // On Windows, "question" displays the same icon as "info", unless you set an icon using the "icon" option.
    // CloudExplorer can use 'critical', but Electron does not have a 'critical' dialog type
    // (see https://github.com/atom/electron/blob/master/docs/api/dialog.md#dialogshowmessageboxbrowserwindow-options-callback).
    if (iconType === "critical") {
        iconType = "error";
    }
    return showNativeMessageBox(packageInfo.displayName, message, iconType, ["Yes", "No"])
        .then(function (response) {
        return response === 0;
    });
}
exports.showYesNoMessageBox = showYesNoMessageBox;
function showOkMessageBox(title, message, type) {
    return showNativeMessageBox(title, message, type, ["Ok"])
        .then(function (response) { return; });
}
exports.showOkMessageBox = showOkMessageBox;
function showNativeMessageBox(title, message, type, buttons) {
    return q.Promise(function (resolve, reject) {
        var parent = getModalParentWindow();
        electron_1.remote.dialog.showMessageBox(parent, {
            type: type,
            message: message,
            title: title,
            cancelId: -1,
            buttons: buttons
        }, resolve);
    });
}
exports.showNativeMessageBox = showNativeMessageBox;
function showOpenDialog(message, browseForFolder, allowMultiSelect, filters) {
    return q.Promise(function (resolve, reject) {
        var parent = getModalParentWindow();
        var options = {
            title: message,
            defaultPath: lastUsedPaths.open,
            properties: []
        };
        options.properties.push(browseForFolder ? "openDirectory" : "openFile");
        if (allowMultiSelect) {
            options.properties.push("multiSelections");
        }
        if (filters) {
            options.filters = filters;
        }
        electron_1.remote.dialog.showOpenDialog(parent, options, function (files) {
            if (files) {
                lastUsedPaths.open = Path.dirname(files[0]);
            }
            resolve(files);
        });
    });
}
exports.showOpenDialog = showOpenDialog;
function showSaveFileDialog(message, defaultName, filters) {
    return q.Promise(function (resolve, reject) {
        var parent = getModalParentWindow();
        defaultName = defaultName ? defaultName : "";
        // Add '.' to compensate for the fact that Electron doesn't handle a default filename without an extension properly.
        if (defaultName.indexOf(".") < 0) {
            defaultName = defaultName + ".";
        }
        // TODO when Electron is updated convert to use app.getPath("downloads")
        lastUsedPaths.save = lastUsedPaths.save || Path.join(electron_1.remote.app.getPath("home"), "Downloads");
        var defaultPath = Path.join(lastUsedPaths.save, defaultName);
        var options = {
            title: message,
            defaultPath: defaultPath
        };
        if (filters) {
            options.filters = filters;
        }
        electron_1.remote.dialog.showSaveDialog(parent, options, function (file) {
            if (file) {
                // Remove "." added above
                if (file[file.length - 1] === ".") {
                    file = file.slice(0, file.length - 1);
                }
                lastUsedPaths.save = Path.dirname(file);
            }
            resolve(file);
        });
    });
}
exports.showSaveFileDialog = showSaveFileDialog;
function getModalParentWindow() {
    if (Utilities.isLinux()) {
        // There is a known bug in Linux where system modal dialogs block ALL (system-wide) mouse input.
        // Only keboard input is processed.
        // This workaround makes all system dialogs in Linux detached, meaning they won't block Storage Explorer.
        // See: https://github.com/electron/electron/issues/9942
        return null;
    }
    return electron_1.remote.BrowserWindow.getFocusedWindow();
}

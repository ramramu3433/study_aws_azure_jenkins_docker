/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Common/TelemetryActions", "Common/Utilities"], function (require, exports, es6_promise_1, TelemetryActions, Utilities) {
    "use strict";
    exports.MillisecondsPerDay = 1000 * 60 * 60 * 24;
    function convertRawDataToNode(resource) {
        return new es6_promise_1.Promise(function (resolve, reject) {
            require(["Providers/Azure/Nodes/AzureResourceNodeFactory"], function (azureResourceNodeFactory) {
                var node = azureResourceNodeFactory.convertAzureResource(resource);
                if (node) {
                    resolve(node);
                }
                else {
                    reject(new Error("Cannot convert raw data to node."));
                }
            });
        });
    }
    exports.convertRawDataToNode = convertRawDataToNode;
    /**
     * Verify the user wants to delete something
     */
    function confirmDelete(host, prompt) {
        return host.executeOperation("Environment.promptYesNo", [prompt, "error"]);
    }
    exports.confirmDelete = confirmDelete;
    function showError(host, error, telemetryCategory) {
        var telemetryError = {
            name: telemetryCategory,
            error: error
        };
        var telemetry = new TelemetryActions(host);
        telemetry.sendError(telemetryError);
        var message = Utilities.getErrorMessage(error);
        return host.executeOperation("Environment.showMessageBox", ["Storage Explorer", message, "error"]);
    }
    exports.showError = showError;
    function closeStorageEditor(host, telemetryActions) {
        telemetryActions.sendEvent("StorageExplorer.Window", { "Action": "Close" });
        return host.executeOperation("Azure.Actions.Storage.closeEditor", []);
    }
    exports.closeStorageEditor = closeStorageEditor;
    function closeTargetStorageEditor(host, telemetryActions, connectionString, storageType, name) {
        return host.executeOperation("Azure.Actions.Storage.getEditorInfo", []).then(function (value) {
            if (!value) {
                return;
            }
            if (value.connectionString && value.connectionString === connectionString) {
                if (((storageType === 0 /* blobContainer */) && (value.containerName === name)) ||
                    ((storageType === 1 /* fileShare */) && (value.shareName === name)) ||
                    ((storageType === 2 /* table */) && (value.tableName === name)) ||
                    ((storageType === 3 /* queue */) && (value.queueName === name))) {
                    return closeStorageEditor(host, telemetryActions);
                }
            }
        }, function (error) {
            showError(host, error);
        });
    }
    exports.closeTargetStorageEditor = closeTargetStorageEditor;
    function getSasStartTimeForCopy() {
        var now = new Date();
        // ... Start 15 minutes early to allow for clock skew between machines
        var start = now.getTime() - 15 * 60 * 1000;
        return new Date(start);
    }
    exports.getSasStartTimeForCopy = getSasStartTimeForCopy;
    function getSasExpiryForCopy() {
        // ... Azure backend blob copy operations time out after 2 weeks (they're copied on a "best-effort basis"),
        //   but that seems excessive for the SAS token, so we'll give it 1 day.
        return new Date(new Date().getTime() + 1 * exports.MillisecondsPerDay);
    }
    exports.getSasExpiryForCopy = getSasExpiryForCopy;
});

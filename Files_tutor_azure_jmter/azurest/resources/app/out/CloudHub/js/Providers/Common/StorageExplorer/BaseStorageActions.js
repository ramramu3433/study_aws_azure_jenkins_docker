/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Providers/Common/AzureStorageConstants", "Common/ConnectionString", "Common/Errors", "Providers/StorageExplorer/ProviderWrappers/StoragePW", "Common/UIActions", "Common/Utilities"], function (require, exports, es6_promise_1, StorageActionsHelper, AzureStorageConstants, ConnectionString_1, Errors, StoragePW, UIActions, Utilities) {
    "use strict";
    /**
     * Actions exposed by the Azure Cloud Explorer plugin.
     */
    var BaseStorageActions = (function () {
        function BaseStorageActions(azureConnection, host, telemetry) {
            var _this = this;
            // TODO: This code path is only used when we create a new storage container or attach to one.  That's not
            // good, we should combine it with the mainline code path.
            this.getStorageNode = function (connectionString, editorNamespace, name, id, connectionType) {
                var attributes = [
                    {
                        name: "connectionString",
                        value: connectionString
                    },
                    {
                        name: "editorNamespace",
                        value: editorNamespace
                    },
                    {
                        name: "id",
                        value: id
                    },
                    {
                        name: "name",
                        value: name
                    },
                    {
                        name: "connectionType",
                        value: connectionType
                    }
                ];
                var portalPromise;
                var nodeType;
                var isAccountSas = connectionType === 1 /* sasAttachedAccount */;
                var isServiceSas = connectionType === 4 /* sasAttachedService */;
                var isSAS = isAccountSas || isServiceSas;
                switch (editorNamespace) {
                    case "BlobContainer":
                        if (isSAS) {
                            portalPromise = StoragePW.getSASBlobContainer(_this._host, connectionString, name);
                            nodeType = isAccountSas ?
                                AzureStorageConstants.nodeTypes.blobContainerInSasAccount :
                                AzureStorageConstants.nodeTypes.sasBlobContainer;
                        }
                        else {
                            portalPromise = StoragePW.getBlobContainer(_this._host, connectionString, name);
                            nodeType = AzureStorageConstants.nodeTypes.blobContainer;
                        }
                        break;
                    case "FileShare":
                        if (isSAS) {
                            portalPromise = StoragePW.getSASFileShare(_this._host, connectionString, name);
                            nodeType = AzureStorageConstants.nodeTypes.sasFileShare;
                        }
                        else {
                            portalPromise = StoragePW.getFileShare(_this._host, connectionString, name);
                            nodeType = AzureStorageConstants.nodeTypes.fileShare;
                        }
                        break;
                    case "Table":
                        if (isSAS) {
                            portalPromise = StoragePW.getSASTable(_this._host, connectionString, name);
                            nodeType = AzureStorageConstants.nodeTypes.sasTable;
                        }
                        else {
                            portalPromise = StoragePW.getTable(_this._host, connectionString, name);
                            nodeType = AzureStorageConstants.nodeTypes.table;
                        }
                        break;
                    case "Queue":
                        if (isSAS) {
                            portalPromise = StoragePW.getSASQueue(_this._host, connectionString, name);
                            nodeType = AzureStorageConstants.nodeTypes.sasQueue;
                        }
                        else {
                            portalPromise = StoragePW.getQueue(_this._host, connectionString, name);
                            nodeType = AzureStorageConstants.nodeTypes.queue;
                        }
                        break;
                    default:
                        throw new Error("Unsupported resource type: " + editorNamespace);
                }
                var sharedAccessSignature = new ConnectionString_1.default(connectionString).getSAS();
                if (sharedAccessSignature) {
                    attributes = attributes.concat({ name: "sharedAccessSignature", value: sharedAccessSignature });
                }
                attributes = attributes.concat({ name: "nodeType", value: nodeType });
                return portalPromise.then(function (value) {
                    var rawData = {
                        type: nodeType,
                        name: name,
                        attributes: attributes.concat(value.attributes)
                    };
                    return StorageActionsHelper.convertRawDataToNode(rawData);
                });
            };
            /**
             * Verify the user wants to delete something
             */
            this.confirmDelete = function (prompt, skipPrompt) {
                if (skipPrompt) {
                    return es6_promise_1.Promise.resolve(true);
                }
                else {
                    return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: prompt, iconType: "critical" }]);
                }
            };
            /**
             * Delete the node and close the storage editor
             */
            this.deleteNode = function (nodeQuery, connectionString, storageType, name) {
                return _this._uiActions.deleteNode(nodeQuery).then(function () {
                    return StorageActionsHelper.closeTargetStorageEditor(_this._host, _this._telemetry, connectionString, storageType, name);
                });
            };
            /**
             * Handle an error.
             */
            this.handleErrorAndThrow = function (error, message, itemName, telemetryCategory) {
                var telemetryError = {
                    name: telemetryCategory,
                    error: error
                };
                _this._telemetry.sendError(telemetryError);
                var errorToThrow;
                if (error.name === Errors.errorNames.ActionableError || error.name === Errors.errorNames.DisplayableError) {
                    errorToThrow = error;
                }
                else {
                    if (error.name === Errors.errorNames.ActiveLeaseError) {
                        var message = itemName + " cannot be modified at this time because another resource is using it."; // localize
                    }
                    errorToThrow = new Errors.DisplayableError(message, error);
                }
                throw errorToThrow;
            };
            /**
             * Construct an error message to show more details.
             */
            this.constructErrorMessage = function (summary, information) {
                return summary
                    + Utilities.getEnvironmentNewLine()
                    + Utilities.getEnvironmentNewLine()
                    + "Details:" // localize
                    + Utilities.getEnvironmentNewLine()
                    + information;
            };
            this._azureConnection = azureConnection;
            this._host = host;
            this._uiActions = new UIActions(this._host);
            this._telemetry = telemetry;
        }
        return BaseStorageActions;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BaseStorageActions;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Common/AzureStorageConstants", "ActivityLog/StorageExplorer/CopyType", "ActivityLog/StorageExplorer/FileFlobContainer", "ActivityLog/StorageExplorer/FileShareCopyGroupActivity", "Providers/StorageExplorer/ProviderWrappers/FilePW", "Providers/StorageExplorer/Actions/FlobActions", "Providers/StorageExplorer/Actions/StorageActionsHelper", "StorageExplorer/StorageExplorerConstants", "Common/TelemetryActions", "Common/UIActions", "Common/Utilities"], function (require, exports, AzureConstants, AzureStorageConstants, CopyType_1, FileFlobContainer_1, FileShareCopyGroupActivity_1, FilePW_1, FlobActions_1, StorageActionsHelper, StorageExplorerConstants, TelemetryActions, UIActions, Utilities) {
    "use strict";
    var FileActions = (function (_super) {
        __extends(FileActions, _super);
        function FileActions(azureConnection, host, activityLogManager, telemetry) {
            var _this = _super.call(this, host, telemetry, false /*isBlobs*/) || this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            _this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(FileActions.copyFileShareToClipboardNamespace, _this.copyFileShareToClipboard);
                actionBindingManager.addActionBinding(FileActions.pasteFileShareToStorageAccountNamespace, _this.pasteFileShareToStorageAccount);
                actionBindingManager.addActionBinding(FileActions.renameFileShareNamespace, _this.renameFileShare);
                actionBindingManager.addActionBinding(FileActions.generateSharedAccessSignatureNamespace, _this.generateSharedAccessSignature);
                actionBindingManager.addActionBinding(FileActions.manageAccessControlListNamespace, _this.manageAccessControlList);
                actionBindingManager.addActionBinding(FileActions.configureCORSNamespace, _this.configureCORS);
            };
            /**
             * Action to copy a file share
             */
            _this.copyFileShareToClipboard = function (args) {
                var sourceShareReference = {
                    connectionString: args.connectionString,
                    shareName: args.name,
                    quota: args.quota
                };
                var sourceContainer = new FileFlobContainer_1.default(_this._host, sourceShareReference);
                return sourceContainer.copyContainerToClipboard();
            };
            /**
             * Action to paste a file share a storage account by create a new file share.
             * CONSIDER: Should be re-using base class
             */
            _this.pasteFileShareToStorageAccount = function (args) {
                var id = args.id;
                var nodeType = args.nodeType;
                var connectionString = args.connectionString;
                return _this._host.executeOperation("Environment.clipboardGetData", [AzureStorageConstants.FileShareClipboardFormat])
                    .then(function (clipboardData) {
                    if (!clipboardData) {
                        return;
                    }
                    var sourceShareReference = {
                        connectionString: clipboardData.connectionString,
                        shareName: clipboardData.shareName,
                        quota: clipboardData.quota
                    };
                    var sourceAccountUri = clipboardData.accountUri;
                    var sourceShareSasToken = clipboardData.sasToken;
                    var sourceContainer = new FileFlobContainer_1.default(_this._host, sourceShareReference);
                    var destShareReference = {
                        connectionString: connectionString,
                        shareName: clipboardData.shareName,
                        quota: clipboardData.quota // Paste to new share with same quota as the source share
                    };
                    var destContainer = new FileFlobContainer_1.default(_this._host, destShareReference);
                    var copyContainerProperties = _this._canCopyContainerProperties(sourceShareReference.connectionString);
                    return _this._confirmCopyContainerProperties(copyContainerProperties).then(function (answer) {
                        if (!answer) {
                            return;
                        }
                        var groupActivity = new FileShareCopyGroupActivity_1.default(CopyType_1.default.Copy, sourceContainer, sourceAccountUri, sourceShareSasToken, "" /*sourceFolder*/, destContainer, "" /*destFolder*/, _this._host, _this._activityLogManager, _this._telemetry, null // mungeDestinationName
                        );
                        groupActivity.initialize();
                        groupActivity.mainMessage("Verifying destination file share exists"); // Localize
                        groupActivity.addToActivityLog();
                        // Close the editor (we can't easily determine if it's open
                        //   to the source table, due to the connection string in the clipboard
                        //   being different).
                        StorageActionsHelper.closeStorageEditor(_this._host, new TelemetryActions(_this._host));
                        groupActivity.startCopyingContainer(id, nodeType, copyContainerProperties, null, null);
                    });
                });
            };
            /**
             * Rename a file share
             */
            _this.renameFileShare = function (args) {
                var reference = {
                    connectionString: args.connectionString,
                    shareName: args.name
                };
                var container = new FileFlobContainer_1.default(_this._host, reference);
                return _this._startRenameTaskCore(args, AzureStorageConstants.nodeTypes.fileShareGroup, args.nodeType, container, true /*copyContainerProperties*/, "StorageExplorer.startRenameFileShareTask");
            };
            _this.generateSharedAccessSignature = function (args) {
                var connectionString = args.connectionString;
                var shareName = args.name;
                return FileActions.openGenerateSharedAccessSignatureDialog(_this._host, connectionString, shareName);
            };
            _this.manageAccessControlList = function (args) {
                var connectionString = args.connectionString;
                var shareName = args.name;
                return FileActions.openManageAccessControlListDialog(_this._host, connectionString, shareName);
            };
            _this.configureCORS = function (args) {
                return _this._host.executeOperation("AzureFiles.getCorsRule", [args.connectionString])
                    .then(function (response) {
                    return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                        id: AzureConstants.registeredDialogs.corsSettings,
                        parameters: {
                            corsRules: response
                        }
                    });
                }).then(function (newCorsRule) {
                    if (newCorsRule) {
                        return _this._host.executeOperation("AzureFiles.setCorsRule", [args.connectionString, newCorsRule]);
                    }
                    else {
                        _this._telemetry.sendEvent("StorageExplorer.File.configureCorsRuleCancelled");
                    }
                })
                    .catch(function (error) {
                    StorageActionsHelper.showError(_this._host, error);
                });
            };
            _this._azureConnection = azureConnection;
            _this._uiActions = new UIActions(_this._host);
            _this._activityLogManager = activityLogManager;
            return _this;
        }
        FileActions.prototype._createCopyGroupActivity = function (copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, destContainer, telemetryCategory) {
            return new FileShareCopyGroupActivity_1.default(copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, "", // sourceFolder
            destContainer, "", // destFolder
            this._host, this._activityLogManager, this._telemetry, null, // mungeDestinationName,
            null // blobListViewModel
            );
        };
        FileActions.prototype._getFlobContainer = function (sourceContainer, destFileShareName) {
            return new FileFlobContainer_1.default(this._host, {
                shareName: destFileShareName,
                connectionString: sourceContainer.getConnectionString()
            });
        };
        FileActions.prototype._doesNewNameExist = function (connectionString, containerName) {
            return new FilePW_1.default(this._host).doesFileShareExist(connectionString, containerName);
        };
        FileActions.openGenerateSharedAccessSignatureDialog = function (host, connectionString, shareName, fileName) {
            if (fileName === void 0) { fileName = ""; }
            var operationArgs = {
                id: AzureConstants.registeredDialogs.generateFileSas,
                parameters: {
                    connectionString: connectionString,
                    shareName: shareName,
                    fileName: fileName,
                    resourceType: AzureStorageConstants.sasResourceTypes.file
                }
            };
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", operationArgs)
                .catch(function (error) {
                StorageActionsHelper.showError(host, error);
            });
        };
        FileActions.openManageAccessControlListDialog = function (host, connectionString, shareName) {
            var operationArgs = {
                id: AzureConstants.registeredDialogs.manageFileAcl,
                parameters: {
                    connectionString: connectionString,
                    shareName: shareName,
                    resourceType: AzureStorageConstants.sasResourceTypes.file
                }
            };
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", operationArgs)
                .catch(function (error) {
                StorageActionsHelper.showError(host, error);
            });
        };
        FileActions.showItemProperties = function (host, connectionString, contentType, shareName, directory, itemName) {
            if (itemName === void 0) { itemName = ""; }
            var operationArgs = [
                connectionString,
                contentType,
                shareName,
                directory,
                itemName
            ];
            return host.executeOperation("AzureFiles.getItemProperties", operationArgs)
                .then(function (response) {
                if (response) {
                    // This will make sure that all the content settings properties always shows up in the properties dialog.
                    if (contentType === "") {
                        AzureStorageConstants.editablePropertiesNames.forEach(function (propName) {
                            return response[propName] = response[propName] ? response[propName] : "";
                        });
                    }
                    var operationArgs = {
                        id: AzureConstants.registeredDialogs.flobProperties,
                        parameters: {
                            response: response,
                            context: {
                                connectionString: connectionString,
                                shareName: shareName,
                                directory: directory,
                                fileName: itemName
                            }
                        }
                    };
                    return host.executeProviderOperation("Environment.Dialogs.getDialogResult", operationArgs)
                        .then(function (result) {
                        if (result) {
                            var contentSettings = {};
                            AzureStorageConstants.editablePropertiesNames.forEach(function (propName) {
                                contentSettings[propName] = result.properties[propName];
                            });
                            var args = [
                                connectionString,
                                contentType,
                                shareName,
                                directory,
                                itemName,
                                contentSettings
                            ];
                            var metadata = [
                                connectionString,
                                contentType,
                                shareName,
                                directory,
                                itemName,
                                result.metadata
                            ];
                            // You cannot set properties for a Folder. you can only set metadata.
                            var setPropertiesIfNotFolder = function () {
                                if (contentType !== StorageExplorerConstants.ContentTypes.Folder) {
                                    return host.executeOperation("AzureFiles.setItemProperties", args);
                                }
                                else {
                                    return Promise.resolve(null);
                                }
                            };
                            return setPropertiesIfNotFolder().then(function (value) {
                                return host.executeOperation("AzureFiles.setItemMetadata", metadata).then(function (value) {
                                    return host.executeOperation("Environment.dismissDialog", [null]);
                                });
                            });
                        }
                    });
                }
            })
                .catch(function (error) {
                var message = Utilities.getErrorMessage(error);
                host.executeOperation("Environment.showInfobarMessage", [message, null, StorageExplorerConstants.InfoBarTypes.errorLink]);
                StorageActionsHelper.showError(host, error);
            });
        };
        return FileActions;
    }(FlobActions_1.default));
    FileActions.copyFileShareToClipboardNamespace = "Azure.Actions.Storage.File.copyFileShareToClipboard";
    FileActions.pasteFileShareToStorageAccountNamespace = "Azure.Actions.Storage.File.pasteFileShareToStorageAccount";
    FileActions.generateSharedAccessSignatureNamespace = "Azure.Actions.Storage.File.generateSharedAccessSignature";
    FileActions.manageAccessControlListNamespace = "Azure.Actions.Storage.File.manageAccessControlList";
    FileActions.configureCORSNamespace = "Azure.Actions.Storage.File.configureCORS";
    FileActions.renameFileShareNamespace = "Azure.Actions.Storage.File.renameFileShare";
    return FileActions;
});

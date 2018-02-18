/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Common/AzureStorageConstants", "ActivityLog/StorageExplorer/BlobContainerCopyGroupActivity", "ActivityLog/StorageExplorer/BlobFlobContainer", "Providers/StorageExplorer/ProviderWrappers/BlobPW", "ActivityLog/StorageExplorer/CopyType", "Providers/StorageExplorer/Actions/FlobActions", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Common/TelemetryActions", "Common/UIActions"], function (require, exports, AzureConstants, AzureStorageConstants, BlobContainerCopyGroupActivity_1, BlobFlobContainer_1, BlobPW_1, CopyType_1, FlobActions_1, StorageActionsHelper, TelemetryActions, UIActions) {
    "use strict";
    var BlobActions = (function (_super) {
        __extends(BlobActions, _super);
        function BlobActions(azureConnection, host, activityLogManager, telemetry) {
            var _this = _super.call(this, host, telemetry, true /*isBlobs*/) || this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            _this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(BlobActions.copyBlobContainerToClipboardNamespace, _this.copyBlobContainerToClipboard);
                actionBindingManager.addActionBinding(BlobActions.pasteBlobContainerToStorageAccountNamespace, _this.pasteBlobContainerToStorageAccount);
                actionBindingManager.addActionBinding(BlobActions.renameBlobContainerNamespace, _this.renameBlobContainer);
                actionBindingManager.addActionBinding(BlobActions.generateBlobContainerSharedAccessSignatureNamespace, _this.generateBlobContainerSharedAccessSignature);
                actionBindingManager.addActionBinding(BlobActions.manageBlobContainerAccessControlListNamespace, _this.manageBlobContainerAccessControlList);
                actionBindingManager.addActionBinding(BlobActions.safeSetContainerPublicAccessLevelNamespace, _this.safeSetContainerPublicAccessLevel);
                actionBindingManager.addActionBinding(BlobActions.acquireBlobContainerLeaseNamespace, _this.acquireBlobContainerLease);
                actionBindingManager.addActionBinding(BlobActions.breakBlobContainerLeaseNamespace, _this.breakBlobContainerLease);
                actionBindingManager.addActionBinding(BlobActions.configureCORSNamespace, _this.configureCORS);
            };
            /**
             * Action to copy a blob container.
             */
            _this.copyBlobContainerToClipboard = function (args) {
                var sourceContainerReference = {
                    connectionString: args.connectionString,
                    containerName: args.name
                };
                var sourceContainer = new BlobFlobContainer_1.default(_this._host, sourceContainerReference);
                return sourceContainer.copyContainerToClipboard();
            };
            /**
             * Action to paste a blob container to a storage account by create a new container.
             */
            _this.pasteBlobContainerToStorageAccount = function (args) {
                var id = args.id;
                var groupNodeType = args.nodeType;
                var connectionString = args.connectionString;
                return _this._getBlobContainerClipboardData()
                    .then(function (clipboardData) {
                    if (!clipboardData) {
                        return;
                    }
                    var sourceContainerReference = {
                        connectionString: clipboardData.connectionString,
                        containerName: clipboardData.containerName
                    };
                    var sourceAccountUri = clipboardData.accountUri;
                    var sourceContainerSasToken = clipboardData.sasToken;
                    var sourceContainer = new BlobFlobContainer_1.default(_this._host, sourceContainerReference);
                    var destContainerReference = {
                        connectionString: connectionString,
                        containerName: clipboardData.containerName // Paste to new container with same name as the source container
                    };
                    var destContainer = new BlobFlobContainer_1.default(_this._host, destContainerReference);
                    var copyContainerProperties = _this._canCopyContainerProperties(sourceContainerReference.connectionString);
                    return _this._confirmCopyContainerProperties(copyContainerProperties).then(function (answer) {
                        if (!answer) {
                            return;
                        }
                        // Close the editor (we can't easily determine if it's open
                        //   to the source table, due to the connection string in the clipboard
                        //   being different).
                        StorageActionsHelper.closeStorageEditor(_this._host, new TelemetryActions(_this._host));
                        return _this._startPasteContainerTaskCore(CopyType_1.default.Copy, null, sourceContainer, sourceAccountUri, sourceContainerSasToken, destContainer, copyContainerProperties, id, groupNodeType, "CloudExplorer.pasteBlobContainer");
                    });
                });
            };
            /**
             * Rename a blob container
             */
            _this.renameBlobContainer = function (args) {
                var reference = {
                    connectionString: args.connectionString,
                    containerName: args.name
                };
                var container = new BlobFlobContainer_1.default(_this._host, reference);
                return _this._startRenameTaskCore(args.id, AzureStorageConstants.nodeTypes.blobContainerGroup, args.nodeType, container, true /*copyContainerProperties*/, "StorageExplorer.startRenameBlobContainerTask");
            };
            /**
             * Action to generate blob container Shared Access Signature based on user input
             */
            _this.generateBlobContainerSharedAccessSignature = function (args) {
                var connectionString = args.connectionString;
                var containerName = args.name;
                return BlobActions.openGenerateSharedAccessSignature(_this._host, connectionString, containerName);
            };
            /**
             * Action to manage blob container Access Control List based on user input
             */
            _this.manageBlobContainerAccessControlList = function (args) {
                var connectionString = args.connectionString;
                var containerName = args.name;
                return BlobActions.openManageAccessControlListDialog(_this._host, connectionString, containerName);
            };
            /**
             * Action to set blob container public access level
             */
            _this.safeSetContainerPublicAccessLevel = function (args) {
                var connectionString = args.connectionString;
                var containerName = args.name;
                var publicReadAccess = args.publicReadAccess;
                return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                    id: AzureConstants.registeredDialogs.options,
                    parameters: {
                        title: "Set Container Public Access Level",
                        message: "Choose the access level for container '" + containerName + "':",
                        options: [
                            { title: "No public access", value: "off" },
                            { title: "Public read access for container and blobs", value: "container" },
                            { title: "Public read access for blobs only", value: "blob" }
                        ],
                        // Blob manager returns uppercased Azure result, so we need to lowercase it when passing back.
                        defaultOptionValue: publicReadAccess.toLowerCase(),
                        buttons: [
                            { title: "Apply", value: "ok" },
                            { title: "Cancel", value: "cancel" }
                        ]
                    }
                }).then(function (response) {
                    if (response && response.button === "ok") {
                        var operationArgs = [
                            connectionString,
                            containerName,
                            response.option
                        ];
                        return _this._host.executeOperation("AzureBlobs.setContainerPublicAccessLevel", operationArgs)
                            .then(function (response) {
                            if (response) {
                                // refresh this node
                                _this._host.executeOperation("CloudExplorer.ElementInteraction.refresh", [args]);
                            }
                        });
                    }
                }).catch(function (error) {
                    _this._showError(error);
                });
            };
            _this.acquireBlobContainerLease = function (args) {
                var connectionString = args.connectionString;
                var containerName = args.containerName;
                // localize
                var prompt = "This will lock blob container '" + containerName + "' so it cannot be deleted, but blobs inside the container will still be able to be deleted or modified.\r\n\r\n"
                    + "Continue?";
                return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: prompt, iconType: "question" }])
                    .then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("AzureBlobs.acquireLease", [connectionString, containerName, null])
                            .then(function () {
                            _this._telemetry.sendEvent("CloudExplorer.acquireBlobContainerLease", {
                                Response: "Success"
                            });
                            // refresh this node
                            _this._host.executeOperation("CloudExplorer.ElementInteraction.refresh", [args]);
                        })
                            .catch(function (error) {
                            _this._showError(error);
                        });
                    }
                });
            };
            _this.breakBlobContainerLease = function (args) {
                var connectionString = args.connectionString;
                var containerName = args.containerName;
                // localize
                var prompt = "Breaking the lease on blob container '" + containerName + "' will allow it to be deleted.\r\n\r\nContinue?";
                return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: prompt, iconType: "question" }])
                    .then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("AzureBlobs.breakLease", [connectionString, containerName, null])
                            .then(function () {
                            _this._telemetry.sendEvent("CloudExplorer.breakBlobContainerLease", {
                                Response: "Success"
                            });
                            // refresh this node
                            _this._host.executeOperation("CloudExplorer.ElementInteraction.refresh", [args]);
                        })
                            .catch(function (error) {
                            _this._showError(error);
                        });
                    }
                });
            };
            _this.configureCORS = function (args) {
                return _this._host.executeOperation("AzureBlobs.getCorsRule", [args.connectionString])
                    .then(function (response) {
                    return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                        id: AzureConstants.registeredDialogs.corsSettings,
                        parameters: {
                            corsRules: response
                        }
                    });
                })
                    .then(function (newCorsRule) {
                    if (newCorsRule) {
                        return _this._host.executeOperation("AzureBlobs.setCorsRule", [args.connectionString, newCorsRule]);
                    }
                    else {
                        _this._telemetry.sendEvent("StorageExplorer.Blob.configureCorsRuleCancelled");
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
        BlobActions.prototype._getBlobContainerClipboardData = function () {
            return this._host.executeOperation("Environment.clipboardGetData", [AzureStorageConstants.BlobContainerClipboardFormat]);
        };
        BlobActions.prototype._createCopyGroupActivity = function (copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, destContainer, telemetryCategory) {
            return new BlobContainerCopyGroupActivity_1.default(copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, "", // sourceFolder
            destContainer, "", // destFolder
            this._host, this._activityLogManager, this._telemetry, null, // mungeDestinationName,
            null // blobListViewModel
            );
        };
        BlobActions.prototype._getFlobContainer = function (sourceContainer, destContainerName) {
            return new BlobFlobContainer_1.default(this._host, {
                containerName: destContainerName,
                connectionString: sourceContainer.getConnectionString()
            });
        };
        BlobActions.prototype._doesNewNameExist = function (connectionString, containerName) {
            return new BlobPW_1.default(this._host).doesBlobContainerExist(connectionString, containerName);
        };
        BlobActions.openManageAccessControlListDialog = function (host, connectionString, containerName) {
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.manageBlobAcl,
                parameters: { connectionString: connectionString, containerName: containerName, resourceType: AzureStorageConstants.sasResourceTypes.blob }
            })
                .catch(function (error) {
                return StorageActionsHelper.showError(host, error);
            });
        };
        BlobActions.openGenerateSharedAccessSignature = function (host, connectionString, containerName, blobName) {
            if (blobName === void 0) { blobName = ""; }
            return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.generateBlobSas,
                parameters: {
                    connectionString: connectionString,
                    containerName: containerName,
                    blobName: blobName,
                    resourceType: AzureStorageConstants.sasResourceTypes.blob
                }
            })
                .catch(function (error) {
                return StorageActionsHelper.showError(host, error);
            });
        };
        BlobActions.showBlobProperties = function (host, connectionString, containerName, blobName, snapshotId) {
            if (blobName === void 0) { blobName = ""; }
            return host.executeOperation("AzureBlobs.getBlobProperties", [connectionString, containerName, blobName, snapshotId]).then(function (response) {
                if (response) {
                    // This will make sure that all the content settings properties always shows up in the properties dialog.
                    AzureStorageConstants.editablePropertiesNames.forEach(function (propName) {
                        return response[propName] = response[propName] ? response[propName] : "";
                    });
                    var parameters = {
                        response: response,
                        context: {
                            connectionString: connectionString,
                            containerName: containerName,
                            blobName: blobName
                        },
                        readOnly: !!snapshotId
                    };
                    return host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                        id: AzureConstants.registeredDialogs.flobProperties,
                        parameters: parameters
                    }).then(function (result) {
                        if (result && !parameters.readOnly) {
                            var contentSettings = {};
                            AzureStorageConstants.editablePropertiesNames.forEach(function (propName) {
                                contentSettings[propName] = result.properties[propName];
                            });
                            var args = [
                                connectionString,
                                containerName,
                                blobName,
                                contentSettings
                            ];
                            var metadata = [
                                connectionString,
                                containerName,
                                blobName,
                                result.metadata
                            ];
                            return host.executeOperation("AzureBlobs.setBlobProperties", args).then(function (value) {
                                return host.executeOperation("AzureBlobs.setBlobMetadata", metadata).then(function (value) {
                                    return host.executeOperation("Environment.dismissDialog", [null]);
                                });
                            });
                        }
                    });
                }
            }).catch(function (error) {
                return StorageActionsHelper.showError(host, error);
            });
        };
        return BlobActions;
    }(FlobActions_1.default));
    BlobActions.copyBlobContainerToClipboardNamespace = "Azure.Actions.Storage.Blob.copyBlobContainerToClipboard";
    BlobActions.generateBlobContainerSharedAccessSignatureNamespace = "Azure.Actions.Storage.Blob.generateBlobContainerSharedAccessSignature";
    BlobActions.manageBlobContainerAccessControlListNamespace = "Azure.Actions.Storage.Blob.manageBlobContainerAccessControlList";
    BlobActions.safeSetContainerPublicAccessLevelNamespace = "Azure.Actions.Storage.Blob.safeSetContainerPublicAccessLevel";
    BlobActions.pasteBlobContainerToStorageAccountNamespace = "Azure.Actions.Storage.Blob.pasteBlobContainerToStorageAccount";
    BlobActions.renameBlobContainerNamespace = "Azure.Actions.Storage.Blob.renameBlobContainer";
    BlobActions.acquireBlobContainerLeaseNamespace = "Azure.Actions.Storage.Blob.acquireBlobContainerLease";
    BlobActions.breakBlobContainerLeaseNamespace = "Azure.Actions.Storage.Blob.breakBlobContainerLease";
    BlobActions.configureCORSNamespace = "Azure.Actions.Storage.Blob.configureCORS";
    return BlobActions;
});

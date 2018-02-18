/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/StorageExplorer/Actions/BaseContainerActions", "ActivityLog/StorageExplorer/CompositeSequence", "ActivityLog/StorageExplorer/CopyType", "StorageExplorer/ActivityLogModels/DeleteRenamedFlobContainerActivity", "Providers/StorageExplorer/Actions/StorageActionsHelper"], function (require, exports, AzureConstants, BaseContainerActions_1, CompositeSequence, CopyType_1, DeleteRenamedFlobContainerActivity_1, StorageActionsHelper) {
    "use strict";
    var FlobActions = (function (_super) {
        __extends(FlobActions, _super);
        function FlobActions(host, telemetry, isBlobs // vs files
        ) {
            var _this = _super.call(this, host) || this;
            _this._telemetry = telemetry;
            _this._isBlobs = isBlobs;
            return _this;
        }
        Object.defineProperty(FlobActions.prototype, "isBlobs", {
            get: function () { return this._isBlobs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlobActions.prototype, "isFiles", {
            get: function () { return !this._isBlobs; },
            enumerable: true,
            configurable: true
        });
        FlobActions.prototype._getNewContainerNameFromUser = function (connectionString, originalName) {
            var _this = this;
            var resourceType;
            // localize
            if (this.isBlobs) {
                resourceType = "blobContainer";
            }
            else {
                resourceType = "fileShare";
            }
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.rename,
                parameters: {
                    newNameLabel: "Please specify the new name",
                    originalName: originalName,
                    resourceType: resourceType,
                    isCaseSensitive: false
                }
            }).then(function (outputs) {
                if (outputs) {
                    var newName = outputs.newName;
                    return _this._doesNewNameExist(connectionString, newName)
                        .then(function (exists) {
                        if (exists) {
                            // Localize
                            throw new Error("An item with that name already exists.");
                        }
                        return newName;
                    });
                }
            });
        };
        FlobActions.prototype._startPasteContainerTaskCore = function (copyType, completionSequence, sourceContainer, sourceAccountUri, sourceContainerSasToken, destContainer, copyContainerProperties, accountNodeId, nodeType, telemetryCategory) {
            // Get a URI for the destination container
            try {
                // Create an activity to do the group copy
                var groupActivity = this._createCopyGroupActivity(copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, destContainer, telemetryCategory);
                groupActivity.initialize();
                groupActivity.mainMessage("Creating destination blob container"); // Localize
                groupActivity.addToActivityLog();
                groupActivity.startCopyingContainer(accountNodeId, nodeType, copyContainerProperties, completionSequence, null);
            }
            catch (error) {
                this._showError(error, telemetryCategory);
            }
        };
        FlobActions.prototype._startRenameTaskCore = function (accountNodeId, groupNodeType, containerNodeType, sourceContainer, copyContainerProperties, telemetryCategory) {
            var _this = this;
            return this._getNewContainerNameFromUser(sourceContainer.getConnectionString(), sourceContainer.getName())
                .then(function (newName) {
                if (newName) {
                    return sourceContainer.getPrimaryAccountUri()
                        .then(function (sourceAccountUri) {
                        return sourceContainer.getSASTokenForCopy()
                            .then(function (sourceContainerSasToken) {
                            var destContainer = _this._getFlobContainer(sourceContainer, newName);
                            // Create a sequence that will get added to the queue after all
                            // the sequence with the enumerated flobs.
                            var completionSequence = new CompositeSequence();
                            // This is set to not run until all other activities are completed or canceled
                            var deleteActivity = new DeleteRenamedFlobContainerActivity_1.default(_this._host, sourceContainer, containerNodeType, _this._telemetry);
                            deleteActivity.initialize();
                            completionSequence.addData(deleteActivity);
                            // Close the source container if it's open
                            StorageActionsHelper.closeTargetStorageEditor(_this._host, _this._telemetry, sourceContainer.getConnectionString(), _this.isBlobs ?
                                0 /* blobContainer */ :
                                1 /* fileShare */, sourceContainer.getName());
                            // Start renaming
                            return _this._startPasteContainerTaskCore(CopyType_1.default.Rename, completionSequence, 
                            // Source info
                            sourceContainer, sourceAccountUri, sourceContainerSasToken, 
                            // Destination info
                            destContainer, copyContainerProperties, accountNodeId, groupNodeType, telemetryCategory);
                        });
                    });
                }
            }).catch(function (error) {
                _this._showError(error, telemetryCategory);
            });
        };
        FlobActions.prototype._showError = function (error, telemetryCategory) {
            return StorageActionsHelper.showError(this._host, error, telemetryCategory);
        };
        return FlobActions;
    }(BaseContainerActions_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobActions;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConstants", "StorageExplorer/Common/BaseStorageCommands", "Common/ConnectionString", "ActivityLog/StorageExplorer/CopyType", "StorageExplorer/Common/DataTableUtilities", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, BaseStorageCommands_1, ConnectionString_1, CopyType_1, DataTableUtilities, StorageExplorerConstants, Utilities) {
    "use strict";
    /*
     * Commands that can be performed in a storage explorer editor
     */
    var FlobCommands = (function (_super) {
        __extends(FlobCommands, _super);
        function FlobCommands(host, telemetry, container, isBlobs // vs files
        ) {
            var _this = _super.call(this, host, telemetry) || this;
            _this.canRename = function (selected) {
                return _this.isEnabled(FlobCommands.renameCommand, selected);
            };
            _this._container = container;
            _this._isBlobs = isBlobs;
            return _this;
        }
        Object.defineProperty(FlobCommands.prototype, "isBlobs", {
            get: function () { return this._isBlobs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlobCommands.prototype, "isFiles", {
            get: function () { return !this._isBlobs; },
            enumerable: true,
            configurable: true
        });
        FlobCommands.prototype._getSelectionInfo = function (selectedFlobs) {
            var connectionString = this._container.getConnectionString();
            var atLeastOneItemOrFolder = DataTableUtilities.containItems(selectedFlobs);
            var singleItemOrFolder = DataTableUtilities.containSingleItem(selectedFlobs);
            var atLeastOneFolder = this.containsFolder(selectedFlobs);
            var atleastOneSnapshot = this.containsSnapshot(selectedFlobs);
            var connectionStringObject = new ConnectionString_1.default(connectionString);
            return {
                atLeastOneItemOrFolder: atLeastOneItemOrFolder,
                singleItemOrFolder: singleItemOrFolder,
                singleItemAndNoFolders: singleItemOrFolder && !atLeastOneFolder,
                atLeastOneFolder: atLeastOneFolder,
                singleFolder: singleItemOrFolder && atLeastOneFolder,
                noFolders: !atLeastOneFolder,
                atleastOneSnapshot: atleastOneSnapshot,
                connectionContainsAccountNameKey: connectionStringObject.containsKeyAndName(true /*includeEmulator*/),
                connectionContainsSas: connectionStringObject.containsSAS(),
                hasVmMetadata: singleItemOrFolder && !atLeastOneFolder ? this.hasVmMetaData(selectedFlobs[0]) : false
            };
        };
        FlobCommands.prototype.isEnabled = function (commandName, selected) {
            var info = this._getSelectionInfo(selected);
            // Check derived classes first
            var enabled = this.isEnabledCore(commandName, info, selected);
            if (typeof enabled === "boolean") {
                return enabled;
            }
            switch (commandName) {
                case FlobCommands.copyCommand:
                    return (info.connectionContainsAccountNameKey || info.connectionContainsSas) && info.atLeastOneItemOrFolder;
                case FlobCommands.renameCommand:
                    // Rename currently depends on copy functionality
                    return info.singleItemOrFolder && this.isEnabled(FlobCommands.copyCommand, selected);
                case FlobCommands.getFolderStatsCommand:
                    // Always available
                    return true;
                case FlobCommands.getSelectionStatsCommand:
                    return info.atLeastOneItemOrFolder;
            }
            return null;
        };
        FlobCommands.prototype.containsFolder = function (flobs) {
            var _this = this;
            return flobs && flobs.some(function (flob) {
                return _this.isFolder(flob);
            });
        };
        FlobCommands.prototype.containsSnapshot = function (flobs) {
            return flobs && flobs.some(function (flob) {
                return !!flob.Blob && !!flob.Blob.Snapshot;
            });
        };
        FlobCommands.prototype.isFolder = function (flob) {
            return flob && flob.ContentType === StorageExplorerConstants.ContentTypes.Folder;
        };
        FlobCommands.prototype.hasVmMetaData = function (flob) {
            // can't construct a portal link for now, so just always return false
            return false;
            // if (!flob || !flob.Blob || !flob.Blob.metadata) {
            //     return false;
            // } else {
            //     var metaData: any = flob.Blob.metadata;
            //     return !!metaData.microsoftazurecompute_diskid &&
            //         !!metaData.microsoftazurecompute_diskname &&
            //         !!metaData.microsoftazurecompute_disktype &&
            //         !!metaData.microsoftazurecompute_resourcegroupname &&
            //         !!metaData.microsoftazurecompute_vmname;
            // }
        };
        /**
         * Adds or updates the flob's properties to the ones given and then redraws the table
         */
        FlobCommands.prototype.addOrUpdateFlobAndRedrawThrottled = function (flob, listViewModel) {
            listViewModel.addFlobToCurrentFolder(flob).then(function () {
                listViewModel.redrawTableThrottled();
            });
        };
        /**
         * Retrieves the flob's current properties from Azure and then redraws the table
         */
        FlobCommands.prototype.addOrUpdateFlobFromAzureAndRedrawThrottled = function (flob, listViewModel) {
            var _this = this;
            this._container.getItem(flob.FullName, flob.Blob ? flob.Blob.Snapshot : null)
                .then(function (updatedFlob) {
                return _this.addOrUpdateFlobAndRedrawThrottled(updatedFlob, listViewModel);
            });
        };
        /**
         * Gets a new name from the user.  Returns the full path + name.
         */
        FlobCommands.prototype._getNewNameFromUser = function (parentFolder, originalName, isFolder) {
            var _this = this;
            var resourceType;
            if (this.isBlobs) {
                if (isFolder) {
                    resourceType = "blobFolder";
                }
                else {
                    resourceType = "blob";
                }
            }
            else {
                if (isFolder) {
                    resourceType = "fileDirectory";
                }
                else {
                    resourceType = "file";
                }
            }
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.rename,
                parameters: {
                    originalName: originalName,
                    resourceType: resourceType,
                    isCaseSensitive: this.isBlobs
                }
            }).then(function (outputs) {
                if (outputs) {
                    var newName = outputs.newName;
                    var newPath = Utilities.JoinAzurePaths(parentFolder, newName);
                    return _this._doesNewNameExist(_this._container.getConnectionString(), _this._container.getName(), newPath, isFolder)
                        .then(function (exists) {
                        if (exists) {
                            // Localize
                            throw new Error(_this.isBlobs ?
                                (isFolder ? "A blob folder with that name already exists." : "A blob with that name already exists.") :
                                "A file or directory with that name already exists.");
                        }
                        return newPath;
                    });
                }
            });
        };
        FlobCommands.prototype._startPasteItemsTaskCore = function (copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, fullItemPathsOrItems, mungeDestinationName, // No munging if null
            listViewModel, overwriteIfExists, telemetryCategory) {
            // Get a URI for the destination container
            try {
                // Create an activity to do the group copy
                var groupActivity = this._createCopyGroupActivity(copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, mungeDestinationName, listViewModel, overwriteIfExists, telemetryCategory);
                groupActivity.initialize();
                groupActivity.addToActivityLog();
                groupActivity.startCopyingItems(fullItemPathsOrItems, sourceFolder, null);
                return Promise.resolve();
            }
            catch (error) {
                this._showError(error, telemetryCategory);
            }
        };
        FlobCommands.prototype._startCopyTaskCoreNoPrompt = function (copyType, newPath, listViewModel, telemetryCategory, overwriteIfExists) {
            var _this = this;
            var selected = listViewModel.selected()[0]; // Only supports renaming a single flob/folder/file/directory
            var isFolder = selected.ContentType === StorageExplorerConstants.ContentTypes.Folder;
            var currentFolderPath = listViewModel.currentFolderPath();
            if (newPath) {
                var newName = Utilities.getFileNameFromPath(newPath);
                return this._container.getPrimaryAccountUri()
                    .then(function (sourceAccountUri) {
                    return _this._container.getSASTokenForCopy()
                        .then(function (sourceContainerSasToken) {
                        var mungeDestinationName;
                        var sourceFolder;
                        var destinationFolder;
                        if (isFolder) {
                            sourceFolder = Utilities.JoinAzurePaths(currentFolderPath, selected.FileName);
                            destinationFolder = Utilities.JoinAzurePaths(Utilities.getDirectoryFromPath(currentFolderPath), newName);
                            mungeDestinationName = null;
                        }
                        else {
                            sourceFolder = currentFolderPath;
                            destinationFolder = currentFolderPath;
                            var mungeDestinationName = function (destPath) {
                                // When we're renaming a single blob/file, we need to change the destination name to the new name
                                return Utilities.JoinAzurePaths(Utilities.getDirectoryFromPath(destPath), newName);
                            };
                        }
                        return _this._startPasteItemsTaskCore(copyType, 
                        // Source info
                        _this._container, sourceAccountUri, sourceContainerSasToken, sourceFolder, _this._container, 
                        // Destination info
                        destinationFolder, [selected], mungeDestinationName, listViewModel, overwriteIfExists, telemetryCategory);
                    });
                });
            }
        };
        FlobCommands.prototype._startRenameTaskCore = function (listViewModel, telemetryCategory) {
            var _this = this;
            var selected = listViewModel.selected()[0]; // Only supports renaming a single flob/folder/file/directory
            var isFolder = selected.ContentType === StorageExplorerConstants.ContentTypes.Folder;
            var currentFolderPath = listViewModel.currentFolderPath();
            return this._getNewNameFromUser(currentFolderPath, selected.FileName, isFolder)
                .then(function (newPath) {
                return _this._startCopyTaskCoreNoPrompt(CopyType_1.default.Rename, newPath, listViewModel, telemetryCategory, false);
            })
                .catch(function (error) {
                _this._showError(error, telemetryCategory);
            });
        };
        return FlobCommands;
    }(BaseStorageCommands_1.default));
    FlobCommands.copyCommand = "copy";
    FlobCommands.renameCommand = "rename";
    FlobCommands.getFolderStatsCommand = "get-folder-stats";
    FlobCommands.getSelectionStatsCommand = "get-selection-stats";
    exports.FlobCommands = FlobCommands;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobCommands;
});

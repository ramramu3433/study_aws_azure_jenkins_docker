/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "underscore", "es6-promise", "Providers/Common/AzureConstants", "Providers/Common/AzureStorageConstants", "Providers/StorageExplorer/Actions/BlobActions", "ActivityLog/StorageExplorer/BlobCopyGroupActivity", "StorageExplorer/ActivityLogModels/BlobDeleteGroupActivity", "ActivityLog/StorageExplorer/BlobFlobContainer", "ActivityLog/StorageExplorer/BlobStatsActivity", "Providers/StorageExplorer/ProviderWrappers/BlobPW", "ActivityLog/StorageExplorer/CopyType", "StorageExplorer/Common/FlobCommands", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, ko, _, es6_promise_1, AzureConstants, AzureStorageConstants, BlobActions, BlobCopyGroupActivity_1, BlobDeleteGroupActivity, BlobFlobContainer_1, BlobStatsActivity_1, BlobPW_1, CopyType_1, FlobCommands_1, StorageExplorerConstants, Utilities) {
    "use strict";
    /*
     * Commands that can be performed in the blob explorer
     */
    var BlobCommands = (function (_super) {
        __extends(BlobCommands, _super);
        function BlobCommands(blobExplorerContext) {
            var _this = _super.call(this, blobExplorerContext.hostProxy, blobExplorerContext.telemetry, new BlobFlobContainer_1.default(blobExplorerContext.hostProxy, blobExplorerContext.containerReference), true /*isBlobs*/) || this;
            _this.downloadCommandName = "download";
            _this.uploadFilesCommandName = "uploadFiles";
            _this.uploadFolderCommandName = "uploadFolder";
            _this._areBlobsOnClipboard = ko.observable(false);
            _this.canCopy = function (selectedBlobs) {
                return _this.isEnabled(BlobCommands.copyCommand, selectedBlobs);
            };
            _this.canManageSnapshots = function (selectedBlobs) {
                return _this.isEnabled(BlobCommands.manageSnapshotCommand, selectedBlobs);
            };
            _this.canMakeSnapshot = function (selectedBlobs) {
                return _this.isEnabled(BlobCommands.makeSnapshotCommand, selectedBlobs);
            };
            _this.canPromoteSnapshot = function (selectedBlobs) {
                return _this.isEnabled(BlobCommands.promoteSnapshotCommand, selectedBlobs);
            };
            _this.canGetFolderStats = function () {
                return _this.isEnabled(BlobCommands.getFolderStatsCommand, null);
            };
            _this.canGetSelectionStats = function (selectedBlobs) {
                return _this.isEnabled(BlobCommands.getSelectionStatsCommand, selectedBlobs);
            };
            _this.canOpenVmInPortal = function (selectedBlobs) {
                return _this.isEnabled(BlobCommands.openVmInPortalCommand, selectedBlobs);
            };
            _this.canPaste = ko.pureComputed(function () { return _this._areBlobsOnClipboard(); });
            /**
             * Since the call to clipboardContainsData is asynchronous, and also since we don't get clipboard
             * change events, someone needs to call this method periodically so the canPaste observable can be
             * recalculated.
             */
            _this.checkClipboard = function (selected) {
                _this._host.executeOperation("Environment.clipboardContainsData", [AzureStorageConstants.BlobsClipboardFormat])
                    .then(function (clipboardHasBlobs) {
                    _this._areBlobsOnClipboard(clipboardHasBlobs);
                });
            };
            _this.testErrorHandling = function () {
                var promises = [
                    _this._host.executeProviderOperation("Testing.Errors.ChildProc.throwPrimitive"),
                    _this._host.executeProviderOperation("Testing.Errors.ChildProc.throwString"),
                    _this._host.executeProviderOperation("Testing.Errors.ChildProc.throwObject"),
                    _this._host.executeProviderOperation("Testing.Errors.ChildProc.throwError"),
                    _this._host.executeProviderOperation("Testing.Errors.ChildProc.throwSystemError"),
                    _this._host.executeProviderOperation("Testing.Errors.InProc.throwPrimitive"),
                    _this._host.executeProviderOperation("Testing.Errors.InProc.throwString"),
                    _this._host.executeProviderOperation("Testing.Errors.InProc.throwObject"),
                    _this._host.executeProviderOperation("Testing.Errors.InProc.throwError"),
                    _this._host.executeProviderOperation("Testing.Errors.InProc.throwSystemError"),
                    _this._host.executeProviderOperation("Fake.Operation")
                ]
                    .map(function (promise) {
                    return promise.then(function () {
                        throw new Error("An exception from the operation was expected, but no exception was thrown");
                    }, function (error) {
                        return error;
                    });
                });
                es6_promise_1.Promise.all(promises).then(function (results) {
                    var message = "\n";
                    results.forEach(function (result) {
                        message += "\n" + result.toString() + "\n";
                    });
                    _this._host.executeOperation("Environment.showMessageBox", [
                        "Microsoft Azure Storage Explorer",
                        "Received the following operation errors:" + message,
                        "info"
                    ]);
                }, function (error) {
                    _this._host.executeOperation("Environment.showMessageBox", [
                        "Microsoft Azure Storage Explorer",
                        "Test failed: " + error,
                        "error"
                    ]);
                });
            };
            _this._activityLogManager = blobExplorerContext.activityLogManager;
            _this._containerReference = blobExplorerContext.containerReference;
            _this._blobActions = blobExplorerContext.blobActions;
            return _this;
        }
        /**
         * Determines if a command should be disabled based on the current selection
         */
        BlobCommands.prototype.isEnabledCore = function (commandName, info, selected) {
            switch (commandName) {
                case BlobCommands.openCommand:
                    return info.singleItemOrFolder;
                case BlobCommands.deleteCommand:
                    return info.atLeastOneItemOrFolder;
                case BlobCommands.generateSharedAccessSignatureCommand:
                    // We need account name and key to support this command.
                    return info.singleItemAndNoFolders && info.connectionContainsAccountNameKey && !info.atleastOneSnapshot;
                case BlobCommands.showBlobPropertiesCommand:
                    return info.singleItemAndNoFolders;
                case BlobCommands.acquireLeaseCommand:
                    return info.noFolders && !info.atleastOneSnapshot &&
                        _.any(selected, function (item) { return item.Blob.LeaseStatus === AzureConstants.leaseStatuses.unlocked; });
                case BlobCommands.breakLeaseCommand:
                    return info.noFolders && !info.atleastOneSnapshot &&
                        _.any(selected, function (item) { return item.Blob.LeaseStatus === AzureConstants.leaseStatuses.locked; });
                case BlobCommands.makeSnapshotCommand:
                    return info.singleItemAndNoFolders && !info.atleastOneSnapshot;
                case BlobCommands.manageSnapshotCommand:
                    return info.singleItemAndNoFolders && !info.atleastOneSnapshot;
                case BlobCommands.promoteSnapshotCommand:
                    return info.singleItemAndNoFolders && info.atleastOneSnapshot;
                case BlobCommands.renameCommand:
                    if (info.atleastOneSnapshot) {
                        return false;
                    }
                    break;
                case BlobCommands.openVmInPortalCommand:
                    return info.hasVmMetadata;
                default:
                    break;
            }
            return null;
        };
        /**
         * Copy the url of selected blobs to clipboard
         */
        BlobCommands.prototype.copyUrl = function (selectedBlobs, blobListViewModel) {
            var uris = selectedBlobs.map(function (blob) { return blob.Uri; });
            var result = uris.join(Utilities.getEnvironmentNewLine());
            return this._host.executeOperation("Environment.clipboardSetData", ["text", result]);
        };
        /**
         * Copy blobs
         */
        BlobCommands.prototype.copyBlobsToClipboard = function (items, currentFolder) {
            // Note: We don't want to put the storage account key on the clipboard, so we put the SAS token on it
            // instead (less risky).
            // We don't do enumeration of blobs when we copy them to the clipboard (we want that to be instantaneous), so that
            // means we have to do it when we're pasting, using the SAS/ host combination from the clipboard.  (We could keep
            // private info around about it, but that would rule out being able to copy/paste between instances of the
            // storage explorer).
            var _this = this;
            // Get paths relative to current folder
            var rootFolder = Utilities.appendSlash(currentFolder);
            var clipBoardItems = items.map(function (item) {
                var fullPath;
                if (item.ContentType === StorageExplorerConstants.ContentTypes.Folder) {
                    fullPath = Utilities.appendSlash(item.FullName);
                }
                else {
                    fullPath = item.FullName;
                }
                var snapshot = "";
                if (item.Blob && item.Blob.Snapshot) {
                    snapshot = item.Blob.Snapshot;
                }
                return {
                    relativePath: fullPath.substr(rootFolder.length),
                    snapshot: snapshot
                };
            });
            return this._container.copyItemsToClipboard(currentFolder, clipBoardItems).catch(function (error) {
                _this._showError(error, "StorageExplorer.copyBlobsToClipboard");
            });
        };
        /**
         * Get blob statistics
         */
        BlobCommands.prototype.getBlobStats = function (items, currentFolder) {
            try {
                var activity = new BlobStatsActivity_1.default(this._host, this._activityLogManager, this._container, items, currentFolder, this._telemetry);
                activity.initialize();
                activity.addToActivityLog(this._activityLogManager);
                activity.start();
                return es6_promise_1.Promise.resolve(null);
            }
            catch (error) {
                this._showError(error, "StorageExplorer.Blobs.getBlobStats");
            }
        };
        BlobCommands.prototype.manageSnapshots = function (blobListViewModel) {
            var handled = false;
            var selectedItems = blobListViewModel.selected();
            if (selectedItems && selectedItems.length) {
                var itemToOpen = selectedItems[0];
                var destBlobFolder = itemToOpen.FullName;
                var folder = Utilities.getDirectoryFromPath(destBlobFolder);
                var file = itemToOpen.FileName;
                blobListViewModel.navigateToSnapshots(folder, file);
                handled = true;
            }
            return handled;
        };
        BlobCommands.prototype.startDeleteBlobsTask = function (blobListViewModel) {
            var _this = this;
            return this._promptDelete()
                .then(function (deleteConfirmed) {
                if (!deleteConfirmed) {
                    return;
                }
                var groupActivity = new BlobDeleteGroupActivity(_this._host, _this._activityLogManager, blobListViewModel, _this._containerReference, _this._telemetry);
                groupActivity.initialize();
                groupActivity.addToActivityLog();
                groupActivity.start();
            })
                .catch(function (error) {
                _this._showError(error, "StorageExplorer.startDeleteBlobsTask");
            });
        };
        BlobCommands.prototype._getBlobsClipboardData = function () {
            return this._host.executeOperation("Environment.clipboardGetData", [AzureStorageConstants.BlobsClipboardFormat]);
        };
        BlobCommands.prototype._createCopyGroupActivity = function (copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, mungeDestinationName, blobListViewModel, overwriteIfExists, telemetryCategory) {
            return new BlobCopyGroupActivity_1.default(copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, this._host, this._activityLogManager, this._telemetry, mungeDestinationName, blobListViewModel, undefined, undefined, undefined, overwriteIfExists);
        };
        /**
         * Pastes blobs from the clipboard into a blob container
         */
        BlobCommands.prototype.startBlobPasteTask = function (destBlobFolder, blobListViewModel) {
            var _this = this;
            return this._getBlobsClipboardData()
                .then(function (clipboardData) {
                if (!clipboardData) {
                    return;
                }
                var sourceContainerReference = {
                    connectionString: clipboardData.connectionString,
                    containerName: clipboardData.containerName
                };
                // Create an activity to do the group copy
                return _this._startPasteItemsTaskCore(CopyType_1.default.Copy, new BlobFlobContainer_1.default(_this._host, sourceContainerReference), 
                // source info
                clipboardData.accountUri, clipboardData.sasToken, clipboardData.sourceFolder, 
                // dest info
                _this._container, destBlobFolder, clipboardData.items, null, // mungeDestinationName
                blobListViewModel, false /* overwrite */, "StorageExplorer.startBlobPasteTask");
            });
        };
        BlobCommands.prototype.startRenameTask = function (blobListViewModel) {
            return this._startRenameTaskCore(blobListViewModel, "StorageExplorer.startRenameBlobsTask");
        };
        BlobCommands.prototype._doesNewNameExist = function (connectionString, containerName, path, isFolder) {
            // For blobs, you can have a folder and a blob with the same name without any problems,
            // so we only need to match blobs against blobs and folders against folders
            var blowPW = new BlobPW_1.default(this._host);
            if (isFolder) {
                return blowPW.doesBlobFolderExist(connectionString, containerName, path);
            }
            else {
                return blowPW.doesBlobExist(connectionString, containerName, path);
            }
        };
        BlobCommands.prototype._doesNewFolderNameExist = function (connectionString, containerName, folderPath) {
            // For blobs, you can have a folder and a blob with the same name without any problems,
            // so we only need to match against blob folders
            return new BlobPW_1.default(this._host)
                .doesBlobFolderExist(connectionString, containerName, folderPath);
        };
        /**
         * Generate blob Shared Access Signature
         */
        BlobCommands.prototype.generateSharedAccessSignature = function (selectedBlobs, blobListViewModel) {
            var promise = es6_promise_1.Promise.reject(new Error("Could not show 'Shared Access Signature' dialog.")); // Should not happen.
            if ($.isArray(selectedBlobs) && selectedBlobs.length === 1) {
                var connectionString = this._containerReference.connectionString, containerName = this._containerReference.containerName, blobName = selectedBlobs[0].FullName;
                promise = BlobActions.openGenerateSharedAccessSignature(this._host, connectionString, containerName, blobName);
            }
            return promise;
        };
        /**
         * Show blob properties.
         */
        BlobCommands.prototype.showBlobProperties = function (selectedBlobs, blobListViewModel) {
            var promise = es6_promise_1.Promise.reject(new Error("Could not show 'Blob Properties' dialog.")); // Should not happen.
            if ($.isArray(selectedBlobs) && selectedBlobs.length === 1) {
                var connectionString = this._containerReference.connectionString, containerName = this._containerReference.containerName, blobName = selectedBlobs[0].FullName;
                promise = BlobActions.showBlobProperties(this._host, connectionString, containerName, blobName, selectedBlobs[0].Blob.Snapshot);
            }
            return promise;
        };
        BlobCommands.prototype.acquireLease = function (selectedItems, blobListViewModel) {
            var _this = this;
            var promises = [];
            selectedItems.forEach(function (blob) {
                var promise = _this._host.executeOperation("AzureBlobs.acquireLease", [_this._containerReference.connectionString, _this._containerReference.containerName, blob.FullName]);
                promises.push(promise);
                promise.then(function () {
                    _this.addOrUpdateFlobFromAzureAndRedrawThrottled(blob, blobListViewModel);
                });
            });
            return es6_promise_1.Promise.all(promises)
                .catch(function (error) {
                _this._showError(error, "StorageExplorer.Blobs.acquireLease");
            });
        };
        BlobCommands.prototype.makeSnapshot = function (selectedItems, blobListViewModel) {
            var _this = this;
            var promises = [];
            selectedItems.forEach(function (blob) {
                var promise = _this._host.executeOperation("AzureBlobs.makeSnapshot", [_this._containerReference.connectionString, _this._containerReference.containerName, blob.FullName]);
                promises.push(promise);
                promise.then(function (snapshot) {
                    var newBlob = JSON.parse(JSON.stringify(blob));
                    newBlob.Blob.Snapshot = snapshot;
                    _this.addOrUpdateFlobFromAzureAndRedrawThrottled(newBlob, blobListViewModel);
                });
            });
            return es6_promise_1.Promise.all(promises)
                .catch(function (error) {
                _this._showError(error, "StorageExplorer.Blobs.makeSnapshot");
            });
        };
        BlobCommands.prototype.promoteSnapshot = function (selectedItems, blobListViewModel) {
            var _this = this;
            var prompt = "Promoting a snapshot will overwrite the contents of the base blob with the contents of the snapshot.\r\n\r\n"
                + "Are you sure you want to continue?"; // localize
            return this._promptYesNo(prompt).then(function (response) {
                if (response) {
                    var selectedItems = blobListViewModel.selected();
                    if (selectedItems && selectedItems.length === 1) {
                        var itemToPromote = selectedItems[0];
                        return _this._startCopyTaskCoreNoPrompt(CopyType_1.default.Promote, itemToPromote.FullName, blobListViewModel, "AzureBlobs.promoteSnapshot", true);
                    }
                }
            });
        };
        BlobCommands.prototype.openVmInPortal = function (selectedItems, blobListViewModel) {
            return es6_promise_1.Promise.resolve();
            // return this._host.executeProviderOperation("Environment.Browser.openUrl", { url: "https://portal.azure.com" });
        };
        BlobCommands.prototype.breakLease = function (selectedItems, blobListViewModel) {
            var _this = this;
            var promises = [];
            var prompt = "Breaking the lease on the selected blobs will allow them to be deleted or modified.\r\n\r\n"
                + "Are you sure you want to continue?"; // localize
            return this._promptYesNo(prompt).then(function (response) {
                if (response) {
                    selectedItems.forEach(function (blob) {
                        var promise = _this._host.executeOperation("AzureBlobs.breakLease", [_this._containerReference.connectionString, _this._containerReference.containerName, blob.FullName]);
                        promises.push(promise);
                        promise.then(function () {
                            _this.addOrUpdateFlobFromAzureAndRedrawThrottled(blob, blobListViewModel);
                        });
                    });
                    return es6_promise_1.Promise.all(promises)
                        .catch(function (error) {
                        _this._showError(error, "StorageExplorer.Blobs.breakLease");
                    });
                }
            });
        };
        BlobCommands.prototype.newFolder = function (currentFolderPath, blobListViewModel) {
            var _this = this;
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.addDirectory,
                parameters: {
                    isVirtual: true
                }
            }).then(function (directoryName) {
                if (directoryName) {
                    blobListViewModel.navigateToFolder(Utilities.JoinAzurePaths(currentFolderPath, directoryName));
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Blobs.addFolderCancelled");
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Blobs.addFolder");
            });
        };
        return BlobCommands;
    }(FlobCommands_1.FlobCommands));
    /* Command Ids */
    BlobCommands.openCommand = "open";
    BlobCommands.downloadCommand = "download";
    BlobCommands.copyUrlCommand = "copyUrl";
    BlobCommands.makeSnapshotCommand = "makeSnapshot";
    BlobCommands.manageSnapshotCommand = "manageSnapshot";
    BlobCommands.promoteSnapshotCommand = "promoteSnapshot";
    BlobCommands.pasteCommand = "paste";
    BlobCommands.deleteCommand = "delete";
    BlobCommands.generateSharedAccessSignatureCommand = "generateSharedAccessSignature";
    BlobCommands.showBlobPropertiesCommand = "showBlobProperties";
    BlobCommands.acquireLeaseCommand = "acquireLease";
    BlobCommands.breakLeaseCommand = "breakLease";
    BlobCommands.openVmInPortalCommand = "openVmInPortal";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobCommands;
});

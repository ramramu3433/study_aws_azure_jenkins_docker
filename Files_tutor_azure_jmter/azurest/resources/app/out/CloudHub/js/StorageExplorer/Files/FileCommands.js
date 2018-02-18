/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "es6-promise", "Providers/Common/AzureStorageConstants", "Common/AzureStorageUtilities", "Providers/Common/AzureConstants", "ActivityLog/StorageExplorer/CopyType", "Common/Utilities", "Providers/StorageExplorer/Actions/FileActions", "ActivityLog/StorageExplorer/FileCopyGroupActivity", "StorageExplorer/ActivityLogModels/FileDownloadGroupActivity", "StorageExplorer/ActivityLogModels/FileDeleteGroupActivity", "ActivityLog/StorageExplorer/FileFlobContainer", "StorageExplorer/ActivityLogModels/FileOpenGroupActivity", "Providers/StorageExplorer/ProviderWrappers/FilePW", "ActivityLog/StorageExplorer/FileStatsActivity", "StorageExplorer/ActivityLogModels/FileUploadGroupActivity", "StorageExplorer/Common/FlobCommands", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, ko, es6_promise_1, AzureStorageConstants, AzureStorageUtilities, AzureConstants, CopyType_1, Utilities, FileActions, FileCopyGroupActivity_1, FileDownloadGroupActivity_1, FileDeleteGroupActivity, FileFlobContainer_1, FileOpenGroupActivity_1, FilePW_1, FileStatsActivity_1, FileUploadGroupActivity_1, FlobCommands_1, StorageExplorerConstants, StorageExplorerUtilities) {
    "use strict";
    /*
     * Commands that can be performed in the file explorer.
     */
    var FileCommands = (function (_super) {
        __extends(FileCommands, _super);
        function FileCommands(fileExplorerContext) {
            var _this = _super.call(this, fileExplorerContext.hostProxy, fileExplorerContext.telemetry, new FileFlobContainer_1.default(fileExplorerContext.hostProxy, fileExplorerContext.shareReference), false /*isBlobs*/) || this;
            /* Observables */
            _this._areFilesOnClipboard = ko.observable(false);
            _this.canCopy = function (selectedItems) {
                return _this.isEnabled(FileCommands.copyCommand, selectedItems);
            };
            _this.canPaste = ko.pureComputed(function () { return _this._areFilesOnClipboard(); });
            _this.canRename = function (selectedBlobs) {
                return _this.isEnabled(FileCommands.renameCommand, selectedBlobs);
            };
            /**
             * Since the call to clipboardContainsData is asynchronous, and also since we don't get clipboard
             * change events, someone needs to call this method periodically so the canPaste observable can be
             * recalculated.
             */
            _this.checkClipboard = function (selected) {
                // TODO Files [Copy] - We may want to check for the blobs as well, to enable blob to file copy.
                // TODO Blobs [Copy] - Viceversa, in BlobCommands we should check for files as well.
                _this._host.executeOperation("Environment.clipboardContainsData", [AzureStorageConstants.FilesClipboardFormat])
                    .then(function (clipboardHasFiles) {
                    _this._areFilesOnClipboard(clipboardHasFiles);
                });
            };
            _this.startDeleteItemsTask = function (fileListViewModel) {
                return _this._promptDelete()
                    .then(function (deleteConfirmed) {
                    if (!deleteConfirmed) {
                        return;
                    }
                    var groupActivity = new FileDeleteGroupActivity(_this._host, _this._activityLogManager, fileListViewModel, _this._shareReference, _this._telemetry);
                    groupActivity.initialize();
                    groupActivity.addToActivityLog();
                    groupActivity.start();
                })
                    .catch(function (error) {
                    _this._showError(error, "StorageExplorer.startDeleteFilesTask");
                });
            };
            _this.openSelected = function (viewModel) {
                var handled = false;
                var selectedItems = viewModel.selected();
                if (selectedItems && selectedItems.length) {
                    var itemToOpen = selectedItems[0];
                    if (itemToOpen.ContentType === StorageExplorerConstants.ContentTypes.Folder) {
                        var targetFolder = itemToOpen.FullName;
                        viewModel.navigateToFolder(targetFolder);
                    }
                    else {
                        _this.openSingleFile(itemToOpen).then(function () {
                            viewModel.focusDataTable();
                        });
                    }
                    handled = true;
                }
                return handled;
            };
            /**
             * Copy the urls of selected items to clipboard
             */
            _this.copyUrl = function (selectedItems, viewModel) {
                var uris = selectedItems.map(function (item) { return item.Uri; });
                var result = uris.join(Utilities.getEnvironmentNewLine());
                return _this._host.executeOperation("Environment.clipboardSetData", ["text", result]);
            };
            _this.generateSharedAccessSignature = function (items, viewModel) {
                var promise = es6_promise_1.Promise.reject(new Error("Could not show 'Shared Access Signature' dialog.")); // Should not happen.
                if ($.isArray(items) && items.length === 1) {
                    var connectionString = _this._shareReference.connectionString, shareName = _this._shareReference.shareName, fileName = items[0].FullName;
                    promise = FileActions.openGenerateSharedAccessSignatureDialog(_this._host, connectionString, shareName, fileName);
                }
                return promise;
            };
            _this.showItemProperties = function (selectedItems, directory, viewModel) {
                var promise = es6_promise_1.Promise.reject(new Error("Could not show 'File Properties' dialog.")); // Should not happen.
                if ($.isArray(selectedItems) && selectedItems.length === 1) {
                    var connectionString = _this._shareReference.connectionString, contentType = selectedItems[0].ContentType, shareName = _this._shareReference.shareName, directory = directory, fileName = selectedItems[0].FileName;
                    promise = FileActions.showItemProperties(_this._host, connectionString, contentType, shareName, directory, fileName);
                }
                return es6_promise_1.Promise.resolve();
            };
            _this._activityLogManager = fileExplorerContext.activityLogManager;
            _this._shareReference = fileExplorerContext.shareReference;
            _this._fileActions = fileExplorerContext.fileActions;
            return _this;
        }
        FileCommands.isFolderItem = function (item) {
            return item && (item.ContentType === StorageExplorerConstants.ContentTypes.Folder);
        };
        FileCommands.containsFolderItem = function (items) {
            return items && items.some(function (b) {
                return FileCommands.isFolderItem(b);
            });
        };
        /**
         * Determines if a command should be disabled based on the current selection
         */
        FileCommands.prototype.isEnabledCore = function (commandName, info, selected) {
            switch (commandName) {
                case FileCommands.openCommand:
                    return info.singleItemOrFolder;
                case FileCommands.deleteCommand:
                case FileCommands.copyUrlCommand:
                case FileCommands.downloadCommand:
                    return info.atLeastOneItemOrFolder;
                case FileCommands.generateSharedAccessSignatureCommand:
                    // We need account name and key to support this command.
                    return info.singleItemOrFolder && info.connectionContainsAccountNameKey;
                case FileCommands.showPropertiesCommand:
                    return info.singleItemOrFolder;
                default:
                    break;
            }
            return null;
        };
        /**
         * Connect to a file share
         */
        FileCommands.prototype.connect = function () {
            var _this = this;
            var accountName = AzureStorageUtilities.getAccountNameFromConnectionString(this._shareReference.connectionString);
            var accountKey = AzureStorageUtilities.getAccountKeyFromConnectionString(this._shareReference.connectionString);
            return this._host.executeOperation("AzureFiles.getFileShare", [this._shareReference.connectionString, this._shareReference.shareName]).then(function (result) {
                var shareUNC = _this.createUncFromUrl(result.attributes[0].value);
                if (!accountKey || accountKey === undefined) {
                    var command = "net use [drive letter] \\\\" + shareUNC + " /u:[account name] [storage account access key]";
                }
                else {
                    var command = "net use [drive letter] \\\\" + shareUNC + " /u:" + accountName + " " + accountKey;
                }
                return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                    id: AzureConstants.registeredDialogs.connectFileShare,
                    parameters: { commandToConnect: command }
                });
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.FileShare.connectFileShareCommand");
            });
        };
        /**
         * Extract the protocol prefix(https) from an URI
         */
        FileCommands.prototype.createUncFromUrl = function (url) {
            var separator = url.split("://");
            return separator[1].replace(/[/]/g, "\\");
        };
        // Do not call this method from the UI, instead call FileListViewModel openFile,
        // which will call openSingleFile.
        FileCommands.prototype.openSingleFile = function (file) {
            var _this = this;
            var sourceFolder = StorageExplorerUtilities.getFolderFromFilePath(file.FullName);
            return this._host.executeOperation("Environment.getTempDirectory", []).then(function (destinationFileFolder) {
                var groupActivity = new FileOpenGroupActivity_1.default(_this._shareReference, sourceFolder, destinationFileFolder, _this._activityLogManager, _this._host, _this._telemetry);
                groupActivity.initialize();
                groupActivity.addToActivityLog();
                groupActivity.start([file]);
            });
        };
        FileCommands.prototype.newDirectory = function (viewModel) {
            var _this = this;
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.addDirectory,
                parameters: {
                    isVirtual: false
                }
            }).then(function (directory) {
                if (directory) {
                    var newDirectoryPath = Utilities.JoinAzurePaths(viewModel.currentFolderPath(), Utilities.replaceBackslashWithSlash(directory));
                    return _this._host.executeOperation("AzureFiles.createDirectory", [
                        _this._shareReference,
                        newDirectoryPath,
                        true /*createParentDirectories*/
                    ]).then(function (result) {
                        if (result) {
                            _this._host.executeOperation("AzureFiles.getUrl", [
                                _this._shareReference.connectionString,
                                _this._shareReference.shareName,
                                newDirectoryPath
                            ]).then(function (url) {
                                viewModel.addFlobToCurrentFolder({
                                    FullName: newDirectoryPath,
                                    FileName: Utilities.getFileNameFromPath(newDirectoryPath),
                                    Uri: url,
                                    ContentType: StorageExplorerConstants.ContentTypes.Folder,
                                    Size: undefined,
                                    LastModified: undefined,
                                    Blob: {
                                        Snapshot: "",
                                        BlobType: "",
                                        LeaseDuration: "",
                                        LeaseState: "",
                                        LeaseStatus: "",
                                        metadata: {
                                            microsoftazurecompute_diskname: null,
                                            microsoftazurecompute_disktype: null,
                                            microsoftazurecompute_resourcegroupname: null,
                                            microsoftazurecompute_vmname: null
                                        }
                                    }
                                }).then(function () {
                                    viewModel.redrawTableThrottled();
                                });
                                _this._telemetry.sendEvent("StorageExplorer.Files.addDirectory");
                            });
                        }
                        else {
                            _this._telemetry.sendEvent("StorageExplorer.Files.addDirectoryAlreadyExists");
                        }
                    });
                }
                else {
                    _this._telemetry.sendEvent("StorageExplorer.Files.addDirectoryCancelled");
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Files.addDirectory");
            });
        };
        /**
         * Get file statistics
         */
        FileCommands.prototype.getFileStats = function (items, currentFolder) {
            try {
                var activity = new FileStatsActivity_1.default(this._host, this._activityLogManager, this._container, items, currentFolder, this._telemetry);
                activity.initialize();
                activity.addToActivityLog(this._activityLogManager);
                activity.start();
                return es6_promise_1.Promise.resolve(null);
            }
            catch (error) {
                this._showError(error, "StorageExplorer.Blobs.getFileStats");
            }
        };
        // CONSIDER: share this code with blobs
        /**
         * Displays a dialog to allow users to upload files to an Azure directory
         */
        FileCommands.prototype.showUploadFilesDialog = function (defaultDestinationDirectory, fileListViewModel) {
            var _this = this;
            defaultDestinationDirectory = Utilities.removeTrailingSlash(defaultDestinationDirectory);
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.uploadFiles,
                parameters: {
                    uploadFolder: false,
                    defaultDestinationDirectory: defaultDestinationDirectory
                }
            }).then(function (parameters) {
                if (parameters) {
                    var absoluteFilePaths = parameters.filePaths;
                    var relative = StorageExplorerUtilities.convertToRelativeFilePaths(absoluteFilePaths);
                    var rootSourceFolder = relative.commonFileFolder;
                    var relativeFilePaths = relative.relativeFilePaths;
                    var destinationDirectory = _this._sanitizeAzureFolder(parameters.destinationDirectory);
                    return _this.startUploadFilesTask(rootSourceFolder, destinationDirectory, fileListViewModel, relativeFilePaths);
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Files.showUploadFilesDialog");
            });
        };
        FileCommands.prototype.showUploadFolderDialog = function (defaultDestinationDirectory, fileListViewModel) {
            var _this = this;
            defaultDestinationDirectory = Utilities.removeTrailingSlash(defaultDestinationDirectory);
            return this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                id: AzureConstants.registeredDialogs.uploadFiles,
                parameters: {
                    uploadFolder: true,
                    defaultDestinationDirectory: defaultDestinationDirectory
                }
            }).then(function (parameters) {
                if (parameters) {
                    var sourceFileFolder = parameters.filePaths[0];
                    var destinationDirectory = _this._sanitizeAzureFolder(parameters.destinationDirectory);
                    return _this.startUploadFolderTask(sourceFileFolder, destinationDirectory, fileListViewModel);
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer.Files.showUploadFolderDialog");
            });
        };
        /**
         * Uploads files without displaying a dialog
         */
        FileCommands.prototype.startUploadFilesTask = function (sourceFileFolder, destFolder, fileListViewModel, relativeFilePaths) {
            try {
                var groupActivity = new FileUploadGroupActivity_1.default(sourceFileFolder, this._shareReference, destFolder, this._activityLogManager, this._host, this._telemetry, fileListViewModel);
                groupActivity.initialize();
                groupActivity.addToActivityLog();
                groupActivity.startUploadingFiles(relativeFilePaths);
                return es6_promise_1.Promise.resolve(null);
            }
            catch (error) {
                this._showError(error, "StorageExplorer.Files.startUploadFilesTask");
            }
        };
        /**
         * Uploads files without displaying a dialog
         */
        FileCommands.prototype.startUploadFolderTask = function (sourceFileFolder, destFolder, fileListViewModel) {
            try {
                // Create group activity to upload the folder
                var groupActivity = new FileUploadGroupActivity_1.default(sourceFileFolder, this._shareReference, destFolder, this._activityLogManager, this._host, this._telemetry, fileListViewModel);
                groupActivity.initialize();
                groupActivity.addToActivityLog();
                groupActivity.startUploadingFolder();
                return es6_promise_1.Promise.resolve(null);
            }
            catch (error) {
                this._showError(error, "StorageExplorer.Files.startUploadFolderTask");
            }
        };
        FileCommands.prototype._sanitizeAzureFolder = function (folder) {
            return folder
                .trim()
                .replace(/\\/g, "/")
                .replace(/^\/+/g, "")
                .replace(/\/+$/g, "");
        };
        /**
         * Copy files
         */
        FileCommands.prototype.copyItemsToClipboard = function (items, currentFolder) {
            // Note: We don't want to put the storage account key on the clipboard, so we put the SAS token on it
            // instead (less risky).
            // We don't do enumeration of files when we copy them to the clipboard (we want that to be instantaneous), so that
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
                _this._showError(error, "StorageExplorer.copyFilesToClipboard");
            });
        };
        FileCommands.prototype._getFilesClipboardData = function () {
            return this._host.executeOperation("Environment.clipboardGetData", [AzureStorageConstants.FilesClipboardFormat]);
        };
        /**
         * Pastes files from the clipboard into a folder
         */
        FileCommands.prototype.startFilePasteTask = function (destFolder, fileListViewModel) {
            var _this = this;
            return this._getFilesClipboardData()
                .then(function (clipboardData) {
                if (!clipboardData) {
                    return;
                }
                var sourceShareReference = {
                    connectionString: clipboardData.connectionString,
                    shareName: clipboardData.shareName
                };
                var sourceFolder = clipboardData.sourceFolder;
                // Create an activity to do the group copy
                return _this._startPasteItemsTaskCore(CopyType_1.default.Copy, new FileFlobContainer_1.default(_this._host, sourceShareReference), 
                // source info
                clipboardData.accountUri, clipboardData.sasToken, sourceFolder, 
                // dest info
                _this._container, destFolder, clipboardData.items, null, // mungeDestinationName
                fileListViewModel, false, /* overwriteIfExists */ "StorageExplorer.startFilePasteTask");
            });
        };
        FileCommands.prototype._doesNewNameExist = function (connectionString, containerName, path, isFolder) {
            return new FilePW_1.default(this._host)
                .doesFileOrDirectoryExist(connectionString, containerName, path);
        };
        FileCommands.prototype.startRenameTask = function (fileListViewModel) {
            return this._startRenameTaskCore(fileListViewModel, "StorageExplorer.startRenameFilesTask");
        };
        /**
         * Downloads files to the local file system
         */
        FileCommands.prototype.showDownloadDialog = function (items, currentFolder) {
            var topLevelFiles = items.filter(function (item) { return item.ContentType !== StorageExplorerConstants.ContentTypes.Folder; });
            var topLevelFolders = items.filter(function (item) { return item.ContentType === StorageExplorerConstants.ContentTypes.Folder; });
            if (topLevelFiles.length === 1 && topLevelFolders.length === 0) {
                // Download a single file only, with no folders
                var file = topLevelFiles[0];
                return this._showDownloadSingleFileDialog(file, currentFolder);
            }
            else if (topLevelFolders.length + topLevelFiles.length > 0) {
                return this._showDownloadMultipleShareItemsDialog(items, currentFolder);
            }
        };
        FileCommands.prototype._showDownloadSingleFileDialog = function (file, currentFolder) {
            var _this = this;
            var operationArgs = {
                message: "Specify where to save the downloaded file",
                defaultName: file.FileName
            };
            return this._host.executeProviderOperation("Environment.Dialogs.getSaveFileDialogResult", operationArgs)
                .then(function (diskPath) {
                if (!!diskPath) {
                    // If we made it this far, we know the user wants to overwrite because
                    // the dialog will have asked.
                    var overwriteIfExists = true;
                    return _this._startDownloadShareItemsTask(currentFolder, StorageExplorerUtilities.getFolderFromFilePath(diskPath), overwriteIfExists, [file], function (relativeSourcePath) {
                        // We showed a save file dialog, and the user selected a filename to save
                        // to, so we need to use that filename instead of the file's name.
                        // There's only a single file, so the download file name is
                        // simply diskPath's filename, no matter the input.
                        return Utilities.getFileNameFromPath(diskPath);
                    });
                }
            })
                .catch(function (error) {
                _this._showError(error, "StorageExplorer._showDownloadSingleFileDialog");
            });
        };
        FileCommands.prototype._showDownloadMultipleShareItemsDialog = function (items, currentFolder) {
            var _this = this;
            // Download multiple files and/or one or more folders
            var operationArgs = {
                message: "Select a folder to save the downloaded files into",
                browseForFolder: true,
                allowMultiSelect: false
            };
            return this._host.executeProviderOperation("Environment.Dialogs.getOpenFileDialogResult", operationArgs)
                .then(function (diskFolderPath) {
                if (diskFolderPath && diskFolderPath.length) {
                    var rootDownloadFolder = Utilities.appendPathSeparator(diskFolderPath[0]);
                    return _this._startDownloadShareItemsTask(currentFolder, rootDownloadFolder, false /*defaultOverwriteIfExists*/, items);
                }
            }).catch(function (error) {
                _this._showError(error, "StorageExplorer._showDownloadMultipleShareItemsDialog");
            });
        };
        FileCommands.prototype._startDownloadShareItemsTask = function (sourceFileFolder, destDiskFolder, defaultOverwriteIfExists, items, transformDownloadFileNameAndPath) {
            var groupActivity = new FileDownloadGroupActivity_1.default(this._shareReference, sourceFileFolder, destDiskFolder, defaultOverwriteIfExists, transformDownloadFileNameAndPath, this._activityLogManager, this._host, this._telemetry);
            groupActivity.initialize();
            groupActivity.addToActivityLog();
            groupActivity.start(items);
        };
        FileCommands.prototype._createCopyGroupActivity = function (copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, mungeDestinationName, listViewModel, overwriteIfExists, telemetryCategory) {
            return new FileCopyGroupActivity_1.default(copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, this._host, this._activityLogManager, this._telemetry, mungeDestinationName, listViewModel, undefined, undefined, overwriteIfExists);
        };
        return FileCommands;
    }(FlobCommands_1.FlobCommands));
    /* Command Ids */
    FileCommands.openCommand = "open";
    FileCommands.downloadCommand = "download";
    FileCommands.copyUrlCommand = "copyUrl";
    FileCommands.pasteCommand = "paste";
    FileCommands.deleteCommand = "delete";
    FileCommands.generateSharedAccessSignatureCommand = "generateSharedAccessSignature";
    FileCommands.showPropertiesCommand = "showProperties";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileCommands;
});

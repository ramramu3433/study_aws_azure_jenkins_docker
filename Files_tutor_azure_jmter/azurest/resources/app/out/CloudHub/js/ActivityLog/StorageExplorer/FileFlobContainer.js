/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureStorageConstants", "ActivityLog/StorageExplorer/BaseFlobContainer", "Common/Errors", "ActivityLog/StorageExplorer/FileFlobTree", "Providers/StorageExplorer/ProviderWrappers/FilePW", "Common/SASResourceType", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Common/ConnectionString", "StorageExplorer/Common/StorageExplorerUtilities", "Common/Utilities"], function (require, exports, AzureStorageConstants, BaseFlobContainer_1, Errors, FileFlobTree_1, FilePW_1, SASResourceType_1, StorageActionsHelper, ConnectionString_1, StorageExplorerUtilities, Utilities) {
    "use strict";
    /*
     * File share implementation of IFlobContainer
     */
    var FileFlobContainer = (function (_super) {
        __extends(FileFlobContainer, _super);
        function FileFlobContainer(host, shareReference) {
            var _this = _super.call(this, host, shareReference.shareName, new FileFlobTree_1.default(host, shareReference)) || this;
            _this._shareReference = shareReference;
            _this._filePW = new FilePW_1.default(host);
            return _this;
        }
        FileFlobContainer.prototype.isBlobContainer = function () { return false; };
        FileFlobContainer.prototype.isFileShare = function () { return true; };
        FileFlobContainer.prototype.exists = function () {
            return this._filePW.doesFileShareExist(this.getConnectionString(), this.getName());
        };
        FileFlobContainer.prototype.safeCreate = function (id, nodeType, doNotOpenInEditor) {
            var args = {
                connectionString: this.getConnectionString(),
                newChildName: this.getName(),
                quota: this._getQuota(),
                id: id,
                nodeType: nodeType,
                doNotOpenInEditor: doNotOpenInEditor
            };
            return this._host.executeOperation("Azure.Actions.Storage.safeCreateFileShare", [args]);
        };
        FileFlobContainer.prototype.copy = function (targetID, nodeType, target, doNotOpenInEditor) {
            var args = {
                sourceConnectionString: this.getConnectionString(),
                sourceShareName: this.getName(),
                targetConnectionString: target.getConnectionString(),
                targetShareName: target.getName(),
                targetID: targetID,
                targetNodeType: nodeType,
                doNotOpenInEditor: doNotOpenInEditor
            };
            return this._host.executeOperation("Azure.Actions.Storage.safeCreateFileShareFromExisting", [args]);
        };
        FileFlobContainer.prototype.safeDelete = function (nodeType, skipPrompt) {
            var args = {
                connectionString: this.getConnectionString(),
                name: this.getName(),
                nodeType: nodeType,
                skipPrompt: skipPrompt
            };
            return this._host.executeOperation("Azure.Actions.Storage.safeDeleteFileShare", [args]);
        };
        FileFlobContainer.prototype.getConnectionString = function () {
            return this._shareReference.connectionString;
        };
        FileFlobContainer.prototype._getQuota = function () {
            return this._shareReference.quota;
        };
        FileFlobContainer.prototype.deleteItem = function (itemPath) {
            return this._host.executeOperation("AzureFiles.deleteFile", [
                this._shareReference.connectionString,
                this._shareReference.shareName,
                StorageExplorerUtilities.getFolderFromFilePath(itemPath),
                StorageExplorerUtilities.getFileNameFromPath(itemPath)
            ]);
        };
        FileFlobContainer.prototype.getItem = function (itemPath) {
            return this._host.executeOperation("AzureFiles.getFile", [
                this._shareReference,
                StorageExplorerUtilities.getFolderFromFilePath(itemPath),
                StorageExplorerUtilities.getFileNameFromPath(itemPath)
            ]);
        };
        FileFlobContainer.prototype.itemExists = function (itemPath) {
            return this.getItem(itemPath)
                .then(function (response) {
                return Promise.resolve(true);
            }).catch(function (error) {
                // TODO(yantang): We need to support both C# and Node backend, checking on error message is not reliable. (This should be in backend.)
                if (error.message === "NotFound") {
                    return Promise.resolve(false);
                }
                return Promise.reject(error);
            });
        };
        FileFlobContainer.prototype.uploadFromLocalFile = function (sourceFilePath, size, destPath, blobType, // Ignored for files
            overwriteIfExists, progressId) {
            return this._uploadFromLocalFileHelper(sourceFilePath, size, destPath, blobType, overwriteIfExists, true /*createPath*/, progressId);
        };
        FileFlobContainer.prototype._uploadFromLocalFileHelper = function (sourceFilePath, size, destPath, blobType, // Ignored for files
            overwriteIfExists, createPath, progressId) {
            var _this = this;
            var args = {
                shareReference: this._shareReference,
                destDirectory: StorageExplorerUtilities.getFolderFromFilePath(destPath),
                destFileName: StorageExplorerUtilities.getFileNameFromPath(destPath),
                sourceFilePath: sourceFilePath,
                fileSize: size,
                overwriteIfExists: overwriteIfExists,
                progressId: progressId
            };
            return this._host.executeProviderOperation("Azure.Storage.Files.uploadFile", args)
                .catch(function (error) {
                if (error.name === Errors.errorNames.ParentNotFoundError) {
                    // Blobs automatically "create" their virtual parent folders when uploaded, so we need to do that
                    //   for files, too.
                    var directoryPath = Utilities.getDirectoryFromPath(destPath);
                    return _this._host.executeOperation("AzureFiles.createDirectory", [_this._shareReference, directoryPath, true /*createParentDirectories*/])
                        .then(function () {
                        // Before calling upload again, we need to release the progressId so we can re-use it
                        return _this.releaseUpload(progressId).then(function () {
                            return _this._uploadFromLocalFileHelper(sourceFilePath, size, destPath, blobType, overwriteIfExists, false /*createPath*/, progressId);
                        });
                    });
                }
                throw error;
            });
        };
        FileFlobContainer.prototype.abortUpload = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Files.abortFileUpload", { progressId: progressId });
        };
        FileFlobContainer.prototype.getUploadProgress = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Files.getFileUploadProgress", { progressId: progressId });
        };
        FileFlobContainer.prototype.getDownloadProgress = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Files.getFileDownloadProgress", { progressId: progressId });
        };
        FileFlobContainer.prototype.releaseUpload = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Files.releaseFileUpload", { progressId: progressId });
        };
        FileFlobContainer.prototype.releaseDownload = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Files.releaseFileDownload", { progressId: progressId });
        };
        FileFlobContainer.prototype.downloadToLocalFile = function (sourceFlobPath, destDiskPath, size, progressId, snapshot) {
            if (snapshot === void 0) { snapshot = ""; }
            var args = {
                shareReference: this._shareReference,
                sourceFlobPath: StorageExplorerUtilities.getFolderFromFilePath(sourceFlobPath),
                sourceFlobName: StorageExplorerUtilities.getFileNameFromPath(sourceFlobPath),
                destDeskPath: destDiskPath,
                progressId: progressId,
                size: size
            };
            return this._host.executeProviderOperation("Azure.Storage.Files.downloadFile", args);
        };
        FileFlobContainer.prototype.abortDownload = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Files.abortFileDownload", { progressId: progressId });
        };
        FileFlobContainer.prototype.startCopyIntoThisContainer = function (source, sourcePath, sourceSasUri, sourceSnapshot, targetPath, overwriteIfExists) {
            var _this = this;
            var sourceReference = {
                connectionString: source.getConnectionString(),
                shareName: source.getName(),
                filePath: sourcePath
            };
            var targetReference = this._getFileReference(targetPath);
            return this._filePW.startCopyStorageFile(sourceReference, sourceSasUri, targetReference, overwriteIfExists)
                .catch(function (error) {
                throw _this.processError(error);
            });
        };
        FileFlobContainer.prototype.abortCopy = function (destPath, copyId) {
            var _this = this;
            return this._host.executeOperation("AzureFiles.abortCopyStorageFile", [
                this._getFileReference(destPath),
                copyId
            ])
                .catch(function (error) {
                throw _this.processError(error);
            });
        };
        FileFlobContainer.prototype.getCopyProgress = function (destPath) {
            return this._host.executeOperation("AzureFiles.getCopyFileProgress", [
                this._getFileReference(destPath)
            ])
                .then(function (result) {
                // Decode the copy progress
                BaseFlobContainer_1.BaseFlobContainer._decodeCopyProgress(result);
                return result;
            });
        };
        FileFlobContainer.prototype.getPrimaryStorageUri = function (itemPath) {
            return this._host.executeOperation("AzureFiles.getPrimaryStorageUri", [this._getFileReference(itemPath)]);
        };
        FileFlobContainer.prototype._getFileReference = function (filePath) {
            return {
                connectionString: this.getConnectionString(),
                shareName: this.getName(),
                filePath: filePath
            };
        };
        FileFlobContainer.prototype.createSASConnectionString = function (resource) {
            return ConnectionString_1.default.createFromSAS(SASResourceType_1.default.file, resource);
        };
        FileFlobContainer.prototype._generateSASTokenForCopy = function () {
            var start = StorageActionsHelper.getSasStartTimeForCopy();
            var expiry = StorageActionsHelper.getSasExpiryForCopy();
            var service = "f";
            // We need access to container-level and object-level APIs to copy a file share.
            var resourceType = "co";
            // Use read and list permissions so we can use a single SAS for the share.
            // Otherwise we would need to iterate over every directory and file.
            var permission = "rl";
            // An account SAS is required to read a blob container's properties and metadata.
            return this._host.executeOperation("Azure.generateSharedAccessSignature", [
                this.getConnectionString(),
                service,
                resourceType,
                permission,
                expiry,
                start
            ]).then(function (result) { return result.sasToken; });
        };
        /**
         * Deletes a file directory, but *not* the items in it (NOOP for blobs)
         */
        FileFlobContainer.prototype.deleteDirectory = function (directoryPath) {
            return this._host.executeOperation("AzureFiles.deleteDirectory", [
                this.getConnectionString(),
                this.getName(),
                directoryPath
            ]);
        };
        FileFlobContainer.prototype._getClipboardDataForItems = function (accountUri, sasToken, sasConnectionString, rootFolder, items) {
            var data = {
                connectionString: sasConnectionString,
                shareName: this.getName(),
                accountUri: accountUri,
                sourceFolder: rootFolder,
                items: items,
                sasToken: sasToken
            };
            return {
                dataFormat: AzureStorageConstants.FilesClipboardFormat,
                data: data
            };
        };
        FileFlobContainer.prototype._getClipboardDataForContainer = function (accountUri, sasToken, sasConnectionString) {
            var data = {
                connectionString: sasConnectionString,
                shareName: this.getName(),
                accountUri: accountUri,
                sasToken: sasToken,
                quota: this._getQuota()
            };
            return {
                dataFormat: AzureStorageConstants.FileShareClipboardFormat,
                data: data
            };
        };
        return FileFlobContainer;
    }(BaseFlobContainer_1.BaseFlobContainer));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileFlobContainer;
});

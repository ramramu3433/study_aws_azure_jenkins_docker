/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/BaseFlobContainer", "ActivityLog/StorageExplorer/BlobFlobTree", "Providers/Common/AzureStorageConstants", "Providers/StorageExplorer/ProviderWrappers/BlobPW", "Common/ConnectionString", "Common/Debug", "Common/SASResourceType", "Providers/StorageExplorer/Actions/StorageActionsHelper"], function (require, exports, BaseFlobContainer_1, BlobFlobTree_1, AzureStorageConstants, BlobPW_1, ConnectionString_1, Debug, SASResourceType_1, StorageActionsHelper) {
    "use strict";
    /*
     * Implementation of container abstraction for blob containers
     */
    var BlobFlobContainer = (function (_super) {
        __extends(BlobFlobContainer, _super);
        function BlobFlobContainer(host, containerReference) {
            var _this = _super.call(this, host, containerReference.containerName, new BlobFlobTree_1.default(host, containerReference)) || this;
            _this._containerReference = containerReference;
            _this._blobsProxy = new BlobPW_1.default(host);
            return _this;
        }
        BlobFlobContainer.prototype.isBlobContainer = function () { return true; };
        BlobFlobContainer.prototype.isFileShare = function () { return false; };
        BlobFlobContainer.prototype.getConnectionString = function () {
            return this._containerReference.connectionString;
        };
        BlobFlobContainer.prototype.safeCreate = function (id, parentNodeType, doNotOpenInEditor) {
            var args = {
                connectionString: this.getConnectionString(),
                newChildName: this.getName(),
                id: id,
                nodeType: parentNodeType,
                doNotOpenInEditor: doNotOpenInEditor
            };
            return this._host.executeOperation("Azure.Actions.Storage.safeCreateBlobContainer", [args]);
        };
        BlobFlobContainer.prototype.copy = function (targetID, parentNodeType, target, doNotOpenInEditor) {
            var args = {
                sourceConnectionString: this.getConnectionString(),
                sourceContainerName: this.getName(),
                targetConnectionString: target.getConnectionString(),
                targetContainerName: target.getName(),
                targetID: targetID,
                targetNodeType: parentNodeType,
                doNotOpenInEditor: doNotOpenInEditor
            };
            return this._host.executeOperation("Azure.Actions.Storage.safeCreateBlobContainerFromExisting", [args]);
        };
        BlobFlobContainer.prototype.safeDelete = function (containerNodeType, skipPrompt) {
            var args = {
                connectionString: this.getConnectionString(),
                name: this.getName(),
                nodeType: containerNodeType,
                skipPrompt: skipPrompt
            };
            return this._host.executeOperation("Azure.Actions.Storage.safeDeleteBlobContainer", [args]);
        };
        BlobFlobContainer.prototype.exists = function () {
            return this._blobsProxy.doesBlobContainerExist(this.getConnectionString(), this.getName());
        };
        BlobFlobContainer.prototype.deleteItem = function (itemPath, snapshot) {
            return this._host.executeOperation("AzureBlobs.deleteBlob", [
                this._containerReference.connectionString,
                this._containerReference.containerName,
                itemPath,
                snapshot
            ]);
        };
        BlobFlobContainer.prototype.itemExists = function (itemPath, snapshot) {
            return this._host.executeOperation("AzureBlobs.getBlob", [this._containerReference, itemPath, snapshot])
                .then(function (response) { return true; })
                .catch(function (error) {
                // TODO: [yantang] We need to support both C# and Node backend, checking on error message is not reliable. (This should be in backend.)
                if (error.message === "NotFound") {
                    return false;
                }
                return Promise.reject(error);
            });
        };
        BlobFlobContainer.prototype.uploadFromLocalFile = function (sourceFilePath, size, destPath, blobType, // Ignored for files
            overwriteIfExists, progressId) {
            var _this = this;
            var before = Date.now();
            var args = {
                containerReference: this._containerReference,
                blobName: destPath,
                fileSize: size,
                filePath: sourceFilePath,
                blobType: blobType,
                overwriteIfExists: overwriteIfExists,
                progressId: progressId
            };
            return this._host.executeProviderOperation("Azure.Storage.Blobs.uploadFileAsBlob", args)
                .then(function () {
                var after = Date.now();
                Debug.log("Elapsed Time for blob upload: " + (after - before));
            })
                .catch(function (error) {
                throw _this.processError(error);
            });
        };
        BlobFlobContainer.prototype.abortUpload = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Blobs.abortBlobUpload", { progressId: progressId });
        };
        BlobFlobContainer.prototype.getUploadProgress = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Blobs.getBlobUploadProgress", { progressId: progressId });
        };
        BlobFlobContainer.prototype.getDownloadProgress = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Blobs.getBlobDownloadProgress", { progressId: progressId });
        };
        BlobFlobContainer.prototype.releaseUpload = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Blobs.releaseBlobUpload", { progressId: progressId });
        };
        BlobFlobContainer.prototype.releaseDownload = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Blobs.releaseBlobDownload", { progressId: progressId });
        };
        BlobFlobContainer.prototype.downloadToLocalFile = function (sourceFlobPath, destDiskPath, size, progressId, snapshot) {
            var args = {
                containerReference: this._containerReference,
                sourceFlobPath: sourceFlobPath,
                destDiskPath: destDiskPath,
                progressId: progressId,
                size: size,
                snapshot: snapshot
            };
            return this._host.executeProviderOperation("Azure.Storage.Blobs.downloadBlobAsFile", args);
        };
        BlobFlobContainer.prototype.abortDownload = function (progressId) {
            return this._host.executeProviderOperation("Azure.Storage.Blobs.abortBlobDownload", { progressId: progressId });
        };
        /**
         * Registers a flob to be copied from a URL location to this container.
         * It doesn't necessarily happen immediately. Azure can throttle it.
         *
         * @param sourceContainer Not used
         * @param sourcePath Not used.
         * @param sourceSasUri The SAS URI to the source flob.
         * @param targetPath The path in this container to copy the flob to.
         * @param overwriteIfExists Determines whether to overwrite any existing flob.
         * @override
         */
        BlobFlobContainer.prototype.startCopyIntoThisContainer = function (sourceContainer, sourcePath, sourceSasUri, sourceSnapshot, targetPath, overwriteIfExists) {
            var _this = this;
            var destination = this._getBlobReference(targetPath);
            return this._blobsProxy.startCopyStorageBlob(sourceSasUri, sourceSnapshot, destination, overwriteIfExists)
                .catch(function (error) {
                throw _this.processError(error);
            });
        };
        BlobFlobContainer.prototype.abortCopy = function (destPath, copyId) {
            var _this = this;
            return this._host.executeOperation("AzureBlobs.abortCopyStorageBlob", [
                this._getBlobReference(destPath),
                copyId
            ])
                .catch(function (error) {
                throw _this.processError(error);
            });
        };
        BlobFlobContainer.prototype.getCopyProgress = function (destPath) {
            return this._host.executeOperation("AzureBlobs.getCopyBlobProgress", [
                this._getBlobReference(destPath)
            ])
                .then(function (result) {
                // Decode the copy progress
                BaseFlobContainer_1.BaseFlobContainer._decodeCopyProgress(result);
                return result;
            });
        };
        BlobFlobContainer.prototype.getPrimaryStorageUri = function (itemPath) {
            return this._host.executeOperation("AzureBlobs.getPrimaryStorageUri", [this._getBlobReference(itemPath)]);
        };
        BlobFlobContainer.prototype.getItem = function (itemPath, snapshot) {
            return this._host.executeOperation("AzureBlobs.getBlob", [this._containerReference, itemPath, snapshot]);
        };
        BlobFlobContainer.prototype.createSASConnectionString = function (resource) {
            return ConnectionString_1.default.createFromSAS(SASResourceType_1.default.blob, resource);
        };
        BlobFlobContainer.prototype._generateSASTokenForCopy = function () {
            var start = StorageActionsHelper.getSasStartTimeForCopy();
            var expiry = StorageActionsHelper.getSasExpiryForCopy();
            var service = "b";
            // We need access to container-level and object-level APIs to copy a blob container.
            var resourceType = "co";
            // Use read and list permissions so we can use a single SAS for the container.
            // Otherwise we would need to iterate over every blob.
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
        BlobFlobContainer.prototype.deleteDirectory = function (directoryPath) {
            return Promise.resolve();
        };
        BlobFlobContainer.prototype._getClipboardDataForItems = function (accountUri, sasToken, sasConnectionString, rootFolder, items) {
            var data = {
                connectionString: sasConnectionString,
                containerName: this.getName(),
                accountUri: accountUri,
                sourceFolder: rootFolder,
                items: items,
                sasToken: sasToken
            };
            return {
                dataFormat: AzureStorageConstants.BlobsClipboardFormat,
                data: data
            };
        };
        BlobFlobContainer.prototype._getClipboardDataForContainer = function (accountUri, sasToken, sasConnectionString) {
            var data = {
                connectionString: sasConnectionString,
                containerName: this.getName(),
                accountUri: accountUri,
                sasToken: sasToken
            };
            return {
                dataFormat: AzureStorageConstants.BlobContainerClipboardFormat,
                data: data
            };
        };
        BlobFlobContainer.prototype._getBlobReference = function (blobPath) {
            return {
                connectionString: this.getConnectionString(),
                containerName: this.getName(),
                blobName: blobPath
            };
        };
        return BlobFlobContainer;
    }(BaseFlobContainer_1.BaseFlobContainer));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobFlobContainer;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Provider wrapper for blobs
     */
    var BlobPW = (function () {
        function BlobPW(host) {
            this.host = host;
        }
        BlobPW.prototype.doesBlobContainerExist = function (connectionString, containerName) {
            return this.host.executeOperation("AzureBlobs.doesBlobContainerExist", [
                connectionString,
                containerName
            ]);
        };
        BlobPW.prototype.doesBlobExist = function (connectionString, containerName, blobPath) {
            return this.host.executeOperation("AzureBlobs.doesBlobExist", [
                {
                    connectionString: connectionString,
                    containerName: containerName
                },
                blobPath
            ]);
        };
        BlobPW.prototype.doesBlobFolderExist = function (connectionString, containerName, path) {
            return this.host.executeOperation("AzureBlobs.doesBlobFolderExist", [
                {
                    connectionString: connectionString,
                    containerName: containerName
                },
                path
            ]);
        };
        BlobPW.prototype.createBlobContainer = function (connectionString, containerName) {
            var operationArgs = {
                connectionString: connectionString,
                containerName: containerName
            };
            return this.host.executeProviderOperation("Azure.Actions.Storage.createBlobContainer", operationArgs);
        };
        BlobPW.prototype.createBlobContainerFromExisting = function (sourceConnectionString, sourceContainerName, targetConnectionString, targetContainerName) {
            var operationArgs = {
                sourceConnectionString: sourceConnectionString,
                sourceContainerName: sourceContainerName,
                targetConnectionString: targetConnectionString,
                targetContainerName: targetContainerName
            };
            return this.host.executeProviderOperation("Azure.Actions.Storage.createBlobContainerFromExisting", operationArgs);
        };
        BlobPW.prototype.startCopyStorageBlob = function (sourceSasUri, sourceSnapshot, destination, overwriteIfExists) {
            var operationArgs = [
                sourceSasUri,
                sourceSnapshot,
                destination,
                overwriteIfExists
            ];
            return this.host.executeOperation("AzureBlobs.startCopyStorageBlob", operationArgs);
        };
        return BlobPW;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobPW;
});

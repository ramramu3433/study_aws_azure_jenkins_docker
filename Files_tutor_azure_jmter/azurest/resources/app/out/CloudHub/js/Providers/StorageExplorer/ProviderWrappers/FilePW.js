/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Common/Utilities"], function (require, exports, es6_promise_1, Utilities) {
    "use strict";
    /**
     * Provider wrapper for Azure files/file shares
     */
    var FilePW = (function () {
        function FilePW(host) {
            this.host = host;
        }
        FilePW.prototype.doesFileShareExist = function (connectionString, shareName) {
            return this.host.executeOperation("AzureFiles.doesFileShareExist", [
                connectionString,
                shareName
            ]);
        };
        FilePW.prototype.doesFileExist = function (connectionString, shareName, filePath) {
            return this.host.executeOperation("AzureFiles.doesFileExist", [
                connectionString,
                shareName,
                Utilities.getDirectoryFromPath(filePath),
                Utilities.getFileNameFromPath(filePath)
            ]);
        };
        FilePW.prototype.doesDirectoryExist = function (connectionString, shareName, directoryPath) {
            return this.host.executeOperation("AzureFiles.doesDirectoryExist", [
                connectionString,
                shareName,
                directoryPath
            ]);
        };
        /**
         * Does the given path exist as either a directory or a file?
         */
        FilePW.prototype.doesFileOrDirectoryExist = function (connectionString, shareName, path) {
            var promises = [
                this.doesFileExist(connectionString, shareName, path),
                this.doesDirectoryExist(connectionString, shareName, path)
            ];
            return es6_promise_1.Promise.all(promises)
                .then(function (results) {
                return results.some(function (exists) { return exists; });
            });
        };
        /**
         * Ensures that a directory is created in the share.
         */
        FilePW.prototype.createDirectory = function (shareReference, newDirectoryPath, createParentDirectories, metadata) {
            var operationArgs = [
                shareReference,
                newDirectoryPath,
                createParentDirectories,
                metadata
            ];
            return this.host.executeOperation("AzureFiles.createDirectory", operationArgs);
        };
        /**
         * Ensures that an empty directory copy is created.
         */
        FilePW.prototype.createDirectoryFromExisting = function (sourceShare, sourcePath, targetShare, targetPath) {
            var operationArgs = [
                sourceShare,
                sourcePath,
                targetShare,
                targetPath
            ];
            return this.host.executeOperation("AzureFiles.createDirectoryFromExisting", operationArgs);
        };
        /**
         * Copies a file to the specified target location.
         * Both the file reference and SAS URI are required to fully copy a file and it's parent directory structure.
         */
        FilePW.prototype.startCopyStorageFile = function (sourceReference, sourceFileSasUri, targetReference, overwriteIfExists) {
            if (overwriteIfExists === void 0) { overwriteIfExists = true; }
            var operationArgs = [
                sourceReference,
                sourceFileSasUri,
                targetReference,
                overwriteIfExists
            ];
            return this.host.executeOperation("AzureFiles.startCopyStorageFile", operationArgs);
        };
        return FilePW;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FilePW;
});

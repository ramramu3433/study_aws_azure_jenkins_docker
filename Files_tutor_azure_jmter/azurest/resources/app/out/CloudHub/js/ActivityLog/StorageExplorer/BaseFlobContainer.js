/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/AzureStorageUtilities", "Common/ConnectionString", "Common/Debug", "ActivityLog/StorageExplorer/ObservableActivity", "Common/Utilities"], function (require, exports, AzureStorageUtilities, ConnectionString_1, Debug, ObservableActivity, Utilities) {
    "use strict";
    /*
     * Base implementation for a blob or file container
     */
    var BaseFlobContainer = (function () {
        function BaseFlobContainer(host, name, flobTree) {
            this._host = host;
            this._name = name;
            this._flobTree = flobTree;
        }
        BaseFlobContainer.prototype.getName = function () {
            return this._name;
        };
        BaseFlobContainer.prototype.getAccountName = function () {
            return new ConnectionString_1.default(this.getConnectionString()).getAccountName();
        };
        BaseFlobContainer.prototype.supportsVirtualFolders = function () {
            return this._flobTree.supportsVirtualFolders();
        };
        BaseFlobContainer.prototype.isEmpty = function () {
            return this._flobTree.isEmpty();
        };
        BaseFlobContainer.prototype.isFolderEmpty = function (folderPath) {
            return this._flobTree.isFolderEmpty(folderPath);
        };
        BaseFlobContainer.prototype.processError = function (error) {
            return AzureStorageUtilities.processError(error);
        };
        BaseFlobContainer.prototype.enumerateItemsRecursively = function (sourceItemsOrPaths, basePath, requireSize, cancelToken, onChunk) {
            return this._flobTree.enumerateItemsRecursively(sourceItemsOrPaths, basePath, requireSize, cancelToken, onChunk);
        };
        /**
         * Copies flob and/or folder references to the clipboard for later pasting into another container.
         * Folder names should end with "/"
         */
        BaseFlobContainer.prototype.copyItemsToClipboard = function (rootFolder, items) {
            var _this = this;
            return this.getSASTokenForCopy()
                .then(function (sasToken) {
                return _this.getPrimaryAccountUri()
                    .then(function (accountUri) {
                    // Create a connection string with sas token.
                    // Instead of using the connection string above that contains the account key.
                    var resource = {
                        resourceName: _this.getName(),
                        accountUri: accountUri,
                        sasToken: sasToken
                    };
                    var sasConnectionString = _this.createSASConnectionString(resource);
                    // Set the clipboard data
                    var clipboardData = _this._getClipboardDataForItems(resource.accountUri, sasToken, sasConnectionString, rootFolder, items);
                    return _this._host.executeOperation("Environment.clipboardSetData", [clipboardData.dataFormat, clipboardData.data]);
                });
            });
        };
        BaseFlobContainer.prototype.copyContainerToClipboard = function () {
            var _this = this;
            return this.getSASTokenForCopy()
                .then(function (sasToken) {
                return _this.getPrimaryAccountUri()
                    .then(function (accountUri) {
                    var resource = {
                        resourceName: _this.getName(),
                        accountUri: accountUri,
                        sasToken: sasToken
                    };
                    var sasConnectionString = _this.createSASConnectionString(resource);
                    // Set the clipboard data
                    var clipboardData = _this._getClipboardDataForContainer(resource.accountUri, sasToken, sasConnectionString);
                    return _this._host.executeOperation("Environment.clipboardSetData", [clipboardData.dataFormat, clipboardData.data]);
                });
            });
        };
        BaseFlobContainer._decodeCopyProgress = function (result) {
            var splitProgress = result.progress.split("/");
            if (splitProgress.length === 2) {
                var completed = Number(splitProgress[0]);
                var total = Number(splitProgress[1]);
                result.totalCopySize = total;
                result.progressPercentage = ObservableActivity.sanitizePercentageProgress(completed / total);
                var completedFormatted = Utilities.formatSize(completed);
                var totalFormatted = Utilities.formatSize(total);
                result.progressMessage = completedFormatted + " of " + totalFormatted + " copied"; // localize
            }
        };
        BaseFlobContainer.prototype.getSASTokenForCopy = function (itemPath, useSecondaryEndpoint) {
            itemPath = itemPath || "";
            var connectionString = new ConnectionString_1.default(this.getConnectionString());
            if (connectionString.containsKeyAndName(true /*includeEmulator*/)) {
                // Generate a SAS
                return this._generateSASTokenForCopy();
            }
            else {
                // Use the SAS in the connection string
                Debug.assert(function () { return connectionString.containsSAS(); }, "Connection string should contain key/name/emulator or SAS");
                return Promise.resolve(connectionString.getSAS());
            }
        };
        BaseFlobContainer.prototype.getPrimaryAccountUri = function () {
            var _this = this;
            return this.getPrimaryStorageUri()
                .then(function (containerUri) { return AzureStorageUtilities.accountUriFromContainerUri(containerUri, _this._name); });
        };
        BaseFlobContainer.prototype.getLocationDisplayPath = function (path1, selectedItems) {
            var path2 = null;
            if (selectedItems && selectedItems.length) {
                path2 = (selectedItems.length === 1) ? selectedItems[0].FileName : "(multiple selections)";
            }
            return Utilities.JoinAzurePaths(this.getAccountName(), this.getName(), path1, path2);
        };
        return BaseFlobContainer;
    }());
    exports.BaseFlobContainer = BaseFlobContainer;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BaseFlobContainer;
});

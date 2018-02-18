/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/BaseFlobTree", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, BaseFlobTree_1, StorageExplorerUtilities) {
    "use strict";
    /*
     * Azure file share implementation of IFlobTree
     */
    var FileFlobTree = (function (_super) {
        __extends(FileFlobTree, _super);
        function FileFlobTree(host, shareReference) {
            var _this = _super.call(this, host, shareReference.shareName) || this;
            _this._shareReference = shareReference;
            return _this;
        }
        /** @override */
        FileFlobTree.prototype.supportsVirtualFolders = function () {
            return false;
        };
        /** @override */
        FileFlobTree.prototype.listsFoldersInEnumeration = function () {
            return true;
        };
        /**
         * @override
         */
        FileFlobTree.prototype._listFlatItemsSegmented = function (prefixOrFolder, continuationToken, downloadSize) {
            var operationArgs = {
                shareReference: this._shareReference,
                directory: StorageExplorerUtilities.ensureTrailingSlash(prefixOrFolder),
                prefix: null,
                currentToken: continuationToken,
                numResults: downloadSize
            };
            return this._host.executeProviderOperation("Azure.Storage.Files.listFilesAndDirectoriesSegmented", operationArgs)
                .then(function (result) {
                // Place directories and files into a single list
                var allResults = {
                    ContinuationToken: result.ContinuationToken,
                    Results: result.Directories.concat(result.Files),
                    ContainsSubItems: false // Files API doesn't list items inside subfolders
                };
                return allResults;
            });
        };
        ;
        return FileFlobTree;
    }(BaseFlobTree_1.BaseFlobTree));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileFlobTree;
});

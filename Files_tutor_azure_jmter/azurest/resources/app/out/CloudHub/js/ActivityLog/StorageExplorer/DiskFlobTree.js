/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/BaseFlobTree", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, BaseFlobTree_1, StorageExplorerConstants, Utilities) {
    "use strict";
    /*
     * Local hard drive implementation of IFlobTree
     */
    var DiskFlobTree = (function (_super) {
        __extends(DiskFlobTree, _super);
        function DiskFlobTree(host, folderPath) {
            var _this = _super.call(this, host, folderPath) || this;
            _this._folderPath = folderPath;
            return _this;
        }
        /** @override */
        DiskFlobTree.prototype.supportsVirtualFolders = function () {
            return true;
        };
        /** @override */
        DiskFlobTree.prototype.listsFoldersInEnumeration = function () {
            return false;
        };
        DiskFlobTree.prototype._releaseEnumeration = function (continuationToken) {
            this._host.executeOperation("Environment.releaseEnumeratedFilesOnDisk", [continuationToken]);
        };
        /** @override */
        DiskFlobTree.prototype._listFlatItemsSegmented = function (prefixOrFolder, continuationToken, downloadSize) {
            var operationArgs = [
                Utilities.JoinFilePaths(this._folderPath, prefixOrFolder),
                continuationToken
            ];
            return this._host.executeOperation("Environment.enumerateFilesOnDiskSegmented", operationArgs)
                .then(function (results) {
                var segmentResults = results.result.map(function (fileInfo) {
                    // The "full" path should be relative to the container, i.e., the root directory
                    var pathRelativeToRootFolder = Utilities.JoinFilePaths(prefixOrFolder, fileInfo.name);
                    return {
                        FullName: pathRelativeToRootFolder,
                        FileName: Utilities.removeTrailingSlash(fileInfo.name),
                        Size: String(fileInfo.size),
                        Uri: "",
                        ContentType: Utilities.isPathAFolder(fileInfo.name) ? StorageExplorerConstants.ContentTypes.Folder : null,
                        Blob: {}
                    };
                });
                return {
                    Results: segmentResults,
                    ContinuationToken: results.continuationToken,
                    ContainsSubItems: false /* Does not return deep items */
                };
            });
        };
        ;
        return DiskFlobTree;
    }(BaseFlobTree_1.BaseFlobTree));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DiskFlobTree;
});

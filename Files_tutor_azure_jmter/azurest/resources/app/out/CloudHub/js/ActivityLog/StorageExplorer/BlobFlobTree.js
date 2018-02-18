/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/BaseFlobTree", "Providers/Azure//BlobQueryProviderConfig"], function (require, exports, BaseFlobTree_1, BlobQueryProviderConfig_1) {
    "use strict";
    /**
     * Implementation of container abstraction for blob containers
     */
    var BlobFlobTree = (function (_super) {
        __extends(BlobFlobTree, _super);
        function BlobFlobTree(host, containerReference) {
            var _this = _super.call(this, host, containerReference.containerName) || this;
            _this._containerReference = containerReference;
            return _this;
        }
        /** @override */
        BlobFlobTree.prototype.supportsVirtualFolders = function () {
            return true;
        };
        /** @override */
        BlobFlobTree.prototype.listsFoldersInEnumeration = function () {
            return false;
        };
        /** @override */
        BlobFlobTree.prototype._listFlatItemsSegmented = function (prefixOrFolder, continuationToken, downloadSize) {
            var operationArgs = {
                containerReference: this._containerReference,
                prefix: prefixOrFolder,
                currentToken: continuationToken,
                numResults: downloadSize,
                include: BlobQueryProviderConfig_1.ListBlobsInclude.FlatList
            };
            return this._host.executeProviderOperation("Azure.Storage.Blobs.listBlobsSegmented", operationArgs)
                .then(function (result) {
                return {
                    Results: result.Results,
                    ContinuationToken: result.ContinuationToken,
                    ContainsSubItems: true /* Blob API always returns deep items */
                };
            });
        };
        ;
        return BlobFlobTree;
    }(BaseFlobTree_1.BaseFlobTree));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobFlobTree;
});

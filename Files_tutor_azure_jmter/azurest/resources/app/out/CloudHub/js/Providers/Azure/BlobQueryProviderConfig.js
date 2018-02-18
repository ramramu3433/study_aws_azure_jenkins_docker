/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * A provider for running blob listing operations in a separate process.
     */
    var BlobQueryProviderConfig = (function () {
        function BlobQueryProviderConfig() {
            this.namespace = "Azure.Storage.BlobQueryProvider";
            this.nodeJSProviderConfig = {
                /** Path relative to app/renderer(?) */
                nodeJSRequirePath: "../providers/BlobQueryProvider",
                useChildProcess: true
            };
            this.exports = [
                "Azure.Storage.Blobs.listBlobsSegmented",
                "Azure.Storage.Blobs.getMetadata"
            ];
        }
        return BlobQueryProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobQueryProviderConfig;
    var ListBlobsInclude;
    (function (ListBlobsInclude) {
        ListBlobsInclude[ListBlobsInclude["Directory"] = 0] = "Directory";
        ListBlobsInclude[ListBlobsInclude["NoFoldersAndSnapshots"] = 1] = "NoFoldersAndSnapshots";
        ListBlobsInclude[ListBlobsInclude["NoFoldersAndMetadata"] = 2] = "NoFoldersAndMetadata";
        ListBlobsInclude[ListBlobsInclude["NoFoldersAndSnapshotsAndMetaData"] = 3] = "NoFoldersAndSnapshotsAndMetaData";
        ListBlobsInclude[ListBlobsInclude["FlatList"] = 4] = "FlatList";
    })(ListBlobsInclude = exports.ListBlobsInclude || (exports.ListBlobsInclude = {}));
});

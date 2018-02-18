"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ListBlobsInclude;
(function (ListBlobsInclude) {
    ListBlobsInclude[ListBlobsInclude["Directory"] = 0] = "Directory";
    ListBlobsInclude[ListBlobsInclude["NoFoldersAndSnapshots"] = 1] = "NoFoldersAndSnapshots";
    ListBlobsInclude[ListBlobsInclude["NoFoldersAndMetadata"] = 2] = "NoFoldersAndMetadata";
    ListBlobsInclude[ListBlobsInclude["NoFoldersAndSnapshotsAndMetaData"] = 3] = "NoFoldersAndSnapshotsAndMetaData";
    ListBlobsInclude[ListBlobsInclude["FlatList"] = 4] = "FlatList";
})(ListBlobsInclude || (ListBlobsInclude = {}));
exports.default = ListBlobsInclude;

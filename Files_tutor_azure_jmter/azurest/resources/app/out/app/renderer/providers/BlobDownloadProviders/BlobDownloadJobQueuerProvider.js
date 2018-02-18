"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var BlobDownloadJobQueuer_1 = require("../../JobHandlers/Blob/Download/BlobDownloadJobQueuer");
var ActivityManager_1 = require("../../Components/Activities/ActivityManager");
var RemoteBlobDownloadGroupManager_1 = require("../../JobHandlers/Blob/Download/RemoteBlobDownloadGroupManager");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var blobDownloadGroup = new RemoteBlobDownloadGroupManager_1.default(host);
var blobDownloadJobQueuer = new BlobDownloadJobQueuer_1.default(remoteActivityManager, blobDownloadGroup);
var BlobDownloadJobQueuerProvider = {
    "BlobDownloadJobQueuer.preProcess": function (args) {
        return blobDownloadJobQueuer.preProcess(args.item);
    }
};
module.exports = BlobDownloadJobQueuerProvider;

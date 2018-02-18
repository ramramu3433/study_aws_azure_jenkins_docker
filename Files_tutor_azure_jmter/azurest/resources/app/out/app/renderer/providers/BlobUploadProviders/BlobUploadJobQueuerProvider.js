"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var BlobUploadJobQueuer_1 = require("../../JobHandlers/Blob/Upload/BlobUploadJobQueuer");
var ActivityManager_1 = require("../../Components/Activities/ActivityManager");
var RemoteBlobUploadGroupManager_1 = require("../../JobHandlers/Blob/Upload/RemoteBlobUploadGroupManager");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var blobUploadGroup = new RemoteBlobUploadGroupManager_1.default(host);
var blobUploadJobQueuer = new BlobUploadJobQueuer_1.default(remoteActivityManager, blobUploadGroup);
var BlobUploadJobQueuerProvider = {
    "BlobUploadJobQueuer.preProcess": function (args) {
        return blobUploadJobQueuer.preProcess(args.item);
    }
};
module.exports = BlobUploadJobQueuerProvider;

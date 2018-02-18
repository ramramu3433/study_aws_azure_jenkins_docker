"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var BlobDownloadIteratorProcessor_1 = require("../../JobHandlers/Blob/Download/BlobDownloadIteratorProcessor");
var RemoteBlobDownloadGroupManager_1 = require("../../JobHandlers/Blob/Download/RemoteBlobDownloadGroupManager");
var ActivityManager_1 = require("../../Components/Activities/ActivityManager");
var host = global.host;
var blobDownloadGroup = new RemoteBlobDownloadGroupManager_1.default(host);
var activityManager = new ActivityManager_1.Remote(host);
var blobDownloadIteratorProcessor = new BlobDownloadIteratorProcessor_1.default(blobDownloadGroup, activityManager, host);
var BlobDownloadIteratorProcessorProvider = {
    "BlobDownloadIteratorProcessor.processIterator": function (args) {
        return blobDownloadIteratorProcessor.process(args.iterator);
    }
};
module.exports = BlobDownloadIteratorProcessorProvider;

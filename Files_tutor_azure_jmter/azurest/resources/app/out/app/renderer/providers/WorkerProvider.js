"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ActivityManager_1 = require("../Components/Activities/ActivityManager");
var Worker_1 = require("../Components/Worker/Worker");
var BlobDownloadJobHandler_1 = require("../JobHandlers/Blob/Download/BlobDownloadJobHandler");
var BlobUploadJobHandler_1 = require("../JobHandlers/Blob/Upload/BlobUploadJobHandler");
var BlobOpenJobHandler_1 = require("../JobHandlers/Blob/Open/BlobOpenJobHandler");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var worker = new Worker_1.default();
worker.registerJobHandler(new BlobDownloadJobHandler_1.default(remoteActivityManager, host));
worker.registerJobHandler(new BlobUploadJobHandler_1.default(remoteActivityManager, host));
worker.registerJobHandler(new BlobOpenJobHandler_1.default(remoteActivityManager, host));
var workerProvider = {
    "Worker.handleJob": function (job) {
        return worker.handleJob(job);
    },
    "ActivityManager.onExecuteActionEvent": function (args) {
        return remoteActivityManager.onExecuteActionEvent(args);
    }
};
module.exports = workerProvider;

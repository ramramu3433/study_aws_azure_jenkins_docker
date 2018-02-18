"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ActivityManager_1 = require("../Components/Activities/ActivityManager");
var WorkerManager_1 = require("../Components/Worker/WorkerManager");
var SeparateProcessWorker_1 = require("../Components/Worker/SeparateProcessWorker");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var workerManager = new WorkerManager_1.default();
var downloadQueue = { name: "download" };
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, downloadQueue, remoteActivityManager));
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, downloadQueue, remoteActivityManager));
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, downloadQueue, remoteActivityManager));
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, downloadQueue, remoteActivityManager));
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, downloadQueue, remoteActivityManager));
var openQueue = { name: "open" };
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, openQueue, remoteActivityManager));
var uploadQueue = { name: "upload" };
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, uploadQueue, remoteActivityManager));
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, uploadQueue, remoteActivityManager));
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, uploadQueue, remoteActivityManager));
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, uploadQueue, remoteActivityManager));
workerManager.registerWorker(new SeparateProcessWorker_1.default(host, uploadQueue, remoteActivityManager));
var WorkerManagerProvider = {
    "ActivityManager.onExecuteActionEvent": function (args) {
        return remoteActivityManager.onExecuteActionEvent(args);
    },
    "JobQueueManager.onJobAddedEvent": function (queue) {
        return workerManager.processQueue(queue);
    }
};
module.exports = WorkerManagerProvider;

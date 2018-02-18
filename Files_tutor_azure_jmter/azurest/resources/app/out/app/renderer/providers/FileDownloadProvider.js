"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var fileManager = require("../Azure/AzureStorage/FileManager");
var FileDownload_1 = require("../JobHandlers/FileDownload/FileDownload");
var ActivityManager_1 = require("../Components/Activities/ActivityManager");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var FileDownloadProvider = {
    "Azure.Storage.Files.downloadFile": function (args) {
        return fileManager.downloadFile(args.shareReference, args.sourceFlobPath, args.sourceFlobName, args.destDeskPath, args.progressId, args.size);
    },
    "Azure.Storage.Files.getFileDownloadProgress": function (args) {
        return fileManager.getFileDownloadProgress(args.progressId);
    },
    "Azure.Storage.Files.releaseFileDownload": function (args) {
        return fileManager.releaseFileDownload(args.progressId);
    },
    "Azure.Storage.Files.abortFileDownload": function (args) {
        return fileManager.abortFileDownload(args.progressId);
    },
    "Azure.Storage.Files.newDownloadFile": function (args) {
        return new FileDownload_1.default(args, remoteActivityManager, host).start();
    },
    "ActivityManager.onExecuteActionEvent": function (args) { return remoteActivityManager.onExecuteActionEvent(args); }
};
module.exports = FileDownloadProvider;

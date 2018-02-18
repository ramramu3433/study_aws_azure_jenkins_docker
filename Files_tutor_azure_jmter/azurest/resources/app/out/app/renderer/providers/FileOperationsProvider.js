"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var FileDelete_1 = require("../JobHandlers/FileDownload/FileDelete");
var ActivityManager_1 = require("../Components/Activities/ActivityManager");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var FileOperationsProvider = {
    "Azure.Storage.Files.deleteFile": function (args) {
        return new FileDelete_1.default(args, remoteActivityManager, host).start();
    },
    "ActivityManager.onExecuteActionEvent": function (args) { return remoteActivityManager.onExecuteActionEvent(args); }
};
module.exports = FileOperationsProvider;

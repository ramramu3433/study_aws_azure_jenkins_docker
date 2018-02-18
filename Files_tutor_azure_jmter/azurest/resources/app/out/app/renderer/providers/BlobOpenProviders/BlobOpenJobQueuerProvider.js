"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var BlobOpenJobQueuer_1 = require("../../JobHandlers/Blob/Open/BlobOpenJobQueuer");
var ActivityManager_1 = require("../../Components/Activities/ActivityManager");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var blobOpenJobQueuer = new BlobOpenJobQueuer_1.default(remoteActivityManager, null);
var BlobOpenJobQueuerProvider = {
    "BlobOpenJobQueuer.preProcess": function (args) {
        return blobOpenJobQueuer.preProcess(args.item);
    }
};
module.exports = BlobOpenJobQueuerProvider;

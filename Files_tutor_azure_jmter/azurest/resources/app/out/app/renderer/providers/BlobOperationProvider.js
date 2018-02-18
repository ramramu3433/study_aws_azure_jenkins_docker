"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var BlobDelete_1 = require("../JobHandlers/Blob/Delete/BlobDelete");
var os = require("os");
var path = require("path");
var crypto = require("crypto");
var LocalFileOverwriteOptions_1 = require("../JobHandlers/Local/LocalFileOverwriteOptions");
var ActivityManager_1 = require("../Components/Activities/ActivityManager");
var RemoteJobQueueManager_1 = require("../Components/JobQueue/ProviderBasedJobQueue/Remote/RemoteJobQueueManager");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var remoteJobQueueManager = new RemoteJobQueueManager_1.default(host);
function determineDestinationForOpen(blobRef, blobContainerRef) {
    var hash = function (str) {
        return crypto.createHash("sha256").update(str).digest("hex");
    };
    var hashString = blobContainerRef.name + blobRef.fileName;
    if (blobRef.snapshot) {
        hashString += blobRef.snapshot;
    }
    var connectionStringFolder = hash(blobContainerRef.connectionString);
    var blobFolder = hash(hashString);
    var pathDirectories = blobRef.fileName.split("/");
    pathDirectories.pop();
    return path.join.apply(path, [connectionStringFolder, blobFolder].concat(blobRef.fileName.split("/")));
}
module.exports = {
    "Azure.Storage.Blobs.delete": function (args) {
        return new BlobDelete_1.default(args, remoteActivityManager, host).start();
    },
    "Azure.Storage.Blobs.open": function (args) {
        var destinationPath = determineDestinationForOpen(args.blobRef, args.blobContainerRef);
        args.baseLocalPath = os.tmpdir();
        args.relativePath = destinationPath;
        args.localOverwritePolicy = LocalFileOverwriteOptions_1.default.Overwrite;
        args.openFile = true;
        return remoteJobQueueManager.addJob({ name: "open" }, {
            type: "Job",
            properties: {
                args: args
            }
        });
    },
    "ActivityManager.onExecuteActionEvent": function (args) {
        return remoteActivityManager.onExecuteActionEvent(args);
    }
};

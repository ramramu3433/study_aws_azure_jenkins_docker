"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var SharedDataManager_1 = require("../../Components/SharedData/SharedDataManager");
var ActivityManager_1 = require("../../Components/Activities/ActivityManager");
var BlobDownloadGroupManager_1 = require("../../JobHandlers/Blob/Download/BlobDownloadGroupManager");
var host = global.host;
var sharedDataManager = new SharedDataManager_1.default();
var remoteActivityManager = new ActivityManager_1.Remote(host);
var blobDownloadGroupManager = new BlobDownloadGroupManager_1.default(sharedDataManager, remoteActivityManager, host);
var BlobDownloadGroupManagerProvider = {
    "BlobDownloadGroupManager.initGroup": function (args) {
        return blobDownloadGroupManager.initGroup(args.groupActivityRef);
    },
    "BlobDownloadGroupManager.cancelGroup": function (args) {
        return blobDownloadGroupManager.cancelGroup(args.groupRef);
    },
    "BlobDownloadGroupManager.addJobs": function (args) {
        return blobDownloadGroupManager.addJobs(args.groupRef, args.state, args.num);
    },
    "BlobDownloadGroupManager.addJob": function (args) {
        return blobDownloadGroupManager.addJob(args.groupRef, args.state);
    },
    "BlobDownloadGroupManager.setJobActivityRef": function (args) {
        return blobDownloadGroupManager.setJobActivityRef(args.groupRef, args.statsRef, args.activityRef);
    },
    "BlobDownloadGroupManager.retryAll": function (args) {
        return blobDownloadGroupManager.retryAll(args.groupRef);
    },
    "BlobDownloadGroupManager.updateState": function (args) {
        return blobDownloadGroupManager.updateState(args.groupRef, args.statsRef, args.state);
    },
    "BlobDownloadGroupManager.isCanceled": function (args) {
        return blobDownloadGroupManager.isCanceled(args.groupRef);
    },
    "BlobDownloadGroupManager.markIteratorComplete": function (args) {
        return blobDownloadGroupManager.markIteratorComplete(args.groupRef);
    },
    "BlobDownloadGroupManager.markIteratorPaused": function (args) {
        return blobDownloadGroupManager.markIteratorPaused(args.groupRef, args.reason, args.resumeAction);
    },
    "BlobDownloadGroupManager.markIteratorResumed": function (args) {
        return blobDownloadGroupManager.markIteratorResumed(args.groupRef);
    },
    "BlobDownloadGroupManager.markIteratorResuming": function (args) {
        return blobDownloadGroupManager.markIteratorResuming(args.groupRef);
    },
    "BlobDownloadGroupManager.iteratorStatus": function (args) {
        return blobDownloadGroupManager.iteratorStatus(args.groupRef);
    },
    "BlobDownloadGroupManager.handleConflict": function (args) {
        return blobDownloadGroupManager.handleConflict(args.groupRef, args.policy, args.values);
    },
    "BlobDownloadGroupManager.getPolicy": function (args) {
        return blobDownloadGroupManager.getPolicy(args.groupRef, args.policy);
    },
    "BlobDownloadGroupManager.reportIssue": function (args) {
        return blobDownloadGroupManager.reportIssue(args.groupRef, args.issueMessage, args.details);
    }
};
module.exports = BlobDownloadGroupManagerProvider;

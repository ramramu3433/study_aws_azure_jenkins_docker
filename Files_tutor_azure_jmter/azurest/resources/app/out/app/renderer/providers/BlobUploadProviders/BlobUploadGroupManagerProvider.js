"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var SharedDataManager_1 = require("../../Components/SharedData/SharedDataManager");
var ActivityManager_1 = require("../../Components/Activities/ActivityManager");
var BlobUploadGroupManager_1 = require("../../JobHandlers/Blob/Upload/BlobUploadGroupManager");
var host = global.host;
var sharedDataManager = new SharedDataManager_1.default();
var remoteActivityManager = new ActivityManager_1.Remote(host);
var blobUploadGroupManager = new BlobUploadGroupManager_1.default(sharedDataManager, remoteActivityManager, host);
var BlobUploadGroupManagerProvider = {
    "BlobUploadGroupManager.initGroup": function (args) {
        return blobUploadGroupManager.initGroup(args.groupActivityRef);
    },
    "BlobUploadGroupManager.cancelGroup": function (args) {
        return blobUploadGroupManager.cancelGroup(args.groupRef);
    },
    "BlobUploadGroupManager.addJobs": function (args) {
        return blobUploadGroupManager.addJobs(args.groupRef, args.state, args.num);
    },
    "BlobUploadGroupManager.addJob": function (args) {
        return blobUploadGroupManager.addJob(args.groupRef, args.state);
    },
    "BlobUploadGroupManager.setJobActivityRef": function (args) {
        return blobUploadGroupManager.setJobActivityRef(args.groupRef, args.statsRef, args.activityRef);
    },
    "BlobUploadGroupManager.retryAll": function (args) {
        return blobUploadGroupManager.retryAll(args.groupRef);
    },
    "BlobUploadGroupManager.updateState": function (args) {
        return blobUploadGroupManager.updateState(args.groupRef, args.statsRef, args.state);
    },
    "BlobUploadGroupManager.isCanceled": function (args) {
        return blobUploadGroupManager.isCanceled(args.groupRef);
    },
    "BlobUploadGroupManager.markIteratorComplete": function (args) {
        return blobUploadGroupManager.markIteratorComplete(args.groupRef);
    },
    "BlobUploadGroupManager.markIteratorPaused": function (args) {
        return blobUploadGroupManager.markIteratorPaused(args.groupRef, args.reason, args.resumeAction);
    },
    "BlobUploadGroupManager.markIteratorResumed": function (args) {
        return blobUploadGroupManager.markIteratorResumed(args.groupRef);
    },
    "BlobUploadGroupManager.markIteratorResuming": function (args) {
        return blobUploadGroupManager.markIteratorResuming(args.groupRef);
    },
    "BlobUploadGroupManager.iteratorStatus": function (args) {
        return blobUploadGroupManager.iteratorStatus(args.groupRef);
    },
    "BlobUploadGroupManager.handleConflict": function (args) {
        return blobUploadGroupManager.handleConflict(args.groupRef, args.policy, args.values);
    },
    "BlobUploadGroupManager.getPolicy": function (args) {
        return blobUploadGroupManager.getPolicy(args.groupRef, args.policy);
    },
    "BlobUploadGroupManager.reportIssue": function (args) {
        return blobUploadGroupManager.reportIssue(args.groupRef, args.issueMessage, args.details);
    }
};
module.exports = BlobUploadGroupManagerProvider;

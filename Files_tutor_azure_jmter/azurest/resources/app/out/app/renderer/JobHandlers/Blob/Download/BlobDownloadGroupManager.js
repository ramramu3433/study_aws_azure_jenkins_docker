"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ActivityStatus_1 = require("../../../Components/Activities/ActivityStatus");
var BlobDownloadState_1 = require("./BlobDownloadState");
var GroupConflictHandler_1 = require("../../Groups/Conflicts/GroupConflictHandler");
var IteratorStatus_1 = require("../../Groups/IteratorStatus");
var JobGroupManager_1 = require("../../Groups/JobGroupManager");
var LocalGroupConflictConfig_1 = require("../../Local/LocalGroupConflictConfig");
var UnsafeNameGroupConflictConfig_1 = require("../../WindowsSafeFileNames/UnsafeName/UnsafeNameGroupConflictConfig");
var BlobDownloadGroupManage = (function (_super) {
    tslib_1.__extends(BlobDownloadGroupManage, _super);
    function BlobDownloadGroupManage(sharedDataManager, activityManager, host) {
        var _this = _super.call(this, activityManager, host) || this;
        _this._groupConflictHandler = new GroupConflictHandler_1.default(sharedDataManager, host, [LocalGroupConflictConfig_1.default, UnsafeNameGroupConflictConfig_1.default]);
        return _this;
    }
    BlobDownloadGroupManage.prototype.handleConflict = function (groupRef, policy, values) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._groupConflictHandler.handleConflict(groupRef, policy, values)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BlobDownloadGroupManage.prototype.getPolicy = function (groupRef, policy) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._groupConflictHandler.getPolicy(groupRef, policy)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @override from JobGroup.ts
     */
    BlobDownloadGroupManage.prototype._updateActivity = function (groupRef, groupActivity, dataProcessor) {
        var numQueued = dataProcessor.numJobsWithState(BlobDownloadState_1.default.WaitingToStart);
        var numRunning = dataProcessor.numJobsWithState(BlobDownloadState_1.default.Active) + dataProcessor.numJobsWithState(BlobDownloadState_1.default.Starting) + dataProcessor.numJobsWithState(BlobDownloadState_1.default.Canceling);
        var numComplete = dataProcessor.numJobsWithState(BlobDownloadState_1.default.Complete);
        var numFailed = dataProcessor.numJobsWithState(BlobDownloadState_1.default.Failed);
        var numSkipped = dataProcessor.numJobsWithState(BlobDownloadState_1.default.Skipped);
        var numCanceled = dataProcessor.numJobsWithState(BlobDownloadState_1.default.Canceled);
        var numConflicted = dataProcessor.numJobsWithState(BlobDownloadState_1.default.Conflicted);
        var numJobs = dataProcessor.numJobs();
        var numIssues = dataProcessor.numIssues();
        groupActivity.actions = [];
        if (dataProcessor.groupIsCancelled() || (numJobs > 0 && numJobs === numCanceled)) {
            if (numQueued === 0 && numRunning === 0 && dataProcessor.iteratorStatus() === IteratorStatus_1.default.Complete) {
                groupActivity.status = ActivityStatus_1.default.Canceled;
                groupActivity.title = "Canceled Group Download";
                groupActivity.message = "";
            }
            else if (dataProcessor.groupIsCancelled()) {
                groupActivity.status = ActivityStatus_1.default.InProgress;
                groupActivity.title = "Canceling Group Download";
                groupActivity.message = "Complete: " + numComplete + " - Canceled: " + numCanceled;
            }
        }
        else {
            if (numQueued === 0 && numRunning === 0 && dataProcessor.iteratorStatus() === IteratorStatus_1.default.Complete) {
                groupActivity.message = "Downloaded: " + numComplete;
                if (numFailed === 0 && numIssues === 0) {
                    groupActivity.status = ActivityStatus_1.default.Success;
                    groupActivity.title = "Downloaded Group";
                }
                else {
                    groupActivity.status = ActivityStatus_1.default.Error;
                    groupActivity.title = "Failed to Download Group";
                    if (numFailed > 0) {
                        groupActivity.message = groupActivity.message + " - Failed: " + numFailed;
                    }
                    if (numIssues > 0) {
                        groupActivity.message = groupActivity.message + " - Issues: " + numIssues;
                    }
                }
            }
            else {
                groupActivity.status = ActivityStatus_1.default.InProgress;
                groupActivity.title = "Downloading Group";
                groupActivity.message = "Complete: " + numComplete;
                if (numFailed + numIssues > 0) {
                    groupActivity.status = ActivityStatus_1.default.Attention;
                    groupActivity.message = "Requires Action: " + (numFailed + numIssues) + " - " + groupActivity.message;
                }
                if (dataProcessor.numJobs() > 0) {
                    groupActivity.actions.push({
                        title: "Cancel All",
                        args: {
                            providerNamespace: "BlobDownloadGroupManager.cancelGroup",
                            providerArgs: {
                                groupRef: groupRef
                            }
                        }
                    });
                }
            }
            if (numFailed > 0) {
                groupActivity.actions.push({
                    title: "Retry All",
                    args: {
                        providerNamespace: "BlobDownloadGroupManager.retryAll",
                        providerArgs: {
                            groupRef: groupRef
                        }
                    }
                });
            }
            if (numSkipped > 0) {
                groupActivity.message = groupActivity.message + " - Skipped: " + numSkipped;
            }
            if (numConflicted > 0) {
                if (groupActivity.status !== ActivityStatus_1.default.InProgress) {
                    groupActivity.status = ActivityStatus_1.default.Attention;
                }
                groupActivity.message += " - Unresolved Conflicts: " + numConflicted;
            }
            switch (dataProcessor.iteratorStatus()) {
                case IteratorStatus_1.default.Paused:
                    var resumeInfo = dataProcessor.iteratorResumeInfo();
                    groupActivity.title = "Remote iteration paused: " + resumeInfo.reason;
                    groupActivity.actions.push(resumeInfo.action);
                    groupActivity.status = ActivityStatus_1.default.Attention;
                    break;
                case IteratorStatus_1.default.Resuming:
                    groupActivity.title = "Remote iteration resuming... ";
                    groupActivity.status = ActivityStatus_1.default.InProgress;
            }
        }
    };
    /**
     * @override from JobGroup.ts
     */
    BlobDownloadGroupManage.prototype._jobIsComplete = function (state) {
        return state === BlobDownloadState_1.default.Complete || state === BlobDownloadState_1.default.Canceled || state === BlobDownloadState_1.default.Skipped;
    };
    /**
     * @override from JobGroup.ts
     */
    BlobDownloadGroupManage.prototype._createIssueActivity = function (issueMessage, details) {
        var activity = {
            parent: null,
            title: issueMessage,
            message: "",
            sortOrder: 1,
            status: ActivityStatus_1.default.Error,
            progress: 0,
            actions: [
                {
                    title: "Details...",
                    args: {
                        providerNamespace: "Activities.handleError",
                        providerArgs: { error: JSON.stringify(details, null, 2) }
                    }
                }
            ]
        };
        return activity;
    };
    /**
     * @override from JobGroup.ts
     */
    BlobDownloadGroupManage.prototype._retryAll = function (dataProcessor) {
        var individualStats = dataProcessor.getIndividualStats();
        for (var statRef in individualStats) {
            if (individualStats[statRef].state === BlobDownloadState_1.default.Failed && !!individualStats[statRef].activityRef) {
                this._activityManager.executeAction(individualStats[statRef].activityRef, { title: "Retry" });
            }
        }
        return Promise.resolve(undefined);
    };
    return BlobDownloadGroupManage;
}(JobGroupManager_1.default));
exports.default = BlobDownloadGroupManage;

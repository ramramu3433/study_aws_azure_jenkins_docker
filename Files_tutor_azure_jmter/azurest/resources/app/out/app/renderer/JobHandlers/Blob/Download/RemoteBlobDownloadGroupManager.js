"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var RemoteBlobDownloadGroupManager = (function () {
    function RemoteBlobDownloadGroupManager(host) {
        this._host = host;
    }
    RemoteBlobDownloadGroupManager.prototype.addJobs = function (groupRef, state, num) {
        return this._host.executeOperation("BlobDownloadGroupManager.addJobs", { groupRef: groupRef, state: state, num: num });
    };
    RemoteBlobDownloadGroupManager.prototype.addJob = function (groupRef, state) {
        return this._host.executeOperation("BlobDownloadGroupManager.addJob", { groupRef: groupRef, state: state });
    };
    RemoteBlobDownloadGroupManager.prototype.setJobActivityRef = function (groupRef, statsRef, activityRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.setJobActivityRef", { groupRef: groupRef, statsRef: statsRef, activityRef: activityRef });
    };
    RemoteBlobDownloadGroupManager.prototype.retryAll = function (groupRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.retryAll", { groupRef: groupRef });
    };
    RemoteBlobDownloadGroupManager.prototype.updateState = function (groupRef, statsRef, state) {
        return this._host.executeOperation("BlobDownloadGroupManager.updateState", { groupRef: groupRef, statsRef: statsRef, state: state });
    };
    RemoteBlobDownloadGroupManager.prototype.isCanceled = function (groupRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.isCanceled", { groupRef: groupRef });
    };
    RemoteBlobDownloadGroupManager.prototype.cancelGroup = function (groupRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.cancelGroup", { groupRef: groupRef });
    };
    RemoteBlobDownloadGroupManager.prototype.markIteratorComplete = function (groupRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.markIteratorComplete", { groupRef: groupRef });
    };
    RemoteBlobDownloadGroupManager.prototype.markIteratorPaused = function (groupRef, reason, resumeAction) {
        return this._host.executeOperation("BlobDownloadGroupManager.markIteratorPaused", { groupRef: groupRef, reason: reason, resumeAction: resumeAction });
    };
    RemoteBlobDownloadGroupManager.prototype.markIteratorResumed = function (groupRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.markIteratorResumed", { groupRef: groupRef });
    };
    RemoteBlobDownloadGroupManager.prototype.markIteratorResuming = function (groupRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.markIteratorResuming", { groupRef: groupRef });
    };
    RemoteBlobDownloadGroupManager.prototype.iteratorStatus = function (groupRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.iteratorStatus", { groupRef: groupRef });
    };
    RemoteBlobDownloadGroupManager.prototype.initGroup = function (groupActivityRef) {
        return this._host.executeOperation("BlobDownloadGroupManager.initGroup", { groupActivityRef: groupActivityRef });
    };
    RemoteBlobDownloadGroupManager.prototype.handleConflict = function (groupRef, policy, values) {
        return this._host.executeOperation("BlobDownloadGroupManager.handleConflict", { groupRef: groupRef, policy: policy, values: values });
    };
    RemoteBlobDownloadGroupManager.prototype.getPolicy = function (groupRef, policy) {
        return this._host.executeOperation("BlobDownloadGroupManager.getPolicy", { groupRef: groupRef, policy: policy });
    };
    RemoteBlobDownloadGroupManager.prototype.reportIssue = function (groupRef, issueMessage) {
        return this._host.executeOperation("BlobUploadGroupManager.reportIssue", { groupRef: groupRef, issueMessage: issueMessage });
    };
    return RemoteBlobDownloadGroupManager;
}());
exports.default = RemoteBlobDownloadGroupManager;

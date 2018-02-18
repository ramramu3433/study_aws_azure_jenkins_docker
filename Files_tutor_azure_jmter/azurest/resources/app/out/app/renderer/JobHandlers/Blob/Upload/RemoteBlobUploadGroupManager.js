"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var RemoteBlobUploadGroupManager = (function () {
    function RemoteBlobUploadGroupManager(host) {
        this._host = host;
    }
    RemoteBlobUploadGroupManager.prototype.addJobs = function (groupRef, state, num) {
        return this._host.executeOperation("BlobUploadGroupManager.addJobs", { groupRef: groupRef, state: state, num: num });
    };
    RemoteBlobUploadGroupManager.prototype.addJob = function (groupRef, state) {
        return this._host.executeOperation("BlobUploadGroupManager.addJob", { groupRef: groupRef, state: state });
    };
    RemoteBlobUploadGroupManager.prototype.setJobActivityRef = function (groupRef, statsRef, activityRef) {
        return this._host.executeOperation("BlobUploadGroupManager.setJobActivityRef", { groupRef: groupRef, statsRef: statsRef, activityRef: activityRef });
    };
    RemoteBlobUploadGroupManager.prototype.retryAll = function (groupRef) {
        return this._host.executeOperation("BlobUploadGroupManager.retryAll", { groupRef: groupRef });
    };
    RemoteBlobUploadGroupManager.prototype.updateState = function (groupRef, statsRef, state) {
        return this._host.executeOperation("BlobUploadGroupManager.updateState", { groupRef: groupRef, statsRef: statsRef, state: state });
    };
    RemoteBlobUploadGroupManager.prototype.isCanceled = function (groupRef) {
        return this._host.executeOperation("BlobUploadGroupManager.isCanceled", { groupRef: groupRef });
    };
    RemoteBlobUploadGroupManager.prototype.cancelGroup = function (groupRef) {
        return this._host.executeOperation("BlobUploadGroupManager.cancelGroup", { groupRef: groupRef });
    };
    RemoteBlobUploadGroupManager.prototype.markIteratorComplete = function (groupRef) {
        return this._host.executeOperation("BlobUploadGroupManager.markIteratorComplete", { groupRef: groupRef });
    };
    RemoteBlobUploadGroupManager.prototype.markIteratorPaused = function (groupRef, reason, resumeAction) {
        return this._host.executeOperation("BlobUploadGroupManager.markIteratorPaused", { groupRef: groupRef, reason: reason, resumeAction: resumeAction });
    };
    RemoteBlobUploadGroupManager.prototype.markIteratorResumed = function (groupRef) {
        return this._host.executeOperation("BlobUploadGroupManager.markIteratorResumed", { groupRef: groupRef });
    };
    RemoteBlobUploadGroupManager.prototype.markIteratorResuming = function (groupRef) {
        return this._host.executeOperation("BlobUploadGroupManager.markIteratorResuming", { groupRef: groupRef });
    };
    RemoteBlobUploadGroupManager.prototype.iteratorStatus = function (groupRef) {
        return this._host.executeOperation("BlobUploadGroupManager.iteratorStatus", { groupRef: groupRef });
    };
    RemoteBlobUploadGroupManager.prototype.initGroup = function (groupActivityRef) {
        return this._host.executeOperation("BlobUploadGroupManager.initGroup", { groupActivityRef: groupActivityRef });
    };
    RemoteBlobUploadGroupManager.prototype.handleConflict = function (groupRef, policy, values) {
        return this._host.executeOperation("BlobUploadGroupManager.handleConflict", { groupRef: groupRef, policy: policy, values: values });
    };
    RemoteBlobUploadGroupManager.prototype.getPolicy = function (groupRef, policy) {
        return this._host.executeOperation("BlobUploadGroupManager.getPolicy", { groupRef: groupRef, policy: policy });
    };
    RemoteBlobUploadGroupManager.prototype.reportIssue = function (groupRef, issueMessage, details) {
        return this._host.executeOperation("BlobUploadGroupManager.reportIssue", { groupRef: groupRef, issueMessage: issueMessage, details: details });
    };
    return RemoteBlobUploadGroupManager;
}());
exports.default = RemoteBlobUploadGroupManager;

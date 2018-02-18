"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid/v1");
var IteratorStatus_1 = require("./IteratorStatus");
var JobGroupDataProcessor = (function () {
    function JobGroupDataProcessor(data) {
        this._data = data;
    }
    JobGroupDataProcessor.prototype.addJob = function (state) {
        var newUid = uuid();
        var stateString = state;
        this._data.numJobs++;
        this._data.individualStats[newUid] = {
            state: state,
            activityRef: null
        };
        if (!this._data.stateCounts[stateString]) {
            this._data.stateCounts[stateString] = 0;
        }
        this._data.stateCounts[stateString]++;
        return { id: newUid };
    };
    JobGroupDataProcessor.prototype.getIndividualStats = function () {
        return this._data.individualStats;
    };
    JobGroupDataProcessor.prototype.setJobActivityRef = function (statsRef, activityRef) {
        if (!!this._data.individualStats[statsRef.id]) {
            this._data.individualStats[statsRef.id].activityRef = activityRef;
        }
    };
    JobGroupDataProcessor.prototype.updateJob = function (statsRef, newState, jobComplete) {
        if (!!this._data.individualStats[statsRef.id]) {
            var newStateString = newState;
            var prevStateString = this._data.individualStats[statsRef.id].state;
            if (newStateString === prevStateString) {
                return false;
            }
            this._data.individualStats[statsRef.id].state = newState;
            this._data.stateCounts[prevStateString]--;
            if (!this._data.stateCounts[newStateString]) {
                this._data.stateCounts[newStateString] = 0;
            }
            this._data.stateCounts[newStateString]++;
            if (jobComplete) {
                delete this._data.individualStats[statsRef.id];
            }
            return true;
        }
        return false;
    };
    JobGroupDataProcessor.prototype.cancelGroup = function () {
        this._data.canceled = true;
    };
    JobGroupDataProcessor.prototype.groupIsCancelled = function () {
        return this._data.canceled;
    };
    JobGroupDataProcessor.prototype.markIteratorPaused = function (reason, resumeAction) {
        this._data.iteratorStatus = IteratorStatus_1.default.Paused;
        this._data.resumeIteratorAction = resumeAction;
        this._data.reasonIteratorPaused = reason;
    };
    JobGroupDataProcessor.prototype.markIteratorResuming = function () {
        this._data.iteratorStatus = IteratorStatus_1.default.Resuming;
        this._data.resumeIteratorAction = null;
        this._data.reasonIteratorPaused = null;
    };
    JobGroupDataProcessor.prototype.markIteratorResumed = function () {
        this._data.iteratorStatus = IteratorStatus_1.default.Processing;
    };
    JobGroupDataProcessor.prototype.markIteratorComplete = function () {
        this._data.iteratorStatus = IteratorStatus_1.default.Complete;
    };
    JobGroupDataProcessor.prototype.iteratorStatus = function () {
        return this._data.iteratorStatus;
    };
    JobGroupDataProcessor.prototype.iteratorResumeInfo = function () {
        return { reason: this._data.reasonIteratorPaused, action: this._data.resumeIteratorAction };
    };
    JobGroupDataProcessor.prototype.numJobs = function () {
        return this._data.numJobs;
    };
    JobGroupDataProcessor.prototype.numJobsWithState = function (state) {
        var stateString = state;
        if (!this._data.stateCounts[stateString]) {
            this._data.stateCounts[stateString] = 0;
        }
        return this._data.stateCounts[stateString];
    };
    JobGroupDataProcessor.prototype.getGroupActivityRef = function () {
        return this._data.groupActivityRef;
    };
    JobGroupDataProcessor.prototype.setGroupActivityRef = function (activityRef) {
        return this._data.groupActivityRef = activityRef;
    };
    JobGroupDataProcessor.prototype.getStartTime = function () {
        return this._data.startTime;
    };
    JobGroupDataProcessor.prototype.incrementIssueCount = function () {
        this._data.issues++;
    };
    JobGroupDataProcessor.prototype.numIssues = function () {
        return this._data.issues;
    };
    return JobGroupDataProcessor;
}());
exports.default = JobGroupDataProcessor;

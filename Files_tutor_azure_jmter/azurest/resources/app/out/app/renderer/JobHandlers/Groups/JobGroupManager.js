"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var JobGroupDataProcessor_1 = require("../Groups/JobGroupDataProcessor");
var uuid = require("uuid/v1");
var IteratorStatus_1 = require("./IteratorStatus");
var JobGroupManager = (function () {
    function JobGroupManager(activityManager, host) {
        var _this = this;
        this._applyToAllValue = "applyToAll";
        this._activityManager = activityManager;
        this._host = host;
        this._groups = {};
        this._updateActivitiesTimeout = setTimeout(function () {
            _this._updateDirtyGroups();
        }, JobGroupManager._timeoutInterval);
    }
    JobGroupManager.prototype._updateDirtyGroups = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises, groupId, group;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        for (groupId in this._groups) {
                            group = this._groups[groupId];
                            if (group.dirty) {
                                promises.push(this._updateGroupActivity(groupId)
                                    .then(function () {
                                    _this._markDataClean(groupId);
                                }));
                            }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        this._updateActivitiesTimeout = setTimeout(function () {
                            _this._updateDirtyGroups();
                        }, JobGroupManager._timeoutInterval);
                        return [2 /*return*/];
                }
            });
        });
    };
    JobGroupManager.prototype._getData = function (groupId) {
        return this._groups[groupId].data;
    };
    JobGroupManager.prototype._markDataDirty = function (groupId) {
        return this._groups[groupId].dirty = true;
    };
    JobGroupManager.prototype._markDataClean = function (groupId) {
        return this._groups[groupId].dirty = false;
    };
    JobGroupManager.prototype.addJobs = function (groupRef, state, num) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor, refs, i;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                refs = [];
                for (i = 0; i < num; i++) {
                    refs.push(dataProcessor.addJob(state));
                }
                this._markDataDirty(groupRef.id);
                return [2 /*return*/, refs];
            });
        });
    };
    JobGroupManager.prototype.addJob = function (groupRef, state) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor, ref;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                ref = dataProcessor.addJob(state);
                this._markDataDirty(groupRef.id);
                return [2 /*return*/, ref];
            });
        });
    };
    JobGroupManager.prototype.setJobActivityRef = function (groupRef, statsRef, activityRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                dataProcessor.setJobActivityRef(statsRef, activityRef);
                return [2 /*return*/];
            });
        });
    };
    JobGroupManager.prototype.retryAll = function (groupRef) {
        var dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
        return this._retryAll(dataProcessor);
    };
    JobGroupManager.prototype.updateState = function (groupRef, statsRef, state) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor, jobStateChanged;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                jobStateChanged = dataProcessor.updateJob(statsRef, state, this._jobIsComplete(state));
                if (jobStateChanged) {
                    this._markDataDirty(groupRef.id);
                }
                return [2 /*return*/];
            });
        });
    };
    JobGroupManager.prototype.isCanceled = function (groupRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                return [2 /*return*/, dataProcessor.groupIsCancelled()];
            });
        });
    };
    JobGroupManager.prototype.cancelGroup = function (groupRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                dataProcessor.cancelGroup();
                this._markDataDirty(groupRef.id);
                return [2 /*return*/];
            });
        });
    };
    JobGroupManager.prototype.initGroup = function (groupActivityRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data, groupRef;
            return tslib_1.__generator(this, function (_a) {
                data = {
                    stateCounts: {},
                    individualStats: {},
                    numJobs: 0,
                    canceled: false,
                    iteratorStatus: IteratorStatus_1.default.Processing,
                    groupActivityRef: groupActivityRef,
                    startTime: Date.now(),
                    issues: 0,
                    resumeIteratorAction: null,
                    reasonIteratorPaused: null
                };
                groupRef = {
                    id: uuid()
                };
                this._groups[groupRef.id] = {
                    data: data,
                    dirty: true
                };
                return [2 /*return*/, groupRef];
            });
        });
    };
    JobGroupManager.prototype.reportIssue = function (groupRef, issueMessage, details) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor, groupActivityRef, childIssueActivity;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                        dataProcessor.incrementIssueCount();
                        groupActivityRef = dataProcessor.getGroupActivityRef();
                        childIssueActivity = this._createIssueActivity(issueMessage, details);
                        if (!!!childIssueActivity) return [3 /*break*/, 2];
                        childIssueActivity.parent = groupActivityRef;
                        return [4 /*yield*/, this._activityManager.add(childIssueActivity)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this._markDataDirty(groupRef.id);
                        return [2 /*return*/];
                }
            });
        });
    };
    JobGroupManager.prototype._updateGroupActivity = function (groupId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor, groupActivity, oldActivity, newActivity, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupId));
                        if (!!!dataProcessor.getGroupActivityRef()) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this._activityManager.get(dataProcessor.getGroupActivityRef())];
                    case 2:
                        groupActivity = _a.sent();
                        oldActivity = JSON.stringify(groupActivity);
                        this._updateActivity({ id: groupId }, groupActivity, dataProcessor);
                        newActivity = JSON.stringify(groupActivity);
                        if (!(oldActivity !== newActivity)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._activityManager.update(dataProcessor.getGroupActivityRef(), groupActivity)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        // someone deleted the activity on us
                        dataProcessor.setGroupActivityRef(null);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    JobGroupManager.prototype.markIteratorPaused = function (groupRef, reason, resumeAction) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                dataProcessor.markIteratorPaused(reason, resumeAction);
                this._markDataDirty(groupRef.id);
                return [2 /*return*/];
            });
        });
    };
    JobGroupManager.prototype.markIteratorResumed = function (groupRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                dataProcessor.markIteratorResumed();
                this._markDataDirty(groupRef.id);
                return [2 /*return*/];
            });
        });
    };
    JobGroupManager.prototype.markIteratorComplete = function (groupRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                dataProcessor.markIteratorComplete();
                this._markDataDirty(groupRef.id);
                return [2 /*return*/];
            });
        });
    };
    JobGroupManager.prototype.markIteratorResuming = function (groupRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                dataProcessor.markIteratorResuming();
                this._markDataDirty(groupRef.id);
                return [2 /*return*/];
            });
        });
    };
    JobGroupManager.prototype.iteratorStatus = function (groupRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataProcessor;
            return tslib_1.__generator(this, function (_a) {
                dataProcessor = new JobGroupDataProcessor_1.default(this._getData(groupRef.id));
                return [2 /*return*/, dataProcessor.iteratorStatus()];
            });
        });
    };
    return JobGroupManager;
}());
JobGroupManager._timeoutInterval = 2.5 * 1000;
exports.default = JobGroupManager;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ActivityStatus_1 = require("../../../Components/Activities/ActivityStatus");
var BlobDownloadState_1 = require("./BlobDownloadState");
var IteratorStatus_1 = require("../../Groups/IteratorStatus");
var BlobDownloadJobQueuer = (function () {
    function BlobDownloadJobQueuer(activityManager, group) {
        var _this = this;
        this.queue = { name: "download" };
        this.preProcess = function (item) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(item.type === "Iterator")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._preProcessIterator(item)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this._preProcessJob(item)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this._activityManager = activityManager;
        this._group = group;
    }
    BlobDownloadJobQueuer.prototype._preProcessJob = function (job) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var activity, activityRef, oldActivity, statsId, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        activity = this._createQueueActivity(job);
                        activityRef = job.properties.activityRef;
                        if (!!!activityRef) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._activityManager.get(job.properties.activityRef)];
                    case 1:
                        oldActivity = _b.sent();
                        if (!!!oldActivity) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._activityManager.update(job.properties.activityRef, activity)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        activityRef = null;
                        _b.label = 4;
                    case 4:
                        if (!!activityRef) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._activityManager.add(activity)];
                    case 5:
                        activityRef = _b.sent();
                        _b.label = 6;
                    case 6:
                        job.properties.activityRef = activityRef;
                        if (!!!job.properties.groupRef) return [3 /*break*/, 12];
                        statsId = job.properties.statsRef;
                        if (!!!statsId) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._group.updateState(job.properties.groupRef, statsId, BlobDownloadState_1.default.WaitingToStart)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        _a = job.properties;
                        return [4 /*yield*/, this._group.addJob(job.properties.groupRef, BlobDownloadState_1.default.WaitingToStart)];
                    case 9:
                        _a.statsRef = _b.sent();
                        _b.label = 10;
                    case 10: return [4 /*yield*/, this._group.setJobActivityRef(job.properties.groupRef, job.properties.statsRef, job.properties.activityRef)];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12: return [2 /*return*/, job];
                }
            });
        });
    };
    BlobDownloadJobQueuer.prototype._preProcessIterator = function (iterator) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var activity, _a, _b, status;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        activity = this._createGroupActivity(iterator);
                        if (!!iterator.properties.activityRef) return [3 /*break*/, 2];
                        _a = iterator.properties;
                        return [4 /*yield*/, this._activityManager.add(activity)];
                    case 1:
                        _a.activityRef = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!!iterator.properties.groupRef) return [3 /*break*/, 4];
                        _b = iterator.properties;
                        return [4 /*yield*/, this._group.initGroup(iterator.properties.activityRef)];
                    case 3:
                        _b.groupRef = _c.sent();
                        _c.label = 4;
                    case 4: return [4 /*yield*/, this._group.iteratorStatus(iterator.properties.groupRef)];
                    case 5:
                        status = _c.sent();
                        if (!(status === IteratorStatus_1.default.Paused)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._group.markIteratorResuming(iterator.properties.groupRef)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7: return [2 /*return*/, iterator];
                }
            });
        });
    };
    BlobDownloadJobQueuer.prototype._createGroupActivity = function (iterator) {
        var activity = {
            parent: iterator.properties.parent,
            title: "Queued Download Group",
            message: "",
            sortOrder: 1,
            status: ActivityStatus_1.default.Pending,
            progress: 0,
            actions: []
        };
        return activity;
    };
    BlobDownloadJobQueuer.prototype._createQueueActivity = function (job) {
        var activity = {
            parent: job.properties.parentActivityRef,
            title: "Queued Download: '" + job.properties.args.blobRef.fileName + "'",
            message: "",
            sortOrder: 1,
            status: ActivityStatus_1.default.Pending,
            progress: 0,
            actions: []
        };
        return activity;
    };
    return BlobDownloadJobQueuer;
}());
exports.default = BlobDownloadJobQueuer;

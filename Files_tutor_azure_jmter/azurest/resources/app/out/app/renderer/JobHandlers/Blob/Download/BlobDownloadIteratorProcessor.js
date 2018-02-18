"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BlobQueryHandler_1 = require("../BlobQueryHandler");
var BlobDownloadState_1 = require("./BlobDownloadState");
var path = require("path");
var LocalFileOverwriteOptions_1 = require("../../Local/LocalFileOverwriteOptions");
var BlobDownload_1 = require("./BlobDownload");
var ActivityStatus_1 = require("../../../Components/Activities/ActivityStatus");
var ConnectionString_1 = require("../../../Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var BlobDownloadIteratorProcessor = (function () {
    function BlobDownloadIteratorProcessor(group, activityManager, host) {
        this._group = group;
        this._activityManager = activityManager;
        this._host = host;
    }
    BlobDownloadIteratorProcessor.prototype.process = function (iterator) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var groupRef, downloadGroupArgs, jobsToQueue, jobsToSkip, groupCanceled, parsedConnectionString, blobEndpoint, connectedToInternet, _a, overwritePolicy, _b, nextJob, localPath, _c, hasNext, newStatsRef, i, i, activity;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        groupRef = iterator.properties.groupRef;
                        downloadGroupArgs = iterator.properties.args;
                        jobsToQueue = [];
                        jobsToSkip = [];
                        return [4 /*yield*/, this._group.isCanceled(groupRef)];
                    case 1:
                        groupCanceled = _d.sent();
                        if (!!groupCanceled) return [3 /*break*/, 26];
                        parsedConnectionString = new ConnectionString_1.default(downloadGroupArgs.blobContainerRef.connectionString);
                        blobEndpoint = parsedConnectionString.blobEndpoint;
                        _a = !blobEndpoint;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._host.executeOperation("Environment.Network.isConnected", { url: parsedConnectionString.blobEndpoint })];
                    case 2:
                        _a = (_d.sent());
                        _d.label = 3;
                    case 3:
                        connectedToInternet = _a;
                        if (!!connectedToInternet) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._group.markIteratorPaused(groupRef, "Unable to resolve: " + parsedConnectionString.blobEndpoint, {
                                title: "Resume",
                                args: {
                                    providerNamespace: "JobQueueManager.addIterator",
                                    providerArgs: { iterator: iterator, queue: { name: "download" } }
                                }
                            })];
                    case 4:
                        _d.sent();
                        iterator = null;
                        return [3 /*break*/, 25];
                    case 5:
                        this._blobQueryHandler = new BlobQueryHandler_1.default(downloadGroupArgs.blobQuery, downloadGroupArgs.blobContainerRef);
                        return [4 /*yield*/, this._getGroupOverwritePolicy(iterator)];
                    case 6:
                        overwritePolicy = _d.sent();
                        return [4 /*yield*/, this._group.markIteratorResumed(groupRef)];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        _b = (jobsToQueue.length + jobsToSkip.length) <= 50;
                        if (!_b) return [3 /*break*/, 10];
                        return [4 /*yield*/, this._blobQueryHandler.hasNext()];
                    case 9:
                        _b = (_d.sent());
                        _d.label = 10;
                    case 10:
                        if (!_b) return [3 /*break*/, 14];
                        return [4 /*yield*/, this._nextJob(downloadGroupArgs, iterator)];
                    case 11:
                        nextJob = _d.sent();
                        nextJob.properties.parentActivityRef = iterator.properties.activityRef;
                        nextJob.properties.groupRef = groupRef;
                        localPath = path.join(downloadGroupArgs.localPath, path.relative(nextJob.properties.args.baseLocalPath, nextJob.properties.args.relativePath));
                        _c = overwritePolicy === LocalFileOverwriteOptions_1.default.Skip;
                        if (!_c) return [3 /*break*/, 13];
                        return [4 /*yield*/, BlobDownload_1.default.localFileExists(localPath)];
                    case 12:
                        _c = (_d.sent());
                        _d.label = 13;
                    case 13:
                        if (_c) {
                            jobsToSkip.push(nextJob);
                        }
                        else {
                            jobsToQueue.push(nextJob);
                        }
                        return [3 /*break*/, 8];
                    case 14: return [4 /*yield*/, this._blobQueryHandler.hasNext()];
                    case 15:
                        hasNext = _d.sent();
                        if (!hasNext) return [3 /*break*/, 16];
                        iterator.properties.args.blobQuery = this._blobQueryHandler.getNextQuery();
                        return [3 /*break*/, 18];
                    case 16:
                        iterator = null;
                        return [4 /*yield*/, this._group.markIteratorComplete(groupRef)];
                    case 17:
                        _d.sent();
                        _d.label = 18;
                    case 18:
                        if (!(jobsToQueue.length > 0)) return [3 /*break*/, 20];
                        return [4 /*yield*/, this._group.addJobs(groupRef, BlobDownloadState_1.default.WaitingToStart, jobsToQueue.length)];
                    case 19:
                        newStatsRef = _d.sent();
                        for (i = 0; i < jobsToQueue.length; i++) {
                            jobsToQueue[i].properties.statsRef = newStatsRef[i];
                        }
                        _d.label = 20;
                    case 20:
                        if (!(jobsToSkip.length > 0)) return [3 /*break*/, 25];
                        return [4 /*yield*/, this._group.addJobs(groupRef, BlobDownloadState_1.default.Skipped, jobsToSkip.length)];
                    case 21:
                        _d.sent();
                        i = 0;
                        _d.label = 22;
                    case 22:
                        if (!(i < jobsToSkip.length)) return [3 /*break*/, 25];
                        activity = this._createSkippedActivity(jobsToSkip[i]);
                        return [4 /*yield*/, this._activityManager.add(activity)];
                    case 23:
                        _d.sent();
                        _d.label = 24;
                    case 24:
                        i++;
                        return [3 /*break*/, 22];
                    case 25: return [3 /*break*/, 28];
                    case 26:
                        iterator = null;
                        return [4 /*yield*/, this._group.markIteratorComplete(groupRef)];
                    case 27:
                        _d.sent();
                        _d.label = 28;
                    case 28: return [2 /*return*/, { jobs: jobsToQueue, newIterator: iterator }];
                }
            });
        });
    };
    BlobDownloadIteratorProcessor.prototype._nextJob = function (downloadGroupArgs, iterator) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var hasNext, blobRef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._blobQueryHandler.hasNext()];
                    case 1:
                        hasNext = _a.sent();
                        if (!hasNext) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._blobQueryHandler.getNext()];
                    case 2:
                        blobRef = _a.sent();
                        return [2 /*return*/, this.blobRefToJob(downloadGroupArgs, iterator, blobRef)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BlobDownloadIteratorProcessor.prototype.blobRefToJob = function (downloadGroupArgs, iterator, blobRef) {
        var downloadArgs = {
            blobContainerRef: downloadGroupArgs.blobContainerRef,
            blobRef: blobRef,
            baseLocalPath: downloadGroupArgs.localPath,
            relativePath: path.relative(downloadGroupArgs.sourceFolder, blobRef.fileName),
            localOverwritePolicy: undefined,
            openFile: false,
            unsafeNameDetectedPolicy: undefined
        };
        var job = {
            type: "Job",
            properties: {
                parentActivityRef: iterator.properties.activityRef,
                args: downloadArgs
            }
        };
        return job;
    };
    BlobDownloadIteratorProcessor.prototype._getGroupOverwritePolicy = function (iterator) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var overwritePolicy;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!BlobDownloadIteratorProcessor.overwritePolicyCache[iterator.properties.groupRef.id]) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._group.getPolicy(iterator.properties.groupRef, "localOverwritePolicy")];
                    case 1:
                        overwritePolicy = _a.sent();
                        if (!!overwritePolicy) {
                            BlobDownloadIteratorProcessor.overwritePolicyCache[iterator.properties.groupRef.id] = overwritePolicy;
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, BlobDownloadIteratorProcessor.overwritePolicyCache[iterator.properties.groupRef.id]];
                }
            });
        });
    };
    BlobDownloadIteratorProcessor.prototype._createSkippedActivity = function (job) {
        var activity = {
            parent: job.properties.parentActivityRef,
            title: "Skipped Download '" + job.properties.args.blobRef.fileName + "'",
            sortOrder: 1,
            progress: 0,
            message: "",
            status: ActivityStatus_1.default.Info,
            actions: []
        };
        return activity;
    };
    return BlobDownloadIteratorProcessor;
}());
BlobDownloadIteratorProcessor.overwritePolicyCache = {};
exports.default = BlobDownloadIteratorProcessor;

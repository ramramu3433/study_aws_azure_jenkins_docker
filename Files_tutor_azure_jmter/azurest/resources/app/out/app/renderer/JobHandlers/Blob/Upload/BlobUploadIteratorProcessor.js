"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var LocalFileQueryHandler_1 = require("../../Local/LocalFileQueryHandler");
var BlobType_1 = require("../BlobType");
var path = require("path");
var BlobUploadState_1 = require("./BlobUploadState");
var BlobOverwriteOptions_1 = require("../BlobOverwriteOptions");
var ConnectionString_1 = require("../../../Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var BlobUploadIteratorProcessor = (function () {
    function BlobUploadIteratorProcessor(group, host) {
        this._group = group;
        this._host = host;
    }
    BlobUploadIteratorProcessor.prototype.process = function (iterator) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var sharedDataRef, uploadGroupArgs, jobs, groupCanceled, parsedConnectionString, blobEndpoint, connectedToInternet, _a, _b, nextJob, err_1, friendlyMessage, hasNext, newStatsRefs, i;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sharedDataRef = iterator.properties.groupRef;
                        uploadGroupArgs = iterator.properties.args;
                        jobs = [];
                        return [4 /*yield*/, this._group.isCanceled(sharedDataRef)];
                    case 1:
                        groupCanceled = _c.sent();
                        if (!!groupCanceled) return [3 /*break*/, 21];
                        parsedConnectionString = new ConnectionString_1.default(uploadGroupArgs.blobContainerRef.connectionString);
                        blobEndpoint = parsedConnectionString.blobEndpoint;
                        _a = !blobEndpoint;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._host.executeOperation("Environment.Network.isConnected", { url: parsedConnectionString.blobEndpoint })];
                    case 2:
                        _a = (_c.sent());
                        _c.label = 3;
                    case 3:
                        connectedToInternet = _a;
                        if (!!connectedToInternet) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._group.markIteratorPaused(sharedDataRef, "Unable to resolve: " + parsedConnectionString.blobEndpoint, {
                                title: "Resume",
                                args: {
                                    providerNamespace: "JobQueueManager.addIterator",
                                    providerArgs: { iterator: iterator, queue: { name: "upload" } }
                                }
                            })];
                    case 4:
                        _c.sent();
                        iterator = null;
                        return [3 /*break*/, 20];
                    case 5:
                        this._localFileQueryHandler = new LocalFileQueryHandler_1.default(uploadGroupArgs.localFileQuery);
                        return [4 /*yield*/, this._group.markIteratorResumed(sharedDataRef)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _b = jobs.length <= 50;
                        if (!_b) return [3 /*break*/, 9];
                        return [4 /*yield*/, this._localFileQueryHandler.hasNext()];
                    case 8:
                        _b = (_c.sent());
                        _c.label = 9;
                    case 9:
                        if (!_b) return [3 /*break*/, 14];
                        _c.label = 10;
                    case 10:
                        _c.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this._nextJob(uploadGroupArgs, iterator)];
                    case 11:
                        nextJob = _c.sent();
                        if (!nextJob) {
                            return [3 /*break*/, 14];
                        }
                        nextJob.properties.parentActivityRef = iterator.properties.activityRef;
                        nextJob.properties.groupRef = sharedDataRef;
                        jobs.push(nextJob);
                        return [3 /*break*/, 13];
                    case 12:
                        err_1 = _c.sent();
                        friendlyMessage = !!err_1.path ? "Unable to access '" + err_1.path + "'" : "Issue while iterating local files";
                        this._group.reportIssue(sharedDataRef, friendlyMessage, err_1);
                        return [3 /*break*/, 13];
                    case 13: return [3 /*break*/, 7];
                    case 14: return [4 /*yield*/, this._localFileQueryHandler.hasNext()];
                    case 15:
                        hasNext = _c.sent();
                        if (!hasNext) return [3 /*break*/, 16];
                        uploadGroupArgs.localFileQuery = this._localFileQueryHandler.getNextQuery();
                        return [3 /*break*/, 18];
                    case 16:
                        iterator = null;
                        return [4 /*yield*/, this._group.markIteratorComplete(sharedDataRef)];
                    case 17:
                        _c.sent();
                        _c.label = 18;
                    case 18:
                        if (!(jobs.length > 0)) return [3 /*break*/, 20];
                        return [4 /*yield*/, this._group.addJobs(sharedDataRef, BlobUploadState_1.default.WaitingToStart, jobs.length)];
                    case 19:
                        newStatsRefs = _c.sent();
                        for (i = 0; i < jobs.length; i++) {
                            jobs[i].properties.statsRef = newStatsRefs[i];
                        }
                        _c.label = 20;
                    case 20: return [3 /*break*/, 23];
                    case 21:
                        iterator = null;
                        return [4 /*yield*/, this._group.markIteratorComplete(sharedDataRef)];
                    case 22:
                        _c.sent();
                        _c.label = 23;
                    case 23: return [2 /*return*/, { jobs: jobs, newIterator: iterator }];
                }
            });
        });
    };
    BlobUploadIteratorProcessor.prototype._nextJob = function (uploadGroupArgs, iterator) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var hasNext, blobRef, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._localFileQueryHandler.hasNext()];
                    case 1:
                        hasNext = _a.sent();
                        if (!hasNext) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._localFileQueryHandler.getNext()];
                    case 3:
                        blobRef = _a.sent();
                        if (!!blobRef) {
                            return [2 /*return*/, this.localFileRefToJob(uploadGroupArgs, iterator, blobRef)];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _a.sent();
                        throw err_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BlobUploadIteratorProcessor.prototype.localFileRefToJob = function (uploadGroupArgs, iterator, localFileRef) {
        var blobType = uploadGroupArgs.defaultBlobType;
        if (uploadGroupArgs.autoDetectPageBlobs) {
            blobType = this._detectBlobTypeByExtension(localFileRef.path, uploadGroupArgs.defaultBlobType);
        }
        var uploadArgs = {
            blobContainerRef: uploadGroupArgs.blobContainerRef,
            localFilePath: localFileRef.path,
            blobType: blobType,
            baseBlobPath: uploadGroupArgs.destinationPath,
            relativeBlobPath: path.relative(uploadGroupArgs.commonPath, localFileRef.path),
            blobOverwritePolicy: BlobOverwriteOptions_1.default.AskToOverwrite,
            fileSize: localFileRef.size,
            encodedNameDetectedPolicy: undefined
        };
        var job = {
            type: "Job",
            properties: {
                args: uploadArgs
            }
        };
        return job;
    };
    BlobUploadIteratorProcessor.prototype._detectBlobTypeByExtension = function (filePath, defaultType) {
        var extension = path.extname(filePath);
        var extLower = extension.toLowerCase();
        // This logic can grow for more file extensions
        switch (extLower) {
            case ".vhd":
            case ".vhdx":
                return BlobType_1.default.Page;
        }
        return defaultType;
    };
    return BlobUploadIteratorProcessor;
}());
exports.default = BlobUploadIteratorProcessor;

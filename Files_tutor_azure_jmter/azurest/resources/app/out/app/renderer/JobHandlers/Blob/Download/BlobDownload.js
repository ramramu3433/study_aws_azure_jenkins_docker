"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BlobUtilities_1 = require("../../../Azure/AzureStorage/Blobs/BlobUtilities");
var storageManagerHelper = require("../../../Azure/AzureStorage/StorageManagerHelper");
var flobManager = require("../../../Azure/AzureStorage/FlobManager");
var Q = require("q");
var fs = require("fs");
var os = require("os");
var path = require("path");
var ActivityStatus_1 = require("../../../Components/Activities/ActivityStatus");
var ExceptionSerialization_1 = require("../../../Components/Errors/ExceptionSerialization");
var WindowsSafeFileName_1 = require("../../../Components/WindowsSafeFileName/WindowsSafeFileName");
var HumanReadableSpeedSummary_1 = require("../../Common/HumanReadableSpeedSummary");
var BlobDownloadState_1 = require("./BlobDownloadState");
var BlobType_1 = require("../BlobType");
var BlobOverwriteOptions_1 = require("../BlobOverwriteOptions");
var LocalFileOverwriteOptions_1 = require("../../Local/LocalFileOverwriteOptions");
var OperationStatus_1 = require("../../../common/OperationStatus");
var UnsafeNameActions_1 = require("../../WindowsSafeFileNames/UnsafeName/UnsafeNameActions");
var ConnectionString_1 = require("../../../Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var Path = require("path");
var Mkdirp = require("mkdirp");
var BlobDownload = (function () {
    function BlobDownload(job, activityManager, host, groupManager, retryAttempt) {
        var _this = this;
        this._updateActivity = function () {
            switch (_this._state) {
                case BlobDownloadState_1.default.Complete:
                    var localPath = _this._getLocalPath();
                    _this._activity.title = "Downloaded '" + _this._args.blobRef.fileName + "' to '" + localPath + "'";
                    _this._activity.status = ActivityStatus_1.default.Success;
                    _this._activity.message = "";
                    _this._activity.actions = [
                        {
                            title: "Open Folder",
                            args: {
                                providerNamespace: "FileSystemProvider.showItemInFolder",
                                providerArgs: { path: localPath }
                            }
                        }
                    ];
                    break;
                case BlobDownloadState_1.default.Canceling:
                    _this._activity.title = "Canceling Download '" + _this._args.blobRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [];
                    _this._activity.message = "";
                    _this._activity.progress = null;
                    break;
                case BlobDownloadState_1.default.Canceled:
                    _this._activity.title = "Canceled Download '" + _this._args.blobRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Canceled;
                    _this._activity.message = "";
                    _this._activity.actions = [];
                    _this._activity.progress = null;
                    break;
                case BlobDownloadState_1.default.Failed:
                    _this._activity.title = "Failed To Download '" + _this._args.blobRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Error;
                    _this._activity.message = ExceptionSerialization_1.default.summarize(_this._error, false);
                    _this._activity.actions = [
                        {
                            title: "Details...",
                            args: {
                                providerNamespace: "Activities.handleError",
                                providerArgs: { error: ExceptionSerialization_1.default.serialize(_this._error) }
                            }
                        },
                        {
                            title: "Retry",
                            args: {
                                providerNamespace: "JobQueueManager.addJob",
                                providerArgs: {
                                    job: _this._job,
                                    queue: { name: "download" }
                                }
                            }
                        }
                    ];
                    break;
                case BlobDownloadState_1.default.WaitingToStart:
                    _this._activity.title = "Queued download of '" + _this._args.blobRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Pending;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
                    _this._activity.progress = 0;
                    break;
                case BlobDownloadState_1.default.Starting:
                    _this._activity.title = "Initializing download of '" + _this._args.blobRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
                    _this._activity.progress = 0;
                    break;
                case BlobDownloadState_1.default.Active:
                    _this._activity.title = "Downloading '" + _this._args.blobRef.fileName + "'";
                    _this._activity.progress = _this._speedSummary.getPercent();
                    _this._activity.message = _this._speedSummary.getSummary();
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
                    break;
                case BlobDownloadState_1.default.Skipped:
                    _this._activity.title = "Skipped Download '" + _this._args.blobRef.fileName + "'";
                    _this._activity.progress = 0;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Info;
                    _this._activity.actions = [];
                    break;
                case BlobDownloadState_1.default.Opening:
                    _this._activity.title = "Opening '" + _this._args.blobRef.fileName + "'";
                    _this._activity.progress = 0;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [];
                    break;
                case BlobDownloadState_1.default.Conflicted:
                    _this._activity.title = "Unresolved download conflict for '" + _this._args.blobRef.fileName + "'";
                    _this._activity.progress = 0;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Attention;
                    _this._activity.actions = [
                        {
                            title: "Resolve Conflict",
                            args: {
                                providerNamespace: "JobQueueManager.addJob",
                                providerArgs: {
                                    job: _this._job,
                                    queue: { name: "download" }
                                }
                            }
                        }
                    ];
                    break;
                default:
                    _this._activity.title = "Unknown State '" + _this._args.blobRef.fileName + "'";
                    _this._activity.progress = null;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Error;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
            }
            switch (_this._state) {
                case BlobDownloadState_1.default.Complete:
                case BlobDownloadState_1.default.Failed:
                case BlobDownloadState_1.default.Canceled:
                case BlobDownloadState_1.default.Conflicted:
                    break;
                default:
                    if (!!_this._retryAttempt && _this._retryAttempt > 0) {
                        _this._activity.message += " Retry Attempt " + (_this._retryAttempt + 1) + " out of 5";
                    }
                    break;
            }
        };
        this.start = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var groupIsCanceled, promise, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        groupIsCanceled = false;
                        this._state = BlobDownloadState_1.default.Starting;
                        return [4 /*yield*/, this.updateActivity()];
                    case 1:
                        _b.sent();
                        if (!!!this._groupRef) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._groupManager.isCanceled(this._groupRef)];
                    case 2:
                        groupIsCanceled = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!groupIsCanceled) return [3 /*break*/, 4];
                        promise = this.cancel();
                        return [3 /*break*/, 10];
                    case 4:
                        if (!(this._retryAttempt >= 5)) return [3 /*break*/, 5];
                        if (!!this._job.properties.unhandledErrors) {
                            promise = this._handleError({
                                name: "BlobDownloadFailed",
                                message: "Download Failed after " + this._retryAttempt + " attempt(s)",
                                errors: this._job.properties.unhandledErrors
                            });
                        }
                        else {
                            promise = this._handleError("Download Failed unexpectedly after " + this._retryAttempt + " attempt(s)");
                        }
                        return [3 /*break*/, 10];
                    case 5: return [4 /*yield*/, this._handleUnsafeFileName()];
                    case 6:
                        _b.sent();
                        if (!(this._args.unsafeNameDetectedPolicy === UnsafeNameActions_1.default.Skip)) return [3 /*break*/, 7];
                        this._state = BlobDownloadState_1.default.Skipped;
                        promise = this._handleSuccess();
                        return [3 /*break*/, 10];
                    case 7:
                        _a = this._args.localOverwritePolicy !== LocalFileOverwriteOptions_1.default.Overwrite;
                        if (!_a) return [3 /*break*/, 9];
                        return [4 /*yield*/, BlobDownload.localFileExists(this._getLocalPath())];
                    case 8:
                        _a = (_b.sent());
                        _b.label = 9;
                    case 9:
                        if (_a) {
                            promise = this._handleConflict()
                                .then(function () { return _this._handleSuccess(); })
                                .catch(function (error) { return _this._handleError(error); });
                        }
                        else {
                            promise = this._start()
                                .then(function () { return _this._handleSuccess(); })
                                .catch(function (error) { return _this._handleError(error); });
                        }
                        _b.label = 10;
                    case 10: return [4 /*yield*/, promise];
                    case 11: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this._start = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var retryDuration, localPath;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        retryDuration = flobManager.getRetryDurationFromFlobSize(this._args.blobRef.length);
                        localPath = this._getLocalPath();
                        return [4 /*yield*/, this._host.executeOperation("StorageExplorer.Blob.Files.UnWatchFile", { filePath: localPath })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, BlobUtilities_1.getBlobService(this._args.blobContainerRef.connectionString, "downloadBlobToLocalFile", retryDuration)
                                .then(function (blobService) {
                                _this._cancelFilter = blobService.cancelFilter;
                                var options = {};
                                if (_this._args.blobRef.snapshot) {
                                    options.snapshotId = _this._args.blobRef.snapshot;
                                }
                                var destinationFolder = Path.dirname(localPath);
                                return _this._ensureFolderExists(destinationFolder)
                                    .then(function () {
                                    var downloadBlobData = BlobDownload._getBlobToLocalFile(blobService, _this._args.blobContainerRef.name, _this._args.blobRef.fileName, localPath, options, _this._args.unsafeNameDetectedPolicy === UnsafeNameActions_1.default.Encode);
                                    _this._speedSummary = new HumanReadableSpeedSummary_1.default(downloadBlobData.speedSummary);
                                    return downloadBlobData.promise
                                        .then(function (result) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!(!!result && !!this._args.openFile)) return [3 /*break*/, 2];
                                                    return [4 /*yield*/, this._openFile(blobService, options)];
                                                case 1:
                                                    _a.sent();
                                                    _a.label = 2;
                                                case 2: return [2 /*return*/, result];
                                            }
                                        });
                                    }); });
                                });
                            })];
                }
            });
        }); };
        this._handleError = function (error) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var promise;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        switch (this._state) {
                            case BlobDownloadState_1.default.Canceled:
                            case BlobDownloadState_1.default.Failed:
                            case BlobDownloadState_1.default.Complete:
                                promise = Q.resolve(true);
                                break;
                            case BlobDownloadState_1.default.Canceling:
                                this._state = BlobDownloadState_1.default.Canceled;
                                promise = Q.resolve(true);
                                break;
                            case BlobDownloadState_1.default.Conflicted:
                                promise = Q.resolve(true);
                                break;
                            default:
                                this._state = BlobDownloadState_1.default.Failed;
                                this._error = storageManagerHelper.processError(error);
                                promise = Q.resolve(true);
                        }
                        return [4 /*yield*/, this.updateActivity()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, promise];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this._handleSuccess = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var promise;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        switch (this._state) {
                            case BlobDownloadState_1.default.Skipped:
                            case BlobDownloadState_1.default.Canceled:
                            case BlobDownloadState_1.default.Failed:
                            case BlobDownloadState_1.default.Complete:
                                promise = Q.resolve(true);
                                break;
                            case BlobDownloadState_1.default.Canceling:
                                this._state = BlobDownloadState_1.default.Canceled;
                                promise = Q.resolve(true);
                                break;
                            case BlobDownloadState_1.default.Conflicted:
                                promise = Q.resolve(true);
                                break;
                            default:
                                this._state = BlobDownloadState_1.default.Complete;
                                promise = Q.resolve(true);
                        }
                        return [4 /*yield*/, this.updateActivity()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, promise];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this._ensureFolderExists = function (folder) {
            var deferred = Q.defer();
            try {
                Mkdirp(folder, function (err, made) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        deferred.resolve(made);
                    }
                });
            }
            catch (error) {
                deferred.reject(error);
            }
            return deferred.promise;
        };
        this._job = job;
        this._args = job.properties.args;
        this._host = host;
        this._activityManager = activityManager;
        this._state = BlobDownloadState_1.default.WaitingToStart;
        this._prevState = null;
        this._activityRef = job.properties.activityRef;
        this._activity = {
            title: "",
            message: "",
            parent: job.properties.parentActivityRef,
            actions: [],
            progress: 0,
            sortOrder: 99,
            status: ActivityStatus_1.default.InProgress
        };
        if (!!job.properties.groupRef) {
            this._groupManager = groupManager;
            this._groupRef = job.properties.groupRef;
            this._statsRef = job.properties.statsRef;
        }
        this._retryAttempt = retryAttempt;
        this._updateIntervalId = setInterval(function () { return _this.updateActivity(); }, 5000);
        this._activityManager.onExecuteAction(function (activityRef, action) {
            if (activityRef.id === _this._activityRef.id) {
                switch (action.title) {
                    case "Cancel":
                        _this.cancel();
                        break;
                }
            }
        });
    }
    BlobDownload.prototype.updateActivity = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, groupIsCanceled, oldActivity, updatedActivity;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(!!this._groupRef && this._state !== this._prevState)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._groupManager.updateState(this._groupRef, this._statsRef, this._state)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        this._prevState = this._state;
                        _a = this._state;
                        switch (_a) {
                            case BlobDownloadState_1.default.Canceled: return [3 /*break*/, 3];
                            case BlobDownloadState_1.default.Complete: return [3 /*break*/, 3];
                            case BlobDownloadState_1.default.Failed: return [3 /*break*/, 3];
                            case BlobDownloadState_1.default.Skipped: return [3 /*break*/, 3];
                            case BlobDownloadState_1.default.Conflicted: return [3 /*break*/, 3];
                            case BlobDownloadState_1.default.Starting: return [3 /*break*/, 4];
                            case BlobDownloadState_1.default.Active: return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 9];
                    case 3:
                        // Stop Updating
                        clearInterval(this._updateIntervalId);
                        this._updateIntervalId = null;
                        return [3 /*break*/, 9];
                    case 4:
                        if (!!this._speedSummary && this._speedSummary.hasStarted()) {
                            this._state = BlobDownloadState_1.default.Active;
                        }
                        return [3 /*break*/, 9];
                    case 5:
                        if (!!!this._groupRef) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._groupManager.isCanceled(this._groupRef)];
                    case 6:
                        groupIsCanceled = _b.sent();
                        if (!groupIsCanceled) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.cancel()];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [3 /*break*/, 9];
                    case 9:
                        oldActivity = JSON.stringify(this._activity);
                        this._updateActivity();
                        updatedActivity = JSON.stringify(this._activity);
                        if (!(oldActivity !== updatedActivity)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this._activityManager.update(this._activityRef, this._activity)];
                    case 10:
                        _b.sent();
                        _b.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    BlobDownload.prototype._getLocalPath = function () {
        return path.resolve(this._args.baseLocalPath, this._args.relativePath);
    };
    BlobDownload.prototype._handleUnsafeFileName = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var windowsSafePath, _a, dialogParameters, dialogResult;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(os.platform() === "win32" && !WindowsSafeFileName_1.default.isPathSafe(this._args.relativePath))) return [3 /*break*/, 5];
                        windowsSafePath = WindowsSafeFileName_1.default.encodePath(this._args.relativePath);
                        if (!!this._args.unsafeNameDetectedPolicy) return [3 /*break*/, 4];
                        if (!!!this._groupRef) return [3 /*break*/, 2];
                        _a = this._args;
                        return [4 /*yield*/, this._groupManager.handleConflict(this._groupRef, "unsafeNamePolicy", { safeItemName: windowsSafePath })];
                    case 1:
                        _a.unsafeNameDetectedPolicy = _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        dialogParameters = {
                            title: "Unsupported Filename",
                            message: "Filename contains unsupported characters. Would you like to encode the filename?",
                            options: [
                                { title: "Enocde filename and download as: " + windowsSafePath, value: UnsafeNameActions_1.default.Encode },
                                { title: "Do not download", value: UnsafeNameActions_1.default.Skip }
                            ],
                            defaultOptionValue: "Encode",
                            buttons: [
                                { title: "Apply", value: "apply" }
                            ]
                        };
                        return [4 /*yield*/, this._host.executeOperation("Environment.Dialogs.getDialogResult", {
                                id: "options",
                                parameters: dialogParameters
                            })];
                    case 3:
                        dialogResult = _b.sent();
                        if (!!dialogResult) {
                            this._args.unsafeNameDetectedPolicy = dialogResult.option;
                        }
                        else {
                            this._args.unsafeNameDetectedPolicy = UnsafeNameActions_1.default.Encode;
                        }
                        _b.label = 4;
                    case 4:
                        if (this._args.unsafeNameDetectedPolicy === UnsafeNameActions_1.default.Encode) {
                            this._args.relativePath = windowsSafePath;
                        }
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BlobDownload.prototype._handleConflict = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var overwritePolicy, localPath, dialogParameters, dialogResult;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localPath = this._getLocalPath();
                        if (!!!this._groupRef) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._groupManager.handleConflict(this._groupRef, "localOverwritePolicy", { conflictedItemName: localPath })];
                    case 1:
                        overwritePolicy = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        dialogParameters = {
                            title: "Download Conflict",
                            message: "An item named '" + localPath + "' already exists. How would you like to resolve the conflict?",
                            options: [
                                { title: "Replace", value: LocalFileOverwriteOptions_1.default.Overwrite },
                                { title: "Keep both", value: LocalFileOverwriteOptions_1.default.KeepBoth },
                                { title: "Do not download", value: LocalFileOverwriteOptions_1.default.Skip }
                            ],
                            defaultOptionValue: LocalFileOverwriteOptions_1.default.Overwrite,
                            buttons: [
                                { title: "Apply", value: "apply" }
                            ]
                        };
                        return [4 /*yield*/, this._host.executeOperation("Environment.Dialogs.getDialogResult", {
                                id: "options",
                                parameters: dialogParameters
                            })];
                    case 3:
                        dialogResult = _a.sent();
                        if (!!dialogResult) {
                            overwritePolicy = dialogResult.option;
                        }
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this._processOverwriteOption(overwritePolicy)];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BlobDownload.prototype._processOverwriteOption = function (overwriteOption) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, parsedPath, newPath, num, exists, nameModifier, localPath;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = overwriteOption;
                        switch (_a) {
                            case LocalFileOverwriteOptions_1.default.Skip: return [3 /*break*/, 1];
                            case LocalFileOverwriteOptions_1.default.KeepBoth: return [3 /*break*/, 3];
                            case LocalFileOverwriteOptions_1.default.Overwrite: return [3 /*break*/, 9];
                            case null: return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 12];
                    case 1:
                        this._state = BlobDownloadState_1.default.Skipped;
                        this._args.localOverwritePolicy = LocalFileOverwriteOptions_1.default.Skip;
                        return [4 /*yield*/, Q.resolve(null)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        parsedPath = path.parse(this._args.relativePath);
                        num = 0;
                        exists = true;
                        _b.label = 4;
                    case 4:
                        num++;
                        nameModifier = void 0;
                        if (os.platform() === "darwin") {
                            nameModifier = num === 1 ? " copy" : " copy " + num;
                        }
                        else {
                            nameModifier = " (" + num + ")";
                        }
                        newPath = Path.join(parsedPath.dir, parsedPath.name) + nameModifier + parsedPath.ext;
                        localPath = path.resolve(this._args.baseLocalPath, newPath);
                        return [4 /*yield*/, BlobDownload.localFileExists(localPath)];
                    case 5:
                        exists = _b.sent();
                        _b.label = 6;
                    case 6:
                        if (exists) return [3 /*break*/, 4];
                        _b.label = 7;
                    case 7:
                        this._args.relativePath = newPath;
                        this._args.localOverwritePolicy = LocalFileOverwriteOptions_1.default.KeepBoth;
                        return [4 /*yield*/, this._start()];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9:
                        this._args.localOverwritePolicy = LocalFileOverwriteOptions_1.default.Overwrite;
                        return [4 /*yield*/, this._start()];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11:
                        this._state = BlobDownloadState_1.default.Conflicted;
                        this._args.localOverwritePolicy = undefined;
                        this.updateActivity();
                        return [2 /*return*/, Q.resolve(null)];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    BlobDownload.prototype._openFile = function (blobService, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var localPath, fileStats, blobType, openResult, err_1, connectionString, accountName, messagePrompt, fullPath, job, queue, callBackNameSpace, callBackArgs, newFile, blobArgs;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localPath = this._getLocalPath();
                        return [4 /*yield*/, Q.nfcall(fs.stat, localPath)];
                    case 1:
                        fileStats = _a.sent();
                        this._state = BlobDownloadState_1.default.Opening;
                        return [4 /*yield*/, this._host.executeOperation("FileSystemProvider.tryOpenFileSafely", { path: localPath })];
                    case 2:
                        openResult = _a.sent();
                        if (openResult.status === OperationStatus_1.default.Succeeded) {
                            this._state = BlobDownloadState_1.default.Complete;
                        }
                        else if (openResult.status === OperationStatus_1.default.Aborted) {
                            this._state = BlobDownloadState_1.default.Canceled;
                            return [2 /*return*/];
                        }
                        else {
                            this._state = BlobDownloadState_1.default.Failed;
                            return [2 /*return*/];
                        }
                        if (!!this._args.blobRef.snapshot) return [3 /*break*/, 7];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._getBlobType(blobService, options)];
                    case 4:
                        blobType = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        throw err_1;
                    case 6:
                        connectionString = this._args.blobContainerRef.connectionString;
                        accountName = BlobDownload._parseStorageAccountFromConnectionString(connectionString);
                        messagePrompt = "How do you want to handle the changes?";
                        fullPath = accountName + "/" + this._args.blobContainerRef.name + "/" + this._args.blobRef.fileName;
                        job = {
                            type: "Job",
                            properties: {
                                args: {
                                    blobContainerRef: this._args.blobContainerRef,
                                    localFilePath: localPath,
                                    blobType: blobType,
                                    baseBlobPath: "",
                                    relativeBlobPath: this._args.blobRef.fileName,
                                    blobOverwritePolicy: BlobOverwriteOptions_1.default.AskToOverwrite,
                                    fileSize: fileStats.size
                                }
                            }
                        };
                        queue = { name: "upload" };
                        callBackNameSpace = "JobQueueManager.addJob";
                        callBackArgs = { job: job, queue: queue };
                        newFile = true;
                        blobArgs = { blobContainerRef: this._args.blobContainerRef, blobRef: this._args.blobRef };
                        this._host.executeOperation("StorageExplorer.Blob.Files.WatchFileChange", {
                            watchFileArgs: {
                                filePath: localPath,
                                fileName: fullPath,
                                messagePrompt: messagePrompt,
                                callBackNameSpace: callBackNameSpace,
                                callBackArgs: callBackArgs,
                                newfile: newFile,
                                blobArgs: blobArgs
                            }
                        });
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    BlobDownload.prototype._getBlobType = function (blobService, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var blobTypeString, blobType;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Q.Promise(function (resolve, reject) {
                            blobService.getBlobProperties(_this._args.blobContainerRef.name, _this._args.blobRef.fileName, options, function (error, result, response) {
                                if (error) {
                                    reject(error);
                                }
                                else {
                                    resolve(result.blobType);
                                }
                            });
                        })];
                    case 1:
                        blobTypeString = _a.sent();
                        switch (blobTypeString) {
                            case "BlockBlob":
                                blobType = BlobType_1.default.Block;
                                break;
                            case "PageBlob":
                                blobType = BlobType_1.default.Page;
                                break;
                            case "AppendBlob":
                                blobType = BlobType_1.default.Append;
                                break;
                        }
                        return [2 /*return*/, blobType];
                }
            });
        });
    };
    BlobDownload._getBlobToLocalFile = function (blobService, container, blob, localFileName, options, nameEncoded) {
        var deferred = Q.defer();
        var partFilePath = localFileName + (nameEncoded ? ".e" : "") + ".partial";
        var speedSummary = blobService.getBlobToLocalFile(container, blob, partFilePath, options, function (error, result) {
            if (error) {
                fs.unlink(partFilePath, function (unlinkErr) { });
                deferred.reject(error);
            }
            else {
                fs.rename(partFilePath, localFileName, function (err) {
                    if (!!err) {
                        fs.unlink(partFilePath, function (unlinkErr) { });
                        deferred.reject(err);
                    }
                    else {
                        deferred.resolve(result);
                    }
                });
            }
        });
        return {
            promise: deferred.promise,
            speedSummary: speedSummary
        };
    };
    BlobDownload.prototype.cancel = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._state !== BlobDownloadState_1.default.Canceling && this._state !== BlobDownloadState_1.default.Canceled && this._state !== BlobDownloadState_1.default.Complete)) return [3 /*break*/, 4];
                        this._state = BlobDownloadState_1.default.Canceling;
                        if (!!!this._cancelFilter) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateActivity()];
                    case 1:
                        _a.sent();
                        this._cancelFilter.Cancel();
                        return [3 /*break*/, 4];
                    case 2:
                        this._state = BlobDownloadState_1.default.Canceled;
                        return [4 /*yield*/, this.updateActivity()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    BlobDownload.prototype.stop = function (error) {
        clearInterval(this._updateIntervalId);
        this._updateIntervalId = null;
        if (!!this._cancelFilter) {
            this._cancelFilter.Cancel();
        }
        this.updateActivity = function () {
            return Promise.resolve(null);
        };
        var handleFunction = function () {
            if (error) {
                return Promise.reject(error);
            }
            else {
                return Promise.resolve(false);
            }
        };
        this._handleError = handleFunction;
        this._handleSuccess = handleFunction;
        return;
    };
    BlobDownload.localFileExists = function (file) {
        var deferred = Q.defer();
        fs.exists(file, function (exists) {
            deferred.resolve(exists);
        });
        return deferred.promise;
    };
    BlobDownload._parseStorageAccountFromConnectionString = function (connectionString) {
        var connStringObj = new ConnectionString_1.default(connectionString);
        return connStringObj.getAccountName();
    };
    return BlobDownload;
}());
exports.default = BlobDownload;

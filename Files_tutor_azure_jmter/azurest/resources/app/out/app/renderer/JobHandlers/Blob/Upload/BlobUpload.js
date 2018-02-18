"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BlobUtilities_1 = require("../../../Azure/AzureStorage/Blobs/BlobUtilities");
var storageErrors = require("../../../Azure/AzureStorage/StorageErrors");
var storageManagerHelper = require("../../../Azure/AzureStorage/StorageManagerHelper");
var azureStorage = require("azure-storage");
var fs = require("fs");
var Q = require("q");
var path = require("path");
var os = require("os");
var ExceptionSerialization_1 = require("../../../Components/Errors/ExceptionSerialization");
var ActivityStatus_1 = require("../../../Components/Activities/ActivityStatus");
var WindowsSafeFileName_1 = require("../../../Components/WindowsSafeFileName/WindowsSafeFileName");
var HumanReadableSpeedSummary_1 = require("../../Common/HumanReadableSpeedSummary");
var BlobUploadState_1 = require("./BlobUploadState");
var BlobOverwriteOptions_1 = require("../BlobOverwriteOptions");
var BlobType_1 = require("../BlobType");
var EncodedNameActions_1 = require("../../WindowsSafeFileNames/EncodedName/EncodedNameActions");
var FileSizeConstants_1 = require("../../Common/FileSizeConstants");
var BlobManager_1 = require("../../../Azure/AzureStorage/BlobManager");
var BlobUpload = (function () {
    function BlobUpload(job, activityManager, host, groupManager, retryAttempt) {
        var _this = this;
        this._getDestinationBlobPath = function () {
            return path.posix.join(_this._args.baseBlobPath, _this._args.relativeBlobPath);
        };
        this._updateActivity = function () {
            var parsedLocalFilePath = path.parse(_this._args.localFilePath);
            var name = parsedLocalFilePath.name + parsedLocalFilePath.ext;
            var toPath = path.posix.join(_this._args.blobContainerRef.name, _this._getDestinationBlobPath());
            switch (_this._state) {
                case BlobUploadState_1.default.Complete:
                    _this._activity.title = "Uploaded '" + name + "' to " + toPath;
                    _this._activity.status = ActivityStatus_1.default.Success;
                    _this._activity.message = "";
                    _this._activity.actions = [];
                    break;
                case BlobUploadState_1.default.Canceling:
                    _this._activity.title = "Canceling Upload '" + name + "' to " + toPath;
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [];
                    _this._activity.message = "";
                    _this._activity.progress = null;
                    break;
                case BlobUploadState_1.default.Canceled:
                    _this._activity.title = "Canceled Upload '" + name + "' to " + toPath;
                    _this._activity.status = ActivityStatus_1.default.Canceled;
                    _this._activity.message = "";
                    _this._activity.actions = [];
                    _this._activity.progress = null;
                    break;
                case BlobUploadState_1.default.Failed:
                    _this._activity.title = "Failed To Upload '" + name + "' to " + toPath;
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
                                    queue: { name: "upload" }
                                }
                            }
                        }
                    ];
                    break;
                case BlobUploadState_1.default.WaitingToStart:
                    _this._activity.title = "Initializing Upload of '" + name + "' to " + toPath;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Pending;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
                    _this._activity.progress = 0;
                    break;
                case BlobUploadState_1.default.Starting:
                    _this._activity.title = "Initializing Upload of '" + name + "' to " + toPath;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
                    _this._activity.progress = 0;
                    break;
                case BlobUploadState_1.default.Active:
                    _this._activity.title = "Uploading '" + name + "' to " + toPath;
                    _this._activity.progress = _this._speedSummary.getPercent();
                    _this._activity.message = _this._speedSummary.getSummary();
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
                    break;
                case BlobUploadState_1.default.Skipped:
                    _this._activity.title = "Skipped Upload '" + name + "' to " + toPath;
                    _this._activity.progress = 0;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Info;
                    _this._activity.actions = [];
                    break;
                case BlobUploadState_1.default.Conflicted:
                    _this._activity.title = "Unresolved upload conflict for '" + name + "' to " + toPath;
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
                                    queue: { name: "upload" }
                                }
                            }
                        }
                    ];
                    break;
                default:
                    _this._activity.title = "Unknown State '" + name + "' to " + toPath;
                    _this._activity.progress = null;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Error;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
            }
            if (_this._messageDetails) {
                _this._activity.message += _this._messageDetails;
            }
            switch (_this._state) {
                case BlobUploadState_1.default.Complete:
                case BlobUploadState_1.default.Failed:
                case BlobUploadState_1.default.Canceled:
                case BlobUploadState_1.default.Conflicted:
                    break;
                default:
                    if (!!_this._retryAttempt && _this._retryAttempt > 0) {
                        _this._activity.message += " Retry Attempt " + (_this._retryAttempt + 1) + " out of 5";
                    }
                    break;
            }
        };
        this._handleError = function (error) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var promise;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        switch (this._state) {
                            case BlobUploadState_1.default.Canceled:
                            case BlobUploadState_1.default.Failed:
                            case BlobUploadState_1.default.Complete:
                                promise = Q.resolve(true);
                                break;
                            case BlobUploadState_1.default.Canceling:
                                this._state = BlobUploadState_1.default.Canceled;
                                promise = Q.resolve(true);
                                break;
                            case BlobUploadState_1.default.Conflicted:
                                promise = Q.resolve(true);
                                break;
                            default:
                                this._state = BlobUploadState_1.default.Failed;
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
                            case BlobUploadState_1.default.Skipped:
                            case BlobUploadState_1.default.Canceled:
                            case BlobUploadState_1.default.Failed:
                            case BlobUploadState_1.default.Complete:
                                promise = Q.resolve(true);
                                break;
                            case BlobUploadState_1.default.Canceling:
                                this._state = BlobUploadState_1.default.Canceled;
                                promise = Q.resolve(true);
                                break;
                            case BlobUploadState_1.default.Conflicted:
                                promise = Q.resolve(true);
                                break;
                            default:
                                this._state = BlobUploadState_1.default.Complete;
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
        this._job = job;
        this._args = job.properties.args;
        this._host = host;
        this._activityManager = activityManager;
        this._state = BlobUploadState_1.default.WaitingToStart;
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
    BlobUpload.prototype.updateActivity = function () {
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
                            case BlobUploadState_1.default.Canceled: return [3 /*break*/, 3];
                            case BlobUploadState_1.default.Complete: return [3 /*break*/, 3];
                            case BlobUploadState_1.default.Failed: return [3 /*break*/, 3];
                            case BlobUploadState_1.default.Skipped: return [3 /*break*/, 3];
                            case BlobUploadState_1.default.Conflicted: return [3 /*break*/, 3];
                            case BlobUploadState_1.default.Starting: return [3 /*break*/, 4];
                            case BlobUploadState_1.default.Active: return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 9];
                    case 3:
                        // Stop Updating
                        clearInterval(this._updateIntervalId);
                        this._updateIntervalId = null;
                        return [3 /*break*/, 9];
                    case 4:
                        if (!!this._speedSummary && this._speedSummary.hasStarted()) {
                            this._state = BlobUploadState_1.default.Active;
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
    BlobUpload.prototype.start = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var groupIsCanceled, promise;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        groupIsCanceled = false;
                        this._state = BlobUploadState_1.default.Starting;
                        return [4 /*yield*/, this.updateActivity()];
                    case 1:
                        _a.sent();
                        if (!!!this._groupRef) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._groupManager.isCanceled(this._groupRef)];
                    case 2:
                        groupIsCanceled = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (groupIsCanceled) {
                            promise = this.cancel();
                        }
                        else if (this._retryAttempt >= 5) {
                            if (!!this._job.properties.unhandledErrors) {
                                promise = this._handleError({
                                    name: "BlobUploadFailed",
                                    message: "Upload Failed after " + this._retryAttempt + " attempt(s)",
                                    errors: this._job.properties.unhandledErrors
                                });
                            }
                            else {
                                promise = this._handleError("Upload Failed unexpectedly after " + this._retryAttempt + " attempt(s)");
                            }
                        }
                        else {
                            promise = this._start()
                                .then(function () { return _this._handleSuccess(); })
                                .catch(function (error) { return _this._handleError(error); });
                        }
                        return [4 /*yield*/, promise];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BlobUpload.prototype._start = function () {
        var _this = this;
        var retryDuration = BlobUpload._determineRetryDuration(this._args.fileSize);
        var blobType = this._args.blobType;
        var filePath = this._args.localFilePath;
        var containerReference = this._args.blobContainerRef;
        return this._handleEncodedFileName()
            .then(function () { return BlobUtilities_1.getBlobService(containerReference.connectionString, "uploadBlobFromLocalFile", retryDuration); })
            .then(function (blobService) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var relativeBlobPath, exists, error_1, options, cancelFilter, speedSummary, createBlobData, createPromise;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        relativeBlobPath = this._args.relativeBlobPath;
                        console.log("Uploading File:" + relativeBlobPath);
                        if (!(this._args.fileSize > FileSizeConstants_1.ByteBasedFileSizes.MB && (!this._args.blobOverwritePolicy || this._args.blobOverwritePolicy === BlobOverwriteOptions_1.default.AskToOverwrite))) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._blobAlreadyExists(blobService)];
                    case 2:
                        exists = _a.sent();
                        if (exists) {
                            return [2 /*return*/, this._handleConflict(blobService)];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, Q.reject(error_1)];
                    case 4:
                        options = {};
                        cancelFilter = blobService.cancelFilter;
                        // Now that we have a cancel filter, resolve it in the provider
                        this._cancelFilter = cancelFilter;
                        if (!(this._args.blobOverwritePolicy === BlobOverwriteOptions_1.default.AskToOverwrite)) return [3 /*break*/, 5];
                        // Force an error if the destination already exists
                        options.accessConditions = azureStorage.AccessCondition.generateIfNotExistsCondition();
                        return [3 /*break*/, 7];
                    case 5:
                        if (!(this._args.blobOverwritePolicy === BlobOverwriteOptions_1.default.Snapshot)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._makeSnapshot(blobService)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        createBlobData = BlobUpload._createBlobFromLocalFile(blobType, blobService, containerReference.name, this._getDestinationBlobPath(), filePath, options);
                        createPromise = createBlobData.promise
                            .catch(function (error) {
                            if (!!error && error.code === "BlobAlreadyExists") {
                                return _this._handleConflict(blobService);
                            }
                            else {
                                var errorObject = {
                                    name: error.name
                                };
                                Object.getOwnPropertyNames(error).forEach(function (property) {
                                    errorObject[property] = error[property];
                                });
                                console.warn("Error: " + JSON.stringify(errorObject));
                            }
                            return Q.reject(error);
                        });
                        speedSummary = createBlobData.speedSummary;
                        this._speedSummary = new HumanReadableSpeedSummary_1.default(speedSummary);
                        this.updateActivity();
                        return [2 /*return*/, createPromise
                                .then(function (result) {
                                if (!!result) {
                                    _this._notifyEditors();
                                }
                                return result;
                            })];
                }
            });
        }); });
    };
    BlobUpload.prototype._handleEncodedFileName = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var decodedRelativeBlobPath, _a, dialogParameters, dialogResult;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(os.platform() === "win32" && WindowsSafeFileName_1.default.isPathEncoded(this._args.relativeBlobPath))) return [3 /*break*/, 5];
                        decodedRelativeBlobPath = WindowsSafeFileName_1.default.decodePath(this._args.relativeBlobPath);
                        if (!!this._args.encodedNameDetectedPolicy) return [3 /*break*/, 4];
                        if (!!!this._groupRef) return [3 /*break*/, 2];
                        _a = this._args;
                        return [4 /*yield*/, this._groupManager.handleConflict(this._groupRef, "encodedNamePolicy", { encodedItemName: this._getDestinationBlobPath(), decodedItemName: path.posix.join(this._args.baseBlobPath, decodedRelativeBlobPath) })];
                    case 1:
                        _a.encodedNameDetectedPolicy = _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        dialogParameters = {
                            title: "URL Encoded Filename Detected",
                            message: "Filename appears to contain encoded characters. Would you like to decode the filename and upload?",
                            options: [
                                { title: "Decode and upload as: " + path.posix.join(this._args.baseBlobPath, decodedRelativeBlobPath), value: EncodedNameActions_1.default.Decode },
                                { title: "Upload as: " + this._getDestinationBlobPath(), value: EncodedNameActions_1.default.KeepOriginalName }
                            ],
                            defaultOptionValue: "decode",
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
                            this._args.encodedNameDetectedPolicy = dialogResult.option;
                        }
                        else {
                            this._args.encodedNameDetectedPolicy = EncodedNameActions_1.default.Decode;
                        }
                        _b.label = 4;
                    case 4:
                        if (this._args.encodedNameDetectedPolicy === EncodedNameActions_1.default.Decode) {
                            this._args.relativeBlobPath = decodedRelativeBlobPath;
                        }
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BlobUpload.prototype._handleConflict = function (blobService) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var blobName, overwritePolicy, dialogParameters, dialogResult;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        blobName = this._getDestinationBlobPath();
                        overwritePolicy = this._args.blobOverwritePolicy;
                        if (!(!overwritePolicy || overwritePolicy === BlobOverwriteOptions_1.default.AskToOverwrite)) return [3 /*break*/, 4];
                        if (!!!this._groupRef) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._groupManager.handleConflict(this._groupRef, "remoteOverwritePolicy", { conflictedItemName: blobName })];
                    case 1:
                        overwritePolicy = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        dialogParameters = {
                            title: "Upload Conflict",
                            message: "An item named '" + blobName + "' already exists. How would you like to resolve the conflict?",
                            options: [
                                { title: "Create snapshot and replace", value: BlobOverwriteOptions_1.default.Snapshot },
                                { title: "Replace", value: BlobOverwriteOptions_1.default.Overwrite },
                                { title: "Do not upload", value: BlobOverwriteOptions_1.default.Skip }
                            ],
                            defaultOptionValue: BlobOverwriteOptions_1.default.Snapshot,
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
                    case 4: return [4 /*yield*/, this._processOverwriteOption(blobService, overwritePolicy)];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BlobUpload.prototype._processOverwriteOption = function (blobService, overwriteOption) {
        var _this = this;
        switch (overwriteOption) {
            case BlobOverwriteOptions_1.default.Skip:
                this._state = BlobUploadState_1.default.Skipped;
                this._args.blobOverwritePolicy = BlobOverwriteOptions_1.default.Skip;
                return Q.resolve(null);
            case BlobOverwriteOptions_1.default.Snapshot:
                this._args.blobOverwritePolicy = BlobOverwriteOptions_1.default.Snapshot;
                return this._makeSnapshot(blobService)
                    .then(function () {
                    return _this._start();
                })
                    .catch(function () {
                    return Q.reject("Failed to create Snapshot.");
                });
            case BlobOverwriteOptions_1.default.Overwrite:
                this._args.blobOverwritePolicy = BlobOverwriteOptions_1.default.Overwrite;
                return this._start();
            case null:
                this._args.blobOverwritePolicy = BlobOverwriteOptions_1.default.AskToOverwrite;
                this._state = BlobUploadState_1.default.Conflicted;
                this.updateActivity();
                return Q.resolve(null);
        }
    };
    BlobUpload.prototype._makeSnapshot = function (blobService) {
        var _this = this;
        var blobName = this._getDestinationBlobPath();
        return BlobUpload.makeSnapshot(blobService, this._args.blobContainerRef.name, blobName)
            .then(function (snapshotId) {
            _this._messageDetails = " - Made Snapshot '" + snapshotId + "' ";
            _this._args.blobOverwritePolicy = BlobOverwriteOptions_1.default.Overwrite;
        });
    };
    BlobUpload.prototype._blobAlreadyExists = function (blobService) {
        var deferred = Q.defer();
        var containerReference = this._args.blobContainerRef;
        var blobName = this._getDestinationBlobPath();
        blobService.getBlobProperties(containerReference.name, blobName, {}, function (error, result, response) {
            if (error) {
                if (error.code === "NotFound") {
                    deferred.resolve(false);
                }
                else {
                    deferred.reject(error);
                }
            }
            else {
                deferred.resolve(true);
            }
        });
        return deferred.promise;
    };
    BlobUpload.prototype._notifyEditors = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var blob;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, BlobManager_1.getBlob({ containerName: this._args.blobContainerRef.name, connectionString: this._args.blobContainerRef.connectionString }, this._getDestinationBlobPath(), null)];
                    case 1:
                        blob = _a.sent();
                        return [2 /*return*/, this._host.executeOperation("DaytonaTabMessenger.broadcastEvent", {
                                event: "blob-container.blob-uploaded",
                                args: {
                                    containerRef: this._args.blobContainerRef,
                                    blob: blob
                                }
                            })];
                }
            });
        });
    };
    BlobUpload._createBlobFromLocalFile = function (type, blobService, container, blob, localFileName, options) {
        switch (type) {
            case BlobType_1.default.Block:
                return BlobUpload._createBlockBlobFromLocalFile(blobService, container, blob, localFileName, options);
            case BlobType_1.default.Page:
                return BlobUpload._createPageBlobFromLocalFile(blobService, container, blob, localFileName, options);
            case BlobType_1.default.Append:
                return BlobUpload._createAppendBlobFromLocalFile(blobService, container, blob, localFileName, options);
            default:
                return {
                    speedSummary: undefined,
                    promise: Q.reject(new Error("Invalid blob type"))
                };
        }
    };
    BlobUpload._createPageBlobFromLocalFile = function (blobService, container, blob, localFileName, options) {
        var deferred = Q.defer();
        var speedSummary;
        var stat = fs.statSync(localFileName);
        options.parallelOperationThreadCount = 25;
        // Page blobs must have size with a multiple of 512
        if (stat.size % 512 !== 0) {
            deferred.reject(new storageErrors.PageBlobInvalidSize());
        }
        else {
            speedSummary = blobService.createPageBlobFromLocalFile(container, blob, localFileName, options, function (error, result) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(result);
                }
            });
        }
        return {
            promise: deferred.promise,
            speedSummary: speedSummary
        };
    };
    BlobUpload._determineParallelCount = function (size) {
        var parallelCount;
        var minBlockSize = size / BlobUpload._maxBlockCount;
        parallelCount = 5 * BlobUpload._maxSupportedBlockSize / minBlockSize;
        parallelCount = parallelCount - parallelCount % 1;
        parallelCount = Math.min(parallelCount, BlobUpload._maxParallelOperationThreadCount);
        return parallelCount;
    };
    BlobUpload._determineRetryDuration = function (size) {
        var SHORT = 10 * 1000;
        var MEDIUM = 60 * 1000;
        var LONG = 10 * 60 * 1000;
        var MB = 1000000;
        var retryDuration = (size < 32 * MB) ? SHORT
            : (size < 100 * MB) ? MEDIUM
                : LONG;
        return retryDuration;
    };
    BlobUpload._createBlockBlobFromLocalFile = function (blobService, container, blob, localFileName, options) {
        var blockOptions = options;
        var deferred = Q.defer();
        var stats = fs.statSync(localFileName);
        var parallelCount = BlobUpload._determineParallelCount(stats.size);
        blobService.defaultEnableReuseSocket = stats.size <= BlobUpload._maxReuseSocketFileSize;
        blockOptions.parallelOperationThreadCount = parallelCount;
        var speedSummary = blobService.createBlockBlobFromLocalFile(container, blob, localFileName, blockOptions, function (error, result) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(result);
            }
        });
        return {
            promise: deferred.promise,
            speedSummary: speedSummary
        };
    };
    BlobUpload._createAppendBlobFromLocalFile = function (blobService, container, blob, localFileName, options) {
        var deferred = Q.defer();
        var speedSummary = blobService.createAppendBlobFromLocalFile(container, blob, localFileName, options, function (error, result) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(result);
            }
        });
        return {
            promise: deferred.promise,
            speedSummary: speedSummary
        };
    };
    BlobUpload.makeSnapshot = function (blobService, container, blob) {
        return Q.Promise(function (resolve, reject) {
            blobService.createBlobSnapshot(container, blob, function (error, result, response) {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });
    };
    BlobUpload.prototype.cancel = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._state !== BlobUploadState_1.default.Canceling && this._state !== BlobUploadState_1.default.Canceled && this._state !== BlobUploadState_1.default.Complete)) return [3 /*break*/, 4];
                        this._state = BlobUploadState_1.default.Canceling;
                        if (!!!this._cancelFilter) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateActivity()];
                    case 1:
                        _a.sent();
                        this._cancelFilter.Cancel();
                        return [3 /*break*/, 4];
                    case 2:
                        this._state = BlobUploadState_1.default.Canceled;
                        return [4 /*yield*/, this.updateActivity()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    BlobUpload.prototype.stop = function (error) {
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
    return BlobUpload;
}());
BlobUpload._maxParallelOperationThreadCount = 25;
BlobUpload._maxBlockCount = 50000;
BlobUpload._maxReuseSocketFileSize = 200 * 1024 * 1024 * 1024; // 200 GB
BlobUpload._maxSupportedBlockSize = 100 * 1024 * 1024;
exports.default = BlobUpload;

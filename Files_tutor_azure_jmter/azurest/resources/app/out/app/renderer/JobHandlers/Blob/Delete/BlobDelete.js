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
var ActivityStatus_1 = require("../../../Components/Activities/ActivityStatus");
var BlobDeleteState;
(function (BlobDeleteState) {
    BlobDeleteState[BlobDeleteState["WaitingToStart"] = 0] = "WaitingToStart";
    BlobDeleteState[BlobDeleteState["Starting"] = 1] = "Starting";
    BlobDeleteState[BlobDeleteState["Active"] = 2] = "Active";
    BlobDeleteState[BlobDeleteState["Complete"] = 3] = "Complete";
    BlobDeleteState[BlobDeleteState["Failed"] = 4] = "Failed";
})(BlobDeleteState || (BlobDeleteState = {}));
var BlobDelete = (function () {
    function BlobDelete(args, activityManager, host) {
        var _this = this;
        this._done = false;
        this._updateActivity = function () {
            switch (_this._state) {
                case BlobDeleteState.Complete:
                    _this._activity.title = "Deleted '" + _this._args.blobRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Success;
                    _this._activity.message = "";
                    break;
                case BlobDeleteState.Failed:
                    _this._activity.title = "Failed to delete '" + _this._args.blobRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Error;
                    _this._activity.message = JSON.stringify(_this._error);
                    break;
                case BlobDeleteState.WaitingToStart:
                    _this._activity.title = "Initializing delete of '" + _this._args.blobRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Pending;
                    break;
                case BlobDeleteState.Starting:
                    _this._activity.title = "Initializing delete of '" + _this._args.blobRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    break;
                case BlobDeleteState.Active:
                    _this._activity.title = "Deleting '" + _this._args.blobRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    break;
                default:
                    _this._activity.title = "Unknown State '" + _this._args.blobRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Error;
            }
        };
        this._onCompleteCallback = function (error, result) {
            if (error) {
                _this._error = storageManagerHelper.processError(error);
                _this._state = BlobDeleteState.Failed,
                    _this._deferred.reject(_this._error);
            }
            else {
                _this._deferred.resolve(result);
                _this._state = BlobDeleteState.Complete,
                    _this._done = true;
            }
            _this.updateActivity();
        };
        this._args = args;
        this._activityManager = activityManager;
        this._state = BlobDeleteState.WaitingToStart;
        this._activityManager.onExecuteAction(function (activityRef, action) {
            if (activityRef.id === _this._activityRef.id) {
                switch (action.title) {
                    case "Cancel":
                        _this.stop();
                        break;
                }
            }
        });
    }
    BlobDelete.prototype.updateActivity = function () {
        var _this = this;
        if (!this._addActivityPromise) {
            this._activity = {
                title: "Deleting '" + this._args.blobRef.fileName + "'",
                message: "",
                parent: undefined,
                actions: [],
                progress: null,
                sortOrder: 1,
                status: ActivityStatus_1.default.InProgress
            };
            this._addActivityPromise = this._activityManager.add(this._activity)
                .then(function (activityRef) {
                _this._activityRef = activityRef;
            });
            this._updateInterval = setInterval(function () { return _this.updateActivity(); }, 5000);
        }
        if (!this._activityRef) {
            this._addActivityPromise.then(function () {
                _this.updateActivity();
            });
        }
        else {
            switch (this._state) {
                case BlobDeleteState.Complete:
                case BlobDeleteState.Failed:
                    clearInterval(this._updateInterval);
                    this._updateInterval = null;
                    break;
                case BlobDeleteState.Starting:
                    this._state = BlobDeleteState.Active;
                    if (this._done) {
                        this._activity.title = "Deleted '" + this._args.blobRef.fileName + "'";
                        this._activity.status = ActivityStatus_1.default.Success;
                    }
                    if (this._error) {
                        this._activity.title = "Failed to delete '" + this._args.blobRef.fileName + "'";
                        this._activity.status = ActivityStatus_1.default.Error;
                        this._activity.message = this._error;
                    }
            }
            this._updateActivity();
            this._activityManager.update(this._activityRef, this._activity);
        }
    };
    BlobDelete.prototype.start = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var retryDuration, blobService, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._state = BlobDeleteState.Starting;
                        retryDuration = flobManager.getRetryDurationFromFlobSize(this._args.blobRef.length);
                        return [4 /*yield*/, BlobUtilities_1.getBlobService(this._args.blobContainerRef.connectionString, "BlobDelete.start", retryDuration)];
                    case 1:
                        blobService = _a.sent();
                        this._deferred = Q.defer();
                        this._cancelFiler = blobService.cancelFilter;
                        options = {};
                        if (this._args.blobRef.snapshot) {
                            options.snapshotId = this._args.blobRef.snapshot;
                        }
                        blobService.deleteBlobIfExists(this._args.blobContainerRef.name, this._args.blobRef.fileName, options, this._onCompleteCallback);
                        this.updateActivity();
                        return [2 /*return*/, this._deferred.promise];
                }
            });
        });
    };
    BlobDelete.prototype.stop = function () {
        if (this._cancelFiler) {
            this._cancelFiler.Cancel();
        }
    };
    return BlobDelete;
}());
exports.default = BlobDelete;

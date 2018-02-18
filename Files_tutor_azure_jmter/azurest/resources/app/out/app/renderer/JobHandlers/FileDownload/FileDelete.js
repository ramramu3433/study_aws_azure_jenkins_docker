"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var FileUtilities_1 = require("../../Azure/AzureStorage/Files/FileUtilities");
var storageManagerHelper = require("../../Azure/AzureStorage/StorageManagerHelper");
var Q = require("q");
var ActivityStatus_1 = require("../../Components/Activities/ActivityStatus");
var FileDeleteState;
(function (FileDeleteState) {
    FileDeleteState[FileDeleteState["WaitingToStart"] = 0] = "WaitingToStart";
    FileDeleteState[FileDeleteState["Starting"] = 1] = "Starting";
    FileDeleteState[FileDeleteState["Active"] = 2] = "Active";
    FileDeleteState[FileDeleteState["Complete"] = 3] = "Complete";
    FileDeleteState[FileDeleteState["Failed"] = 4] = "Failed";
})(FileDeleteState || (FileDeleteState = {}));
var FileDownload = (function () {
    function FileDownload(args, activityManager, host) {
        var _this = this;
        this._updateActivity = function () {
            switch (_this._state) {
                case FileDeleteState.Complete:
                    _this._activity.title = "Deleted '" + _this._args.fileRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Success;
                    _this._activity.actions = [];
                    break;
                case FileDeleteState.Failed:
                    _this._activity.title = "Failed to delete '" + _this._args.fileRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Error;
                    _this._activity.actions = [];
                    break;
                case FileDeleteState.Starting:
                case FileDeleteState.Active:
                    _this._activity.title = "Deleting '" + _this._args.fileRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [];
                    break;
                case FileDeleteState.WaitingToStart:
                    _this._activity.title = "Waiting to delete '" + _this._args.fileRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Pending;
                    _this._activity.actions = [];
                    break;
                default:
                    _this._activity.title = "Unknown State '" + _this._args.fileRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Error;
                    _this._activity.actions = [];
            }
        };
        this._onCompleteCallback = function (error, result) {
            if (error) {
                _this._error = storageManagerHelper.processError(error);
                _this._state = FileDeleteState.Failed;
                _this._deferred.reject(_this._error);
            }
            else {
                _this._state = FileDeleteState.Complete;
                _this._deferred.resolve(undefined);
            }
            _this.updateActivity();
        };
        this._args = args;
        this._activityManager = activityManager;
        this._state = FileDeleteState.WaitingToStart;
        this._host = host;
    }
    FileDownload.prototype.updateActivity = function () {
        var _this = this;
        if (!this._addActivityPromise) {
            this._activity = {
                title: "Deleting '" + this._args.fileRef.fileName + "'",
                message: "",
                parent: undefined,
                actions: [],
                progress: null,
                sortOrder: 1,
                status: ActivityStatus_1.default.InProgress
            };
            this._updateActivity();
            this._addActivityPromise = this._activityManager.add(this._activity).then(function (activityRef) {
                _this._activityRef = activityRef;
            });
        }
        if (!this._activityRef) {
            this._addActivityPromise.then(function () {
                _this.updateActivity();
            });
        }
        else {
            switch (this._state) {
                case FileDeleteState.Complete:
                case FileDeleteState.Failed:
                    // Stop Updating
                    clearInterval(this._updateIntervalId);
                    this._updateIntervalId = null;
                    break;
                case FileDeleteState.Starting:
                    this._state = FileDeleteState.Active;
                    break;
            }
            this._updateActivity();
            this._activityManager.update(this._activityRef, this._activity);
        }
    };
    FileDownload.prototype.start = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                this._state = FileDeleteState.Starting;
                return [2 /*return*/, FileUtilities_1.getFileService(this._args.fileShareRef.connectionString, "deleteFileShare")
                        .then(function (fileService) {
                        _this._deferred = Q.defer();
                        fileService.deleteFile(_this._args.fileShareRef.shareName, _this._args.fileRef.fileDirectory, _this._args.fileRef.fileName, _this._onCompleteCallback);
                        _this.updateActivity();
                        return _this._deferred.promise;
                    })];
            });
        });
    };
    return FileDownload;
}());
exports.default = FileDownload;

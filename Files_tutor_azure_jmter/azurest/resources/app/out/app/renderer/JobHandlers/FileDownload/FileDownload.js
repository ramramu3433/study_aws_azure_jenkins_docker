"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var FileUtilities_1 = require("../../Azure/AzureStorage/Files/FileUtilities");
var storageManagerHelper = require("../../Azure/AzureStorage/StorageManagerHelper");
var flobManager = require("../../Azure/AzureStorage/FlobManager");
var fs = require("fs");
var Q = require("q");
var ActivityStatus_1 = require("../../Components/Activities/ActivityStatus");
var HumanReadableSpeedSummary_1 = require("../Common/HumanReadableSpeedSummary");
var FileDownloadState;
(function (FileDownloadState) {
    FileDownloadState[FileDownloadState["WaitingToStart"] = 0] = "WaitingToStart";
    FileDownloadState[FileDownloadState["Starting"] = 1] = "Starting";
    FileDownloadState[FileDownloadState["Active"] = 2] = "Active";
    FileDownloadState[FileDownloadState["Complete"] = 3] = "Complete";
    FileDownloadState[FileDownloadState["Failed"] = 4] = "Failed";
    FileDownloadState[FileDownloadState["Canceling"] = 5] = "Canceling";
    FileDownloadState[FileDownloadState["Canceled"] = 6] = "Canceled";
})(FileDownloadState || (FileDownloadState = {}));
var FileDownload = (function () {
    function FileDownload(args, activityManager, host) {
        var _this = this;
        this._updateActivity = function () {
            switch (_this._state) {
                case FileDownloadState.Complete:
                    _this._activity.title = "Downloaded '" + _this._args.fileRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Success;
                    _this._activity.message = "";
                    _this._activity.actions = [
                        {
                            title: "Open Folder"
                        }
                    ];
                    break;
                case FileDownloadState.Canceling:
                    _this._activity.title = "Canceling download of '" + _this._args.fileRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [];
                    _this._activity.message = "";
                    break;
                case FileDownloadState.Canceled:
                    _this._activity.title = "Canceled download of '" + _this._args.fileRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Canceled;
                    _this._activity.message = "";
                    _this._activity.actions = [];
                    break;
                case FileDownloadState.Failed:
                    _this._activity.title = "Failed to download '" + _this._args.fileRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Error;
                    _this._activity.message = JSON.stringify(_this._error);
                    _this._activity.actions = [];
                    break;
                case FileDownloadState.WaitingToStart:
                    _this._activity.title = "Initializing download of '" + _this._args.fileRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Pending;
                    _this._activity.actions = [];
                    _this._activity.progress = 0;
                    break;
                case FileDownloadState.Starting:
                    _this._activity.title = "Initializing download of '" + _this._args.fileRef.fileName + "'";
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [];
                    _this._activity.progress = 0;
                    break;
                case FileDownloadState.Active:
                    _this._activity.title = "Downloading '" + _this._args.fileRef.fileName + "'";
                    _this._activity.progress = _this._speedSummary.getPercent();
                    _this._activity.message = _this._speedSummary.getSummary();
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [
                        {
                            title: "Cancel"
                        }
                    ];
                    break;
                default:
                    _this._activity.title = "Unknown state during download of '" + _this._args.fileRef.fileName + "'";
                    _this._activity.progress = null;
                    _this._activity.message = "";
                    _this._activity.status = ActivityStatus_1.default.Error;
                    _this._activity.actions = [];
            }
        };
        this._onCompleteCallback = function (error, result) {
            if (_this._state === FileDownloadState.Canceled) {
                // storage library calls into the callback twice for some reason
                return;
            }
            else if (_this._state === FileDownloadState.Canceling) {
                _this._state = FileDownloadState.Canceled;
            }
            else if (error) {
                console.assert(!fs.existsSync(_this._args.localPath), "'" + _this._args.localPath + "' exists and storage library should have cleaned it up.");
                _this._error = storageManagerHelper.processError(error);
                _this._state = FileDownloadState.Failed;
                _this._deferred.reject(_this._error);
            }
            else {
                _this._state = FileDownloadState.Complete;
                _this._deferred.resolve(undefined);
            }
            _this.updateActivity();
        };
        this._showItemInFolder = function () {
            _this._host.executeOperation("FileSystemProvider.showItemInFolder", { path: _this._args.localPath });
        };
        this._args = args;
        this._activityManager = activityManager;
        this._host = host;
        this._state = FileDownloadState.WaitingToStart;
        this._activityManager.onExecuteAction(function (activityRef, action) {
            if (activityRef.id === _this._activityRef.id) {
                switch (action.title) {
                    case "Cancel":
                        _this.stop();
                        break;
                    case "Open Folder":
                        _this._showItemInFolder();
                        break;
                }
            }
        });
    }
    FileDownload.prototype.updateActivity = function () {
        var _this = this;
        if (!this._addActivityPromise) {
            this._activity = {
                title: "",
                message: "",
                parent: undefined,
                actions: [],
                progress: 0,
                sortOrder: 1,
                status: ActivityStatus_1.default.InProgress
            };
            this._updateActivity();
            this._addActivityPromise = this._activityManager.add(this._activity).then(function (activityRef) {
                _this._activityRef = activityRef;
            });
            this._updateIntervalId = setInterval(function () { return _this.updateActivity(); }, 5000);
        }
        if (!this._activityRef) {
            this._addActivityPromise.then(function () {
                _this.updateActivity();
            });
        }
        else {
            switch (this._state) {
                case FileDownloadState.Canceled:
                case FileDownloadState.Complete:
                case FileDownloadState.Failed:
                    // Stop Updating
                    clearInterval(this._updateIntervalId);
                    this._updateIntervalId = null;
                    break;
                case FileDownloadState.Starting:
                    if (!!this._speedSummary && this._speedSummary.hasStarted()) {
                        this._state = FileDownloadState.Active;
                    }
                    else {
                        // if it's still starting then update more frequently
                        setTimeout(function () { return _this.updateActivity(); }, 1000);
                    }
                    break;
            }
            this._updateActivity();
            this._activityManager.update(this._activityRef, this._activity);
        }
    };
    FileDownload.prototype.start = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var retryDuration;
            return tslib_1.__generator(this, function (_a) {
                this._state = FileDownloadState.Starting;
                retryDuration = flobManager.getRetryDurationFromFlobSize(this._args.fileRef.length);
                return [2 /*return*/, FileUtilities_1.getFileService(this._args.fileShareRef.connectionString, "downloadFile", retryDuration)
                        .then(function (fileService) {
                        _this._deferred = Q.defer();
                        _this._cancelFilter = fileService.cancelFilter;
                        var options = {};
                        var speedSummary = fileService.getFileToLocalFile(_this._args.fileShareRef.shareName, _this._args.fileRef.fileDirectory, _this._args.fileRef.fileName, _this._args.localPath, options, _this._onCompleteCallback);
                        _this._speedSummary = new HumanReadableSpeedSummary_1.default(speedSummary);
                        _this.updateActivity();
                        return _this._deferred.promise;
                    })];
            });
        });
    };
    FileDownload.prototype.stop = function () {
        if (this._cancelFilter) {
            this._cancelFilter.Cancel();
        }
        this._state = FileDownloadState.Canceling;
        this.updateActivity();
    };
    return FileDownload;
}());
exports.default = FileDownload;

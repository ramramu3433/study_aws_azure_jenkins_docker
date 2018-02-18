"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BlobDownload_1 = require("../Download/BlobDownload");
var BlobDownloadState_1 = require("../Download/BlobDownloadState");
var ActivityStatus_1 = require("../../../Components/Activities/ActivityStatus");
var ExceptionSerialization_1 = require("../../../Components/Errors/ExceptionSerialization");
var path = require("path");
var BlobOpen = (function (_super) {
    tslib_1.__extends(BlobOpen, _super);
    function BlobOpen(job, activityManager, host, groupManager, retryAttempt) {
        var _this = _super.call(this, job, activityManager, host, groupManager, retryAttempt) || this;
        _this._updateActivity = function () {
            var localPath = path.resolve(_this._args.baseLocalPath, _this._args.relativePath);
            switch (_this._state) {
                case BlobDownloadState_1.default.Complete:
                    _this._activity.title = "Opened '" + _this._args.blobRef.fileName + "'";
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
                    _this._activity.title = "Canceling Open '" + _this._args.blobRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.InProgress;
                    _this._activity.actions = [];
                    _this._activity.message = "";
                    _this._activity.progress = null;
                    break;
                case BlobDownloadState_1.default.Canceled:
                    _this._activity.title = "Canceled Open '" + _this._args.blobRef.fileName + "'";
                    _this._activity.status = ActivityStatus_1.default.Canceled;
                    _this._activity.message = "";
                    _this._activity.actions = [];
                    _this._activity.progress = null;
                    break;
                case BlobDownloadState_1.default.Failed:
                    _this._activity.title = "Failed To Open '" + _this._args.blobRef.fileName + "'";
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
                                    queue: { name: "open" }
                                }
                            }
                        }
                    ];
                    break;
                case BlobDownloadState_1.default.WaitingToStart:
                    _this._activity.title = "Queued open of '" + _this._args.blobRef.fileName + "'";
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
                    _this._activity.title = "Initializing open of '" + _this._args.blobRef.fileName + "'";
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
                    _this._activity.title = "Opening '" + _this._args.blobRef.fileName + "' (downloading)";
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
                    _this._activity.title = "Skipped Open '" + _this._args.blobRef.fileName + "'";
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
                    _this._activity.title = "Unresolved open conflict for '" + _this._args.blobRef.fileName + "'";
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
        return _this;
    }
    return BlobOpen;
}(BlobDownload_1.default));
exports.default = BlobOpen;

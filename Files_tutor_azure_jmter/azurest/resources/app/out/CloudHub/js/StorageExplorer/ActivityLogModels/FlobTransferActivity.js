/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "ActivityLog/ActivityLogStatus", "ActivityLog/StorageExplorer/FlobOverwritableActivity", "Common/Utilities"], function (require, exports, _string, ActivityLogStatus, FlobOverwritableActivity_1, Utilities) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a flob upload or download (not copy - that's done differently)
     */
    var FlobTransferActivity = (function (_super) {
        __extends(FlobTransferActivity, _super);
        // TODO: Put the flob size into the telemetry data...
        function FlobTransferActivity(host, container, initialTitle, // Initial title, e.g. "Discovering blobs to upload..."
            telemetryInfo, size) {
            var _this = _super.call(this, initialTitle, null /*actionWithOverwrite, see below*/, FlobTransferActivity._isBig(size) ?
                {
                    flobType: telemetryInfo.flobType,
                    telemetry: telemetryInfo.telemetry,
                    telemetryEventName: telemetryInfo.telemetryEventName + ".Big"
                } : telemetryInfo) || this;
            _this.StartingPollIntervalMs = 1000;
            _this.DelayScale = 1.05; // Slowly take longer between updates
            _this.MaxDelayMs = 1000 * 10; // .. but no longer than 10s
            _this._delayPollForProgress = function (poll, updateProgress, millisecondsDelay) {
                return Utilities.delayAction(function () { return FlobTransferActivity._pollForProgress(poll, updateProgress); }, millisecondsDelay)
                    .then(function () {
                    if (_this.rawStatus() === ActivityLogStatus.InProgress) {
                        var newDelay = Utilities.ensureBetweenBounds(millisecondsDelay * _this.DelayScale, 1, _this.MaxDelayMs);
                        return _this._delayPollForProgress(poll, updateProgress, newDelay);
                    }
                    else {
                        // If the task is no longer active, we should stop polling, but
                        // first do one more poll to give it a chance to give us completed stats.
                        if (_this.rawStatus() === ActivityLogStatus.Success) {
                            updateProgress(1, "");
                        }
                        else {
                            FlobTransferActivity._pollForProgress(poll, updateProgress);
                        }
                        return null;
                    }
                }, function (error) {
                    if (_this.rawStatus() === ActivityLogStatus.InProgress) {
                        _this._handleRejected(error);
                    }
                });
            };
            _this._host = host;
            _this._container = container;
            _this._size = size;
            // Release progress when done
            _this.onSuccessOrFailure(function () {
                _this._releaseTransfer();
            });
            return _this;
        }
        /**
         * @override
         */
        FlobTransferActivity.prototype._doOverwritableActionCore = function (overwrite) {
            var _this = this;
            this.progress(0);
            var promise = this._startTransfer(overwrite);
            // Start polling for progress
            this._delayPollForProgress(function () { return _this._getTransferProgress(); }, function (percentageProgress, message) {
                _this.progress(percentageProgress);
                _this.progressMessage(message);
            }, this.StartingPollIntervalMs); // Start out polling every 1 second
            return promise;
        };
        /**
         * @override
         */
        FlobTransferActivity.prototype.getPotentialConcurrency = function () {
            // CONSIDER: Put this information into the backend?
            if (this._size >= FlobTransferActivity.SingleFlobPutThresholdInBytes) {
                // If greater than this size, it can be broken into chunks
                return Math.ceil(this._size / FlobTransferActivity.ChunkSizeInBytes);
            }
            else {
                // Otherwise sent as a single chunk
                return 1;
            }
        };
        /**
         * @override
         */
        FlobTransferActivity.prototype._isCancelableCore = function () {
            return true;
        };
        /**
         * @override
         */
        FlobTransferActivity.prototype._requestCancelCore = function () {
            return this._requestCancelTransfer();
        };
        Object.defineProperty(FlobTransferActivity.prototype, "_progressId", {
            get: function () {
                if (!this._progressIdBacking) {
                    this._progressIdBacking = this._createProgressIdCore();
                }
                return this._progressIdBacking;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlobTransferActivity.prototype, "_condenseTelemetry", {
            /**
             * @override
             */
            get: function () {
                if (this._isBigFlob) {
                    // Be verbose (show start/success telemetry) for larger flob transfers, when
                    // we know the size
                    return false;
                }
                else {
                    return true;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlobTransferActivity.prototype, "_isBigFlob", {
            get: function () {
                return FlobTransferActivity._isBig(this._size);
            },
            enumerable: true,
            configurable: true
        });
        FlobTransferActivity._isBig = function (size) {
            return size >= FlobTransferActivity.LargeFlobThresholdBytes;
        };
        return FlobTransferActivity;
    }(FlobOverwritableActivity_1.default));
    FlobTransferActivity.LargeFlobThresholdBytes = 100 * 1000 * 1000; // 100 MB (whether it counts as large in telemetry)
    // TODO: This is DEFAULT_SINGLE_BLOB_PUT_THRESHOLD_IN_BYTES in the node.js client library. We should get this from the backend.
    /**
     * The size in bytes past which a blob/file upload/download will be broken up into chunks.
     */
    FlobTransferActivity.SingleFlobPutThresholdInBytes = 32 * 1024 * 1024;
    /**
     * The size of each download/upload chunk if the flob size is over SingleFlobPutThresholdInBytes
     */
    FlobTransferActivity.ChunkSizeInBytes = 4 * 1024 * 1024;
    FlobTransferActivity._pollForProgress = function (poll, updateProgress) {
        return poll()
            .then(function (result) {
            if (result) {
                var progressMessage = _string.sprintf("%s of %s (speed: %s, average: %s)", // Localize
                result.friendlyCompleted, result.friendlyTotalSize, result.friendlySpeed, result.friendlyAverageSpeed);
                updateProgress(result.progressPercentage, progressMessage);
            }
        });
    };
    exports.FlobTransferActivity = FlobTransferActivity;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobTransferActivity;
});

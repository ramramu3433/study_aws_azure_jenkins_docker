/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/ActionCanceledError", "ActivityLog/ActivityLogStatus", "Providers/Common/AzureStorageConstants", "ActivityLog/StorageExplorer/CopyType", "Common/Debug", "Common/Errors", "StorageExplorer/ActivityLogModels/FlobDeleter", "ActivityLog/StorageExplorer/OverwritableActivity", "ActivityLog/StorageExplorer/OverwriteMode", "Common/Utilities", "underscore.string"], function (require, exports, ActionCanceledError_1, ActivityLogStatus, AzureStorageConstants, CopyType_1, Debug, Errors, FlobDeleter, OverwritableActivity_1, OverwriteMode, Utilities, _string) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a file/blob copy or rename operation
     */
    var FlobCopyActivity = (function (_super) {
        __extends(FlobCopyActivity, _super);
        function FlobCopyActivity(host, srcContainer, sourceAccountUri, srcContainerSasToken, srcFlobPath, srcSnapshot, destContainer, destFlobPath, copyType, listViewModel, telemetryInfo, overwrite) {
            if (overwrite === void 0) { overwrite = false; }
            var _this = _super.call(this, FlobCopyActivity._getTitle(srcFlobPath, destFlobPath, copyType), telemetryInfo, overwrite ? OverwriteMode.Overwrite : undefined) || this;
            // abstract
            _this.DestinationExistsErrorMessage = "DestinationExistsErrorMessage";
            _this._deleteOriginal = function () {
                return FlobDeleter.deleteFlobAndUpdateView(_this._srcContainer, _this._srcFlobPath, _this._listViewModel, _this._srcSnapshot)
                    .catch(function (error) {
                    var newMessage = "Could not delete the original item after copying." // Localize
                        + "\n" + Utilities.getErrorMessage(error);
                    throw new Error(newMessage);
                });
            };
            _this._copy = function (overwrite) {
                _this.progress(0);
                var checkExistencePromise = Promise.resolve(false);
                if (!overwrite && !_this._supportsThrowingIfExists()) {
                    // We have to check ourselves if the destination exists before trying to copy
                    checkExistencePromise = _this._destContainer.itemExists(_this._destFlobPath, null);
                }
                return checkExistencePromise.then(function (exist) {
                    if (!exist) {
                        return _this._startCopy(overwrite || !_this._supportsThrowingIfExists())
                            .then(function (result) {
                            if (FlobCopyActivity._isCopyCompleted(result)) {
                                // Already finished copying
                                return true;
                            }
                            else {
                                // Pending - start polling for progress
                                return _this._delayPollForCompletion(function () { return _this._destContainer.getCopyProgress(_this._destFlobPath); }, function (percentageProgress, message) {
                                    _this.progress(percentageProgress);
                                    _this.progressMessage(message);
                                }, 1000); // Start out polling every 1 second
                            }
                        });
                    }
                    else {
                        return Promise.reject(new Errors.DestinationExistsError(_this.DestinationExistsErrorMessage));
                    }
                });
            };
            _this._startCopy = function (overwrite) {
                _this._copyId = null;
                _this._cancelRequested = false;
                return _this._destContainer.startCopyIntoThisContainer(_this._srcContainer, _this._srcFlobPath, _this._sourceUriWithSas, _this._srcSnapshot, _this._destFlobPath, overwrite)
                    .then(function (result) {
                    Debug.assert(!_this._copyId);
                    _this._copyId = result.copyId;
                    if (_this._cancelRequested) {
                        _this._cancelRequested = false;
                        if (result.status === AzureStorageConstants.AzureBlobCopyStatus.Pending) {
                            return _this._destContainer.abortCopy(_this._destFlobPath, result.copyId);
                        }
                    }
                    return result;
                });
            };
            _this._host = host;
            _this._copyType = copyType;
            _this._listViewModel = listViewModel;
            _this._srcContainer = srcContainer;
            _this._srcFlobPath = srcFlobPath;
            _this._srcSnapshot = srcSnapshot;
            _this._destContainer = destContainer;
            _this._sourceUriWithSas = Utilities.appendSlash(sourceAccountUri)
                + srcContainer.getName() + "/"
                + encodeURIComponent(srcFlobPath)
                + "?" + srcContainerSasToken;
            _this._destFlobPath = destFlobPath;
            return _this;
        }
        /**
         * @override
         */
        FlobCopyActivity.prototype._doOverwritableActionCore = function (overwrite) {
            var _this = this;
            var copyPromise = this._copied ? Promise.resolve(null) : this._copy(overwrite);
            return copyPromise
                .then(function () {
                _this._copied = true;
                _this._showDestinationInView();
                if (FlobCopyActivity._shouldDeleteOriginalItemsAfterCopy(_this._copyType)) {
                    // Delete original after copy
                    return _this._deleteOriginal();
                }
            });
        };
        FlobCopyActivity._shouldDeleteOriginalItemsAfterCopy = function (copyType) {
            return copyType === CopyType_1.default.Rename;
        };
        FlobCopyActivity._getTitle = function (sourceFlobPath, destFlobPath, copyType) {
            var template = copyType === CopyType_1.default.Copy ? "Copying '%s' to '%s'" : "Renaming '%s' to '%s'";
            return _string.sprintf(template, sourceFlobPath, destFlobPath);
        };
        /**
         * Returns "Copy" or "Rename" (to be used only for telemetry/internal use, not end-user strings)
         */
        FlobCopyActivity.getTelemetryCopyType = function (copyType) {
            return copyType === CopyType_1.default.Copy ? "Copy" : "Rename";
        };
        FlobCopyActivity._pollIsCompleted = function (poll, updateProgress) {
            return poll()
                .then(function (result) {
                updateProgress(result.progressPercentage, result.progressMessage);
                return Promise.resolve(FlobCopyActivity._isCopyCompleted(result));
            });
        };
        FlobCopyActivity.prototype._delayPollForCompletion = function (poll, updateProgress, millisecondsDelay) {
            var _this = this;
            var delayScale = 1.05; // Slowly take longer between updates
            var maxDelay = 1000 * 10; // .. but no longer than 10s
            return Utilities.delayAction(function () { return FlobCopyActivity._pollIsCompleted(poll, updateProgress); }, millisecondsDelay)
                .then(function (isCompleted) {
                // If the task is no longer active, we should stop polling
                if (_this.rawStatus() === ActivityLogStatus.InProgress) {
                    if (isCompleted) {
                        return Promise.resolve(true);
                    }
                    else {
                        return _this._delayPollForCompletion(poll, updateProgress, Utilities.ensureBetweenBounds(millisecondsDelay * delayScale, 1, maxDelay));
                    }
                }
            }, function (error) {
                if (_this.rawStatus() === ActivityLogStatus.InProgress) {
                    _this._handleRejected(error);
                }
            });
        };
        Object.defineProperty(FlobCopyActivity.prototype, "_condenseTelemetry", {
            /**
             * @override
             */
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @override
         */
        FlobCopyActivity.prototype._isCancelableCore = function () {
            return true;
        };
        /**
         * @override
         */
        FlobCopyActivity.prototype._requestCancelCore = function () {
            var copyId = this._copyId;
            if (copyId) {
                return this._destContainer.abortCopy(this._destFlobPath, copyId);
            }
            else {
                // We don't have a copyId yet (we get it by asking for progress), so just note the cancel request
                this._cancelRequested = true;
                return Promise.resolve();
            }
        };
        FlobCopyActivity.prototype._showDestinationInView = function () {
            var _this = this;
            // Update the current view once the copy is completed
            return this._destContainer.getItem(this._destFlobPath, this._srcSnapshot)
                .then(function (flob) {
                if (_this._listViewModel) {
                    _this._listViewModel.addFlobToCurrentFolder(flob).then(function () {
                        _this._listViewModel.redrawTableThrottled();
                    });
                }
            });
        };
        return FlobCopyActivity;
    }(OverwritableActivity_1.default));
    // Returns true if completed or false if copy in progress, or throws an exception
    // if failed or aborted.
    FlobCopyActivity._isCopyCompleted = function (result) {
        var isCompleted = false;
        switch (result.status) {
            case AzureStorageConstants.AzureBlobCopyStatus.Aborted:
                throw new ActionCanceledError_1.ActionCanceledError(result.statusDescription || result.status);
            case AzureStorageConstants.AzureBlobCopyStatus.Failed:
                throw new Error(result.statusDescription || result.status);
            case AzureStorageConstants.AzureBlobCopyStatus.Success:
                isCompleted = true;
                break;
            case AzureStorageConstants.AzureBlobCopyStatus.Pending:
                isCompleted = false;
                break;
        }
        return isCompleted;
    };
    exports.FlobCopyActivity = FlobCopyActivity;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobCopyActivity;
});

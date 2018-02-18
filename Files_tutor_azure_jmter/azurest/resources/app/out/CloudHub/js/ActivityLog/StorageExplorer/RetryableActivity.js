/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/ObservableActivity"], function (require, exports, ExtendedStatus, ObservableActivity) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an operation that can
     *   be canceled or retried.
     */
    var RetryableActivity = (function (_super) {
        __extends(RetryableActivity, _super);
        function RetryableActivity(title) {
            var _this = _super.call(this, title) || this;
            _this.cancelDisplayName = "Cancel"; // localize
            _this.retryDisplayName = "Retry"; // localize
            _this.cancel = function () {
                // Override
            };
            _this.retry = function () {
                // Override
            };
            return _this;
        }
        RetryableActivity.prototype._canRetryCore = function () {
            return true;
        };
        RetryableActivity.prototype._canCancelCore = function () {
            return true;
        };
        RetryableActivity.prototype._initializeObservables = function () {
            var _this = this;
            _super.prototype._initializeObservables.call(this);
            this.canRetry = this._overridableComputed(this._canRetryCore, this);
            this.canCancel = this._overridableComputed(this._canCancelCore, this);
            this.canRetry.subscribe(function (value) {
                _this._updateActions();
                _this._firePropertyChanged("canRetry");
            });
            this.canCancel.subscribe(function (value) {
                _this._updateActions();
                _this._firePropertyChanged("canCancel");
            });
        };
        RetryableActivity.prototype.isRetrying = function () {
            return this.extendedStatus() === ExtendedStatus.Retrying;
        };
        RetryableActivity.prototype.isCanceling = function () {
            return this.extendedStatus() === ExtendedStatus.Canceling;
        };
        RetryableActivity.prototype.isCanceled = function () {
            return this.extendedStatus() === ExtendedStatus.Canceled;
        };
        /**
         * @override
         */
        RetryableActivity.prototype._updateActions = function () {
            _super.prototype._updateActions.call(this);
            // Add/remove the retry button
            this._addOrRemoveAction(this.retryDisplayName, this.retry, this.canRetry());
            // Add/remove the cancel button
            this._addOrRemoveAction(this.cancelDisplayName, this.cancel, this.canCancel());
        };
        return RetryableActivity;
    }(ObservableActivity));
    return RetryableActivity;
});

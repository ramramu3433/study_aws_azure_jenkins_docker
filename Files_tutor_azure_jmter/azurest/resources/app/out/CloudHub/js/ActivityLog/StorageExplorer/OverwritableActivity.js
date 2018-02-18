/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "ActivityLog/StorageExplorer/ActionBasedActivity", "ActivityLog/StorageExplorer/ActionCanceledError", "Common/Errors", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/OverwriteMode"], function (require, exports, ko, ActionBasedActivity_1, ActionCanceledError_1, Errors, ExtendedStatus, OverwriteMode) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a blob operation that
     * can have destination blob already exists errors.
     */
    var OverwritableActivity = (function (_super) {
        __extends(OverwritableActivity, _super);
        function OverwritableActivity(title, telemetryInfo, overwriteMode) {
            if (overwriteMode === void 0) { overwriteMode = OverwriteMode.LetUserResolve; }
            var _this = _super.call(this, title, telemetryInfo) || this;
            _this._overwriteDisplayName = "Overwrite"; // localize
            /**
             * Handle restarting or canceling activities with conflicts if we have an overwrite mode set
             */
            _this._handleOverwriteModeForConflicts = function () {
                // If there is a conflict...
                if (_this._currentErrorIsConflict()) {
                    if (_this._overwriteMode() === OverwriteMode.Overwrite) {
                        // ... and the resolution mode changes to Overwrite, then restart
                        _this.restart();
                    }
                    else if (_this._overwriteMode() === OverwriteMode.KeepExisting) {
                        // ... and the resolution mode changes to KeepExisting, then cancel
                        _this._handleRejected(new ActionCanceledError_1.ActionCanceledError());
                    }
                }
            };
            _this._currentErrorIsConflict = ko.pureComputed(function () {
                var error = _this._currentError();
                return OverwritableActivity._errorIsConflict(error);
            });
            // This isn't whether the current error is a conflict (that's _currentErrorIsConflict),
            // but rather if we should show the conflict resolution buttons.
            _this.hasConflict = ko.pureComputed(function () {
                // Only show it as a conflict if the user hasn't selected a resolution
                return _this._overwriteMode() === OverwriteMode.LetUserResolve
                    && _this._currentErrorIsConflict();
            });
            /**
             * Sets the activity's overwrite mode to keep existing
             */
            _this.keepExisting = function () {
                _this._overwriteMode(OverwriteMode.KeepExisting);
            };
            /**
             * Sets the activity's overwrite mode to overwrite
             */
            _this.overwrite = function () {
                _this._sendEvent({ "Overwrite": "Yes" });
                // Changing this will automatically set up a restart if needed
                _this._overwriteMode(OverwriteMode.Overwrite);
            };
            _this._overwriteMode = ko.observable(overwriteMode);
            _this.hasConflict.subscribe(function (value) {
                _this._updateActions();
                _this._firePropertyChanged("hasConflict");
            });
            _this._overwriteMode.subscribe(_this._handleOverwriteModeForConflicts);
            return _this;
        }
        /**
         * @override
         */
        OverwritableActivity.prototype._doActionCore = function () {
            var overwrite = this._overwriteMode() === OverwriteMode.Overwrite;
            return this._doOverwritableActionCore(overwrite);
        };
        /**
         * @override
         */
        OverwritableActivity.prototype._handleRejected = function (error, newStatus) {
            if (newStatus === void 0) { newStatus = ExtendedStatus.Error; }
            if (newStatus === ExtendedStatus.Error && OverwritableActivity._errorIsConflict(error)) {
                // Use Conflict instead of error if the error is a conflict
                // CONSIDER: Get rid of the concept of having an error around when there is a conflict
                newStatus = ExtendedStatus.Conflict;
            }
            _super.prototype._handleRejected.call(this, error, newStatus);
            // Deal with any new conflicts if we have an overwrite mode
            this._handleOverwriteModeForConflicts();
        };
        OverwritableActivity._errorIsConflict = function (error) {
            return error && error.name === Errors.errorNames.DestinationExistsError;
        };
        /**
         * @override
         */
        OverwritableActivity.prototype._canRetryCore = function () {
            // Don't show Retry button if it's a conflict error
            return _super.prototype._canRetryCore.call(this) && !this._currentErrorIsConflict();
        };
        /**
         * @override
         */
        OverwritableActivity.prototype._canCancelCore = function () {
            if (_super.prototype._canCancelCore.call(this)) {
                return true;
            }
            if (this.hasConflict()) {
                // Cancel for a conflict means to stop asking to override
                return true;
            }
            return false;
        };
        /**
         * @override
         */
        OverwritableActivity.prototype._updateActions = function () {
            _super.prototype._updateActions.call(this);
            // Add/remove the overwrite button
            this._addOrRemoveAction(this._overwriteDisplayName, this.overwrite, this.hasConflict());
        };
        return OverwritableActivity;
    }(ActionBasedActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = OverwritableActivity;
});

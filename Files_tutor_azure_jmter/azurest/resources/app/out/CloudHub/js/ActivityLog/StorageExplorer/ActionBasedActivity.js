/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "ActivityLog/StorageExplorer/ActionCanceledError", "ActivityLog/ActivityLogStatus", "Common/Debug", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/ObservableActivity", "ActivityLog/StorageExplorer/RetryableActivity", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, ko, ActionCanceledError, ActivityLogStatus, Debug, ExtendedStatus, ObservableActivity, RetryableActivity, StorageExplorerConstants, Utilities) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an operation that can
     *   be described via functions to start, retry and cancel
     */
    var ActionBasedActivity = (function (_super) {
        __extends(ActionBasedActivity, _super);
        function ActionBasedActivity(title, telemetryInfo // TODO: Get this through virtual function instead of constructor?
        ) {
            var _this = _super.call(this, title) || this;
            _this._completionCallbacks = [];
            _this._currentError = ko.observable();
            _this._lastAutoRetryIntervalMs = 0;
            _this._retryCount = 0;
            _this.onSuccessOrFailure = function (callback) {
                _this._completionCallbacks.push(callback);
            };
            /**
             * Places the activity back into the queue as pending
             */
            _this.resetToPending = function () {
                _this._clearAutoRetryTimer();
                _this._currentError(null);
                _this.mainMessage(null);
                _this.progress(0);
                _this.extendedStatus(ExtendedStatus.Pending);
            };
            // Restarts a task, whether for a user-specified Retry, or for
            //   resolving a conflict.
            _this.restart = function () {
                _this._clearAutoRetryTimer();
                if (_this._parent && _this._parent.restartChild) {
                    // Let parent handle it
                    _this._parent.restartChild(_this);
                }
                else {
                    _this.resetToPending();
                    _this.start();
                }
            };
            /**
             * @override
             */
            _this.retry = function () {
                // TODO only send telemetry if retried manually
                if (_this.canRetry()) {
                    _this._sendEvent(ObservableActivity.getCurrentTimeTelemetryProperties(_this, { "Retry": "Yes" }));
                    // Start auto-retry interval over, since user initiated this retry
                    _this._lastAutoRetryIntervalMs = 0;
                    _this._retryCount++;
                    _this.restart();
                }
            };
            _this.start = function () {
                var status = _this.rawStatus();
                if (status !== ActivityLogStatus.Pending && status !== ActivityLogStatus.Error) {
                    return;
                }
                _this._currentPromise = null;
                _this._currentError(null);
                _this._clearAutoRetryTimer();
                _this.progress(0);
                _this.mainMessage(null);
                _this.extendedStatus(ExtendedStatus.InProgress);
                // Start the action
                try {
                    var delayedAction = function () {
                        _this.resetStartTime(null);
                        if (!_this._condenseTelemetry) {
                            _this._sendEvent(ObservableActivity.getStartTimeTelemetryProperties(_this, null, { "Start": "Yes" }));
                        }
                        return _this._doActionCore();
                    };
                    // If in testing mode, add random delays and failures
                    delayedAction = Utilities.addRandomDelayAndFailureIfTesting(delayedAction, 0, 10000, .5);
                    _this._currentPromise = delayedAction();
                }
                catch (error) {
                    _this._handleRejected(error);
                    return;
                }
                // Hook up the promise success and fail
                var promise = _this._currentPromise;
                promise.then(function (result) {
                    // If this resolution still applies to the last time we started/restarted...
                    if (promise === _this._currentPromise) {
                        _this._handleFulfilled(result);
                    }
                }, function (error) {
                    // If this resolution still applies to the last time we started/restarted...
                    if (promise === _this._currentPromise) {
                        _this._handleRejected(error);
                    }
                });
            };
            /**
             * @override
             */
            _this.cancel = function () {
                if (_this.canCancel()) {
                    // Only use the this._cancel method passed in to us if the action is actually in progress.
                    // For pending/etc we don't need to do anything specific to the action, just set an error
                    // so it never starts.
                    var isCancelingActiveAction = _this._isCancelableCore && _this.extendedStatus() === ExtendedStatus.InProgress;
                    var requestCancel = isCancelingActiveAction
                        ? function () { return _this._requestCancelCore(); }
                        : function () {
                            _this._handleRejected(new ActionCanceledError.ActionCanceledError());
                            return Promise.resolve();
                        };
                    // If in testing mode, add random delays and failures to the requestCancel action
                    requestCancel = Utilities.addRandomDelayAndFailureIfTesting(requestCancel, 0, 3000, .4);
                    // Call cancel method if one was provided (you can cancel without one
                    //   if the entry is in pending state.
                    _this.mainMessage("Canceling..."); // localize
                    _this.extendedStatus(ExtendedStatus.Canceling);
                    // TODO: Should we only send telemetry when cancelingActiveAction?
                    _this._sendEvent(ObservableActivity.getElapsedTimeTelemetryProperties(_this, null, { "CancelResult": "Canceling" }));
                    // Request a cancel.  Returning success here does not mean that the activity
                    //   was canceled, just that the request was registered.  If the cancel succeeds,
                    //   we expect the action promise itself to be rejected with ActionCanceledError,
                    //   which will set the status to Canceled.
                    return requestCancel()
                        .catch(function (error) {
                        if (_this.extendedStatus() === ExtendedStatus.Canceling) {
                            _this.mainMessage("Could not cancel: " + Utilities.getErrorMessage(error)); // Localize
                            _this.extendedStatus(ExtendedStatus.InProgress);
                            _this._sendError(error, ObservableActivity.getElapsedTimeTelemetryProperties(_this, null), "CancelError");
                        }
                    });
                }
            };
            _this._handleFulfilled = function (result) {
                _this._currentPromise = null;
                _this.extendedStatus(ExtendedStatus.Success);
                _this.mainMessage(null);
                _this.progress(1);
                _this.setEndTime();
                _this._resolveWhenSuccessful(result);
                var telemetryProperties = ObservableActivity.getElapsedTimeTelemetryProperties(_this, null, { "Status": "Success" });
                if (_this._condenseTelemetry) {
                    _this._sendCondensedEvent(telemetryProperties);
                }
                else {
                    _this._sendEvent(telemetryProperties);
                }
                _this._notifyCompleted();
            };
            _this._notifyCompleted = function () {
                _this._completionCallbacks.forEach(function (callback) {
                    callback(_this);
                });
            };
            _this._telemetryInfo = telemetryInfo;
            _this._successPromise = new Promise(function (resolve) {
                _this._resolveWhenSuccessful = resolve;
            });
            return _this;
        }
        /**
         * Override if _isCancelableCore() is true to implement a request that the currently-active action be canceled.
         * NOTE: MUST ALSO OVERRIDE isCancelable to true
         *
         * IMPORTANT:
         * Resolving this promise does not mean that the activity was canceled, just that the request was registered.
         * If the cancel succeeds, the action promise must be rejected with ActionCanceledError,
         * which will set the status to Canceled.
         */
        ActionBasedActivity.prototype._requestCancelCore = function () {
            throw new Error("This method must be overridden if isCancelable is true");
        };
        /**
         * Returns true if this activity is ready to be run. If it's dependent on
         * a currently-running activity or other condition, it should return false.
         * @param incompleteActivities All the activities (besides this one) which have been pulled from
         * the pending queue and are not completed or canceled.  It will also include pending activities
         * which have not been started, and activities which have failed.
         */
        ActionBasedActivity.prototype.isReadyToStart = function (incompleteActivities) {
            return true;
        };
        Object.defineProperty(ActionBasedActivity.prototype, "success", {
            /**
             * Resolves only if the activity completes successfully (whether a retry
             * took place or not).
             * We never reject, because failure can occur multiple times with retry.
             */
            get: function () {
                return this._successPromise;
            },
            enumerable: true,
            configurable: true
        });
        ActionBasedActivity.prototype._handleRejected = function (error, newStatus) {
            if (newStatus === void 0) { newStatus = ExtendedStatus.Error; }
            if (error.name === ActionCanceledError.name) {
                // We handle cancel in _handleRejected because a cancel occurs by an activity throwing a cancel error.
                newStatus = ExtendedStatus.Canceled;
            }
            this._currentPromise = null;
            this.extendedStatus(newStatus);
            // TODO: There should be an error message separate from mainMessage so that tasks can't 
            // accidentally overwrite an error message once it's been set
            this.mainMessage(Utilities.getErrorMessage(error));
            this._currentError(error);
            this.setEndTime();
            if (this._isErrorAutoRetryable(error)) {
                this._startAutoRetryTimer();
            }
            this._sendError(error, ObservableActivity.getElapsedTimeTelemetryProperties(this, null));
            this._notifyCompleted();
        };
        /**
         * @override
         */
        ActionBasedActivity.prototype._initializeObservables = function () {
            _super.prototype._initializeObservables.call(this);
            this.extendedStatus(ExtendedStatus.Pending);
        };
        /**
         * @override
         */
        ActionBasedActivity.prototype._canCancelCore = function () {
            if (!_super.prototype._canCancelCore.call(this)) {
                return false;
            }
            if (this.extendedStatus() === ExtendedStatus.Pending
                || this.extendedStatus() === ExtendedStatus.None) {
                // Can always cancel something that's not started
                return true;
            }
            if (!this._isCancelableCore()) {
                // We don't know how to cancel this activity if it's not pending
                return false;
            }
            // Can't cancel in canceling/canceled states, only when actually in progress
            return this.extendedStatus() === ExtendedStatus.InProgress;
        };
        /**
         * @override
         */
        ActionBasedActivity.prototype._canRetryCore = function () {
            if (!_super.prototype._canRetryCore.call(this)) {
                return false;
            }
            if (this.extendedStatus() === ExtendedStatus.Canceling) {
                return false;
            }
            var rawStatus = this.rawStatus();
            return rawStatus === ActivityLogStatus.Error ||
                rawStatus === ActivityLogStatus.Attention;
        };
        Object.defineProperty(ActionBasedActivity.prototype, "_condenseTelemetry", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        ActionBasedActivity.prototype._sendError = function (error, properties, nameSuffix) {
            var fullEventName = nameSuffix ? this._telemetryInfo.telemetryEventName + "." + nameSuffix : this._telemetryInfo.telemetryEventName;
            this._telemetryInfo.telemetry.sendError({
                name: fullEventName,
                error: error,
                properties: properties
            });
        };
        ActionBasedActivity.prototype._sendEvent = function (properties) {
            this._telemetryInfo.telemetry.sendEvent(this._telemetryInfo.telemetryEventName, properties);
        };
        ActionBasedActivity.prototype._sendCondensedEvent = function (properties) {
            if (this._parent) {
                this._parent.sendConsensedTelemetryEvent(this._telemetryInfo.telemetryEventName, properties, {
                    propertiesToAverage: ["ElapsedTime"],
                    propertiesToCombine: ["Status"]
                });
            }
            else {
                Debug.fail("Can't send condensed telemetry event because this activity has no parent.");
            }
        };
        Object.defineProperty(ActionBasedActivity.prototype, "isWaitingForAutoRetry", {
            get: function () {
                return !!this._autoRetryHandle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionBasedActivity.prototype, "retryCount", {
            get: function () {
                return this._retryCount;
            },
            enumerable: true,
            configurable: true
        });
        ActionBasedActivity.prototype._isErrorAutoRetryable = function (error) {
            if (!error) {
                return false;
            }
            // TODO: Is there a good way to do this right now?
            if (error.name === StorageExplorerConstants.ErrorNames.NetworkTimeoutError
                || (error.message && error.message.match(StorageExplorerConstants.ErrorNames.NetworkTimeoutError))) {
                return true;
            }
            return false;
        };
        ActionBasedActivity.prototype._startAutoRetryTimer = function () {
            var _this = this;
            this._clearAutoRetryTimer();
            // Determine next interval
            var autoRetryIntervalMs = this._lastAutoRetryIntervalMs ?
                this._lastAutoRetryIntervalMs * ActionBasedActivity.AutoRetryIntervalScale :
                ActionBasedActivity.AutoRetryInitialIntervalSeconds * StorageExplorerConstants.Time.MillisecondsPerSecond;
            var retryTime = new Date(Date.now() + autoRetryIntervalMs).toLocaleTimeString();
            var message = "Retry #" + (this.retryCount + 1) + " will occur at " + retryTime; // Localize
            this.progressMessage(message);
            this._autoRetryHandle = setTimeout(function () {
                _this._autoRetryHandle = null;
                if (_this._isErrorAutoRetryable(_this._currentError())) {
                    _this._retryCount++;
                    _this._lastAutoRetryIntervalMs = autoRetryIntervalMs;
                    _this.restart();
                }
            }, autoRetryIntervalMs);
        };
        ActionBasedActivity.prototype._clearAutoRetryTimer = function () {
            if (this._autoRetryHandle) {
                clearTimeout(this._autoRetryHandle);
                this._autoRetryHandle = null;
            }
        };
        return ActionBasedActivity;
    }(RetryableActivity));
    ActionBasedActivity.AutoRetryInitialIntervalSeconds = 10;
    ActionBasedActivity.AutoRetryIntervalScale = 2;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ActionBasedActivity;
});

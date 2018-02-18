/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "ActivityLog/ActivityLogEntry", "ActivityLog/ActivityLogStatus", "Common/Debug", "Common/Errors", "ActivityLog/StorageExplorer/ExtendedStatus", "Common/Utilities"], function (require, exports, ko, ActivityLogEntry, ActivityLogStatus, Debug, Errors, ExtendedStatus, Utilities) {
    "use strict";
    /**
     * An observable companion to an activity log entry.  Changes made to the observable
     * activity will be automatically set on the corresponding log entry.
     */
    var ObservableActivity = (function () {
        function ObservableActivity(title) {
            var _this = this;
            // Timing measurements for the most recent start or retry time ("default") or any other named timing
            this._elapsedTimes = {
                default: {} // The elapsed time for the activity as a whole
            };
            this._initialized = false;
            // Activity's title
            this.title = ko.observable();
            // Sort order inside the parent (doesn't apply to top-level activities)
            this.childSortOrder = ko.observable(0);
            // Message specific to its progress (e.g. "80B of 100K uploaded")
            // This is placed in parentheses behind the main message (or without parentheses if
            //   there is no main message).
            this.progressMessage = ko.observable();
            // This is read-only.  Use extendedStatus to update
            this.rawStatus = ko.pureComputed(function () { return _this._extendedStatusToStatus(_this.extendedStatus()); });
            this._getMainMessageCore = function () {
                return null;
            };
            this._getProgressCore = function () {
                return 0;
            };
            // Base doesn't track the actions we give it, so we have to do it
            this._actions = {};
            this.title(title);
            this._guid = Utilities.guid();
            this.resetStartTime(null);
        }
        Object.defineProperty(ObservableActivity.prototype, "hideInParent", {
            get: function () {
                return this._hideInParent;
            },
            set: function (f) {
                this._hideInParent = f;
            },
            enumerable: true,
            configurable: true
        });
        ObservableActivity.sanitizePercentageProgress = function (percentage) {
            // If it's anything greater than 0%, set it to at least 1%, and if it's anything
            // less than 100%, set it to 99% (users don't like to see 0% done when there's no progress,
            // or to see it stick on 100% for a long time).
            // E.g., if you've copied 999 out of 1000 bytes, that would round up to 100% in the activity log if
            // we don't do this.
            if (percentage <= 0 || !percentage /* handles NaN */) {
                return 0;
            }
            else if (percentage >= 1) {
                return 1;
            }
            else {
                return Utilities.ensureBetweenBounds(percentage, 0.01, 0.99);
            }
        };
        ObservableActivity.getTelemetryProperties = function (activity, data) {
            if (data === void 0) { data = null; }
            var properties = {
                "Id": activity.getId()
            };
            if (data) {
                for (var propertyName in data) {
                    var value = data[propertyName];
                    if (value) {
                        properties[propertyName] = value;
                    }
                }
            }
            return properties;
        };
        ObservableActivity.getStartTimeTelemetryProperties = function (activity, timingId, /* null for default */ data) {
            var properties = ObservableActivity.getTelemetryProperties(activity, data);
            properties.StartTime = activity.getStartTimeInMilliseconds(timingId).toString();
            return properties;
        };
        ObservableActivity.getCurrentTimeTelemetryProperties = function (activity, data) {
            var properties = ObservableActivity.getTelemetryProperties(activity, data);
            properties.CurrentTime = Date.now().toString();
            return properties;
        };
        ObservableActivity.getElapsedTimeTelemetryProperties = function (activity, timingId, /* null for default */ data) {
            var properties = ObservableActivity.getCurrentTimeTelemetryProperties(activity, data);
            properties.ElapsedTime = activity.getElapsedTimeInMilliseconds(timingId).toString();
            return properties;
        };
        ObservableActivity.prototype._getTiming = function (timingId /* null for default */) {
            var timingId = timingId || "default";
            var timing = this._elapsedTimes[timingId];
            if (!timing) {
                timing = {};
                this._elapsedTimes[timingId] = timing;
            }
            return timing;
        };
        ObservableActivity.prototype.initialize = function () {
            this._initializeObservables();
            this._initialized = true;
        };
        Object.defineProperty(ObservableActivity.prototype, "logEntry", {
            // The matching log entry
            get: function () { return this._logEntry; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObservableActivity.prototype, "isTemporary", {
            get: function () { return this._isTemporary; },
            enumerable: true,
            configurable: true
        });
        // This should not be called directly.  Use the addChild* methods on GroupedActivity.
        ObservableActivity.prototype._setParent = function (parent, isTemporary) {
            if (this._parent) {
                throw new Errors.InvalidOperationError("Internal error: This activity has already been parented");
            }
            this._parent = parent;
            this._isTemporary = isTemporary;
        };
        /**
         * The estimated number of concurrent operations that could be used for this activity.  For instance,
         * a 1GB upload would have an estimated concurrency of 1GB/4MB = 250 if the upload engine is capable of
         * simultaneously transmitting chunks of 4MB each.
         */
        ObservableActivity.prototype.getPotentialConcurrency = function () {
            return 1;
        };
        ObservableActivity.prototype._ensureInitialized = function () {
            if (!this._initialized) {
                throw new Errors.InvalidOperationError("Internal error: Activity not initialized");
            }
        };
        // Initialize the activity log entry from the current values in this activity
        ObservableActivity.prototype._initializeLogEntry = function () {
            this._ensureInitialized();
            var logEntry = this._logEntry;
            logEntry.title = this.title();
            logEntry.message = this._actualMessage();
            logEntry.progress = this.progress();
            logEntry.status = this._extendedStatusToStatus(this.extendedStatus());
            logEntry.childSortOrder = this.childSortOrder();
            logEntry.actions = this._actions;
        };
        ObservableActivity.prototype._initializeObservables = function () {
            this._createObservables();
            this._subscribeObservables();
        };
        // Initialize computed observables (some need access to functions not yet available in constructor)
        ObservableActivity.prototype._createObservables = function () {
            var _this = this;
            this.extendedStatus = ko.observable(ExtendedStatus.None);
            this.mainMessage = this._overridableComputed(this._getMainMessageCore, this)
                .extend({
                // We can rate limit this because the only thing depending on it is the UI
                rateLimit: ObservableActivity._rateLimitMs
            });
            this.progress = this._overridableComputed(this._getProgressCore, this)
                .extend({
                // We can rate limit this because the only thing depending on it is the UI
                rateLimit: ObservableActivity._rateLimitMs
            });
            this._actualMessage = ko.pureComputed(function () {
                var mainMessage = _this.mainMessage();
                var progressMessage = _this.progressMessage();
                var actualMessage = (mainMessage && progressMessage)
                    ? (mainMessage + " (" + progressMessage + ")")
                    : (mainMessage || progressMessage || null);
                if (Debug.isDebug()) {
                    var debugMessage = _this._getDebugMessage();
                    if (debugMessage) {
                        actualMessage = [actualMessage, "[DEBUG: " + debugMessage + "]"].join(" ");
                    }
                }
                return actualMessage;
            }).extend({
                // We can rate limit this because the only thing depending on it is the UI
                rateLimit: ObservableActivity._rateLimitMs
            });
            // Takes into account the status of the activity as well as
            //  what was manually set into the progress observable.
            this.actualProgress = ko.pureComputed(function () {
                switch (_this.rawStatus()) {
                    default:
                        Debug.fail("Unexpected status");
                        return 0;
                    case ActivityLogStatus.Error:
                    case ActivityLogStatus.Pending:
                    case ActivityLogStatus.Canceled:
                    case ActivityLogStatus.Attention:
                        return 0;
                    case ActivityLogStatus.Success:
                        return 1;
                    case ActivityLogStatus.InProgress:
                        return ObservableActivity.sanitizePercentageProgress(_this.progress());
                }
            }).extend({
                // We can rate limit this because the only thing depending on it is the UI
                rateLimit: ObservableActivity._rateLimitMs
            });
        };
        // Sync up the values on the activity log entry with the observable values on this object
        ObservableActivity.prototype._subscribeObservables = function () {
            var _this = this;
            this.title.subscribe(function (value) {
                if (_this._logEntry) {
                    _this._logEntry.title = value;
                }
                _this._firePropertyChanged("title");
            });
            this._actualMessage.subscribe(function (value) {
                if (_this._logEntry) {
                    _this._logEntry.message = value;
                }
                _this._firePropertyChanged("message");
            });
            this.progress.subscribe(function (value) {
                if (_this._logEntry) {
                    _this._logEntry.progress = value;
                }
                _this._firePropertyChanged("progress");
            });
            this.extendedStatus.subscribe(function (value) {
                var newRawStatus = _this._extendedStatusToStatus(value);
                if (_this._logEntry) {
                    _this._logEntry.status = newRawStatus;
                }
                _this._firePropertyChanged("extendedStatus"); // Also means rawStatus may have changed
                _this._setSortOrder(newRawStatus);
            });
            this.childSortOrder.subscribe(function (value) {
                if (_this._logEntry) {
                    _this._logEntry.childSortOrder = value;
                }
            });
        };
        ObservableActivity.prototype._setSortOrder = function (rawStatus) {
            var order = 0;
            switch (rawStatus) {
                case ActivityLogStatus.Success:
                    order = -.1;
                    break;
                case ActivityLogStatus.Error:
                    order = 100;
                    break;
                case ActivityLogStatus.InProgress:
                    order = 1;
                    break;
                case ActivityLogStatus.Pending:
                    order = 2;
                    break;
                case ActivityLogStatus.Canceled:
                    // (Note: We shouldn't be showing canceled activities, but it might happen for a short time)
                    order = 200;
                    break;
                case ActivityLogStatus.Attention:
                    order = 0;
                    break;
                default:
                    Debug.fail("Unexpected status");
                    break;
            }
            this.childSortOrder(order);
        };
        // Creates the matching log entry and connects it
        ObservableActivity.prototype.createMatchingLogEntry = function () {
            this._ensureInitialized();
            if (this._logEntry) {
                throw new Error("Internal error: Log entry already created");
            }
            this._logEntry = new ActivityLogEntry(this.title(), ActivityLogStatus.Pending);
            this._initializeLogEntry();
            this._updateActions();
        };
        /**
         * Notifies the parent activity (if any) of a property change on this child activity
         */
        ObservableActivity.prototype._firePropertyChanged = function (propertyName) {
            if (this._parent) {
                this._parent.onChildPropertyChanged(this, propertyName);
            }
        };
        // Creates a new corresponding log entry, then adds it (connected to this activity)
        // to the activity log as a top- level member.  (Don't use this for child activities,
        // use GroupedActivity.AddChildActivity.)
        ObservableActivity.prototype.addToActivityLog = function (manager) {
            this._ensureInitialized();
            if (this.logEntry) {
                throw new Error("Internal error: This activity has already been added to the activity log");
            }
            this.createMatchingLogEntry();
            // Add to the activity log
            if (!ObservableActivity._debugDoNotAddChildrenToActivityLog) {
                manager.add(this.logEntry);
            }
        };
        ObservableActivity.prototype._updateActions = function () {
        };
        /**
         * Adds or removes the given action
         */
        ObservableActivity.prototype._addOrRemoveAction = function (displayName, action, add) {
            var toAddOrRemove = {};
            toAddOrRemove[displayName] = (action && add) ? action : null;
            return this._addOrRemoveActions(toAddOrRemove);
        };
        /**
         * For each entry in actionToAddOrRemove, if the value is null, removes it from actions, otherwise adds it to actions
         */
        ObservableActivity.prototype._addOrRemoveActions = function (actionsToAddOrRemove) {
            var actions = this._actions;
            var changed = false;
            for (var name in actionsToAddOrRemove) {
                if (actionsToAddOrRemove.hasOwnProperty(name)) {
                    if (actionsToAddOrRemove[name]) {
                        // Add the action if not already there
                        if (actions[name] !== actionsToAddOrRemove[name]) {
                            actions[name] = actionsToAddOrRemove[name];
                            changed = true;
                        }
                    }
                    else {
                        // Remove the action if there
                        if (actions[name]) {
                            delete actions[name];
                            changed = true;
                        }
                    }
                }
            }
            if (changed) {
                this._actions = actions;
                if (this._logEntry) {
                    this._logEntry.actions = actions;
                }
            }
            return changed;
        };
        ObservableActivity.prototype._extendedStatusToStatus = function (extendedStatus) {
            switch (extendedStatus) {
                case ExtendedStatus.Canceled:
                    return ActivityLogStatus.Canceled;
                case ExtendedStatus.Error:
                case ExtendedStatus.TooManyErrors:
                    return ActivityLogStatus.Error;
                case ExtendedStatus.Conflict:
                    return ActivityLogStatus.Attention;
                case ExtendedStatus.InProgress:
                case ExtendedStatus.Retrying:
                case ExtendedStatus.Canceling:
                    return ActivityLogStatus.InProgress;
                case ExtendedStatus.None:
                case ExtendedStatus.Pending:
                    return ActivityLogStatus.Pending;
                case ExtendedStatus.Success:
                    return ActivityLogStatus.Success;
                default:
                    throw new Error("Internal error: Unexpected extended status " + extendedStatus);
            }
        };
        ObservableActivity.prototype.getId = function () {
            return this._guid;
        };
        ObservableActivity.prototype.resetStartTime = function (timingId /* null for default */) {
            var timing = this._getTiming(timingId);
            timing.startTimeInMilliseconds = Date.now();
            timing.endTimeInMilliseconds = null;
        };
        ObservableActivity.prototype.setEndTime = function (timingId) {
            var timing = this._getTiming(timingId);
            timing = this._elapsedTimes[timingId] || {};
            timing.endTimeInMilliseconds = Date.now();
        };
        /**
         * Gets the start time of the named timing
         */
        ObservableActivity.prototype.getStartTimeInMilliseconds = function (timingId) {
            return this._getTiming(timingId).startTimeInMilliseconds;
        };
        /**
         * Gets the end time of the named timing
         */
        ObservableActivity.prototype.getEndTimeInMilliseconds = function (timingId) {
            return this._getTiming(timingId).endTimeInMilliseconds;
        };
        /**
         * Gets the elapsed time of the named timing, or from the named timing's start to now, if no end time has been set
         */
        ObservableActivity.prototype.getElapsedTimeInMilliseconds = function (timingId) {
            var startTime = this.getStartTimeInMilliseconds(timingId);
            var endTime = this.getEndTimeInMilliseconds(timingId) || Date.now();
            if (startTime) {
                return endTime - startTime;
            }
            else {
                return undefined;
            }
        };
        /**
         * Returns a knockout computed that can be written to.  When written to, that value
         * will be returned instead of calling the computed function, until a null value is
         * written into the observable.
         */
        ObservableActivity.prototype._overridableComputed = function (read, context) {
            var computed = ko.pureComputed({
                read: function () {
                    var overriddenValue = computed.$overrideObservable();
                    if (overriddenValue !== null) {
                        return overriddenValue;
                    }
                    else {
                        return read.apply(context);
                    }
                },
                write: function (value) {
                    computed.$overrideObservable(value);
                }
            });
            computed.$overrideObservable = ko.observable(null);
            return computed;
        };
        ObservableActivity.prototype._getDebugMessage = function () {
            try {
                var debugMessages = [];
                var elapsed = this.getElapsedTimeInMilliseconds();
                if (elapsed) {
                    debugMessages.push("Elapsed time: " + Utilities.formatDuration(elapsed));
                }
                debugMessages.push(" Potential concurrency: " + this.getPotentialConcurrency());
                return debugMessages.join(", ");
            }
            catch (error) {
                Debug.error(error);
                return "";
            }
        };
        return ObservableActivity;
    }());
    // Standard rate limits that affect knockout performance
    ObservableActivity._rateLimitMs = 750;
    // Use this to determine the effects of child activities on performance.
    // Should normally be false.  Setting to true keeps children activities from
    // showing up in the activity log (but are still created and maintained as
    // activities).
    ObservableActivity._debugDoNotAddChildrenToActivityLog = false;
    return ObservableActivity;
});

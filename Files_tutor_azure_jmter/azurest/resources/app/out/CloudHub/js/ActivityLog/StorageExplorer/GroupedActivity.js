/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "underscore", "ActivityLog/ActivityLogStatus", "ActivityLog/StorageExplorer/CompositeSequence", "Common/Debug", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/ObservableActivity", "ActivityLog/StorageExplorer/RetryableActivity", "StorageExplorer/StorageExplorerConstants", "ActivityLog/StorageExplorer/TelemetryCondenserizer", "Common/Utilities"], function (require, exports, _string, underscore, ActivityLogStatus, CompositeSequence, Debug, ExtendedStatus, ObservableActivity, RetryableActivity, StorageExplorerConstants, TelemetryCondenserizer, Utilities) {
    "use strict";
    // TODO: Coordinate with backend
    var MaxConcurrency = 25;
    var MaximumActiveActivitiesPerGroup = 5;
    var MaximumSubactivitiesDisplayedByActivityLog = 100; // This is a constant in the activity log
    var MaximumErrorsBeforePausing = MaximumSubactivitiesDisplayedByActivityLog - MaximumActiveActivitiesPerGroup;
    /**
     * Class to handle the Activity Log lifecycle of a parent operation that updates its state based
     * on its children.
     */
    var GroupedActivity = (function (_super) {
        __extends(GroupedActivity, _super);
        function GroupedActivity(title, activityLogManager, telemetryInfo) {
            var _this = _super.call(this, title) || this;
            // IMPORTANT NOTE!
            // Do not created computed knockout properties that touch knockout properties of any of the children,
            // because it won't scale to the millions of children that we might have.  It's okay to use knockout
            // computed properties that are only dependent on knockout properties on the group activity.
            //
            // NOTE: We no longer create millions of children at a time, so this could be rewritten.
            // These override values in RetryableActivity
            _this.cancelDisplayName = "Cancel all"; // localize
            _this.retryDisplayName = "Retry all"; // localize
            // Child activities that have been added to the activity log
            _this._visibleChildActivities = [];
            // Child activities not in the activity log
            _this._hiddenChildActivities = [];
            // Combination of hidden and visible activities
            _this._allChildActivities = [];
            // Activities which have not been created yet
            _this._pendingSequence = new CompositeSequence();
            // Stats for activities that have been removed because we no longer need them
            _this._countRemovedTotal = 0;
            _this._countRemovedSuccessful = 0;
            _this._countRemovedCanceled = 0;
            _this._countRemovedTotalRetries = 0;
            // If an error occurs while trying to enumerate the pending activities
            _this._enumerationError = null;
            // If set, overrides status for the entire group (e.g., canceling)
            _this._groupExtendedStatus = null;
            _this._areAllChildrenAdded = false; // Whether all child activities or sequences have been added, or whether more might be added.
            _this._allCompletedOrCancelled = false;
            // Cancel All
            _this.cancel = function () {
                if (!_this.canCancel()) {
                    return;
                }
                var cancelTimingId = "cancel";
                _this.resetStartTime(cancelTimingId); // Only measure time it takes to request-cancel child activities.
                _this._telemetryInfo.telemetry.sendEvent(_this._telemetryInfo.telemetryEventName, ObservableActivity.getStartTimeTelemetryProperties(_this, cancelTimingId, { "CancelAll": "Start" }));
                _this._groupExtendedStatus = ExtendedStatus.Canceling;
                _this._recalculatePropertiesImmediately();
                Utilities.forEachResponsive(_this._allChildActivities.slice(), function (child, index) {
                    // If it's cancelable then cancel it
                    var retryable = _this._asRetryableActivity(child);
                    if (retryable && retryable.canCancel()) {
                        // If it's still pending, just leave it in the pending state (much faster, and possibly a
                        //   better user experience anyway). Also, don't want to cancel if there's a conflict, because
                        //   that's the same as the user telling us to not overwrite.  So, we really just want to cancel
                        //   ones that are currently in progress.
                        if (retryable.extendedStatus() === ExtendedStatus.InProgress) {
                            retryable.cancel();
                        }
                    }
                    // Update visibility for all children (in particular, this makes sure errors and conflicts get hidden)
                    _this._showOrHideChildBasedOnStatus(child);
                }).catch(function (error) {
                    _this._telemetryInfo.telemetry.sendError({
                        name: _this._telemetryInfo.telemetryEventName + ".CancelAllError",
                        error: error,
                        properties: ObservableActivity.getElapsedTimeTelemetryProperties(_this, cancelTimingId)
                    });
                }).then(function () {
                    _this._groupExtendedStatus = ExtendedStatus.Canceled;
                    _this._recalculatePropertiesImmediately();
                    _this._telemetryInfo.telemetry.sendEvent(_this._telemetryInfo.telemetryEventName, ObservableActivity.getElapsedTimeTelemetryProperties(_this, cancelTimingId, { "CancelAll": "Finished" }));
                });
            };
            // Retry All
            _this.retry = function () {
                if (!_this.canRetry()) {
                    return;
                }
                var requestRetryTimingId = "requestRetry";
                _this.resetStartTime(null);
                _this.resetStartTime(requestRetryTimingId); // This measures only the time it takes to request-retry child activities
                _this._groupExtendedStatus = ExtendedStatus.Retrying;
                _this._recalculatePropertiesImmediately();
                _this._telemetryInfo.telemetry.sendEvent(_this._telemetryInfo.telemetryEventName, ObservableActivity.getStartTimeTelemetryProperties(_this, requestRetryTimingId, { "RetryAll": "Start" }));
                Utilities.forEachResponsive(_this._allChildActivities.slice(), function (child, index) {
                    var retryable = _this._asRetryableActivity(child); // If it's retryable, call retry
                    if (retryable && retryable.canRetry()) {
                        // This won't get called for still-pending items, which is good - they'll get activated in time...
                        retryable.retry();
                    }
                }).catch(function (error) {
                    _this._telemetryInfo.telemetry.sendError({
                        name: _this._telemetryInfo.telemetryEventName + ".RetryAllError",
                        error: error,
                        properties: ObservableActivity.getElapsedTimeTelemetryProperties(_this, requestRetryTimingId)
                    });
                }).then(function () {
                    _this._groupExtendedStatus = null;
                    _this._recalculatePropertiesImmediately();
                    _this._delayActivateActivitiesUpToThrottle();
                    _this._telemetryInfo.telemetry.sendEvent(_this._telemetryInfo.telemetryEventName, ObservableActivity.getElapsedTimeTelemetryProperties(_this, requestRetryTimingId, { "RetryAll": "Finished" }));
                });
            };
            _this._checkAllCompletedOrCancelled = function () {
                // Have we finished with all activities?
                if (_this._areAllChildrenAdded && _this._pendingSequence.isEmpty() && _this._allChildActivities.length === 0) {
                    if (!_this.getEndTimeInMilliseconds(null)) {
                        _this.setEndTime(null);
                    }
                    _this._allCompletedOrCancelledDeferred.resolve(); // Okay if called multiple times
                    _this._allCompletedOrCancelled = true;
                    // Do this on a timer to ensure we get the current telemetry sent
                    setTimeout(function () { return _this._telemetryCondenserizer.flush(); }, 1 * StorageExplorerConstants.Time.MillisecondsPerSecond);
                }
            };
            // Have we reached the throttle yet, or can we activate one or more children?
            _this._countCanActivate = function () {
                if (_this.isRetrying() || _this.isCanceling() || _this.isCanceled()) {
                    // If in one of these states, activation of activities is frozen.
                    return 0;
                }
                var currentlyActive = _this._countChildActivities(_this._isActivityActive);
                var childrenToActivateBeforeThrottle = MaximumActiveActivitiesPerGroup - currentlyActive;
                return childrenToActivateBeforeThrottle > 0 ? childrenToActivateBeforeThrottle : 0;
            };
            _this._delayActivateActivitiesUpToThrottle = function (millisecondsDelay) {
                if (millisecondsDelay === void 0) { millisecondsDelay = 10; }
                Utilities.throttle(_this._activateActivitiesUpToThrottle, millisecondsDelay, _this);
            };
            _this._activateActivitiesUpToThrottle = function () {
                _this._recalculatePropertiesImmediately();
                var countCanActivate = _this._countCanActivate();
                if (countCanActivate) {
                    for (var i = 0; i < countCanActivate; ++i) {
                        // We can start another pending activity that's ready to start
                        var incompleteActivities = _this._allChildActivities.filter(function (child) {
                            return child.rawStatus() !== ActivityLogStatus.Success
                                && child.rawStatus() !== ActivityLogStatus.Canceled;
                        });
                        var firstPendingReadyActivity = underscore.find(_this._allChildActivities, function (child) {
                            return child.rawStatus() === ActivityLogStatus.Pending
                                && _this._isActionBasedAndReadyToStart(child, incompleteActivities);
                        });
                        // If we couldn't find a pending activity from our current children, add an activity
                        // from the pending sequence
                        while (!firstPendingReadyActivity && !_this._isLoadingMorePendingData && !_this._pendingSequence.isEmpty()) {
                            var stats = _this._calculateActivityPropertyStats();
                            if ((stats.countConflicts + stats.countErrorsNotConflicts) > MaximumErrorsBeforePausing) {
                                // Too many errors - we want to avoid the memory required to keep around a bunch
                                // of error activity entries, so pause until the user takes care of these somehow.
                                _this._groupExtendedStatus = ExtendedStatus.TooManyErrors;
                                _this._recalculatePropertiesImmediately();
                                return;
                            }
                            var newActivity = _this._pendingSequence.getNextAvailable();
                            if (newActivity) {
                                // Add the new activity whether it's action-based or not and ready to start or not
                                _this.addChildActivity(newActivity);
                                // Is it action-based and ready to start?
                                if (_this._isActionBasedAndReadyToStart(newActivity, incompleteActivities)) {
                                    firstPendingReadyActivity = _this._asActionBasedActivity(newActivity);
                                }
                            }
                            else {
                                // Request more pending activities
                                _this._isLoadingMorePendingData = true;
                                _this._pendingSequence.loadMore().then(function () {
                                    _this._isLoadingMorePendingData = false;
                                    _this._enumerationError = null;
                                    // Try again after we've loaded more activities
                                    _this._delayActivateActivitiesUpToThrottle();
                                }).catch(function (error) {
                                    // Failed getting more activities from the cache
                                    _this._isLoadingMorePendingData = false;
                                    var errorAlreadySent = !!_this._enumerationError;
                                    _this._enumerationError = "An error occurred while reading from the disk cache: " + Utilities.getErrorMessage(error); // Localize
                                    Debug.fail(_this._enumerationError);
                                    if (!errorAlreadySent) {
                                        _this._telemetryInfo.telemetry.sendError({
                                            name: _this._telemetryInfo.telemetryEventName + ".EnumerationError",
                                            error: _this._enumerationError,
                                            properties: ObservableActivity.getElapsedTimeTelemetryProperties(_this, null)
                                        });
                                    }
                                    _this._recalculatePropertiesImmediately();
                                    // Try again after a delay...
                                    _this._delayActivateActivitiesUpToThrottle(10 * StorageExplorerConstants.Time.MillisecondsPerSecond);
                                });
                                break;
                            }
                        }
                        if (firstPendingReadyActivity) {
                            // We can unpause now
                            if (_this._groupExtendedStatus === ExtendedStatus.TooManyErrors) {
                                _this._groupExtendedStatus = null;
                                _this._recalculatePropertiesImmediately();
                            }
                            // Start it
                            firstPendingReadyActivity.start();
                        }
                        else {
                            break;
                        }
                    }
                }
            };
            /**
             * True if the activity is action-based and has no dependencies keeping it from starting now
             */
            _this._isActionBasedAndReadyToStart = function (child, incompleteActivities) {
                var isReadyToStart = false;
                var actionBased = _this._asActionBasedActivity(child);
                if (actionBased) {
                    var otherIncompleteActivities = incompleteActivities.filter(function (otherChild) { return child !== otherChild; });
                    isReadyToStart = actionBased.isReadyToStart(otherIncompleteActivities);
                }
                if (isReadyToStart) {
                    // No dependencies. Do we have the potential currency to handle it?
                    var runningConcurrency = _this.getPotentialConcurrency();
                    var actionConcurrency = actionBased.getPotentialConcurrency();
                    if (actionConcurrency + runningConcurrency <= MaxConcurrency) {
                        return true;
                    }
                    // If there are no other running activities, we need to start it anyway. The back end will
                    // appropriately determine the actual concurrency to use.
                    if (!_this._getRunningActivities().length) {
                        return true;
                    }
                }
                return false;
            };
            _this._getRunningActivities = function () {
                return _this._allChildActivities
                    .filter(function (activity) { return _this._asActionBasedActivity(activity) && activity.rawStatus() === ActivityLogStatus.InProgress; });
            };
            _this._calculateMainMessage = function (stats) {
                var state = null;
                if (_this.extendedStatus() === ExtendedStatus.TooManyErrors) {
                    state = "PAUSED - too many errors or conflicts"; // Localize
                }
                else if (_this.isCanceled() || _this.isCanceling()) {
                    // Only show "Canceled" if our group state is canceled *and* no activity is still in progress
                    if (_this.isCanceling() || stats.countInProgress) {
                        state = "Canceling..."; // Localize
                    }
                    else {
                        state = "Canceled"; // Localize
                    }
                }
                else if (_this.isRetrying()) {
                    state = "Retrying..."; // Localize
                }
                var statsStrings = _this._getMainMessageStats(stats);
                var statsString = statsStrings.join(", ");
                if (stats.countConflicts || stats.countErrorsNotConflicts) {
                    statsString = statsString + " (expand for more)";
                }
                return state ? _string.sprintf("%s (%s)", state, statsString) : statsString;
            };
            _this._calculateExtendedStatus = function (stats) {
                if (_this._groupExtendedStatus !== null) {
                    // This overrides any state
                    return _this._groupExtendedStatus;
                }
                else if (_this._enumerationError) {
                    return ExtendedStatus.Error;
                }
                if (!stats.countTotal) {
                    // No activities at all
                    return _this._areAllChildrenAdded ? ExtendedStatus.Success : ExtendedStatus.Pending;
                }
                if (stats.countPending === stats.countTotal) {
                    // Only pending activities exist
                    return ExtendedStatus.Pending;
                }
                if ((stats.countCanceled + stats.countSuccesses) === stats.countTotal) {
                    // All activities have completed successfully or were canceled
                    return ExtendedStatus.Success;
                }
                if (stats.countConflicts) {
                    return ExtendedStatus.Conflict;
                }
                if (stats.countErrorsNotConflicts) {
                    return ExtendedStatus.Error;
                }
                return ExtendedStatus.InProgress;
            };
            _this._calculateProgress = function (stats) {
                if (!stats.countTotal) {
                    return null;
                }
                // CONSIDER: Use a weighting based on the size of the individual
                //   actions.
                var total = stats.countTotal;
                var completed = _this._countRemovedSuccessful + _this._countRemovedCanceled;
                _this._allChildActivities.forEach(function (child) {
                    if (!child.isTemporary) {
                        completed += child.actualProgress();
                    }
                });
                var percentage = completed / total;
                return ObservableActivity.sanitizePercentageProgress(percentage);
            };
            _this.title(title);
            _this._activityLogManager = activityLogManager;
            _this._telemetryInfo = telemetryInfo;
            _this._allCompletedOrCancelledDeferred = $.Deferred();
            _this._telemetryCondenserizer = new TelemetryCondenserizer(telemetryInfo.telemetry);
            return _this;
        }
        Object.defineProperty(GroupedActivity.prototype, "allCompletedOrCancelledPromise", {
            /**
             * A promise that resolves when all meaningful activities have completed or been cancelled
             */
            get: function () {
                return this._allCompletedOrCancelledDeferred.promise();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GroupedActivity.prototype, "areAllChildrenAdded", {
            /**
             * Whether all child activities or sequences have been added, or whether more might be added
             */
            get: function () {
                return this._areAllChildrenAdded;
            },
            set: function (value) {
                this._areAllChildrenAdded = value;
                this._checkAllCompletedOrCancelled();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @override
         */
        GroupedActivity.prototype.getPotentialConcurrency = function () {
            return this._getRunningActivities()
                .map(function (action) { return action.getPotentialConcurrency(); })
                .reduce(function (sum, concurrency) { return sum + concurrency; }, 0);
        };
        /**
         * Gets optional additional stats to become part of the main message in the activity
         */
        GroupedActivity.prototype._getAdditionalTelemetryStats = function () {
            return null;
        };
        GroupedActivity.prototype._getMainMessageStats = function (o) {
            var stats = o;
            var statsStrings = [];
            if (this._enumerationError) {
                statsStrings.push(this._enumerationError);
            }
            statsStrings.push(_string.sprintf("%d completed", stats.countSuccesses)); // Localize
            if (stats.countErrorsNotConflicts) {
                statsStrings.push(_string.sprintf("%d error(s)", stats.countErrorsNotConflicts)); // Localize
            }
            if (stats.countConflicts) {
                statsStrings.push(_string.sprintf("%d conflict(s)", stats.countConflicts)); // Localize
            }
            if (stats.countCanceled) {
                statsStrings.push(_string.sprintf("%d canceled", stats.countCanceled)); // Localize
            }
            if (stats.countInProgress) {
                statsStrings.push(_string.sprintf("%d in progress", stats.countInProgress)); // Localize
            }
            if (stats.countPending) {
                statsStrings.push(_string.sprintf("%d pending", stats.countPending)); // Localize
            }
            if (stats.countAutoRetryWaiting) {
                statsStrings.push(_string.sprintf("%d to retry", stats.countAutoRetryWaiting)); // Localize
            }
            if (stats.countRetryAttempts) {
                statsStrings.push(_string.sprintf("%d total retries", stats.countRetryAttempts)); // Localize
            }
            statsStrings = statsStrings.concat(this._getAdditionalTelemetryStats() || []);
            return statsStrings;
        };
        GroupedActivity.prototype.onChildPropertyChanged = function (child, propertyName) {
            var _this = this;
            switch (propertyName) {
                case "extendedStatus":
                    // Pop out of the current stack before adding/removing to the
                    // arrays - we might cause problems if, say, they're being iterated over.
                    setTimeout(function () {
                        _this._showOrHideChildBasedOnStatus(child);
                        _this._checkAllCompletedOrCancelled();
                    }, 1);
                    break;
            }
            this._delayRecalculateProperties();
            this._delayActivateActivitiesUpToThrottle();
        };
        /**
         * Adds this group activity itself as a top-level item in the activity log
         */
        GroupedActivity.prototype.addToActivityLog = function () {
            if (this.logEntry) {
                throw new Error("Internal error: This group activity has already been added to the activity log");
            }
            this.createMatchingLogEntry();
            var logEntry = this.logEntry;
            // Add existing visible children to activity log
            if (!ObservableActivity._debugDoNotAddChildrenToActivityLog) {
                logEntry.addChildren(this._visibleChildActivities.map(function (child) { return child.logEntry; }));
            }
            // Add group activity to the activity log
            this._activityLogManager.add(logEntry);
        };
        GroupedActivity.prototype.removeChildActivity = function (child) {
            Utilities.removeValueFromArray(this._visibleChildActivities, child);
            Utilities.removeValueFromArray(this._hiddenChildActivities, child);
            Utilities.removeValueFromArray(this._allChildActivities, child);
            if (this.logEntry) {
                this.logEntry.removeChild(child.logEntry);
            }
            this._delayRecalculateProperties();
        };
        GroupedActivity.prototype.addTemporaryChildActivity = function (temporaryChild, showInActivityLogImmediately) {
            if (showInActivityLogImmediately === void 0) { showInActivityLogImmediately = true; }
            this._addChildActivitiesCore([temporaryChild], showInActivityLogImmediately, true /*isTemporary*/);
        };
        GroupedActivity.prototype.addChildActivity = function (child, showInActivityLogImmediately) {
            if (showInActivityLogImmediately === void 0) { showInActivityLogImmediately = false; }
            this._addChildActivitiesCore([child], showInActivityLogImmediately, false /*isTemporary*/);
        };
        GroupedActivity.prototype.addChildActivities = function (children, showInActivityLogImmediately) {
            if (showInActivityLogImmediately === void 0) { showInActivityLogImmediately = false; }
            this._addChildActivitiesCore(children, showInActivityLogImmediately, false /*isTemporary*/);
        };
        // virtual
        GroupedActivity.prototype._addChildActivitiesCore = function (children, showInActivityLogImmediately, isTemporary) {
            var _this = this;
            children.forEach(function (child) {
                // PERF: CONSIDER: don't create log entry until displayed in activity log (should be able to do that now)
                child.createMatchingLogEntry();
                // Add to the hidden list at first
                _this._allChildActivities.push(child);
                _this._hiddenChildActivities.push(child);
                child._setParent(_this, isTemporary);
                // Make visible if requested
                if (showInActivityLogImmediately && !child.hideInParent) {
                    _this._showChildInActivityLog(child);
                }
            });
            this._delayRecalculateProperties();
            this._delayActivateActivitiesUpToThrottle();
        };
        /**
         * Adds a sequence containing a list of children. The children will be
         * activated one at a time as they are needed.
         */
        GroupedActivity.prototype.addChildSequence = function (sequence) {
            this._pendingSequence.addSequence(sequence);
            this._delayActivateActivitiesUpToThrottle();
        };
        GroupedActivity.prototype._showOrHideChildBasedOnStatus = function (child) {
            switch (child.extendedStatus()) {
                // We hide pending activities from the activity log, if we actually
                // have an activity log entry for them (which can happen when an
                // activity is retried - otherwise they'll be represented by _pendingSequence)
                case ExtendedStatus.None:
                case ExtendedStatus.Pending:
                    this._hideChildFromActivityLog(child);
                    break;
                case ExtendedStatus.Success:
                    // We no longer need to show these and can dispose of them completely
                    this.removeChildActivity(child);
                    this._recordStatsForChildBeingRemoved(child, { isSuccessful: true });
                    break;
                case ExtendedStatus.Canceled:
                    // Canceled items can't be retried, so we don't need to show this.
                    this.removeChildActivity(child);
                    this._recordStatsForChildBeingRemoved(child, { isCanceled: true });
                    break;
                default:
                    if (this.isCanceling() || this.isCanceled()) {
                        // Shouldn't show any children except items which are cancelling once the user does a Cancel All
                        this.removeChildActivity(child);
                        this._recordStatsForChildBeingRemoved(child, { isCanceled: true });
                    }
                    else {
                        // Any other state should show the child
                        if (!child.hideInParent) {
                            this._showChildInActivityLog(child);
                        }
                    }
            }
        };
        GroupedActivity.prototype._recordStatsForChildBeingRemoved = function (child, state) {
            // Always count retries
            this._countRemovedTotalRetries += this._getActivityRetryCount(child);
            if (!child.isTemporary) {
                if (state.isSuccessful) {
                    this._countRemovedTotal++;
                    this._countRemovedSuccessful++;
                }
                else {
                    Debug.assert(state.isCanceled, "Should be successful or canceled.");
                    this._countRemovedTotal++;
                    this._countRemovedCanceled++;
                }
            }
        };
        GroupedActivity.prototype._getTitleFromTemplate = function (template, count, isCountFinal, completed, source, dest) {
            var plural = count !== 1; // Zero counts as plural
            var countString = String(count) + (isCountFinal ? "" : "+");
            if (plural) {
                // Expected args for plural templates
                //   %0s - count
                //   %1s - source
                var selectedTemplate = completed ? template.pluralDone : template.pluralDoing;
                return !source ?
                    _string.sprintf(selectedTemplate, countString) :
                    !dest ?
                        _string.sprintf(selectedTemplate, countString, source) :
                        _string.sprintf(selectedTemplate, countString, source, dest);
            }
            else {
                // Expected args for singular templates
                //   %0s - source (optional)
                //   %1s - dest (optional)
                var selectedTemplate = completed ? template.singularDone : template.singularDoing;
                return !source ?
                    _string.sprintf(selectedTemplate) :
                    !dest ?
                        _string.sprintf(selectedTemplate, source) :
                        _string.sprintf(selectedTemplate, source, dest);
            }
        };
        GroupedActivity.prototype._setTitleBasedOnCountCore = function (titleTemplate, count, isCountFinal, source, dest) {
            var _this = this;
            var inProgressTitle = this._getTitleFromTemplate(titleTemplate, count, isCountFinal, false, source, dest);
            var completedTitle = this._getTitleFromTemplate(titleTemplate, count, isCountFinal, true, source, dest);
            // Set up the in progress title first
            this.title(this._allCompletedOrCancelled ? completedTitle : inProgressTitle);
            // When completed, change to the completed title
            if (isCountFinal) {
                this.allCompletedOrCancelledPromise.then(function () {
                    _this.title(completedTitle);
                });
            }
            this._telemetryInfo.telemetry.sendEvent(this._telemetryInfo.telemetryEventName, isCountFinal ?
                {
                    "Id": this.getId(),
                    "Count": count.toString()
                } : {
                "Id": this.getId(),
                "CountSoFar": count.toString()
            });
        };
        GroupedActivity.prototype._delayRecalculateProperties = function () {
            Utilities.throttle(this._recalculatePropertiesImmediately, 250, this);
        };
        // This should be called only on activities that have already been added as children
        GroupedActivity.prototype._showChildInActivityLog = function (child) {
            if (this._allChildActivities.indexOf(child) >= 0) {
                // Is child already in activity log (i.e. in visible list?)
                if (this._visibleChildActivities.indexOf(child) < 0) {
                    // No... Add child to activity log
                    Utilities.removeValueFromArray(this._hiddenChildActivities, child);
                    this._visibleChildActivities.push(child);
                    // If this group is in the activity log then add the child to its
                    //   log entry.
                    if (this.logEntry) {
                        if (!ObservableActivity._debugDoNotAddChildrenToActivityLog) {
                            this.logEntry.addChildren([child.logEntry]);
                        }
                    }
                }
            }
        };
        // This should be called only on activities that have already been added as children
        GroupedActivity.prototype._hideChildFromActivityLog = function (child) {
            if (this._allChildActivities.indexOf(child) >= 0) {
                if (child.logEntry) {
                    // Remove child from activity log
                    Utilities.removeValueFromArray(this._visibleChildActivities, child);
                    this._hiddenChildActivities.push(child);
                    // CONSIDER: Delete log entry for child?
                    if (this.logEntry) {
                        this.logEntry.removeChild(child.logEntry);
                    }
                }
            }
        };
        GroupedActivity.prototype._recalculatePropertiesImmediately = function () {
            var stats = this._calculateActivityPropertyStats();
            this.extendedStatus(this._calculateExtendedStatus(stats)); // mainMessage depends on extendedStatus
            this.canCancel(this._calculateCanCancel(stats));
            this.canRetry(this._calculateCanRetry(stats));
            this.mainMessage(this._calculateMainMessage(stats));
            this.progress(this._calculateProgress(stats));
            // TODO calculate title here?
        };
        GroupedActivity.prototype._calculateActivityPropertyStats = function () {
            // Note: Assuming that all children in the pending sequence count towards progress.  But if they don't, things
            // should adjust themselves out anyway.
            var _this = this;
            // Note: We want to show all activities with errors/conflicts/etc, but only those counting towards
            // progress for success/etc.
            var total = this._allChildActivities.length
                + this._pendingSequence.getRemainingCount()
                + this._countRemovedTotal;
            var conflicts = this._countChildActivities(function (child) {
                return child.hasConflict && child.hasConflict();
            });
            var errors = this._countChildActivities(function (child) { return child.extendedStatus() === ExtendedStatus.Error; });
            var successes = this._countChildActivities(function (child) {
                return child.rawStatus() === ActivityLogStatus.Success;
            })
                + this._countRemovedSuccessful;
            var canceled = this._countChildActivities(function (child) {
                return child.extendedStatus() === ExtendedStatus.Canceled;
            })
                + this._countRemovedCanceled;
            var pending = this._countChildActivities(function (child) {
                return child.extendedStatus() === ExtendedStatus.Pending;
            })
                + this._pendingSequence.getRemainingCount();
            var inProgress = this._countChildActivities(function (child) {
                return child.extendedStatus() === ExtendedStatus.InProgress;
            });
            var autoRetryWaiting = this._countChildActivities(function (child) { return child.isWaitingForAutoRetry; });
            var retryCount = this._countRemovedTotalRetries;
            this._allChildActivities.forEach(function (child) {
                retryCount += _this._getActivityRetryCount(child);
            });
            return {
                countTotal: total,
                countConflicts: conflicts,
                countErrorsNotConflicts: errors,
                countSuccesses: successes,
                countCanceled: canceled,
                countPending: pending,
                countInProgress: inProgress,
                countAutoRetryWaiting: autoRetryWaiting,
                countRetryAttempts: retryCount
            };
        };
        GroupedActivity.prototype._getActivityRetryCount = function (activity) {
            var actionBased = this._asActionBasedActivity(activity);
            return actionBased ? actionBased.retryCount : 0;
        };
        GroupedActivity.prototype._countChildActivities = function (predicate) {
            var count = 0;
            this._allChildActivities.forEach(function (child) {
                if (predicate(child)) {
                    ++count;
                }
            });
            return count;
        };
        GroupedActivity.prototype._isActivityActive = function (activity) {
            return activity.rawStatus() === ActivityLogStatus.InProgress;
        };
        GroupedActivity.prototype._calculateCanCancel = function (stats) {
            var _this = this;
            if (this.isCanceling() || this.isCanceled()) {
                return false;
            }
            if (stats.countPending) {
                // Pending items are cancellable
                return true;
            }
            return this._allChildActivities.some(function (child) {
                var retryable = _this._asRetryableActivity(child);
                return retryable && retryable.canCancel();
            });
        };
        GroupedActivity.prototype._calculateCanRetry = function (stats) {
            var _this = this;
            if (this.isCanceling() || this.isCanceled()) {
                return false;
            }
            else {
                // Otherwise if any of the active children are retryable...
                return this._allChildActivities.some(function (child) {
                    var retryable = _this._asRetryableActivity(child);
                    return retryable && retryable.canRetry();
                });
            }
        };
        GroupedActivity.prototype.restartChild = function (child) {
            var actionable = this._asActionBasedActivity(child);
            if (actionable) {
                // Set to pending so that we will automatically start the child activity when it's appropriate.
                actionable.resetToPending();
                if (this.isCanceled()) {
                    // If the group was canceled, we won't automatically restart the child
                    //   after setting it to pending, so do so here.  This allows the user
                    //   to retry a single activity out of a group that s/he canceled.
                    actionable.start();
                }
            }
        };
        /**
         * @override
         */
        GroupedActivity.prototype._initializeObservables = function () {
            var _this = this;
            _super.prototype._initializeObservables.call(this);
            this.extendedStatus.subscribe(function () {
                // All activities completed successfully
                if (_this.extendedStatus() === ExtendedStatus.Success) {
                    _this._telemetryInfo.telemetry.sendEvent(_this._telemetryInfo.telemetryEventName, ObservableActivity.getElapsedTimeTelemetryProperties(_this, null, { "Status": "Success" }));
                }
            });
            this._recalculatePropertiesImmediately();
        };
        GroupedActivity.prototype.sendConsensedTelemetryEvent = function (name, properties, options) {
            this._telemetryCondenserizer.sendEvent(name, properties, options);
        };
        GroupedActivity.prototype._asActionBasedActivity = function (activity) {
            // Does it have the start() method?
            if (activity.start) {
                return activity;
            }
        };
        GroupedActivity.prototype._asRetryableActivity = function (activity) {
            // Does it have the canRetry() method?
            if (activity.canRetry) {
                return activity;
            }
        };
        return GroupedActivity;
    }(RetryableActivity));
    return GroupedActivity;
});

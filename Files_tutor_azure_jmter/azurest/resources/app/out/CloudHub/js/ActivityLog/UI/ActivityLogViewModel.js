/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore", "CloudExplorer/DaytonaHostProxy", "Common/ActivityLogManager", "ActivityLog/UI/ActivityLogEntryViewModel", "ActivityLog/ActivityLogStatus", "Common/Debug", "Common/TelemetryActions"], function (require, exports, ko, _, DaytonaHostProxy_1, ActivityLogManager, ActivityLogEntryViewModel, ActivityLogStatus, Debug, TelemetryActions) {
    "use strict";
    /**
     * Main ActivityLog ViewModel
     */
    var ActivityLogViewModel = (function () {
        function ActivityLogViewModel() {
            var _this = this;
            this.dismissCompletedLabel = "Clear completed";
            this.dismissSuccessfulLabel = "Clear successful";
            this._viewModelCache = {};
            this._processChangesQueue = [];
            this._processing = false;
            this._handleChange = function (changeHandler) {
                _this._processChangesQueue.push(changeHandler);
                if (!_this._processing) {
                    _this._startProcessItem();
                }
            };
            this._startProcessItem = function () {
                _this._processing = true;
                setTimeout(_this._processItem, 10);
            };
            this._processItem = function () {
                var change = _this._processChangesQueue.shift();
                if (!!change) {
                    change();
                }
                if (_this._processChangesQueue.length > 0) {
                    setTimeout(_this._processItem, 10);
                }
                else {
                    _this._processing = false;
                }
            };
            this.updateViewModelFromModel = function (vm, model) {
                // Dismissing an entry sets the visible observable to false. If we don't use this
                // previous value when we update the view model, then previously dismissed entries
                // will be shown again.
                if (!vm) {
                    // View model might have gone out of scope
                    return;
                }
                // TODO: This might end up resurrecting a VM that has been retired
                if (_this._viewModelCache[vm.id]) {
                    vm.visibility(_this._viewModelCache[vm.id].visibility());
                }
                _this._viewModelCache[vm.id] = vm;
                vm.title(model._title);
                vm.childSortOrder(model._childSortOrder);
                vm.status(ActivityLogStatus[model._status]);
                vm.progress(model._progress);
                vm.message(model._message);
                // Replace all the actions if anything has changed (actions doesn't change frequently for any element, so probably doesn't affect UI too much)
                var oldActions = vm.actions();
                var newActions = Object.keys(model._actionNames);
                if (oldActions.length !== newActions.length || JSON.stringify(oldActions) !== JSON.stringify(newActions)) {
                    vm.actions(newActions);
                }
                var newList = [];
                for (var i = 0; i < model._children.length; i++) {
                    // If we already have a view model for this model, we don't need to recreate the object (improving performance)
                    var child = _this._viewModelCache[model._children[i]._id];
                    if (!child) {
                        child = new ActivityLogEntryViewModel(_this._activityLogManager, model._children[i]._id, vm);
                    }
                    _this.updateViewModelFromModel(child, model._children[i]);
                    // Record the current index of the child for use in the stable sort below
                    child.$_index = i;
                    newList.push(child);
                }
                // Do a stable sort on the new list based on childSortOrder (browser sorts generally are
                // not stable) by recording the current index and using it as the secondary sort field.
                newList = newList.sort(function (a, b) {
                    var ret = ActivityLogViewModel.statusToSortOrder(ActivityLogStatus[a.status()]) - ActivityLogViewModel.statusToSortOrder(ActivityLogStatus[b.status()]);
                    if (ret === 0) {
                        ret = a.childSortOrder() - b.childSortOrder();
                    }
                    if (ret === 0) {
                        ret = a.$_index - b.$_index;
                    }
                    return ret;
                });
                // Modify the set of children in place to match the new list (we don't want to wholesale replace the
                // list if we can help it, it disrupts the UI more than modifying the existing list).
                // I.e., modify vm.children to make it look like newList.
                var result = ActivityLogViewModel.updateObservableArrayToMatchArray(vm.children, newList);
                var removedIds = result.removedIds;
                // Get rid of the view model from our cache for any child which was there previously but no longer is
                removedIds.forEach(function (id) {
                    delete _this._viewModelCache[id];
                });
                vm.updateVisibleChildren();
            };
            this.handleAddEntry = function (model) {
                var addEntryChange = function () {
                    var vm = new ActivityLogEntryViewModel(_this._activityLogManager, model._id, null);
                    vm.show();
                    _this.updateViewModelFromModel(vm, model);
                    _this.entries.unshift(vm);
                };
                _this._handleChange(addEntryChange);
                return Promise.resolve();
            };
            this.handleUpdateEntry = function (model) {
                var updateEntryChange = function () {
                    if (_this._viewModelCache[model._id]) {
                        _this.updateViewModelFromModel(_this._viewModelCache[model._id], model);
                    }
                };
                _this._handleChange(updateEntryChange);
                return Promise.resolve();
            };
            this.handleDeleteEntry = function (model) {
                var deleteEntryChange = function () {
                    if (_this._viewModelCache[model._id]) {
                        var viewModel = _this._viewModelCache[model._id];
                        delete _this._viewModelCache[model._id];
                        // Todo: Needs to handle removing a child entry.
                        _this.entries.remove(viewModel);
                        viewModel.children().forEach(function (childViewModel) {
                            delete _this._viewModelCache[childViewModel.id];
                        });
                    }
                };
                _this._handleChange(deleteEntryChange);
                return Promise.resolve();
            };
            /**
             * Recursively dismisses all of the successfully completed entries in the log.
             */
            this.dismissSuccessful = function () {
                for (var i = _this.entries().length - 1; i >= 0; i--) {
                    if (_this.entries()[i].recursiveDismissSuccessful()) {
                        // TODO: remove from view model cache
                        _this.entries.splice(i, 1);
                    }
                }
            };
            /**
             * Recursively dismisses all of the completed entries in the log.
             * An entry is considered complete if its state is `Successful` or `Error`.
             */
            this.dismissCompleted = function () {
                for (var i = _this.entries().length - 1; i >= 0; i--) {
                    if (_this.entries()[i].recursiveDismissCompleted()) {
                        // TODO: remove from view model cache
                        _this.entries.splice(i, 1);
                    }
                }
            };
            /**
             * Dismisses all of the entries in the log.
             */
            this.dismissAll = function () {
                // TODO: remove from view model cache
                _this.entries.removeAll();
            };
            this.entries = ko.observableArray([]);
            this._hostProxy = new DaytonaHostProxy_1.default();
            this._telemetryActions = new TelemetryActions(this._hostProxy);
            this._activityLogManager = new ActivityLogManager(this._hostProxy, this._telemetryActions);
            this._hostProxy.executeOperation(ActivityLogManager.initializedNamespace, []);
            // Make sure we can handle logged activity
            this._activityLogManager.onAddLogActivity(this.handleAddEntry);
            this._activityLogManager.onUpdateLogActivity(this.handleUpdateEntry);
            this._activityLogManager.onDeleteLogActivity(this.handleDeleteEntry);
        }
        ActivityLogViewModel.areSetsEqual = function (set1, set2) {
            if (set1.length !== set2.length) {
                return false;
            }
            else if (!set1.length && !set2.length) {
                return true; // Both arrays are empty
            }
            // Sort both arrays
            var sortedIds1 = _.map(set1, function (entry) { return entry.id; }).sort();
            var sortedIds2 = _.map(set2, function (entry) { return entry._id; }).sort();
            // Make sure they are equal
            return _.isEqual(sortedIds1, sortedIds2);
        };
        /**
         * Modify the left (observable) array in place to match the right one. If possible to do just by removing and inserting
         * items (and not by sorting items), then it will be done that way, which should disturb any attached UX as little as possible
         */
        ActivityLogViewModel.updateObservableArrayToMatchArray = function (left, right) {
            var i = 0; // Index into left
            var j = 0; // Index into right
            // Figure out which child VMs have been added or deleted
            var leftIds = left().map(function (entry) { return entry.id; });
            var rightIds = right.map(function (entry) { return entry.id; });
            var addedIds = {};
            var removedIds = {};
            // ... Start with all items in the new list, and weed them out.
            rightIds.forEach(function (id) { return addedIds[id] = id; });
            leftIds.forEach(function (id) {
                if (rightIds.indexOf(id) >= 0) {
                    // The ID was there before and is still there.  Remove it from the list of added ids.
                    // Anything left after this loop will be the set of added ids.
                    delete addedIds[id];
                }
                else {
                    // Was there before, has been removed since
                    removedIds[id] = id;
                }
            });
            if (Debug.isDebug()) {
                Debug.assert(_.toArray(addedIds).length + _.toArray(removedIds).length <= leftIds.length + rightIds.length);
                Debug.assert(_.toArray(addedIds).length <= rightIds.length);
                Debug.assert(_.toArray(removedIds).length <= leftIds.length);
            }
            var done = false;
            while (!done) {
                var leftLength = left().length;
                var rightLength = right.length;
                if (i >= leftLength && j >= rightLength) {
                    // We've reached the end of both lists - success
                    done = true;
                }
                else if (i < leftLength && left()[i].id in removedIds) {
                    // Item should be removed from left list
                    left.splice(i, 1);
                }
                else if (j < rightLength && right[j].id in addedIds) {
                    // Insert new item from right into the left list
                    left.splice(i, 0, right[j]);
                    ++i;
                    ++j;
                }
                else if (i < leftLength && j < rightLength && left()[i] === right[j]) {
                    // The items both match, skip past them and keep going
                    ++i;
                    ++j;
                }
                else {
                    // Some item must have changed order.  At this point it's easiest just
                    // to replace the entire list.
                    left(right);
                    done = true;
                }
            }
            Debug.assert(function () { return ActivityLogViewModel.areSetsEqual(left(), right); });
            return {
                removedIds: _.toArray(removedIds) // This gets an array of the property values (which we've set up to be the same as the keys)
            };
        };
        return ActivityLogViewModel;
    }());
    ActivityLogViewModel.statusToSortOrder = function (status) {
        switch (status) {
            case ActivityLogStatus.Attention:
                return 0;
            case ActivityLogStatus.Error:
                return 1;
            case ActivityLogStatus.InProgress:
                return 2;
            case ActivityLogStatus.Pending:
                return 3;
            case ActivityLogStatus.Info:
                return 4;
            case ActivityLogStatus.Canceled:
                return 4;
            case ActivityLogStatus.Success:
                return 4;
        }
    };
    return ActivityLogViewModel;
});

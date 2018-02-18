/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "ActivityLog/ActivityLogStatus", "Providers/Common/AzureConstants", "../../CloudExplorer/UI/KeyCodes"], function (require, exports, ko, ActivityLogStatus, AzureConstants, KeyCodes_1) {
    "use strict";
    var maxNumVisibleChildren = 100;
    var Visibility;
    (function (Visibility) {
        Visibility[Visibility["Unseen"] = 0] = "Unseen";
        Visibility[Visibility["Visible"] = 1] = "Visible";
        Visibility[Visibility["Dismissed"] = 2] = "Dismissed";
    })(Visibility || (Visibility = {}));
    ;
    /**
     * View model for an individual ActivityLogViewModel
     */
    var ActivityLogEntryViewModel = (function () {
        function ActivityLogEntryViewModel(manager, id, parent) {
            var _this = this;
            /*
             * Determines which children should be visible in the Activity Log by showing only those up to a maximum.
             */
            this.updateVisibleChildren = function () {
                var childrenToShow = maxNumVisibleChildren - _this.visibleChildren().length;
                for (var i = 0; i < _this.children().length; i++) {
                    // We want to show the entry if we haven't yet reached the limit of entries to show
                    var hasRemainingSpace = childrenToShow > 0 && _this.children()[i].visibility() === Visibility.Unseen;
                    if (hasRemainingSpace) {
                        _this.children()[i].show();
                        childrenToShow--;
                    }
                }
            };
            /**
             * Handles a click on an action from the UI. Fires an event via the manager
             */
            this.handleActionClick = function (value) {
                _this._manager.action(_this._id, value);
            };
            this.show = function () {
                _this.visibility(Visibility.Visible);
            };
            /**
             * Dismisses an entry and its children if they all succeeded.
             *   If the entry itself is successful (and should be dismissed), it returns true to
             *   indicate to the parent that it will be hidden (and can be removed from the array).
             */
            this.recursiveDismissSuccessful = function () {
                if (_this.hasChildren()) {
                    var canDismiss = _this.isSuccessState();
                    for (var i = _this.children().length - 1; i >= 0; i--) {
                        var child = _this.children()[i];
                        var canDismissChild = child.recursiveDismissSuccessful();
                        canDismiss = canDismiss && canDismissChild;
                        if (canDismissChild) {
                            _this.children.splice(i, 1);
                        }
                    }
                    _this.updateVisibleChildren();
                    return canDismiss;
                }
                else {
                    return _this.isSuccessState();
                }
            };
            /**
             * Recursively dismisses an entry's children if they are completed.
             * If all of an entry's children are dismissed, it returns true to
             * indicate to the parent that it can be removed.
             */
            this.recursiveDismissCompleted = function () {
                if (_this.hasChildren()) {
                    var canDismiss = _this.isCompletedState();
                    for (var i = _this.children().length - 1; i >= 0; i--) {
                        var child = _this.children()[i];
                        var canDismissChild = child.recursiveDismissCompleted();
                        canDismiss = canDismiss && canDismissChild;
                        if (canDismissChild) {
                            _this.children.splice(i, 1);
                        }
                    }
                    _this.updateVisibleChildren();
                    return canDismiss;
                }
                else {
                    return _this.isCompletedState();
                }
            };
            /**
             * Returns whether an activity is completed.
             * For a single activity, it's completed if it succeeded or failed or was canceled
             * For a group activity, it's completed when all the children are completed.
             */
            this.isActivityCompleted = function () {
                if (!_this.hasChildren()) {
                    return _this.isCompletedState();
                }
                else {
                    return _this.children().every(function (child) { return child.isActivityCompleted(); });
                }
            };
            this.onKeyPress = function (data, event) {
                var keyPressed = event.key || event.keyCode;
                switch (keyPressed) {
                    case "Enter":
                    case KeyCodes_1.default.Enter:
                        _this.toggleExpand();
                        return false;
                }
                return true;
            };
            /**
             * Handles a click on the expand icon.
             */
            this.toggleExpand = function () {
                _this.isCollapsed(!_this.isCollapsed());
                _this.expandIconSrc(_this.isCollapsed() ? AzureConstants.imagePaths.DefaultExpandIcon : AzureConstants.imagePaths.ToggleExpandIcon);
            };
            this.isSuccessState = function () {
                return _this.status() === ActivityLogStatus[ActivityLogStatus.Success] ||
                    _this.status() === ActivityLogStatus[ActivityLogStatus.Canceled] ||
                    _this.status() === ActivityLogStatus[ActivityLogStatus.Info];
            };
            this.isCompletedState = function () {
                return _this.status() === ActivityLogStatus[ActivityLogStatus.Success] ||
                    _this.status() === ActivityLogStatus[ActivityLogStatus.Error] ||
                    _this.status() === ActivityLogStatus[ActivityLogStatus.Canceled] ||
                    _this.status() === ActivityLogStatus[ActivityLogStatus.Info];
            };
            this._manager = manager;
            this._id = id;
            this.title = ko.observable("");
            this.childSortOrder = ko.observable(0);
            this.status = ko.observable(ActivityLogStatus[ActivityLogStatus.Pending]);
            this.visibility = ko.observable(Visibility.Unseen);
            this.isCollapsed = ko.observable(true);
            this.progress = ko.observable(0);
            this.message = ko.observable("");
            this.actions = ko.observableArray([]);
            this.children = ko.observableArray([]);
            this.expandIconSrc = ko.observable(AzureConstants.imagePaths.DefaultExpandIcon);
            this.statusIconSrc = ko.pureComputed(function () {
                switch (ActivityLogStatus[_this.status()]) {
                    case ActivityLogStatus.Pending:
                        return "../../images/ActivityLog/Pending_16x16.png";
                    case ActivityLogStatus.InProgress:
                        return "../../images/Common/Halo_ProgressSpinner.svg";
                    case ActivityLogStatus.Success:
                        return "../../images/ActivityLog/Success_16x16.png";
                    case ActivityLogStatus.Error:
                        return "../../images/ActivityLog/Error_16x16.png";
                    case ActivityLogStatus.Attention:
                        return "../../images/ActivityLog/Attention_16x16.png";
                    case ActivityLogStatus.Canceled:
                        return "../../images/ActivityLog/Canceled_16x16.png";
                    case ActivityLogStatus.Info:
                        return "../../images/ActivityLog/QueryInformation_16x.png";
                }
            });
            this.parent = ko.observable(parent);
            this.level = ko.pureComputed(function () { return _this.parent() ? _this.parent().level() + 1 : 1; });
            /*
             * Returns the children that are visible (not dismissed or waiting to be shown in the log)
             */
            this.visibleChildren = ko.computed(function () {
                return ko.utils.arrayFilter(_this.children(), function (child) {
                    return child.visibility() === Visibility.Visible;
                });
            });
            this.activitiesNotShownText = ko.pureComputed(function () {
                var notShownText = ActivityLogEntryViewModel.activitiesNotShownClearToSeeMoreCaption;
                if (_this.status() === ActivityLogStatus[ActivityLogStatus.Success]) {
                    notShownText = ActivityLogEntryViewModel.activitiesNotShownCaption;
                }
                return notShownText;
            });
            this.hasUnseenChildren = ko.pureComputed(function () {
                return _this.children().some(function (child) { return child.visibility() === Visibility.Unseen; });
            });
            /**
             * Returns the progress in a displayable form
             */
            this.progressPercentage = ko.computed(function () {
                return Math.floor(_this.progress() * 100) + "%";
            });
            /**
             * Returns whether or not the entry has children entries
             */
            this.hasChildren = ko.computed({
                read: function () { return !!_this.children().length; }
            });
            /**
             * Returns whether or not the operation has progress (meaning that it is InProgress and has a valid number)
             */
            this.hasProgress = ko.computed(function () {
                return !!_this.progress() && !_this.isActivityCompleted();
            });
        }
        Object.defineProperty(ActivityLogEntryViewModel.prototype, "id", {
            /**
             * Returns the id of the associated ActivityLogEntry
             */
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        return ActivityLogEntryViewModel;
    }());
    /* Labels */
    ActivityLogEntryViewModel.activitiesNotShownClearToSeeMoreCaption = "There are more activities that are not shown. Clear successful activities to see more."; // localize
    ActivityLogEntryViewModel.activitiesNotShownCaption = "There are more activities that are not shown."; // localize
    return ActivityLogEntryViewModel;
});

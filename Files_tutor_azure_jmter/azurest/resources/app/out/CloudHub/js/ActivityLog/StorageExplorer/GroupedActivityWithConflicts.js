/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/ActivityLogStatus", "Providers/Common/AzureConstants", "knockout", "ActivityLog/StorageExplorer/GroupedActivity", "ActivityLog/StorageExplorer/OverwriteMode"], function (require, exports, ActivityLogStatus, AzureConstants, ko, GroupedActivity, OverwriteMode) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a parent operation that updates its state based
     * on its children, and also knows about activity conflicts (e.g., trying to upload a blob, but one
     * with that name already exists).
     */
    var GroupedActivityWithConflicts = (function (_super) {
        __extends(GroupedActivityWithConflicts, _super);
        function GroupedActivityWithConflicts(title, resolveDialogOperationType, resolveDialogFlobType, host, activityLogManager, telemetryInfo) {
            var _this = _super.call(this, title, activityLogManager, telemetryInfo) || this;
            _this._showOverwriteModeLabel = "Auto-Resolve behavior..."; // localize
            _this._overwriteMode = OverwriteMode.LetUserResolve;
            _this.canSetOverwriteMode = ko.observable(true);
            _this.showOverwriteModeDialog = function () {
                if (!_this.canSetOverwriteMode()) {
                    return;
                }
                return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                    id: AzureConstants.registeredDialogs.options,
                    parameters: {
                        title: "Choose Auto-resolve Behavior",
                        message: "How do you want to handle items with the same name?",
                        options: [
                            { title: "Replace items in the destination", value: "overwrite" },
                            { title: "Skip items with conflicting names", value: "keepExisting" },
                            { title: "Handle conflicts individually", value: "letMeResolve" }
                        ],
                        defaultOptionValue: "overwrite",
                        buttons: [
                            { title: "Apply", value: "apply" }
                        ]
                    }
                }).then(function (result) {
                    if (!result) {
                        return;
                    }
                    var overwriteAll = result.option === "overwrite";
                    var keepAll = result.option === "keepExisting";
                    if (overwriteAll || keepAll) {
                        _this._overwriteMode = overwriteAll ? OverwriteMode.Overwrite : OverwriteMode.KeepExisting;
                        _this._recalculatePropertiesImmediately();
                        _this._resolveAll(_this._overwriteMode);
                    }
                });
            };
            _this._resolveAll = function (overwriteMode) {
                _this._telemetryInfo.telemetry.sendEvent(_this._telemetryInfo.telemetryEventName, { "Conflicts resolve mode": (overwriteMode === OverwriteMode.Overwrite) ? "overwrite all" : "keep all existing" });
                _this._allChildActivities.forEach(function (child) {
                    _this._setChildOvewriteMode(child, overwriteMode);
                });
            };
            _this._host = host;
            _this._resolveDialogOperationType = resolveDialogOperationType;
            _this._resolveDialogFlobType = resolveDialogFlobType;
            _this.canSetOverwriteMode.subscribe(function () {
                _this._updateActions();
                _this._firePropertyChanged("canSetOverwriteMode");
            });
            return _this;
        }
        GroupedActivityWithConflicts.prototype._addChildActivitiesCore = function (children, showInActivityLog, isTemporary) {
            var _this = this;
            _super.prototype._addChildActivitiesCore.call(this, children, showInActivityLog, isTemporary);
            children.forEach(function (child) { return _this._setChildOvewriteMode(child, _this._overwriteMode); });
        };
        GroupedActivityWithConflicts.prototype._setChildOvewriteMode = function (child, overwriteMode) {
            var overwritableChild = this._asOverwritableActivity(child);
            if (overwritableChild && overwritableChild.keepExisting) {
                // We need to call these whether or not there is currently a conflict, because we want
                // to set the resolution mode for activities which haven't even run yet (or finished).
                if (overwriteMode === OverwriteMode.Overwrite) {
                    overwritableChild.overwrite();
                }
                else if (overwriteMode === OverwriteMode.KeepExisting) {
                    overwritableChild.keepExisting();
                }
            }
        };
        GroupedActivityWithConflicts.prototype._recalculatePropertiesImmediately = function () {
            _super.prototype._recalculatePropertiesImmediately.call(this);
            this.canSetOverwriteMode(this._getCanSetOverwriteMode());
        };
        GroupedActivityWithConflicts.prototype._getCanSetOverwriteMode = function () {
            if (!this._canHaveConflicts) {
                return false;
            }
            if (this.isRetrying() || this.isCanceling()) {
                return false;
            }
            if (this.rawStatus() === ActivityLogStatus.Canceled || this.rawStatus() === ActivityLogStatus.Success) {
                return false;
            }
            return this._overwriteMode === OverwriteMode.LetUserResolve;
        };
        GroupedActivityWithConflicts.prototype._asOverwritableActivity = function (activity) {
            // Does it have the overwrite() method?
            if (activity.overwrite) {
                return activity;
            }
        };
        /**
         * @override
         */
        GroupedActivityWithConflicts.prototype._updateActions = function () {
            _super.prototype._updateActions.call(this);
            // Add/remove Resolve Conflicts button
            this._addOrRemoveAction(this._showOverwriteModeLabel, this.showOverwriteModeDialog, this.canSetOverwriteMode());
        };
        /**
         * @override
         */
        GroupedActivityWithConflicts.prototype._getAdditionalTelemetryStats = function () {
            switch (this._overwriteMode) {
                case OverwriteMode.LetUserResolve:
                    return [];
                case OverwriteMode.Overwrite:
                    return ["overwrite on conflicts"];
                case OverwriteMode.KeepExisting:
                    return ["skip on conflicts"];
            }
        };
        return GroupedActivityWithConflicts;
    }(GroupedActivity));
    // IMPORTANT NOTE!
    // Do not created computed knockout properties that touch any of the children, because it
    // won't scale to the millions of children that we might have.
    GroupedActivityWithConflicts.dialogOperationTypes = {
        copy: "Copy",
        upload: "Upload",
        download: "Download"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GroupedActivityWithConflicts;
});

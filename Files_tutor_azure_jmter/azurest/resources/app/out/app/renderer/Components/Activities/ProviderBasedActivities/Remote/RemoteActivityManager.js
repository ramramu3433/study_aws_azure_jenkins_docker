"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var RemoteActivityManager = (function () {
    function RemoteActivityManager(host) {
        var _this = this;
        this.executeAction = function (activityRef, action) {
            var args = {
                activityRef: activityRef,
                action: action
            };
            return _this._host.executeOperation("ActivityManager.executeAction", args);
        };
        this._executeActionHandlers = [];
        this.onExecuteActionEvent = function (args) {
            _this._executeActionHandlers.forEach(function (executeActionListener) {
                executeActionListener(args.activityRef, args.action);
            });
            return Q.resolve(undefined);
        };
        this.onExecuteAction = function (actionHandler) {
            _this._executeActionHandlers.push(actionHandler);
        };
        this._host = host;
    }
    RemoteActivityManager.prototype.add = function (entry) {
        return this._host.executeOperation("ActivityManager.add", entry);
    };
    RemoteActivityManager.prototype.update = function (entryRef, updatedEntry) {
        var args = {
            activityRef: entryRef,
            updatedActivity: updatedEntry
        };
        return this._host.executeOperation("ActivityManager.update", args);
    };
    RemoteActivityManager.prototype.delete = function (entryRef) {
        return this._host.executeOperation("ActivityManager.delete", entryRef);
    };
    RemoteActivityManager.prototype.get = function (entryRef) {
        return this._host.executeOperation("ActivityManager.get", entryRef);
    };
    RemoteActivityManager.prototype.getChildren = function (entryRef) {
        return this._host.executeOperation("ActivityManager.getChildren", entryRef);
    };
    RemoteActivityManager.prototype.setDbLocation = function (dbFilePath) {
        return this._host.executeOperation("ActivityManager.setDbLocation", dbFilePath);
    };
    return RemoteActivityManager;
}());
exports.default = RemoteActivityManager;

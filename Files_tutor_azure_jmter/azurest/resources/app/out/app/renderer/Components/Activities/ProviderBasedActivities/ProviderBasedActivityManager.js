"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityManager_1 = require("../ActivityManager");
var Q = require("q");
var ProviderBasedActivityManager = (function () {
    function ProviderBasedActivityManager(host) {
        var _this = this;
        this.executeAction = function (activityRef, action) {
            if (_this._activityManager) {
                return _this._activityManager.executeAction(activityRef, action);
            }
            else {
                return _this.init().then(function () { return _this.executeAction(activityRef, action); });
            }
        };
        this._onAddListener = function (entryRef, parentRef) {
            _this._host.raiseEvent("ActivityManager.onAddEvent", { entryRef: entryRef, parentRef: parentRef });
        };
        this._onUpdateListener = function (entryRef, parentRef) {
            _this._host.raiseEvent("ActivityManager.onUpdateEvent", { entryRef: entryRef, parentRef: parentRef });
        };
        this._onDeleteListener = function (entryRef, parentRef) {
            _this._host.raiseEvent("ActivityManager.onDeleteEvent", { entryRef: entryRef, parentRef: parentRef });
        };
        this._onExecuteActionListener = function (activityRef, action) {
            var args = {
                activityRef: activityRef,
                action: action
            };
            if (action.args && action.args.providerNamespace) {
                return _this._host.executeOperation(action.args.providerNamespace, action.args.providerArgs);
            }
            return _this._host.raiseEvent("ActivityManager.onExecuteActionEvent", args);
        };
        this._host = host;
    }
    ProviderBasedActivityManager.prototype.init = function () {
        var _this = this;
        if (!this._initPromise) {
            this._initPromise = Q.Promise(function (resolve, reject) {
                _this._activityManager = new ActivityManager_1.default();
                _this._activityManager.onAdd(_this._onAddListener);
                _this._activityManager.onUpdate(_this._onUpdateListener);
                _this._activityManager.onDelete(_this._onDeleteListener);
                _this._activityManager.onExecuteAction(_this._onExecuteActionListener);
                resolve(null);
            });
        }
        return this._initPromise;
    };
    ProviderBasedActivityManager.prototype.add = function (entry) {
        var _this = this;
        if (this._activityManager) {
            return this._activityManager.add(entry);
        }
        else {
            return this.init().then(function () { return _this.add(entry); });
        }
    };
    ProviderBasedActivityManager.prototype.update = function (entryRef, updatedEntry) {
        var _this = this;
        if (this._activityManager) {
            return this._activityManager.update(entryRef, updatedEntry);
        }
        else {
            return this.init().then(function () { return _this.update(entryRef, updatedEntry); });
        }
    };
    ProviderBasedActivityManager.prototype.delete = function (entryRef) {
        var _this = this;
        if (this._activityManager) {
            return this._activityManager.delete(entryRef);
        }
        else {
            return this.init().then(function () { return _this.delete(entryRef); });
        }
    };
    ProviderBasedActivityManager.prototype.get = function (entryRef) {
        var _this = this;
        if (this._activityManager) {
            return this._activityManager.get(entryRef);
        }
        else {
            return this.init().then(function () { return _this.get(entryRef); });
        }
    };
    ProviderBasedActivityManager.prototype.getChildren = function (entryRef) {
        var _this = this;
        if (this._activityManager) {
            return this._activityManager.getChildren(entryRef);
        }
        else {
            return this.init().then(function () { return _this.getChildren(entryRef); });
        }
    };
    return ProviderBasedActivityManager;
}());
exports.default = ProviderBasedActivityManager;

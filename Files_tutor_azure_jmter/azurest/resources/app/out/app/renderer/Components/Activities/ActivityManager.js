"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ActivityStatus_1 = require("./ActivityStatus");
var RemoteActivityManager_1 = require("./ProviderBasedActivities/Remote/RemoteActivityManager");
exports.Remote = RemoteActivityManager_1.default;
// Consider using https://github.com/Ivshti/linvodb3 if we need large scale
var Nedb = require("nedb");
var Q = require("q");
var ActivityManager = (function () {
    function ActivityManager(filePath) {
        var _this = this;
        this._addListeners = [];
        this._updateListeners = [];
        this._deleteListeners = [];
        this._executeActionListeners = [];
        this.executeAction = function (activityRef, action) {
            return _this.get(activityRef).then(function (activity) {
                var matchingActions = activity.actions.filter(function (filterAction) {
                    return filterAction.title === action.title;
                });
                if (matchingActions.length > 0) {
                    var actionToExecute = matchingActions[0];
                    _this._raiseExecuteActionEvent(activityRef, actionToExecute);
                }
            });
        };
        this._database = new Nedb({
            autoload: true,
            filename: filePath
        });
        this._database.persistence.setAutocompactionInterval(60000);
    }
    ActivityManager.prototype.add = function (entry) {
        var _this = this;
        this._preProcess(entry);
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.insert(entry, function (err, addedEntry) {
                if (err) {
                    reject(err);
                }
                else if (addedEntry) {
                    // nedb adds a _id property to the IActivity.
                    var insertedDoc = addedEntry;
                    var entryRef = {
                        id: insertedDoc._id
                    };
                    resolve(entryRef);
                    _this._raiseAddEvent(entryRef, entry.parent);
                }
                else {
                    reject("Failed To Add Entry");
                }
            });
        });
    };
    ActivityManager.prototype.update = function (entryRef, updatedEntry) {
        var _this = this;
        this._preProcess(updatedEntry);
        return Q.Promise(function (resolve, reject, notify) {
            var updateQuery = {
                $set: updatedEntry
            };
            _this._database.update({ _id: entryRef.id }, updateQuery, { multi: false }, function (err, numberOfUpdated, upsert) {
                if (err) {
                    reject(err);
                }
                else {
                    if (numberOfUpdated === 1) {
                        _this._raiseUpdateEvent(entryRef, updatedEntry.parent);
                    }
                    resolve(null);
                }
            });
        });
    };
    ActivityManager.prototype.delete = function (entryRef) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.remove({ _id: entryRef.id }, { multi: false }, function (err, numberOfDeleted) {
                if (numberOfDeleted === 1 && !err) {
                    _this._raiseDeleteEvent(entryRef, null);
                }
                else if (err) {
                    reject(err);
                }
                resolve(null);
            });
        });
    };
    ActivityManager.prototype.get = function (entryRef) {
        var _this = this;
        return Q.Promise(function (resolve, reject, notify) {
            _this._database.find({ _id: entryRef.id }, function (err, documents) {
                // TODO remove _id proprty;
                var document = (documents && documents.length === 1) ? documents[0] : null;
                if (err) {
                    reject(err);
                }
                else {
                    _this._database.count({
                        "parent.id": entryRef.id
                    }, function (err, n) {
                        if (err) {
                            reject(err);
                        }
                        else if (!document) {
                            reject("No activity to get.");
                        }
                        else {
                            document.numChildren = n;
                            resolve(document);
                        }
                    });
                }
            });
        });
    };
    ActivityManager.prototype.getChildren = function (entryRef) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var MaxPerStaus, MaxChildren, attentionPromise, canceledPromise, errorPromise, infoPromise, inProgressPromise, pendingPromise, successPromise, childrenPromises;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        MaxPerStaus = 50;
                        MaxChildren = 105;
                        attentionPromise = this._getChildrenByStatus(entryRef, ActivityStatus_1.default.Attention, MaxPerStaus, { _lastModified: -1 });
                        canceledPromise = this._getChildrenByStatus(entryRef, ActivityStatus_1.default.Canceled, MaxPerStaus, { _lastModified: -1 });
                        errorPromise = this._getChildrenByStatus(entryRef, ActivityStatus_1.default.Error, MaxPerStaus, { _lastModified: -1 });
                        infoPromise = this._getChildrenByStatus(entryRef, ActivityStatus_1.default.Info, MaxPerStaus, { _lastModified: -1 });
                        inProgressPromise = this._getChildrenByStatus(entryRef, ActivityStatus_1.default.InProgress, MaxPerStaus);
                        pendingPromise = this._getChildrenByStatus(entryRef, ActivityStatus_1.default.Pending, MaxPerStaus, { _lastModified: 1 });
                        successPromise = this._getChildrenAndExpireOldChildrenByStatus(entryRef, ActivityStatus_1.default.Success, MaxPerStaus);
                        childrenPromises = [attentionPromise, errorPromise, inProgressPromise, pendingPromise, infoPromise, canceledPromise, successPromise];
                        return [4 /*yield*/, Q.all(childrenPromises)
                                .then(function (childrenResults) {
                                return [].concat.apply([], childrenResults).slice(0, MaxChildren);
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ActivityManager.prototype._getChildrenAndExpireOldChildrenByStatus = function (parentRef, status, limit) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var children, oldestReturnedChild, modifiedThreshold;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getChildrenByStatus(parentRef, status, limit, { _lastModified: -1 })];
                    case 1:
                        children = _a.sent();
                        if (children.length > 0) {
                            oldestReturnedChild = children[children.length - 1];
                            modifiedThreshold = oldestReturnedChild.activity._lastModified;
                            this._database.remove({ _lastModified: { $lt: modifiedThreshold }, status: status }, { multi: true });
                        }
                        return [2 /*return*/, children];
                }
            });
        });
    };
    ActivityManager.prototype._getChildrenByStatus = function (parentRef, status, limit, sortOptions) {
        var _this = this;
        return Q.Promise(function (childrenResolve, reject, notify) {
            var findCursor = _this._database.find({
                "parent.id": parentRef.id,
                "status": status
            });
            if (!!sortOptions) {
                findCursor = findCursor.sort(sortOptions);
            }
            findCursor.limit(limit)
                .exec(function (err, childActivities) {
                if (err) {
                    reject(err);
                }
                else {
                    var returnChildrenPromises = childActivities.map(function (child) {
                        return Q.Promise(function (childResolve, reject, notify) {
                            // Used to get _id from child.
                            var anyChild = child;
                            var childRef = { id: anyChild._id };
                            _this._database.count({
                                "parent.id": childRef.id
                            }, function (err, n) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    child.numChildren = n;
                                    childResolve({
                                        activityRef: childRef,
                                        activity: child
                                    });
                                }
                            });
                        });
                    });
                    Q.all(returnChildrenPromises)
                        .then(childrenResolve);
                }
            });
        });
    };
    ActivityManager.prototype._raiseAddEvent = function (entryRef, parentRef) {
        this._addListeners.forEach(function (addListener) {
            addListener(entryRef, parentRef);
        });
    };
    ActivityManager.prototype._raiseUpdateEvent = function (entryRef, parentRef) {
        this._updateListeners.forEach(function (updateListener) {
            updateListener(entryRef, parentRef);
        });
    };
    ActivityManager.prototype._raiseDeleteEvent = function (entryRef, parentRef) {
        this._deleteListeners.forEach(function (deleteListener) {
            deleteListener(entryRef, parentRef);
        });
    };
    ActivityManager.prototype._raiseExecuteActionEvent = function (entryRef, action) {
        this._executeActionListeners.forEach(function (executeActionListener) {
            executeActionListener(entryRef, action);
        });
    };
    ActivityManager.prototype.onAdd = function (listener) {
        this._addListeners.push(listener);
    };
    ActivityManager.prototype.onUpdate = function (listener) {
        this._updateListeners.push(listener);
    };
    ActivityManager.prototype.onDelete = function (listener) {
        this._deleteListeners.push(listener);
    };
    ActivityManager.prototype.onExecuteAction = function (listener) {
        this._executeActionListeners.push(listener);
    };
    ActivityManager.prototype._preProcess = function (entry) {
        entry._lastModified = new Date();
    };
    return ActivityManager;
}());
exports.default = ActivityManager;

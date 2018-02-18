"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var ActivityStatus_1 = require("../Components/Activities/ActivityStatus");
var ActivityManager_1 = require("../Components/Activities/ActivityManager");
var Assert_1 = require("../Components/TestManager/Assert");
var Q = require("q");
var Path = require("path");
var ActivityTests = (function (_super) {
    tslib_1.__extends(ActivityTests, _super);
    function ActivityTests(activityManager) {
        var _this = _super.call(this, "Activity Tests", activityManager) || this;
        _this._singleItemTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var addedActivity, activityRef, activityFromManager;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addedActivity = {
                            parent: null,
                            title: "Test Title",
                            message: "Test Message",
                            sortOrder: 2,
                            status: ActivityStatus_1.default.Pending,
                            progress: 1,
                            actions: []
                        };
                        return [4 /*yield*/, this._activityManager.add(addedActivity)];
                    case 1:
                        activityRef = _a.sent();
                        return [4 /*yield*/, this._activityManager.get(activityRef)];
                    case 2:
                        activityFromManager = _a.sent();
                        return [4 /*yield*/, this._activityManager.delete(activityRef)];
                    case 3:
                        _a.sent();
                        Assert_1.default(this._equal(activityFromManager, addedActivity), "Added activity should be the same from activity manager.");
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._updateItemTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var addedActivity, activityRef, updatedActivityFromManager;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addedActivity = {
                            parent: null,
                            title: "Test Title",
                            message: "Test Message",
                            sortOrder: 1,
                            status: ActivityStatus_1.default.Success,
                            progress: 1,
                            actions: []
                        };
                        return [4 /*yield*/, this._activityManager.add(addedActivity)];
                    case 1:
                        activityRef = _a.sent();
                        addedActivity.title = "New Title";
                        return [4 /*yield*/, this._activityManager.update(activityRef, addedActivity)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._activityManager.get(activityRef)];
                    case 3:
                        updatedActivityFromManager = _a.sent();
                        Assert_1.default(this._equal(updatedActivityFromManager, addedActivity), "Updated activity should be the same from activity manager.");
                        return [4 /*yield*/, this._activityManager.delete(activityRef)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._itemWithChildTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var parentActivity, childActivity, parentRef, childRef, returnedParent, returnedChildren, returnedChild;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentActivity = {
                            parent: null,
                            title: "Test Activity With Child",
                            message: "Test Activity With Child",
                            sortOrder: 1,
                            status: ActivityStatus_1.default.Success,
                            progress: 1,
                            actions: []
                        };
                        childActivity = {
                            parent: null,
                            title: "Test Child",
                            message: "Test Child",
                            sortOrder: 1,
                            status: ActivityStatus_1.default.Success,
                            progress: 1,
                            actions: []
                        };
                        return [4 /*yield*/, this._activityManager.add(parentActivity)];
                    case 1:
                        parentRef = _a.sent();
                        childActivity.parent = parentRef;
                        return [4 /*yield*/, this._activityManager.add(childActivity)];
                    case 2:
                        childRef = _a.sent();
                        return [4 /*yield*/, this._activityManager.get(parentRef)];
                    case 3:
                        returnedParent = _a.sent();
                        Assert_1.default(this._equal(parentActivity, returnedParent), "Parent activity should be the same from activity manager.");
                        return [4 /*yield*/, this._activityManager.getChildren(parentRef)];
                    case 4:
                        returnedChildren = _a.sent();
                        returnedChild = returnedChildren[0].activity;
                        Assert_1.default(this._equal(returnedChild, childActivity), "Child activity should be the same from activity manager.");
                        return [4 /*yield*/, this._activityManager.delete(childRef)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this._activityManager.delete(parentRef)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._tenThousandAddAndDeleteTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var messagePrefix, count, parentActivity, childActivity, parentRef, previous, updateParent, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messagePrefix = "(Remote) Ten Thousand Item Test - Current Count: ";
                        count = 0;
                        parentActivity = {
                            parent: null,
                            title: "",
                            message: messagePrefix + count,
                            sortOrder: 1,
                            status: ActivityStatus_1.default.InProgress,
                            progress: 1,
                            actions: []
                        };
                        childActivity = {
                            parent: null,
                            title: "Test Child",
                            message: "Test Child",
                            sortOrder: 1,
                            status: ActivityStatus_1.default.Success,
                            progress: 1,
                            actions: []
                        };
                        return [4 /*yield*/, this._activityManager.add(parentActivity)];
                    case 1:
                        parentRef = _a.sent();
                        childActivity.parent = parentRef;
                        previous = Date.now();
                        updateParent = function (count) {
                            if ((count % 1000) === 0) {
                                var delta = Date.now() - previous;
                                previous = Date.now();
                                parentActivity.message = messagePrefix + count + " - " + delta / 1000 + "ms/(add + delete)";
                                _this._activityManager.update(parentRef, parentActivity);
                            }
                        };
                        return [4 /*yield*/, Q.Promise(function (resolve, reject, notify) {
                                var count = 0;
                                var singleTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var activityRef;
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this._activityManager.add(childActivity)];
                                            case 1:
                                                activityRef = _a.sent();
                                                return [4 /*yield*/, this._activityManager.delete(activityRef)];
                                            case 2:
                                                _a.sent();
                                                if (count++ < 10000) {
                                                    updateParent(count);
                                                    singleTest();
                                                }
                                                else {
                                                    resolve(true);
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                }); };
                                // Run Three Concurently
                                singleTest();
                                singleTest();
                                singleTest();
                            })];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, this._activityManager.delete(parentRef)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        _this._tenThousandAddAndDeleteLocalTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var messagePrefix, count, statusActivity, childActivity, statusActivityRef, previous, updateStatus, sessinFolder, activityManagerLocal, parentActivityRef, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messagePrefix = "(Local) Ten Thousand Item Test - Current Count: ";
                        count = 0;
                        statusActivity = {
                            parent: null,
                            title: "",
                            message: messagePrefix + count,
                            sortOrder: 1,
                            status: ActivityStatus_1.default.InProgress,
                            progress: 1,
                            actions: []
                        };
                        childActivity = {
                            parent: null,
                            title: "Test Child",
                            message: "Test Child",
                            sortOrder: 1,
                            status: ActivityStatus_1.default.Success,
                            progress: 1,
                            actions: []
                        };
                        return [4 /*yield*/, this._activityManager.add(statusActivity)];
                    case 1:
                        statusActivityRef = _a.sent();
                        previous = Date.now();
                        updateStatus = function (count) {
                            if ((count % 1000) === 0) {
                                var delta = Date.now() - previous;
                                previous = Date.now();
                                statusActivity.message = messagePrefix + count + " - " + delta / 1000 + "ms/(add + delete)";
                                _this._activityManager.update(statusActivityRef, statusActivity);
                            }
                        };
                        return [4 /*yield*/, this._host.executeOperation("SessionManager.getCurrentSessionFolder", {})];
                    case 2:
                        sessinFolder = (_a.sent()).path;
                        activityManagerLocal = new ActivityManager_1.default(Path.join(sessinFolder, "activities.db"));
                        return [4 /*yield*/, activityManagerLocal.add(statusActivity)];
                    case 3:
                        parentActivityRef = _a.sent();
                        childActivity.parent = parentActivityRef;
                        return [4 /*yield*/, Q.Promise(function (resolve, reject, notify) {
                                var count = 0;
                                var singleTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var activityRef;
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, activityManagerLocal.add(childActivity)];
                                            case 1:
                                                activityRef = _a.sent();
                                                return [4 /*yield*/, activityManagerLocal.delete(activityRef)];
                                            case 2:
                                                _a.sent();
                                                if (count++ < 10000) {
                                                    updateStatus(count);
                                                    singleTest();
                                                }
                                                else {
                                                    resolve(true);
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                }); };
                                // Run Three Concurently
                                singleTest();
                                singleTest();
                                singleTest();
                            })];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, this._activityManager.delete(statusActivityRef)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        _this._oneThousandAddTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var messagePrefix, count, parentActivity, childActivity, parentRef, previous, updateParent, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messagePrefix = "One Thousand Item Test - Current Count: ";
                        count = 0;
                        parentActivity = {
                            parent: null,
                            title: "",
                            message: messagePrefix + count,
                            sortOrder: 1,
                            status: ActivityStatus_1.default.InProgress,
                            progress: 1,
                            actions: []
                        };
                        childActivity = {
                            parent: null,
                            title: "Test Child",
                            message: "Test Child",
                            sortOrder: 1,
                            status: ActivityStatus_1.default.Success,
                            progress: 1,
                            actions: []
                        };
                        return [4 /*yield*/, this._activityManager.add(parentActivity)];
                    case 1:
                        parentRef = _a.sent();
                        childActivity.parent = parentRef;
                        previous = Date.now();
                        updateParent = function (count) {
                            if ((count % 100) === 0) {
                                var delta = Date.now() - previous;
                                previous = Date.now();
                                parentActivity.message = messagePrefix + count + " - " + delta / 100 + "ms/add";
                                _this._activityManager.update(parentRef, parentActivity);
                            }
                        };
                        return [4 /*yield*/, Q.Promise(function (resolve, reject, notify) {
                                var count = 0;
                                var singleTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this._activityManager.add(childActivity)];
                                            case 1:
                                                _a.sent();
                                                if (count++ < 1000) {
                                                    updateParent(count);
                                                    singleTest();
                                                }
                                                else {
                                                    resolve(true);
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                }); };
                                // Run Three Concurently
                                singleTest();
                                singleTest();
                                singleTest();
                            })];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, this._activityManager.delete(parentRef)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        _this._itemWithActionTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var testActionDeferred, addedAction, addedActivity, activityRef, activityFromManager, action, testActionRan;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testActionDeferred = Q.defer();
                        addedAction = {
                            title: "Complete Test"
                        };
                        addedActivity = {
                            parent: null,
                            title: "Item With Action Title",
                            message: "Item With Action Message",
                            sortOrder: 1,
                            status: ActivityStatus_1.default.Success,
                            progress: 1,
                            actions: [addedAction]
                        };
                        return [4 /*yield*/, this._activityManager.add(addedActivity)];
                    case 1:
                        activityRef = _a.sent();
                        this._activityManager.onExecuteAction(function (actionActivityRef, action) {
                            testActionDeferred.resolve(action.title === addedAction.title && activityRef.id === actionActivityRef.id);
                        });
                        return [4 /*yield*/, this._activityManager.get(activityRef)];
                    case 2:
                        activityFromManager = _a.sent();
                        action = activityFromManager.actions[0];
                        this._activityManager.executeAction(activityRef, action);
                        return [4 /*yield*/, testActionDeferred.promise];
                    case 3:
                        testActionRan = _a.sent();
                        Assert_1.default(testActionRan, "Test action should have run.");
                        return [4 /*yield*/, this._activityManager.delete(activityRef)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._equal = function (activityA, activityB) {
            return JSON.stringify(activityA.actions) === JSON.stringify(activityB.actions)
                && activityA.message === activityB.message
                && JSON.stringify(activityA.parent) === JSON.stringify(activityB.parent)
                && activityA.progress === activityB.progress
                && activityA.sortOrder === activityB.sortOrder
                && activityA.status === activityB.status
                && activityA.title === activityB.title;
        };
        _this.addTest(new Test_1.default("Single Item", _this._singleItemTest, _this, activityManager));
        _this.addTest(new Test_1.default("Update Item", _this._updateItemTest, _this, activityManager));
        _this.addTest(new Test_1.default("Item With Child", _this._itemWithChildTest, _this, activityManager));
        _this.addTest(new Test_1.default("Item With Action", _this._itemWithActionTest, _this, activityManager));
        _this.addTest(new Test_1.default("(Remote) Add and Delete 10,000 Item", _this._tenThousandAddAndDeleteTest, _this, activityManager));
        _this.addTest(new Test_1.default("(Local) Add and Delete 10,000 Item", _this._tenThousandAddAndDeleteLocalTest, _this, activityManager));
        _this.addTest(new Test_1.default("Add 1000 Item", _this._oneThousandAddTest, _this, activityManager));
        return _this;
    }
    return ActivityTests;
}(TestGroup_1.default));
exports.default = ActivityTests;

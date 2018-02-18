"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var ActivityStatus_1 = require("../Activities/ActivityStatus");
var TestGroup = (function () {
    function TestGroup(name, activityManager) {
        var _this = this;
        this._host = global.host;
        this._tests = [];
        this.addTest = function (test) {
            _this._tests.push(test);
        };
        this.getTests = function () {
            return _this._tests;
        };
        this.runAll = function (parentActivityRef) {
            _this._activity = {
                parent: parentActivityRef,
                title: "Running Test Group: ",
                message: _this.name,
                sortOrder: 1,
                status: ActivityStatus_1.default.InProgress,
                progress: 0,
                actions: []
            };
            return _this._activityManager.add(_this._activity)
                .then(function (activityRef) { _this.activityRef = activityRef; })
                .then(function () { return _this._run(); })
                .then(function (result) {
                _this._done(result);
                return result;
            });
        };
        this._run = function () {
            var promises = [];
            _this._tests.forEach(function (test) {
                promises.push(test.run());
            });
            return Q.all(promises).then(function (results) {
                return results.every(function (result) {
                    return result;
                });
            }).catch(function () {
                return false;
            });
        };
        this._done = function (result) {
            _this._activity.status = result ? ActivityStatus_1.default.Success : ActivityStatus_1.default.Error;
            _this._activity.title = result ? "Group Passed: " : "Group Failed: ";
            _this._activityManager.update(_this.activityRef, _this._activity);
            _this.activityRef = null;
        };
        this._activityManager = activityManager;
        this.name = name;
    }
    return TestGroup;
}());
exports.default = TestGroup;

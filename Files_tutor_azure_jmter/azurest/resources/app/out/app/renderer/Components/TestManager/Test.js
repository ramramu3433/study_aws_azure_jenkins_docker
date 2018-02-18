"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityStatus_1 = require("../Activities/ActivityStatus");
var Test = (function () {
    function Test(name, execute, testGroup, activityManager) {
        var _this = this;
        this._host = global.host;
        this._menuItem = null;
        this._errorString = "";
        this.run = function () {
            _this._activity = {
                parent: _this._testGroup.activityRef,
                title: "Running Test: ",
                message: _this.name,
                sortOrder: 1,
                status: ActivityStatus_1.default.InProgress,
                progress: 0,
                actions: []
            };
            return _this._activityManager.add(_this._activity)
                .then(function (activityRef) { _this.activityRef = activityRef; })
                .then(function () { return _this._runTest(); })
                .catch(function (reason) {
                if (reason.message) {
                    _this._errorString += reason.message;
                }
                else {
                    _this._errorString += JSON.stringify(reason);
                }
                return false;
            })
                .then(function (result) {
                _this._done(result);
                return result;
            });
        };
        this._done = function (result) {
            _this._activity.status = result ? ActivityStatus_1.default.Success : ActivityStatus_1.default.Error;
            _this._activity.title = result ? "'" + _this.name + "' Passed." : "'" + _this.name + "' Failed: ";
            _this._activity.message = result ? "" : _this._errorString;
            _this._activityManager.update(_this.activityRef, _this._activity);
            _this.activityRef = null;
        };
        this._runTest = function () {
            return _this._execute();
        };
        this._activityManager = activityManager;
        this._testGroup = testGroup;
        this.name = name;
        this._execute = execute;
        this._menuItem = { label: name, click: this._runTest };
    }
    return Test;
}());
exports.default = Test;

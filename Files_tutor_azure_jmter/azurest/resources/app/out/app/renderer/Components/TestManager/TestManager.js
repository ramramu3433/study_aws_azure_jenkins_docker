"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityStatus_1 = require("../Activities/ActivityStatus");
var ActivityTests_1 = require("../../Tests/ActivityTests");
var ConnectionStringTests_1 = require("../../Tests/ConnectionStringTests");
var ErrorHandlingTests_1 = require("../../Tests/ErrorHandlingTests");
var SharedDataTests_1 = require("../../Tests/SharedDataTests");
var ProcessTests_1 = require("../../Tests/ProcessTests");
var VersionFileTests_1 = require("../../Tests/VersionFileTests");
var JobGroupTests_1 = require("../../Tests/JobGroupTests");
var ExpressionTests_1 = require("../../Tests/ExpressionTests");
var JobQueueTests_1 = require("../../Tests/JobQueueTests");
var RemoteTestManager_1 = require("./ProviderBasedTestManager/Remote/RemoteTestManager");
exports.Remote = RemoteTestManager_1.default;
var SasUriTests_1 = require("../../Tests/SasUriTests");
var SasTokenTests_1 = require("../../Tests/SasTokenTests");
var WindowsSafeFileNameTests_1 = require("../../Tests/WindowsSafeFileNameTests");
var AzureEnvironmentTests_1 = require("../../Tests/AzureEnvironmentTests");
var NodeIPCTests_1 = require("../../Tests/NodeIPCTests");
var Q = require("q");
var TestManager = (function () {
    function TestManager(activityManager) {
        var _this = this;
        this._testGroups = [];
        this.runAll = function () {
            _this._activity = {
                parent: null,
                title: "Running Test Pass ",
                message: "",
                sortOrder: 1,
                status: ActivityStatus_1.default.InProgress,
                progress: 0,
                actions: []
            };
            return _this._activityManager.add(_this._activity)
                .then(function (activityRef) { _this._activityRef = activityRef; })
                .then(function () { return _this._runAllGroup(); })
                .then(function (result) {
                _this._done(result);
                return result;
            });
        };
        this._done = function (result) {
            _this._activity.status = result ? ActivityStatus_1.default.Success : ActivityStatus_1.default.Error;
            _this._activity.title = result ? "Test Pass Successful" : "Test Pass Failure";
            _this._activityManager.update(_this._activityRef, _this._activity);
            _this._activityRef = null;
        };
        this._runAllGroup = function () {
            var promises = [];
            var passed = true;
            _this._testGroups.forEach(function (testGroup) {
                promises.push(testGroup.runAll(_this._activityRef).then(function (result) { passed = (passed && result); }));
            });
            return Q.all(promises).then(function () {
                return passed;
            }).catch(function () {
                return false;
            });
        };
        this._activityManager = activityManager;
        this._testGroups.push(new JobQueueTests_1.default(activityManager), new ActivityTests_1.default(activityManager), new ErrorHandlingTests_1.default(activityManager), new SharedDataTests_1.default(activityManager), new ProcessTests_1.default(activityManager), new VersionFileTests_1.default(activityManager), new JobGroupTests_1.default(activityManager), new ExpressionTests_1.default(activityManager), new SasTokenTests_1.default(activityManager), new SasUriTests_1.default(activityManager), new ConnectionStringTests_1.default(activityManager), new AzureEnvironmentTests_1.default(activityManager), new WindowsSafeFileNameTests_1.default(activityManager), new NodeIPCTests_1.default(activityManager));
        this._testGroups.sort(function (a, b) {
            if (a.name < b.name) {
                return -1;
            }
            return 1;
        });
    }
    TestManager.prototype.getTestGroups = function () {
        return this._testGroups;
    };
    return TestManager;
}());
exports.default = TestManager;

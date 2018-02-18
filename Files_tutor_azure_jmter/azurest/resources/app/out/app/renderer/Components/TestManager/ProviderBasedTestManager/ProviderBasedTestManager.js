"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestManager_1 = require("../TestManager");
var ProviderBasedTestManager = (function () {
    function ProviderBasedTestManager(activityManager) {
        var _this = this;
        this._nextId = 0;
        this._executeMap = {};
        this.getTestGroups = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (!this._testGroups) {
                    this._testGroups = this._convert(this._testManagaer.getTestGroups());
                }
                return [2 /*return*/, this._testGroups];
            });
        }); };
        this.runAll = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._testManagaer.runAll()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this.executeTestGroup = function (testGroup) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._executeMap[testGroup.runId]()];
            });
        }); };
        this.executeTest = function (test) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._executeMap[test.runId]()];
            });
        }); };
        this._convert = function (testGroups) {
            var providerBasedTestGroups = [];
            testGroups.forEach(function (testGroup) {
                var providerBasedTestGroup = {
                    name: testGroup.name,
                    runId: _this._getNextId(),
                    tests: []
                };
                testGroup.getTests().forEach(function (test) {
                    var providerBasedTest = {
                        name: test.name,
                        runId: _this._getNextId()
                    };
                    providerBasedTestGroup.tests.push(providerBasedTest);
                    _this._executeMap[providerBasedTest.runId] = test.run;
                });
                providerBasedTestGroups.push(providerBasedTestGroup);
                _this._executeMap[providerBasedTestGroup.runId] = testGroup.runAll;
            });
            return providerBasedTestGroups;
        };
        this._activityManager = activityManager;
        this._testManagaer = new TestManager_1.default(this._activityManager);
    }
    ProviderBasedTestManager.prototype._getNextId = function () {
        return "TestExecuteID_" + this._nextId++;
    };
    return ProviderBasedTestManager;
}());
exports.default = ProviderBasedTestManager;

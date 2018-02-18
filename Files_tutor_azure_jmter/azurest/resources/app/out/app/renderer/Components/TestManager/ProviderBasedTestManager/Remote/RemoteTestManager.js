"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var RemoteTestManager = (function () {
    function RemoteTestManager() {
        var _this = this;
        this._host = global.host;
        this._convert = function (providerBasedTestGroups) {
            var testGroups = [];
            providerBasedTestGroups.forEach(function (providerBasedTestGroup) {
                var tests = [];
                var testGroup = {
                    name: providerBasedTestGroup.name,
                    runAll: function () { return _this._executeTestGroup(providerBasedTestGroup); },
                    getTests: function () { return tests; }
                };
                providerBasedTestGroup.tests.forEach(function (providerBasedTestRef) {
                    var newTest = {
                        name: providerBasedTestRef.name,
                        run: function () { return _this._executeTest(providerBasedTestRef); }
                    };
                    tests.push(newTest);
                });
                testGroups.push(testGroup);
            });
            return testGroups;
        };
        this.getTestGroups = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var providerBasedTestGroups;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._host.executeOperation("TestManager.getTestGroups", {})];
                    case 1:
                        providerBasedTestGroups = _a.sent();
                        return [2 /*return*/, this._convert(providerBasedTestGroups)];
                }
            });
        }); };
        this.runAll = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._host.executeOperation("TestManager.runAll", null)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this._executeTestGroup = function (providerBasedTestGroup) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._host.executeOperation("TestManager.executeTestGroup", providerBasedTestGroup)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this._executeTest = function (providerBasedTestGroup) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._host.executeOperation("TestManager.executeTest", providerBasedTestGroup)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
    }
    return RemoteTestManager;
}());
exports.default = RemoteTestManager;

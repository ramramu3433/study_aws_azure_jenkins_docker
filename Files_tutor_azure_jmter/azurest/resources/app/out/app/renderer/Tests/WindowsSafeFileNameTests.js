"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var Assert_1 = require("../Components/TestManager/Assert");
var WindowsSafeFileName_1 = require("../Components/WindowsSafeFileName/WindowsSafeFileName");
var WindowsSafeFileNameTests = (function (_super) {
    tslib_1.__extends(WindowsSafeFileNameTests, _super);
    function WindowsSafeFileNameTests(activityManager) {
        var _this = _super.call(this, "Windows Safe Filename Tests", activityManager) || this;
        _this._isEncodedTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var path, isEncoded;
            return tslib_1.__generator(this, function (_a) {
                path = WindowsSafeFileName_1.default.encodePath("/    /:::/");
                isEncoded = WindowsSafeFileName_1.default.isPathEncoded(path);
                Assert_1.default(isEncoded, "Expected path to be encoded.");
                return [2 /*return*/, true];
            });
        }); };
        _this._isNotEncodedTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var path, isEncoded;
            return tslib_1.__generator(this, function (_a) {
                path = WindowsSafeFileName_1.default.encodePath("/a/b/c/");
                isEncoded = WindowsSafeFileName_1.default.isPathEncoded(path);
                Assert_1.default(!isEncoded, "Expected path not to be encoded.");
                return [2 /*return*/, true];
            });
        }); };
        _this._isNotEncodedBackSlashes = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var isEncoded;
            return tslib_1.__generator(this, function (_a) {
                isEncoded = WindowsSafeFileName_1.default.isPathEncoded("/a/b/c/d/e.txt");
                Assert_1.default(!isEncoded, "Expected path not to be encoded.");
                return [2 /*return*/, true];
            });
        }); };
        _this._isNotEncodedForwardedSlashes = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var isEncoded;
            return tslib_1.__generator(this, function (_a) {
                isEncoded = WindowsSafeFileName_1.default.isPathEncoded("\a\b\c\d\e.txt");
                Assert_1.default(!isEncoded, "Expected path not to be encoded.");
                return [2 /*return*/, true];
            });
        }); };
        _this.addTest(new Test_1.default("Is Encoded Test", _this._isEncodedTest, _this, activityManager));
        _this.addTest(new Test_1.default("Is Not Encoded Test", _this._isNotEncodedTest, _this, activityManager));
        _this.addTest(new Test_1.default("Is Not Encoded Back Slashes Test", _this._isNotEncodedBackSlashes, _this, activityManager));
        _this.addTest(new Test_1.default("Is Not Encoded Forward Slashes Test", _this._isNotEncodedForwardedSlashes, _this, activityManager));
        return _this;
    }
    return WindowsSafeFileNameTests;
}(TestGroup_1.default));
exports.default = WindowsSafeFileNameTests;

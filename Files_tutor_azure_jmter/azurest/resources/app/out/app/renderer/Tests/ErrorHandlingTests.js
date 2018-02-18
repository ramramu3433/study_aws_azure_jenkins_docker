"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Assert_1 = require("../Components/TestManager/Assert");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var ErrorHandlingTests = (function (_super) {
    tslib_1.__extends(ErrorHandlingTests, _super);
    function ErrorHandlingTests(activityManager) {
        var _this = _super.call(this, "Error Handling Tests", activityManager) || this;
        _this._childProcPrimitiveException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.ChildProc.throwPrimitive", "Primitive")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._childProcStringException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.ChildProc.throwString", "String")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._childProcObjectException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.ChildProc.throwObject", "Object")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._childProcErrorException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.ChildProc.throwError", "Error")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._childProcSystemErrorException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.ChildProc.throwSystemError", "SystemError")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._inProcPrimitiveException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.InProc.throwPrimitive", "Primitive")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._inProcStringException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.InProc.throwString", "String")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._inProcObjectException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.InProc.throwObject", "Object")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._inProcErrorException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.InProc.throwError", "Error")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._inProcSystemErrorException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Testing.Errors.InProc.throwSystemError", "SystemError")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._routerException = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._runTest("Fake.Operation", "Error")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this._runTest = function (operation, expectedType) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var err_1, actualType;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._host.executeOperation(operation, {})];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        actualType = this.getExceptionType(err_1);
                        Assert_1.default(actualType === expectedType, "Received error of type '" + actualType + "'. Expected '" + expectedType + "'.");
                        return [2 /*return*/, true];
                    case 3:
                        Assert_1.default(false, "Did not catch any exceptions. Expected '" + expectedType + "'");
                        return [2 /*return*/, false];
                }
            });
        }); };
        _this.addTest(new Test_1.default("Child Process Operation Throws Primitive Exception", _this._childProcPrimitiveException, _this, activityManager));
        _this.addTest(new Test_1.default("Child Process Operation Throws String Exception", _this._childProcStringException, _this, activityManager));
        _this.addTest(new Test_1.default("Child Process Operation Throws Object Exception", _this._childProcObjectException, _this, activityManager));
        _this.addTest(new Test_1.default("Child Process Operation Throws Error", _this._childProcErrorException, _this, activityManager));
        _this.addTest(new Test_1.default("Child Process Operation Throws System Error", _this._childProcSystemErrorException, _this, activityManager));
        _this.addTest(new Test_1.default("In-process Operation Throws Primitive Exception", _this._inProcPrimitiveException, _this, activityManager));
        _this.addTest(new Test_1.default("In-process Operation Throws String Exception", _this._inProcStringException, _this, activityManager));
        _this.addTest(new Test_1.default("In-process Operation Throws Object Exception", _this._inProcObjectException, _this, activityManager));
        _this.addTest(new Test_1.default("In-process Operation Throws Error", _this._inProcErrorException, _this, activityManager));
        _this.addTest(new Test_1.default("In-process Operation Throws System Error", _this._inProcSystemErrorException, _this, activityManager));
        _this.addTest(new Test_1.default("Router Throws Exception", _this._routerException, _this, activityManager));
        return _this;
    }
    ErrorHandlingTests.prototype.getExceptionType = function (err) {
        if (err instanceof Error) {
            if (err.code) {
                return "SystemError";
            }
            else {
                return "Error";
            }
        }
        else if (typeof err === "object") {
            return "Object";
        }
        else if (typeof err === "string") {
            return "String";
        }
        else {
            return "Primitive";
        }
    };
    return ErrorHandlingTests;
}(TestGroup_1.default));
exports.default = ErrorHandlingTests;

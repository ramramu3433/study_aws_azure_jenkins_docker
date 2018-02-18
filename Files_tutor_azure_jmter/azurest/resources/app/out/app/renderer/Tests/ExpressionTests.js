"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var Assert_1 = require("../Components/TestManager/Assert");
var ExpressionEvaluator_1 = require("../Components/Expressions/ExpressionEvaluator");
var ExpressionTests = (function (_super) {
    tslib_1.__extends(ExpressionTests, _super);
    function ExpressionTests(activityManager) {
        var _this = _super.call(this, "Expressions Tests", activityManager) || this;
        _this._generalTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expression, values, evalResult, expectedValue;
            return tslib_1.__generator(this, function (_a) {
                expression = {
                    expression: "\"This is an \" + variable + \".\"",
                    args: ["variable"]
                };
                values = {
                    variable: "expression"
                };
                evalResult = ExpressionEvaluator_1.default.evaluate(expression, values);
                expectedValue = "This is an expression.";
                Assert_1.default(evalResult === expectedValue, "Evaluated expression is wrong. Expected: " + expectedValue + ", Actual: " + evalResult);
                return [2 /*return*/, true];
            });
        }); };
        _this._extraValues = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expression, values, evalResult, expectedValue;
            return tslib_1.__generator(this, function (_a) {
                expression = {
                    expression: "\"This is an \" + variable + \".\"",
                    args: ["variable"]
                };
                values = {
                    variable: "expression",
                    extraVariable: "extra"
                };
                evalResult = ExpressionEvaluator_1.default.evaluate(expression, values);
                expectedValue = "This is an expression.";
                Assert_1.default(evalResult === expectedValue, "Evaluated expression is wrong. Expected: " + expectedValue + ", Actual: " + evalResult);
                return [2 /*return*/, true];
            });
        }); };
        _this._complexTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expression, values, evalResult, expectedValue;
            return tslib_1.__generator(this, function (_a) {
                expression = {
                    expression: "\"This is an \" + variable + \". It is pretty \" + coolVariable + \".\"",
                    args: ["variable", "coolVariable"]
                };
                values = {
                    variable: "expression",
                    coolVariable: "cool"
                };
                evalResult = ExpressionEvaluator_1.default.evaluate(expression, values);
                expectedValue = "This is an expression. It is pretty cool.";
                Assert_1.default(evalResult === expectedValue, "Evaluated expression is wrong. Expected: " + expectedValue + ", Actual: " + evalResult);
                return [2 /*return*/, true];
            });
        }); };
        _this._missingOne = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expression, values, evalResult, expectedValue;
            return tslib_1.__generator(this, function (_a) {
                expression = {
                    expression: "\"This is an \" + variable + \".\"",
                    args: ["variable"]
                };
                values = {};
                evalResult = ExpressionEvaluator_1.default.evaluate(expression, values);
                expectedValue = "This is an undefined.";
                Assert_1.default(evalResult === expectedValue, "Evaluated expression is wrong. Expected: " + expectedValue + ", Actual: " + evalResult);
                return [2 /*return*/, true];
            });
        }); };
        _this._missingMany = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expression, values, evalResult, expectedValue;
            return tslib_1.__generator(this, function (_a) {
                expression = {
                    expression: "\"This is an \" + variable + \". It is pretty \" + coolVariable + \".\"",
                    args: ["variable", "coolVariable"]
                };
                values = {};
                evalResult = ExpressionEvaluator_1.default.evaluate(expression, values);
                expectedValue = "This is an undefined. It is pretty undefined.";
                Assert_1.default(evalResult === expectedValue, "Evaluated expression is wrong. Expected: " + expectedValue + ", Actual: " + evalResult);
                return [2 /*return*/, true];
            });
        }); };
        _this._templateTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expression, values, evalResult, expectedValue;
            return tslib_1.__generator(this, function (_a) {
                expression = {
                    expression: "`This is an ${variable}.`",
                    args: ["variable"]
                };
                values = {
                    variable: "expression"
                };
                evalResult = ExpressionEvaluator_1.default.evaluate(expression, values);
                expectedValue = "This is an expression.";
                Assert_1.default(evalResult === expectedValue, "Evaluated expression is wrong. Expected: " + expectedValue + ", Actual: " + evalResult);
                return [2 /*return*/, true];
            });
        }); };
        _this.addTest(new Test_1.default("Simple Test", _this._generalTest, _this, activityManager));
        _this.addTest(new Test_1.default("Extra Values", _this._extraValues, _this, activityManager));
        _this.addTest(new Test_1.default("Expression With Many Values", _this._complexTest, _this, activityManager));
        _this.addTest(new Test_1.default("Missing One Value", _this._missingOne, _this, activityManager));
        _this.addTest(new Test_1.default("Missing Many Values", _this._missingMany, _this, activityManager));
        _this.addTest(new Test_1.default("String Template", _this._templateTest, _this, activityManager));
        return _this;
    }
    return ExpressionTests;
}(TestGroup_1.default));
exports.default = ExpressionTests;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ExpressionEvaluator = (function () {
    function ExpressionEvaluator() {
    }
    ExpressionEvaluator.evaluate = function (expression, values) {
        var names = expression.args.slice();
        names.push("return " + expression.expression + ";");
        var func = Function.apply(null, names);
        var args = new Array(expression.args.length);
        expression.args.forEach(function (value, index) {
            args[index] = values[value];
        });
        return func.apply(null, args);
    };
    return ExpressionEvaluator;
}());
exports.default = ExpressionEvaluator;

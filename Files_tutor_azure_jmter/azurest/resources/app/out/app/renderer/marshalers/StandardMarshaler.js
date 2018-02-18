"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ExceptionSerialization_1 = require("../Components/Errors/ExceptionSerialization");
var q = require("q");
var StandardMarshaler = (function () {
    function StandardMarshaler() {
    }
    StandardMarshaler.getStandardMarshaler = function (marshaler) {
        var standardMarshaler = {};
        var operations = Object.getOwnPropertyNames(marshaler);
        operations.forEach(function (operation) {
            standardMarshaler[operation] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    var result = marshaler[operation].apply(marshaler, args);
                    if (q.isPromiseAlike(result)) {
                        return result
                            .then(function (result) {
                            return StandardMarshaler.serializeResult(result);
                        })
                            .catch(function (err) {
                            return StandardMarshaler.serializeError(err);
                        });
                    }
                    else {
                        return q.resolve(StandardMarshaler.serializeResult(result));
                    }
                }
                catch (error) {
                    return q.resolve(StandardMarshaler.serializeError(error));
                }
            };
        });
        return standardMarshaler;
    };
    StandardMarshaler.serializeResult = function (result) {
        return JSON.stringify({ type: "result", result: result });
    };
    StandardMarshaler.serializeError = function (error) {
        return JSON.stringify({ type: "error", error: ExceptionSerialization_1.default.serialize(error) });
    };
    return StandardMarshaler;
}());
exports.default = StandardMarshaler;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Provides utilities for managing `IException` objects.
 */
var ExceptionSerialization = (function () {
    function ExceptionSerialization() {
    }
    /**
     * Serializes an exception to an `IException` object.
     */
    ExceptionSerialization.serialize = function (error) {
        var result;
        if (error === undefined) {
            result = { name: undefined, message: undefined };
        }
        else if (error === null) {
            result = { name: undefined, message: null };
        }
        else if (ExceptionSerialization.isErrorLike(error)) {
            // `JSON.stringify` escapes any escape sequences in strings,
            // including newline characters. So we should not stringify
            // `message` to avoid mangling intended format.
            result = { name: error.name, message: error.message };
            Object.getOwnPropertyNames(error).forEach(function (property) {
                result[property] = error[property];
            });
        }
        else {
            result = { name: error.name, message: JSON.stringify(error) };
        }
        return JSON.stringify(result, null, 2);
    };
    /**
     * Deserializes an `IException` object into it's original exception form.
     */
    ExceptionSerialization.deserialize = function (error) {
        var exception;
        try {
            exception = JSON.parse(error);
        }
        catch (e) {
            throw new TypeError("Unable to deserialize exception object: " + error);
        }
        if (exception.name) {
            var result_1 = new Error(exception.message);
            result_1.name = exception.name;
            Object.getOwnPropertyNames(exception).forEach(function (property) {
                result_1[property] = exception[property];
            });
            return result_1;
        }
        else if (exception.message === undefined) {
            // An undefined exception is a special case.
            // `JSON.parse` doesn't parse `undefined`.
            return undefined;
        }
        else {
            return JSON.parse(exception.message);
        }
    };
    /**
     * Converts an exception into a human-readable string.
     */
    ExceptionSerialization.summarize = function (error, includeName) {
        if (includeName === void 0) { includeName = true; }
        if (!this.isErrorLike(error)) {
            error = ExceptionSerialization.serialize(error);
        }
        var name = includeName ?
            (error.name === undefined ? "Error" : error.name) + ":" :
            "";
        return "" + name + (error.message || "unknown");
    };
    /**
     * Determines whether the specified error is similar to a Node `Error`
     * object.
     *
     * An object is considered error-like if it defines a `name` and `message`
     * property.
     *
     * We sometimes use Error-like objects, such as `DisplayableError` that
     * aren't actually instances of Node's `Error` class. However, we still
     * expect them  be treated as `Error` instances.
     */
    ExceptionSerialization.isErrorLike = function (error) {
        return !!error && error.name !== undefined && error.message !== undefined;
    };
    return ExceptionSerialization;
}());
exports.default = ExceptionSerialization;

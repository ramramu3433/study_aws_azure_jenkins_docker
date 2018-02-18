"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ValidationResult = (function () {
    function ValidationResult() {
        this._errors = [];
    }
    Object.defineProperty(ValidationResult.prototype, "isValid", {
        get: function () { return this._errors.length === 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValidationResult.prototype, "errors", {
        get: function () { return this._errors; },
        enumerable: true,
        configurable: true
    });
    ValidationResult.prototype.join = function (other) {
        this._errors = this._errors.concat(other.errors);
    };
    return ValidationResult;
}());
exports.default = ValidationResult;

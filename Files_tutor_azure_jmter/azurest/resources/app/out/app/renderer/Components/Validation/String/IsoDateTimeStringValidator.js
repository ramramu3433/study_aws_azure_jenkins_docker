"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ValidationResult_1 = require("../ValidationResult");
var ValidatorBase_1 = require("../ValidatorBase");
// Year format
var year = /\d{4}/;
// Month format
var month = /[01]\d/;
var yearMonth = new RegExp("(" + year.source + ")-(" + month.source + ")");
// Day format
var day = /[0-3]\d/;
var date = new RegExp(yearMonth.source + "-(" + day.source + ")");
// Hour-minute format
var minuteOrSecond = /[0-5]\d/;
var hourMinute = new RegExp("([0-2]d):(" + minuteOrSecond.source + ")/");
var timeZone = new RegExp("[+-]" + hourMinute.source + "|Z/");
var dateHourMinute = new RegExp("(" + date.source + ")T" + hourMinute + "(" + timeZone.source + ")");
// Hour-minute-second format
var hourMinuteSecond = new RegExp("(" + hourMinute.source + "):(" + minuteOrSecond.source + ")/");
var dateHourMinuteSecond = new RegExp("(" + date.source + ")T(" + hourMinuteSecond.source + ")(" + timeZone.source + ")");
// Full precision format
var time = new RegExp(hourMinuteSecond + "\\.d+");
var full = new RegExp("(" + date.source + ")T(" + time.source + ")(" + timeZone.source + ")");
var iso = new RegExp("^" + year.source + "|" + yearMonth.source + "|" + date.source + "|" + dateHourMinute.source + "|" + dateHourMinuteSecond.source + "|" + full.source + "$");
/**
 * A validator for ISO date time formatted strings.
 */
var IsoDateTimeStringValidator = (function (_super) {
    tslib_1.__extends(IsoDateTimeStringValidator, _super);
    function IsoDateTimeStringValidator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IsoDateTimeStringValidator.prototype.validate = function (value) {
        var result = new ValidationResult_1.default();
        result.join(this._rule_validIso(value));
        return result;
    };
    IsoDateTimeStringValidator.prototype._rule_validIso = function (obj) {
        var result = new ValidationResult_1.default();
        if (!iso.test(obj)) {
            result.errors.push({ code: "IsoStringInvalid", message: "The string '" + obj + "' is not in a valid ISO format." });
        }
        return result;
    };
    return IsoDateTimeStringValidator;
}(ValidatorBase_1.default));
var instance = new IsoDateTimeStringValidator();
exports.default = instance;

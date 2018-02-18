"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var EdmType_1 = require("./EdmType");
var EdmTypeDisplayName_1 = require("./EdmTypeDisplayName");
var InputType_1 = require("./InputType");
var TableEntitySystemKey_1 = require("./TableEntitySystemKey");
var edmTypePrefix = "Edm.";
var yearMonthDay = "\\d{4}[- ][01]\\d[- ][0-3]\\d";
var timeOfDay = "T[0-2]\\d:[0-5]\\d(:[0-5]\\d(\\.\\d+)?)?";
var timeZone = "Z|[+-][0-2]\\d:[0-5]\\d";
exports.Int32 = {
    Min: -2147483648,
    Max: 2147483647
};
exports.Int64 = {
    Min: -9223372036854775808,
    Max: 9223372036854775807
};
exports.ValidationRegExp = {
    Guid: /^[{(]?[0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12}[)}]?$/i,
    Float: /^[+-]?\d+(\.\d+)?(e[+-]?\d+)?$/i,
    // OData seems to require an "L" suffix for Int64 values, yet Azure Storage errors out with it. See http://www.odata.org/documentation/odata-version-2-0/overview/
    Integer: /^[+-]?\d+$/i,
    Boolean: /^"?(true|false)"?$/i,
    DateTime: new RegExp("^" + yearMonthDay + timeOfDay + timeZone + "$"),
    PrimaryKey: /^[^/\\#?\u0000-\u001F\u007F-\u009F]*$/
};
/**
 * Converts an `EdmTypeDisplayName` to it's `EdmType`
 */
function getEdmTypeFromDisplayName(displayedName) {
    var edmType = EdmType_1.default.String;
    if (displayedName) {
        edmType = edmTypePrefix + displayedName;
    }
    return edmType;
}
exports.getEdmTypeFromDisplayName = getEdmTypeFromDisplayName;
/**
 * Converts an `EdmType` to it's display name.
 */
function getDisplayNameFromEdmType(edmType) {
    var displayedName = "";
    if (edmType) {
        displayedName = edmType.slice(edmTypePrefix.length);
    }
    return displayedName;
}
exports.getDisplayNameFromEdmType = getDisplayNameFromEdmType;
function getInputTypeFromDisplayedName(displayedName) {
    switch (displayedName) {
        case EdmTypeDisplayName_1.default.DateTime:
            return InputType_1.default.DateTime;
        case EdmTypeDisplayName_1.default.Int32:
        case EdmTypeDisplayName_1.default.Int64:
            return InputType_1.default.Number;
        default:
            return InputType_1.default.Text;
    }
}
exports.getInputTypeFromDisplayedName = getInputTypeFromDisplayedName;
/**
 * Gets the timestamp embedded in an entity's etag.
 */
function getTimestampFromMetadata(metadata) {
    var timestamp = null;
    var etag = metadata[TableEntitySystemKey_1.default.Etag];
    if (etag) {
        var datetime = etag.split("'")[1];
        if (datetime) {
            var decodedDatetime = decodeURIComponent(datetime);
            if (decodedDatetime) {
                var dateISOString = new Date(decodedDatetime).toISOString();
                timestamp = {
                    $: EdmType_1.default.DateTime,
                    _: dateISOString
                };
            }
        }
    }
    return timestamp;
}
exports.getTimestampFromMetadata = getTimestampFromMetadata;
function getLocalDateTime(dateTime) {
    var dateTimeObject = new Date(dateTime);
    var year = dateTimeObject.getFullYear();
    var month = this.ensureDoubleDigits(dateTimeObject.getMonth() + 1); // Month ranges from 0 to 11
    var day = this.ensureDoubleDigits(dateTimeObject.getDate());
    var hours = this.ensureDoubleDigits(dateTimeObject.getHours());
    var minutes = this.ensureDoubleDigits(dateTimeObject.getMinutes());
    var seconds = this.ensureDoubleDigits(dateTimeObject.getSeconds());
    var milliseconds = this.ensureTripleDigits(dateTimeObject.getMilliseconds());
    var localDateTime = year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    return localDateTime;
}
exports.getLocalDateTime = getLocalDateTime;
function getUTCDateTime(dateTime) {
    var dateTimeObject = new Date(dateTime);
    var year = dateTimeObject.getUTCFullYear();
    var month = dateTimeObject.getUTCMonth();
    var day = dateTimeObject.getUTCDate();
    var hours = dateTimeObject.getUTCHours();
    var minutes = dateTimeObject.getUTCMinutes();
    var seconds = dateTimeObject.getUTCSeconds();
    var milliseconds = dateTimeObject.getUTCMilliseconds();
    var utcDateTime = new Date(year, month, day, hours, minutes, seconds, milliseconds).toISOString();
    return utcDateTime;
}
exports.getUTCDateTime = getUTCDateTime;
function ensureDoubleDigits(num) {
    var doubleDigitsString = num.toString();
    if (num < 10) {
        doubleDigitsString = "0" + doubleDigitsString;
    }
    return doubleDigitsString;
}
exports.ensureDoubleDigits = ensureDoubleDigits;
function ensureTripleDigits(num) {
    var tripleDigitsString = num.toString();
    if (num < 10) {
        tripleDigitsString = "00" + tripleDigitsString;
    }
    else if (num < 100) {
        tripleDigitsString = "0" + tripleDigitsString;
    }
    return tripleDigitsString;
}
exports.ensureTripleDigits = ensureTripleDigits;

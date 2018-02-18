/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "../../Common/Debug", "underscore.string", "Common/Errors"], function (require, exports, Debug, _string, Errors) {
    "use strict";
    var TimeUnit;
    (function (TimeUnit) {
        TimeUnit[TimeUnit["Seconds"] = 0] = "Seconds";
        TimeUnit[TimeUnit["Minutes"] = 1] = "Minutes";
        TimeUnit[TimeUnit["Hours"] = 2] = "Hours";
        TimeUnit[TimeUnit["Days"] = 3] = "Days";
    })(TimeUnit || (TimeUnit = {}));
    ;
    var Timestamps = (function () {
        function Timestamps() {
        }
        Timestamps.getLocalDateTime = function (dateTime) {
            var dateTimeObject = new Date(dateTime);
            var year = dateTimeObject.getFullYear();
            var month = Timestamps.ensureDoubleDigits(dateTimeObject.getMonth() + 1); // Month ranges from 0 to 11
            var day = Timestamps.ensureDoubleDigits(dateTimeObject.getDate());
            var hours = Timestamps.ensureDoubleDigits(dateTimeObject.getHours());
            var minutes = Timestamps.ensureDoubleDigits(dateTimeObject.getMinutes());
            var seconds = Timestamps.ensureDoubleDigits(dateTimeObject.getSeconds());
            var milliseconds = Timestamps.ensureTripleDigits(dateTimeObject.getMilliseconds());
            var localDateTime = year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
            return localDateTime;
        };
        Timestamps.trimDateStringSuffix = function (dateString) {
            var trimmedString = dateString, firstColonDelimiterIndex = trimmedString.indexOf(Timestamps._colon), lastColonDelimiterIndex = trimmedString.lastIndexOf(Timestamps._colon);
            // Trims second and millisecond suffix e.g. ':09.123Z' of '2015-11-03T16:14:09.123Z'
            // Also ensuring that a date string already trimmed e.g. '2015-11-03T16:14' is not trimmed again.
            if ((firstColonDelimiterIndex < lastColonDelimiterIndex) && (0 < lastColonDelimiterIndex)) {
                trimmedString = trimmedString.substring(0, lastColonDelimiterIndex);
            }
            return trimmedString;
        };
        Timestamps.parseDate = function (dateString, isUTC) {
            // TODO validate dateString
            var date = null;
            if (dateString) {
                if (isUTC && dateString.charAt(dateString.length - 1) !== "Z") {
                    // add the Z so Date.parse works correctly
                    dateString += "Z";
                }
                try {
                    var millisecondTime = Date.parse(dateString);
                    date = new Date(millisecondTime);
                }
                catch (error) {
                    Debug.error("Error parsing date string: ", dateString, error);
                }
            }
            ;
            return date;
        };
        Timestamps.localFromUtcDateString = function (utcDateString) {
            // TODO validate utcDateString
            var utcDate = Timestamps.parseDate(utcDateString, true), localDateString = null;
            if (utcDate) {
                localDateString = Timestamps._toLocalDateString(utcDate);
            }
            return localDateString;
        };
        Timestamps.tryChangeTimestampTimeZone = function (koTimestamp, toUTC) {
            if (koTimestamp) {
                var currentDateString = koTimestamp(), newDateString;
                if (currentDateString) {
                    if (toUTC) {
                        newDateString = Timestamps.utcFromLocalDateString(currentDateString);
                    }
                    else {
                        newDateString = Timestamps.localFromUtcDateString(currentDateString);
                    }
                    // utcFromLocalDateString and localFromUtcDateString could return null if currentDateString is invalid.
                    // Hence, only set koTimestamp if newDateString is not null.
                    if (newDateString) {
                        koTimestamp(newDateString);
                    }
                }
            }
        };
        Timestamps.queryLastDaysHours = function (days, hours) {
            /* tslint:disable: no-unused-variable */
            var now = Date.now();
            var wantedTime = Timestamps._daysHoursBeforeNow(days, hours);
            var wantedTimeString = wantedTime.toISOString();
            return "datetime'" + wantedTimeString + "'";
            /* tslint:enable: no-unused-variable */
        };
        Timestamps.queryCurrentMonthLocal = function () {
            var now = new Date();
            var start = Timestamps._getLocalIsoDateStringFromParts(now.getFullYear(), now.getMonth(), 1);
            start = Timestamps.getUTCDateTime(start);
            return "datetime'" + start + "'";
        };
        Timestamps.queryCurrentYearLocal = function () {
            var now = new Date();
            var start = Timestamps._getLocalIsoDateStringFromParts(now.getFullYear(), 0, 1); // Month is 0..11, date is 1..31
            start = Timestamps.getUTCDateTime(start);
            return "datetime'" + start + "'";
        };
        Timestamps.queryLastTime = function (lastNumber, timeUnit) {
            /* tslint:disable: no-unused-variable */
            var daysHoursAgo = Timestamps._getLocalIsoDateTimeString(Timestamps._timeBeforeNow(lastNumber, timeUnit));
            daysHoursAgo = Timestamps.getUTCDateTime(daysHoursAgo);
            return "datetime'" + daysHoursAgo + "'";
            /* tslint:enable: no-unused-variable */
        };
        Timestamps.getUTCDateTime = function (dateTime) {
            var utcDateTime = new Date(dateTime).toISOString();
            return utcDateTime;
        };
        Timestamps.ensureDoubleDigits = function (num) {
            var doubleDigitsString = num.toString();
            if (num < 10) {
                doubleDigitsString = "0" + doubleDigitsString;
            }
            return doubleDigitsString;
        };
        Timestamps.ensureTripleDigits = function (num) {
            var tripleDigitsString = num.toString();
            if (num < 10) {
                tripleDigitsString = "00" + tripleDigitsString;
            }
            else if (num < 100) {
                tripleDigitsString = "0" + tripleDigitsString;
            }
            return tripleDigitsString;
        };
        Timestamps.utcFromLocalDateString = function (localDateString) {
            // TODO validate localDateString
            var localDate = Timestamps.parseDate(localDateString, false), utcDateString = null;
            if (localDate) {
                utcDateString = Timestamps.trimDateStringSuffix(localDate.toISOString());
            }
            return utcDateString;
        };
        Timestamps._getLocalIsoDateTimeString = function (time) {
            // yyyy-mm-ddThh:mm:ss.sss
            // Not using the timezone offset (or 'Z'), which will make the
            // date/time represent local time by default.
            var formatted = _string.sprintf("%sT%02d:%02d:%02d.%03d", Timestamps._getLocalIsoDateString(time), time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
            return formatted;
        };
        Timestamps._getLocalIsoDateString = function (date) {
            return Timestamps._getLocalIsoDateStringFromParts(date.getFullYear(), date.getMonth(), date.getDate());
        };
        Timestamps._getLocalIsoDateStringFromParts = function (fullYear, month /* 0..11 */, date /* 1..31 */) {
            return _string.sprintf("%04d-%02d-%02d", fullYear, month + 1, // JS month is 0..11
            date); // but date is 1..31
        };
        Timestamps._addDaysHours = function (time, days, hours) {
            var msPerHour = 1000 * 60 * 60;
            var daysMs = days * msPerHour * 24;
            var hoursMs = hours * msPerHour;
            var newTimeMs = time.getTime() + daysMs + hoursMs;
            return new Date(newTimeMs);
        };
        Timestamps._daysHoursBeforeNow = function (days, hours) {
            return Timestamps._addDaysHours(new Date(), -days, -hours);
        };
        Timestamps._addTime = function (time, lastNumber, timeUnit) {
            var timeMS;
            switch (TimeUnit[timeUnit]) {
                case TimeUnit.Days:
                    timeMS = lastNumber * 1000 * 60 * 60 * 24;
                    break;
                case TimeUnit.Hours:
                    timeMS = lastNumber * 1000 * 60 * 60;
                    break;
                case TimeUnit.Minutes:
                    timeMS = lastNumber * 1000 * 60;
                    break;
                case TimeUnit.Seconds:
                    timeMS = lastNumber * 1000;
                    break;
                default:
                    throw new Errors.ArgumentOutOfRangeError(timeUnit);
            }
            var newTimeMS = time.getTime() + timeMS;
            return new Date(newTimeMS);
        };
        Timestamps._timeBeforeNow = function (lastNumber, timeUnit) {
            return Timestamps._addTime(new Date(), -lastNumber, timeUnit);
        };
        Timestamps._padIfNeeded = function (value) {
            var padded = String(value);
            if ((0 <= value) && (value < 10)) {
                padded = "0" + padded;
            }
            return padded;
        };
        Timestamps._toLocalDateString = function (date) {
            var localDateString = null;
            if (date) {
                localDateString = date.getFullYear() +
                    "-" + Timestamps._padIfNeeded(date.getMonth() + 1) +
                    "-" + Timestamps._padIfNeeded(date.getDate()) +
                    "T" + Timestamps._padIfNeeded(date.getHours()) +
                    ":" + Timestamps._padIfNeeded(date.getMinutes()) +
                    ":" + Timestamps._padIfNeeded(date.getSeconds());
            }
            return localDateString;
        };
        return Timestamps;
    }());
    Timestamps.utc = "utc";
    Timestamps.local = "local";
    Timestamps._colon = ":";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Timestamps;
});

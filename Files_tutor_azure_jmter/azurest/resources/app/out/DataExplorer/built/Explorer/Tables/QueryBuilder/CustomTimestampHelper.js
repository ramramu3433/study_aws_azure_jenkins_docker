//import * as _string from "underscore.string";
define(["require", "exports", "./DateTimeUtilities"], function (require, exports, DateTimeUtilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Constants
     */
    exports.utc = "utc";
    exports.local = "local";
    var TimeUnit;
    (function (TimeUnit) {
        TimeUnit[TimeUnit["Seconds"] = 0] = "Seconds";
        TimeUnit[TimeUnit["Minutes"] = 1] = "Minutes";
        TimeUnit[TimeUnit["Hours"] = 2] = "Hours";
        TimeUnit[TimeUnit["Days"] = 3] = "Days";
    })(TimeUnit = exports.TimeUnit || (exports.TimeUnit = {}));
    ;
    /**
     * Setting helpers
     */
    function addRangeTimestamp(timestamp, queryBuilderViewModel, queryClauseViewModel) {
        queryBuilderViewModel.addCustomRange(timestamp, queryClauseViewModel);
    }
    exports.addRangeTimestamp = addRangeTimestamp;
    function getDefaultStart(localTime, durationHours) {
        if (durationHours === void 0) { durationHours = 24; }
        var startTimestamp;
        var utcNowString = new Date().toISOString();
        var yesterday = new Date(utcNowString);
        yesterday.setHours(yesterday.getHours() - durationHours);
        startTimestamp = yesterday.toISOString();
        if (localTime) {
            startTimestamp = localFromUtcDateString(startTimestamp);
        }
        return startTimestamp;
    }
    exports.getDefaultStart = getDefaultStart;
    function getDefaultEnd(localTime) {
        var endTimestamp;
        var utcNowString = new Date().toISOString();
        endTimestamp = utcNowString;
        if (localTime) {
            endTimestamp = localFromUtcDateString(endTimestamp);
        }
        return endTimestamp;
    }
    exports.getDefaultEnd = getDefaultEnd;
    function parseDate(dateString, isUTC) {
        // TODO validate dateString
        var date = null;
        if (dateString) {
            try {
                // Date string is assumed to be UTC in Storage Explorer Standalone.
                // Behavior may vary in other browsers.
                // Here's an example of how the string looks like "2015-10-24T21:44:12"
                var millisecondTime = Date.parse(dateString), parsed = new Date(millisecondTime);
                if (isUTC) {
                    date = parsed;
                }
                else {
                    // Since we parsed in UTC, accessors are flipped - we get local time from the getUTC* group
                    // Reinstating, the date is parsed above as UTC, and here we are creating a new date object
                    // in local time.
                    var year = parsed.getUTCFullYear(), month = parsed.getUTCMonth(), day = parsed.getUTCDate(), hours = parsed.getUTCHours(), minutes = parsed.getUTCMinutes(), seconds = parsed.getUTCSeconds(), milliseconds = parsed.getUTCMilliseconds();
                    date = new Date(year, month, day, hours, minutes, seconds, milliseconds);
                }
            }
            catch (error) {
                //Debug.error("Error parsing date string: ", dateString, error);
            }
        }
        ;
        return date;
    }
    exports.parseDate = parseDate;
    function utcFromLocalDateString(localDateString) {
        // TODO validate localDateString
        var localDate = parseDate(localDateString, false), utcDateString = null;
        if (localDate) {
            utcDateString = localDate.toISOString();
        }
        return utcDateString;
    }
    exports.utcFromLocalDateString = utcFromLocalDateString;
    function padIfNeeded(value) {
        var padded = String(value);
        if ((0 <= value) && (value < 10)) {
            padded = "0" + padded;
        }
        return padded;
    }
    function toLocalDateString(date) {
        var localDateString = null;
        if (date) {
            localDateString = date.getFullYear() +
                "-" + padIfNeeded(date.getMonth() + 1) +
                "-" + padIfNeeded(date.getDate()) +
                "T" + padIfNeeded(date.getHours()) +
                ":" + padIfNeeded(date.getMinutes()) +
                ":" + padIfNeeded(date.getSeconds());
        }
        return localDateString;
    }
    function localFromUtcDateString(utcDateString) {
        // TODO validate utcDateString
        var utcDate = parseDate(utcDateString, true), localDateString = null;
        if (utcDate) {
            localDateString = toLocalDateString(utcDate);
        }
        return localDateString;
    }
    exports.localFromUtcDateString = localFromUtcDateString;
    function tryChangeTimestampTimeZone(koTimestamp, toUTC) {
        if (koTimestamp) {
            var currentDateString = koTimestamp(), newDateString;
            if (currentDateString) {
                if (toUTC) {
                    newDateString = utcFromLocalDateString(currentDateString);
                    // removing last character because cannot format it to html binding with the 'Z' at the end
                    newDateString = newDateString.substring(0, newDateString.length - 1);
                }
                else {
                    newDateString = localFromUtcDateString(currentDateString);
                }
                // utcFromLocalDateString and localFromUtcDateString could return null if currentDateString is invalid.
                // Hence, only set koTimestamp if newDateString is not null.
                if (newDateString) {
                    koTimestamp(newDateString);
                }
            }
        }
    }
    exports.tryChangeTimestampTimeZone = tryChangeTimestampTimeZone;
    /**
     * Input validation helpers
     */
    exports.noTooltip = "", exports.invalidStartTimeTooltip = "Please provide a valid start time.", exports.invalidExpiryTimeRequiredTooltip = "Required field. Please provide a valid expiry time.", exports.invalidExpiryTimeGreaterThanStartTimeTooltip = "The expiry time must be greater than the start time."; // localize
    function isDateString(dateString) {
        var success = false;
        if (dateString) {
            var date = Date.parse(dateString);
            success = $.isNumeric(date);
        }
        return success;
    }
    exports.isDateString = isDateString;
    // Is date string and earlier than expiry time; or is empty
    // export function isInvalidStartTimeInput(startTimestamp: string, expiryTimestamp: string, isUTC: boolean): DialogsCommon.IValidationResult {
    //     var tooltip: string = noTooltip,
    //         isValid: boolean = isDateString(startTimestamp),
    //         startDate: Date,
    //         expiryDate: Date;
    //     if (!isValid) {
    //         isValid = (startTimestamp === "");
    //     }
    //     if (!isValid) {
    //         tooltip = invalidStartTimeTooltip;
    //     }
    //     if (isValid && !!startTimestamp && isDateString(expiryTimestamp)) {
    //         startDate = parseDate(startTimestamp, isUTC);
    //         expiryDate = parseDate(expiryTimestamp, isUTC);
    //         isValid = (startDate < expiryDate);
    //         if (!isValid) {
    //             tooltip = invalidExpiryTimeGreaterThanStartTimeTooltip;
    //         }
    //     }
    //     return { isInvalid: !isValid, help: tooltip };
    // }
    // Is date string, and later than start time (if any)
    // export function isInvalidExpiryTimeInput(startTimestamp: string, expiryTimestamp: string, isUTC: boolean): DialogsCommon.IValidationResult {
    //     var isValid: boolean = isDateString(expiryTimestamp),
    //         tooltip: string = isValid ? noTooltip : invalidExpiryTimeRequiredTooltip,
    //         startDate: Date,
    //         expiryDate: Date;
    //     if (isValid && startTimestamp) {
    //         if (isDateString(startTimestamp)) {
    //             startDate = parseDate(startTimestamp, isUTC);
    //             expiryDate = parseDate(expiryTimestamp, isUTC);
    //             isValid = (startDate < expiryDate);
    //             if (!isValid) {
    //                 tooltip = invalidExpiryTimeGreaterThanStartTimeTooltip;
    //             }
    //         }
    //     }
    //     return { isInvalid: !isValid, help: tooltip };
    // }
    /**
     * Functions to calculate DateTime Strings
     */
    function _getLocalIsoDateTimeString(time) {
        // yyyy-mm-ddThh:mm:ss.sss
        // Not using the timezone offset (or 'Z'), which will make the
        // date/time represent local time by default.
        // var formatted = _string.sprintf(
        //     "%sT%02d:%02d:%02d.%03d",
        //     _getLocalIsoDateString(time),
        //     time.getHours(),
        //     time.getMinutes(),
        //     time.getSeconds(),
        //     time.getMilliseconds()
        // );
        // return formatted;
        return _getLocalIsoDateString(time) + "T" + DateTimeUtilities.ensureDoubleDigits(time.getHours())
            + ":" + DateTimeUtilities.ensureDoubleDigits(time.getMinutes())
            + ":" + DateTimeUtilities.ensureDoubleDigits(time.getSeconds())
            + "." + DateTimeUtilities.ensureTripleDigits(time.getMilliseconds());
    }
    function _getLocalIsoDateString(date) {
        return _getLocalIsoDateStringFromParts(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function _getLocalIsoDateStringFromParts(fullYear, month /* 0..11 */, date /* 1..31 */) {
        month = month + 1;
        return fullYear + "-" + DateTimeUtilities.ensureDoubleDigits(month) + "-" + DateTimeUtilities.ensureDoubleDigits(date);
        // return _string.sprintf(
        //     "%04d-%02d-%02d",
        //     fullYear,
        //     month + 1, // JS month is 0..11
        //     date);     // but date is 1..31
    }
    function _addDaysHours(time, days, hours) {
        var msPerHour = 1000 * 60 * 60;
        var daysMs = days * msPerHour * 24;
        var hoursMs = hours * msPerHour;
        var newTimeMs = time.getTime() + daysMs + hoursMs;
        return new Date(newTimeMs);
    }
    function _daysHoursBeforeNow(days, hours) {
        return _addDaysHours(new Date(), -days, -hours);
    }
    function _queryLastDaysHours(days, hours) {
        /* tslint:disable: no-unused-variable */
        var daysHoursAgo = _getLocalIsoDateTimeString(_daysHoursBeforeNow(days, hours));
        daysHoursAgo = DateTimeUtilities.getUTCDateTime(daysHoursAgo);
        return daysHoursAgo;
        /* tslint:enable: no-unused-variable */
    }
    exports._queryLastDaysHours = _queryLastDaysHours;
    function _queryCurrentMonthLocal() {
        var now = new Date();
        var start = _getLocalIsoDateStringFromParts(now.getFullYear(), now.getMonth(), 1);
        start = DateTimeUtilities.getUTCDateTime(start);
        return start;
    }
    exports._queryCurrentMonthLocal = _queryCurrentMonthLocal;
    function _queryCurrentYearLocal() {
        var now = new Date();
        var start = _getLocalIsoDateStringFromParts(now.getFullYear(), 0, 1); // Month is 0..11, date is 1..31
        start = DateTimeUtilities.getUTCDateTime(start);
        return start;
    }
    exports._queryCurrentYearLocal = _queryCurrentYearLocal;
    function _addTime(time, lastNumber, timeUnit) {
        var timeMS;
        switch (TimeUnit[Number(timeUnit)]) {
            case TimeUnit.Days.toString():
                timeMS = lastNumber * 1000 * 60 * 60 * 24;
                break;
            case TimeUnit.Hours.toString():
                timeMS = lastNumber * 1000 * 60 * 60;
                break;
            case TimeUnit.Minutes.toString():
                timeMS = lastNumber * 1000 * 60;
                break;
            case TimeUnit.Seconds.toString():
                timeMS = lastNumber * 1000;
                break;
            default:
        }
        var newTimeMS = time.getTime() + timeMS;
        return new Date(newTimeMS);
    }
    function _timeBeforeNow(lastNumber, timeUnit) {
        return _addTime(new Date(), -lastNumber, timeUnit);
    }
    function _queryLastTime(lastNumber, timeUnit) {
        /* tslint:disable: no-unused-variable */
        var daysHoursAgo = _getLocalIsoDateTimeString(_timeBeforeNow(lastNumber, timeUnit));
        daysHoursAgo = DateTimeUtilities.getUTCDateTime(daysHoursAgo);
        return daysHoursAgo;
        /* tslint:enable: no-unused-variable */
    }
    exports._queryLastTime = _queryLastTime;
});

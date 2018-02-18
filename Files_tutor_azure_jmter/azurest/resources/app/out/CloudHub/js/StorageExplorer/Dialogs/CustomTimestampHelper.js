/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "../Common/Timestamps"], function (require, exports, Timestamps_1) {
    "use strict";
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
            startTimestamp = Timestamps_1.default.localFromUtcDateString(startTimestamp);
        }
        return startTimestamp;
    }
    exports.getDefaultStart = getDefaultStart;
    function getDefaultEnd(localTime) {
        var endTimestamp;
        var utcNowString = new Date().toISOString();
        endTimestamp = utcNowString;
        if (localTime) {
            endTimestamp = Timestamps_1.default.localFromUtcDateString(endTimestamp);
        }
        return endTimestamp;
    }
    exports.getDefaultEnd = getDefaultEnd;
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
    function isInvalidStartTimeInput(startTimestamp, expiryTimestamp, isUTC) {
        var tooltip = exports.noTooltip, isValid = isDateString(startTimestamp), startDate, expiryDate;
        if (!isValid) {
            isValid = (startTimestamp === "");
        }
        if (!isValid) {
            tooltip = exports.invalidStartTimeTooltip;
        }
        if (isValid && !!startTimestamp && isDateString(expiryTimestamp)) {
            startDate = Timestamps_1.default.parseDate(startTimestamp, isUTC);
            expiryDate = Timestamps_1.default.parseDate(expiryTimestamp, isUTC);
            isValid = (startDate < expiryDate);
            if (!isValid) {
                tooltip = exports.invalidExpiryTimeGreaterThanStartTimeTooltip;
            }
        }
        return { isInvalid: !isValid, help: tooltip };
    }
    exports.isInvalidStartTimeInput = isInvalidStartTimeInput;
    // Is date string, and later than start time (if any)
    function isInvalidExpiryTimeInput(startTimestamp, expiryTimestamp, isUTC) {
        var isValid = isDateString(expiryTimestamp), tooltip = isValid ? exports.noTooltip : exports.invalidExpiryTimeRequiredTooltip, startDate, expiryDate;
        if (isValid && startTimestamp) {
            if (isDateString(startTimestamp)) {
                startDate = Timestamps_1.default.parseDate(startTimestamp, isUTC);
                expiryDate = Timestamps_1.default.parseDate(expiryTimestamp, isUTC);
                isValid = (startDate < expiryDate);
                if (!isValid) {
                    tooltip = exports.invalidExpiryTimeGreaterThanStartTimeTooltip;
                }
            }
        }
        return { isInvalid: !isValid, help: tooltip };
    }
    exports.isInvalidExpiryTimeInput = isInvalidExpiryTimeInput;
});

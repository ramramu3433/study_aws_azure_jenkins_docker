"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var TimestampUtilities_1 = require("../../common/TimestampUtilities");
var $ = require("jquery");
var ko = require("knockout");
var TimeUnit;
(function (TimeUnit) {
    TimeUnit[TimeUnit["Seconds"] = 0] = "Seconds";
    TimeUnit[TimeUnit["Minutes"] = 1] = "Minutes";
    TimeUnit[TimeUnit["Hours"] = 2] = "Hours";
    TimeUnit[TimeUnit["Days"] = 3] = "Days";
})(TimeUnit || (TimeUnit = {}));
;
// Localize
var noTooltip = "";
var invalidStartTimeTooltip = "Please provide a valid start time.";
var invalidExpiryTimeRequiredTooltip = "Required field. Please provide a valid expiry time.";
var invalidExpiryTimeGreaterThanStartTimeTooltip = "The expiry time must be greater than the start time.";
var CustomTimestampQueryDialog = (function (_super) {
    tslib_1.__extends(CustomTimestampQueryDialog, _super);
    function CustomTimestampQueryDialog(parameters) {
        var _this = _super.call(this) || this;
        /* Labels */
        // Localize
        _this.titleLabel = "Custom Timestamp Query";
        _this.lastLabel = "Last:";
        _this.rangeLabel = "Range:";
        _this.fromLabel = "From:";
        _this.toLabel = "To:";
        _this.timezoneLabel = "Time Zone:";
        _this.utcLabel = "UTC";
        _this.localLabel = "Local";
        _this.timeUnits = [
            TimeUnit[TimeUnit.Days],
            TimeUnit[TimeUnit.Hours],
            TimeUnit[TimeUnit.Minutes],
            TimeUnit[TimeUnit.Seconds]
        ];
        // initalize dialog
        _this.queryType = ko.observable("last");
        _this.lastNumber = ko.observable(parameters.lastNumber);
        _this.lastTimeUnit = ko.observable(parameters.lastTimeUnit);
        _this.lastTimeInputTitle = ko.observable("last number of " + parameters.lastTimeUnit);
        _this.lastTimeUnit.subscribe(function (newValue) {
            _this.lastTimeInputTitle("last number of " + newValue);
        });
        _this.startTimestamp = ko.observable(_this.getDefaultStart(true, 24));
        _this.endTimestamp = ko.observable(_this.getDefaultEnd(true));
        _this.timeZone = ko.observable("local");
        _this.timeZone.subscribe(function (value) {
            var toUTC = (value === TimestampUtilities_1.default.utc);
            TimestampUtilities_1.default.tryChangeTimestampTimeZone(_this.startTimestamp, toUTC);
            TimestampUtilities_1.default.tryChangeTimestampTimeZone(_this.endTimestamp, toUTC);
        });
        _this.isCreateEnabled = ko.observable(true);
        _this.addAcceptButton(DialogViewModel_1.default.okCaption, _this.isCreateEnabled);
        _this.addCancelButton();
        // Input validation
        _this.isInvalidStartTimestamp = ko.observable(false);
        _this.startTimestampTooltip = ko.observable(noTooltip);
        _this.startTimestamp.subscribe(function (value) {
            _this.validateTimestampInput(value, _this.endTimestamp(), _this.isUTC());
            _this.updateIsCreateEnabled();
        });
        _this.isInvalidEndTimestamp = ko.observable(false);
        _this.endTimestampTooltip = ko.observable(noTooltip);
        _this.endTimestamp.subscribe(function (value) {
            _this.validateTimestampInput(_this.startTimestamp(), value, _this.isUTC());
            _this.updateIsCreateEnabled();
        });
        return _this;
    }
    CustomTimestampQueryDialog.prototype.updateIsCreateEnabled = function () {
        var disable = (this.isInvalidStartTimestamp() || this.isInvalidEndTimestamp());
        this.isCreateEnabled(!disable);
    };
    /**
     * @override
     */
    CustomTimestampQueryDialog.prototype.getResults = function () {
        return {
            queryType: this.queryType(),
            lastNumber: this.lastNumber(),
            lastTimeUnit: this.lastTimeUnit(),
            startTime: this.startTimestamp(),
            endTime: this.endTimestamp(),
            timeZone: this.timeZone()
        };
    };
    ;
    CustomTimestampQueryDialog.prototype.isUTC = function () {
        return (this.timeZone() === TimestampUtilities_1.default.utc);
    };
    CustomTimestampQueryDialog.prototype.validateTimestampInput = function (startTimestamp, expiryTimestamp, isUTC) {
        // Start timestamp
        var isUTC = this.isUTC();
        var result = this.isInvalidStartTimeInput(startTimestamp, expiryTimestamp, isUTC);
        this.isInvalidStartTimestamp(result.isInvalid);
        this.startTimestampTooltip(result.help);
        // Expiry timestamp
        result = this.isInvalidExpiryTimeInput(startTimestamp, expiryTimestamp, isUTC);
        this.isInvalidEndTimestamp(result.isInvalid);
        this.endTimestampTooltip(result.help);
    };
    CustomTimestampQueryDialog.prototype.getDefaultStart = function (localTime, durationHours) {
        if (durationHours === void 0) { durationHours = 24; }
        var startTimestamp;
        var utcNowString = new Date().toISOString();
        var yesterday = new Date(utcNowString);
        yesterday.setHours(yesterday.getHours() - durationHours);
        startTimestamp = yesterday.toISOString();
        if (localTime) {
            startTimestamp = TimestampUtilities_1.default.localFromUtcDateString(startTimestamp);
        }
        return startTimestamp;
    };
    CustomTimestampQueryDialog.prototype.getDefaultEnd = function (localTime) {
        var endTimestamp;
        var utcNowString = new Date().toISOString();
        endTimestamp = utcNowString;
        if (localTime) {
            endTimestamp = TimestampUtilities_1.default.localFromUtcDateString(endTimestamp);
        }
        return endTimestamp;
    };
    /**
     * Is date string and earlier than expiry time; or is empty
     */
    CustomTimestampQueryDialog.prototype.isInvalidStartTimeInput = function (startTimestamp, expiryTimestamp, isUTC) {
        var tooltip = noTooltip, isValid = this.isDateString(startTimestamp), startDate, expiryDate;
        if (!isValid) {
            isValid = (startTimestamp === "");
        }
        if (!isValid) {
            tooltip = invalidStartTimeTooltip;
        }
        if (isValid && !!startTimestamp && this.isDateString(expiryTimestamp)) {
            startDate = TimestampUtilities_1.default.parseDate(startTimestamp, isUTC);
            expiryDate = TimestampUtilities_1.default.parseDate(expiryTimestamp, isUTC);
            isValid = (startDate < expiryDate);
            if (!isValid) {
                tooltip = invalidExpiryTimeGreaterThanStartTimeTooltip;
            }
        }
        return { isInvalid: !isValid, help: tooltip };
    };
    /**
     * Is date string, and later than start time (if any)
     */
    CustomTimestampQueryDialog.prototype.isInvalidExpiryTimeInput = function (startTimestamp, expiryTimestamp, isUTC) {
        var isValid = this.isDateString(expiryTimestamp);
        var tooltip = isValid ? noTooltip : invalidExpiryTimeRequiredTooltip;
        var startDate;
        var expiryDate;
        if (isValid && startTimestamp) {
            if (this.isDateString(startTimestamp)) {
                startDate = TimestampUtilities_1.default.parseDate(startTimestamp, isUTC);
                expiryDate = TimestampUtilities_1.default.parseDate(expiryTimestamp, isUTC);
                isValid = (startDate < expiryDate);
                if (!isValid) {
                    tooltip = invalidExpiryTimeGreaterThanStartTimeTooltip;
                }
            }
        }
        return { isInvalid: !isValid, help: tooltip };
    };
    CustomTimestampQueryDialog.prototype.isDateString = function (dateString) {
        var success = false;
        if (dateString) {
            var date = Date.parse(dateString);
            success = $.isNumeric(date);
        }
        return success;
    };
    return CustomTimestampQueryDialog;
}(DialogViewModel_1.default));
exports.default = CustomTimestampQueryDialog;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var Errors = require("../../common/Errors");
var ko = require("knockout");
var TimeUnit;
(function (TimeUnit) {
    TimeUnit[TimeUnit["Seconds"] = 0] = "Seconds";
    TimeUnit[TimeUnit["Minutes"] = 1] = "Minutes";
    TimeUnit[TimeUnit["Hours"] = 2] = "Hours";
    TimeUnit[TimeUnit["Days"] = 3] = "Days";
})(TimeUnit || (TimeUnit = {}));
;
var maxTimeToLive = {
    inDays: 7,
    inHours: 7 * 24,
    inMinutes: 7 * 24 * 60,
    inSeconds: 7 * 24 * 60 * 60
};
var timeConversion = {
    secondsPerDay: 24 * 60 * 60,
    secondsPerHour: 60 * 60,
    secondsPerMinute: 60
};
/**
 * View model for set container access level dialog
 */
var AddMessageViewModel = (function (_super) {
    tslib_1.__extends(AddMessageViewModel, _super);
    function AddMessageViewModel() {
        var _this = _super.call(this) || this;
        _this.titleLabel = "Add Message"; // localize
        _this.messageTextLabel = "Message text"; // localize
        _this.timeToLiveLabel = "Expires in:"; // localize
        _this.base64MessageLabel = "Encode message body in Base64"; // localize
        _this.ttlInvalidWarning = "Messages must expire in no less than 1 second and no more than 7 days."; // localize
        _this.timeUnits = [
            TimeUnit[TimeUnit.Days],
            TimeUnit[TimeUnit.Hours],
            TimeUnit[TimeUnit.Minutes],
            TimeUnit[TimeUnit.Seconds]
        ];
        _this.messageText = ko.observable("");
        _this.timeToLive = ko.observable(maxTimeToLive.inDays);
        _this.selectedTimeUnit = ko.observable(_this.timeUnits[0]);
        _this.isTtlValid = ko.pureComputed(function () {
            return _this.validateTimeToLive(_this.timeToLive(), _this.selectedTimeUnit());
        });
        _this.isBase64Checked = ko.observable(true);
        _this.addAcceptButton(DialogViewModel_1.default.okCaption, _this.isTtlValid);
        _this.addCancelButton();
        return _this;
    }
    /**
     * @override
     */
    AddMessageViewModel.prototype.getResults = function () {
        return {
            "MessageText": this.messageText(),
            "TimeToLive": this.convertTtlToSeconds(this.timeToLive(), this.selectedTimeUnit()),
            "Base64Encode": this.isBase64Checked()
        };
    };
    ;
    AddMessageViewModel.prototype.validateTimeToLive = function (timeToLive, timeUnit) {
        if (timeToLive <= 0) {
            return false;
        }
        var ttlInSeconds = this.convertTtlToSeconds(timeToLive, timeUnit);
        return ttlInSeconds <= maxTimeToLive.inSeconds;
    };
    AddMessageViewModel.prototype.convertTtlToSeconds = function (timeToLive, timeUnit) {
        var ttlInSeconds;
        switch (TimeUnit[timeUnit]) {
            case TimeUnit.Days:
                ttlInSeconds = timeToLive * timeConversion.secondsPerDay;
                break;
            case TimeUnit.Hours:
                ttlInSeconds = timeToLive * timeConversion.secondsPerHour;
                break;
            case TimeUnit.Minutes:
                ttlInSeconds = timeToLive * timeConversion.secondsPerMinute;
                break;
            case TimeUnit.Seconds:
                ttlInSeconds = timeToLive;
                break;
            default:
                throw new Errors.ArgumentOutOfRangeError(timeUnit);
        }
        return ttlInSeconds;
    };
    return AddMessageViewModel;
}(DialogViewModel_1.default));
exports.default = AddMessageViewModel;

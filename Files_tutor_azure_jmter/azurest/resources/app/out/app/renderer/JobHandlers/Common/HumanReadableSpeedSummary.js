"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HumanReadableSpeedSummary = (function () {
    function HumanReadableSpeedSummary(speedSummary) {
        var _this = this;
        this._previousCompleteSize = 0;
        this._previousString = "";
        this._previousHasStarted = false;
        this.getPercent = function () {
            return _this._speedSummary.getCompletePercent(0) / 100;
        };
        this.getRawSpeed = function () {
            return parseFloat(_this._speedSummary.getAverageSpeed(false)) / 1000000; // mb/s
        };
        this.getSummary = function () {
            var completeSize = _this._speedSummary.getCompleteSize(false);
            if (completeSize > _this._previousCompleteSize || !_this._previousString) {
                _this._previousCompleteSize = completeSize;
                _this._previousString = _this._convertToHumanReadable(_this._speedSummary);
            }
            return _this._convertToHumanReadable(_this._speedSummary);
        };
        this.hasStarted = function () {
            _this._previousHasStarted = _this._previousHasStarted || (_this._speedSummary.getCompleteSize(false) > 0 || _this._speedSummary.getSpeed(false) > 0);
            return _this._previousHasStarted;
        };
        this._speedSummary = speedSummary;
    }
    HumanReadableSpeedSummary.prototype._convertToHumanReadable = function (speedSummary) {
        var humanReadable = "";
        var totalSize = this._speedSummary.getTotalSize(false);
        // azureStorage library only updates speed summary if it's bigger than 32MB.
        if (totalSize > (32 * 1024 * 1024)) {
            var remainingSize = totalSize - this._speedSummary.getCompleteSize(false);
            if (remainingSize > 0) {
                var averageSpeed = this._speedSummary.getAverageSpeed(false);
                humanReadable = this._speedSummary.getCompleteSize(true) + " of " + this._speedSummary.getTotalSize(true) + " - Average Speed: " + this._speedSummary.getAverageSpeed(true);
                var remainingTime;
                if (averageSpeed > 0) {
                    var estimatedTotalSecondsRemaining = (remainingSize / averageSpeed);
                    remainingTime = this._convertSecondsToHumanReadable(estimatedTotalSecondsRemaining);
                }
                else {
                    remainingTime = "Unknown";
                }
                humanReadable += " - Estimated Remaining: " + remainingTime;
            }
        }
        return humanReadable;
    };
    HumanReadableSpeedSummary.prototype._convertSecondsToHumanReadable = function (seconds) {
        if (seconds > 0) {
            var tenthsOfHoursRemainder = (seconds % (60 * 6));
            var hours = ((seconds - tenthsOfHoursRemainder) / (60 * 6)) / 10;
            if (hours === 1) {
                return "1 hour";
            }
            else if (hours > 1) {
                return hours + " hours";
            }
            else {
                var tenthsOfMinutesRemainder = seconds % 6;
                var minutes = ((seconds - tenthsOfMinutesRemainder) / 6) / 10;
                if (minutes === 1) {
                    return "1 minute";
                }
                else if (minutes > 1) {
                    return minutes + " minutes";
                }
                else {
                    var secondsRemainder = seconds % 1;
                    var roundedSeconds = seconds - secondsRemainder;
                    return roundedSeconds + " seconds";
                }
            }
        }
        return "";
    };
    return HumanReadableSpeedSummary;
}());
exports.default = HumanReadableSpeedSummary;

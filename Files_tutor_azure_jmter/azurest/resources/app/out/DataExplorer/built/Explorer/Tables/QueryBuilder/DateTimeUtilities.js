define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    function convertUnixToJSDate(unixTime) {
        return new Date(unixTime * 1000);
    }
    exports.convertUnixToJSDate = convertUnixToJSDate;
    function convertJSDateToUnix(dateTime) {
        return Number((new Date(dateTime).getTime() / 1000).toFixed(0));
    }
    exports.convertJSDateToUnix = convertJSDateToUnix;
    function convertTicksToJSDate(ticks) {
        var ticksToMicrotime = Number(ticks) / 10000;
        var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));
        return new Date(ticksToMicrotime - epochMicrotimeDiff);
    }
    exports.convertTicksToJSDate = convertTicksToJSDate;
    function convertJSDateToTicksWithPadding(dateTime) {
        var epochTicks = 621355968000000000;
        var ticksPerMillisecond = 10000;
        var ticks = epochTicks + (new Date(dateTime).getTime() * ticksPerMillisecond);
        return padDateTicksWithZeros(ticks.toString());
    }
    exports.convertJSDateToTicksWithPadding = convertJSDateToTicksWithPadding;
    function padDateTicksWithZeros(value) {
        var s = "0000000000000000000" + value;
        return s.substr(s.length - 20);
    }
});

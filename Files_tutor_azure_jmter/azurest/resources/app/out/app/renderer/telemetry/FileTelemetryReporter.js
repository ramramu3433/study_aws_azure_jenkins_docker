"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var tslib_1 = require("tslib");
var fs = require("fs");
var os = require("os");
var path = require("path");
var _string = require("underscore.string");
var Utilities = require("../../Utilities");
var FileTelemetryReporter = (function () {
    function FileTelemetryReporter(isInternalUser, userId) {
        var _this = this;
        this._counter = 0;
        this._nextString = "";
        this.sendEvent = function (name, properties) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (properties === null) {
                    properties = {};
                }
                this._updateTelemetryProperties(properties);
                this._writeTelemetryEntry(name, 0, properties);
                return [2 /*return*/];
            });
        }); };
        this._updateTelemetryProperties = function (properties) {
            properties["Host.IsInternalUser"] = _this._isInternalUser.toString();
            properties["Host.OrderNum"] = (++_this._counter).toString();
        };
        /**
         * Send debug telemetry data to file.
         * Use asynchronous appendFiles, only one at a time to keep from overwhelming node with pending file writes.
         * While each append is pending, accumulate any new telemetry strings received into _currentString.
         */
        this._writeTelemetryEntry = function (name, value, properties) {
            var telemetryString = _string.sprintf("[%s] [%s : %s]", _this._cloudExplorerSessionId, name, value);
            for (var key in properties) {
                telemetryString += _string.sprintf(" [%s : %s]", key, properties[key]);
            }
            telemetryString += os.EOL;
            _this._nextString += telemetryString;
            console.log(telemetryString);
            _this._flushAsync();
        };
        this._isInternalUser = isInternalUser;
        this._cloudExplorerSessionId = Utilities.guid(); // New GUID to track
        this._debugFilePath = path.normalize(os.tmpdir() + "/" + FileTelemetryReporter.debugFileName);
        console.log(_string.sprintf("Telemetry file path: '%s'", this._debugFilePath));
    }
    FileTelemetryReporter.prototype._flushAsync = function () {
        var _this = this;
        var currentString = this._nextString;
        if (currentString && !this._isWritingToFile) {
            // There's something to write, and there's not a current pending write.
            this._nextString = "";
            this._isWritingToFile = true;
            fs.appendFile(this._debugFilePath, currentString, null, function (err) {
                if (err) {
                    console.error("Error appending to debug telemetry file: " + err.message);
                }
                _this._isWritingToFile = false;
                _this._flushAsync();
            });
        }
    };
    return FileTelemetryReporter;
}());
FileTelemetryReporter.debugFileName = "DebugTelemetryOutput.log";
module.exports = FileTelemetryReporter;

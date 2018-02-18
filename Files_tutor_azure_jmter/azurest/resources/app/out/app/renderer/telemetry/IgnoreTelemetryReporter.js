"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var tslib_1 = require("tslib");
var IgnoreTelemetryReporter = (function () {
    function IgnoreTelemetryReporter(isInternalUser, userId) {
        var _this = this;
        this.sendEvent = function (name, properties) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        return;
    }
    return IgnoreTelemetryReporter;
}());
module.exports = IgnoreTelemetryReporter;

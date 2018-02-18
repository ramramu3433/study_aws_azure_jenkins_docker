"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var tslib_1 = require("tslib");
var os = require("os");
var Q = require("q");
var getmac = require("getmac");
var appInsights = require("applicationinsights");
var crypto = require("crypto");
var Utilities = require("../../Utilities");
var AITelemetryReporter = (function () {
    function AITelemetryReporter(isInternalUser, userId) {
        var _this = this;
        this._aIInstrumentationKey = "71ebf67a-f23a-4893-bafb-e7fd7a0f43d3";
        this._counter = 0;
        this._isInternalUser = true;
        this._commonProperties = {};
        this._hashedMacAddress = null;
        this.sendEvent = function (name, properties) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (properties === null) {
                            properties = {};
                        }
                        // Assign common properties to all telemetry sent from the default client
                        this._commonProperties["Host.OrderNum"] = (++this._counter).toString();
                        _a = this._commonProperties;
                        _b = "Host.HashedMacAddress";
                        return [4 /*yield*/, this._getHashedMacAddress()];
                    case 1:
                        _a[_b] = _c.sent();
                        appInsights.client.commonProperties = this._commonProperties;
                        this._client.trackEvent(name, properties);
                        return [2 /*return*/];
                }
            });
        }); };
        this._createTelemetryClient = function () {
            // TODO: [cralvord] Update @types/applicationinsights and remove <any> cast
            appInsights.setup(_this._aIInstrumentationKey)
                .setAutoCollectRequests(false)
                .setAutoCollectPerformance(false)
                .setAutoCollectExceptions(false)
                .setAutoCollectDependencies(false)
                .start();
            _this._client = appInsights.client;
        };
        this._isInternalUser = isInternalUser;
        this._createTelemetryClient();
        this._commonProperties = {
            "OS.Platform": os.platform(),
            "OS.Type": os.type(),
            "OS.Arch": os.arch(),
            "OS.Release": os.release(),
            "Host.CloudHub.sessionId": Utilities.guid(),
            "Host.IsInternalUser": this._isInternalUser.toString(),
            "Host.StorageExplorer.version": Utilities.getVersion(),
            "Host.Name": AITelemetryReporter.hostName,
            "Host.UserId": userId
        };
    }
    AITelemetryReporter.prototype._getHashedMacAddress = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this._hashedMacAddress) {
                            return [2 /*return*/, this._hashedMacAddress];
                        }
                        _a = this;
                        return [4 /*yield*/, Q.Promise(function (resolve, reject) {
                                try {
                                    getmac.getMac(function (error, macAddress) {
                                        if (!!error) {
                                            resolve("unknown");
                                        }
                                        else {
                                            resolve(crypto.createHash("sha256").update(macAddress, "utf8").digest("hex"));
                                        }
                                    });
                                }
                                catch (err) {
                                    resolve("unknown");
                                }
                            })];
                    case 1:
                        _a._hashedMacAddress = _b.sent();
                        return [2 /*return*/, this._hashedMacAddress];
                }
            });
        });
    };
    return AITelemetryReporter;
}());
AITelemetryReporter.debugFileName = "DebugTelemetryOutput.log";
AITelemetryReporter.hostName = "StorageExplorer";
module.exports = AITelemetryReporter;

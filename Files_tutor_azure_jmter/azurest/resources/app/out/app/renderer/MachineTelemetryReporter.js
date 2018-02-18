"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var crypto = require("crypto");
var getmac = require("getmac");
var os = require("os");
var Q = require("q");
var TelemetryManager = require("./telemetry/TelemetryManager");
var ExceptionSerialization_1 = require("./Components/Errors/ExceptionSerialization");
var Utilities = require("../Utilities");
var MachineTelemetryReporter = (function () {
    function MachineTelemetryReporter() {
    }
    MachineTelemetryReporter.getMachineInfo = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var machineId;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MachineTelemetryReporter._getMachineId()];
                    case 1:
                        machineId = _a.sent();
                        return [2 /*return*/, {
                                platform: Utilities.getPlatform(),
                                isWinx64: Utilities.isWinx64() ? "true" : "false",
                                maxMemory: os.totalmem().toString(),
                                numCpus: os.cpus().length.toString(),
                                machineId: machineId
                            }];
                }
            });
        });
    };
    MachineTelemetryReporter.sendMachineInfo = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var machineInfo;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MachineTelemetryReporter.getMachineInfo()];
                    case 1:
                        machineInfo = _a.sent();
                        TelemetryManager.sendEvent("StorageExplorer.machineInfo", machineInfo);
                        return [2 /*return*/];
                }
            });
        });
    };
    MachineTelemetryReporter._getMachineId = function () {
        return this._getHashedMacAddress();
    };
    MachineTelemetryReporter._getHashedMacAddress = function () {
        return Q.Promise(function (resolve, reject) {
            try {
                getmac.getMac(function (error, macAddress) {
                    if (!!error) {
                        MachineTelemetryReporter._reportGetMacAddressErr(error);
                        resolve("unknown");
                    }
                    else {
                        resolve(crypto.createHash("sha256").update(macAddress, "utf8").digest("hex"));
                    }
                });
            }
            catch (err) {
                MachineTelemetryReporter._reportGetMacAddressErr(err);
                resolve("unknown");
            }
        });
    };
    MachineTelemetryReporter._reportGetMacAddressErr = function (err) {
        TelemetryManager.sendEvent("StorageExplorer.GetMacAddress", {
            err: err,
            stringErr: ExceptionSerialization_1.default.summarize(err)
        });
    };
    return MachineTelemetryReporter;
}());
exports.default = MachineTelemetryReporter;

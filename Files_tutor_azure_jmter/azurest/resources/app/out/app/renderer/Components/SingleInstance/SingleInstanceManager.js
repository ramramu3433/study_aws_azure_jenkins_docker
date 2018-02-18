"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodeIPCFactory_1 = require("../IPC/Node/NodeIPCFactory");
var fs = require("fs");
var os = require("os");
var process = require("process");
var Q = require("q");
var SingleInstanceManager = (function () {
    function SingleInstanceManager(mainIPCHandle, _forceNewInstance) {
        this._forceNewInstance = _forceNewInstance;
        this._retryCount = 1;
        this._pipeName = mainIPCHandle;
    }
    SingleInstanceManager.prototype.end = function () {
        if (!!this._server) {
            return this._server.close();
        }
        else {
            return Promise.resolve(undefined);
        }
    };
    SingleInstanceManager.prototype.ensureSingleInstance = function (onStartupArgsReceived) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, client, mainPIDDeferred_1, mainPIDPromise, mainPID, allowSetForegroundWindow, error_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this._tryToCreateMainInstanceServer()];
                    case 1:
                        _a._server = _b.sent();
                        if (!!!this._server) return [3 /*break*/, 2];
                        this._server.onMessage(function (message) {
                            if (message === "PID") {
                                return _this._server.sendMessage(process.pid);
                            }
                            else {
                                return onStartupArgsReceived(message);
                            }
                        });
                        return [2 /*return*/, { shouldExit: false, appIsMainInstance: true }];
                    case 2:
                        if (!this._forceNewInstance) return [3 /*break*/, 3];
                        return [2 /*return*/, { shouldExit: false, appIsMainInstance: false }];
                    case 3:
                        _b.trys.push([3, 9, , 10]);
                        return [4 /*yield*/, this._tryToConnectToMainInstanceServer()];
                    case 4:
                        client = _b.sent();
                        mainPIDDeferred_1 = Q.defer();
                        mainPIDPromise = mainPIDDeferred_1.promise.timeout(5 * 1000, "Main PID promise timeout");
                        client.onMessage(function (message) {
                            mainPIDDeferred_1.resolve(message);
                            return Promise.resolve(undefined);
                        });
                        if (!(os.platform() === "win32")) return [3 /*break*/, 7];
                        return [4 /*yield*/, client.sendMessage("PID")];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, mainPIDPromise];
                    case 6:
                        mainPID = _b.sent();
                        allowSetForegroundWindow = require("windows-foreground-love").allowSetForegroundWindow;
                        allowSetForegroundWindow(mainPID);
                        _b.label = 7;
                    case 7: return [4 /*yield*/, client.sendMessage(process.argv)];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, { shouldExit: true, appIsMainInstance: false }];
                    case 9:
                        error_1 = _b.sent();
                        if (error_1.code !== "ECONNREFUSED" || this._retryCount <= 0) {
                            throw error_1;
                        }
                        else {
                            // It somtimes happens on Linux and OS X that the pipe is left behind
                            // so we unlink and try again if we think that has happened.
                            this._unlinkSocket();
                            this._retryCount--;
                            return [2 /*return*/, this.ensureSingleInstance(onStartupArgsReceived)];
                        }
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    SingleInstanceManager.prototype._tryToCreateMainInstanceServer = function () {
        return NodeIPCFactory_1.default.serve(this._pipeName)
            .then(function (server) {
            return Promise.resolve(server);
        })
            .catch(function (error) {
            if (error.code === "EADDRINUSE") {
                return Promise.resolve(null);
            }
            else {
                throw error;
            }
        });
    };
    SingleInstanceManager.prototype._tryToConnectToMainInstanceServer = function () {
        return NodeIPCFactory_1.default.connect(this._pipeName);
    };
    SingleInstanceManager.prototype._unlinkSocket = function () {
        try {
            fs.unlinkSync(this._pipeName);
        }
        catch (e) {
            // noop
        }
    };
    return SingleInstanceManager;
}());
exports.default = SingleInstanceManager;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var ProcessManager_1 = require("../Components/ProcessManager/Host/ProcessManager");
var path = require("path");
var Assert_1 = require("../Components/TestManager/Assert");
var Q = require("q");
var ProcessTests = (function (_super) {
    tslib_1.__extends(ProcessTests, _super);
    function ProcessTests(activityManager) {
        var _this = _super.call(this, "Process Tests", activityManager) || this;
        _this._pingPongTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pongBootloaderModule, pongProcess, messageReceivedDeferred, messageReceived;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pongBootloaderModule = path.resolve(ProcessTests._relatedFilesPath, "./PongBootloader");
                        return [4 /*yield*/, ProcessManager_1.default.startProcess(pongBootloaderModule, "init")];
                    case 1:
                        pongProcess = _a.sent();
                        messageReceivedDeferred = Q.defer();
                        pongProcess.onMessage(function (receivedMessage) {
                            messageReceivedDeferred.resolve(receivedMessage);
                            return Q.resolve(null);
                        });
                        pongProcess.sendMessage("Ping");
                        return [4 /*yield*/, messageReceivedDeferred.promise];
                    case 2:
                        messageReceived = _a.sent();
                        Assert_1.default(messageReceived === "Pong", "Messaged received expected to be Pong");
                        pongProcess.kill();
                        // Assert(pongProcess.disconnected, "Process should have been disconnected.");
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._pangWrongTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pongBootloaderModule, pongProcess, messageReceivedDeferred, messageReceived;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pongBootloaderModule = path.resolve(ProcessTests._relatedFilesPath, "./PongBootloader");
                        return [4 /*yield*/, ProcessManager_1.default.startProcess(pongBootloaderModule, "init")];
                    case 1:
                        pongProcess = _a.sent();
                        messageReceivedDeferred = Q.defer();
                        pongProcess.onMessage(function (receivedMessage) {
                            messageReceivedDeferred.resolve(receivedMessage);
                            return Q.resolve(null);
                        });
                        pongProcess.sendMessage("Pang");
                        return [4 /*yield*/, messageReceivedDeferred.promise];
                    case 2:
                        messageReceived = _a.sent();
                        Assert_1.default(messageReceived !== "Pong", "Messaged received should not be Pong");
                        pongProcess.kill();
                        // Assert(pongProcess.disconnected, "Process should have been disconnected.");
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this._killTest = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var killBootloaderModule, killProcess, disconnectedDeferred, error;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        killBootloaderModule = path.resolve(ProcessTests._relatedFilesPath, "./KillProcessBootloader");
                        return [4 /*yield*/, ProcessManager_1.default.startProcess(killBootloaderModule, "init")];
                    case 1:
                        killProcess = _a.sent();
                        disconnectedDeferred = Q.defer();
                        killProcess.onDisconnected(function (error) {
                            disconnectedDeferred.resolve(error);
                            return Q.resolve(null);
                        });
                        killProcess.sendMessage("Kill");
                        return [4 /*yield*/, disconnectedDeferred.promise];
                    case 2:
                        error = _a.sent();
                        Assert_1.default(error === undefined, "Expected: undefined - Actual: " + (error ? error.message : ""));
                        Assert_1.default(killProcess.disconnected, "Process should have been disconnected.");
                        return [2 /*return*/, true];
                }
            });
        }); };
        _this.addTest(new Test_1.default("Ping - Pong Test", _this._pingPongTest, _this, activityManager));
        _this.addTest(new Test_1.default("Pang - Wrong Test", _this._pangWrongTest, _this, activityManager));
        _this.addTest(new Test_1.default("Kill Process Test", _this._killTest, _this, activityManager));
        return _this;
    }
    return ProcessTests;
}(TestGroup_1.default));
ProcessTests._relatedFilesPath = path.resolve(__dirname, "./ProcessTestRelatedFiles");
exports.default = ProcessTests;

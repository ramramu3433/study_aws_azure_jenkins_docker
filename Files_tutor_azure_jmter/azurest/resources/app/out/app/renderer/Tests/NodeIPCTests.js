"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Assert_1 = require("../Components/TestManager/Assert");
var NodeIPCFactory_1 = require("../Components/IPC/Node/NodeIPCFactory");
var Test_1 = require("../Components/TestManager/Test");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var uuid = require("uuid/v1");
var Q = require("q");
var NodeIPCTests = (function (_super) {
    tslib_1.__extends(NodeIPCTests, _super);
    function NodeIPCTests(activityManager) {
        var _this = _super.call(this, "Node IPC Tests", activityManager) || this;
        _this._createServer = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pipeName, server, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        pipeName = NodeIPCFactory_1.default.generateUniquePipeName();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 1:
                        server = _a.sent();
                        return [4 /*yield*/, server.close()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        Assert_1.default(false, "Error: " + JSON.stringify(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, true];
                }
            });
        }); };
        _this._recreateServer = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pipeName, server, error_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        pipeName = NodeIPCFactory_1.default.generateUniquePipeName();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 1:
                        server = _a.sent();
                        return [4 /*yield*/, server.close()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 3:
                        server = _a.sent();
                        return [4 /*yield*/, server.close()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        Assert_1.default(false, "Error: " + JSON.stringify(error_2));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, true];
                }
            });
        }); };
        _this._createServerTwice = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pipeName, server, error_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        pipeName = NodeIPCFactory_1.default.generateUniquePipeName();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 1:
                        server = _a.sent();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 2:
                        server = _a.sent();
                        return [4 /*yield*/, server.close()];
                    case 3:
                        _a.sent();
                        Assert_1.default(false, "Should not have been able to make the same server without closing the first one.");
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, true];
                }
            });
        }); };
        _this._connectSingle = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pipeName, server, client, error_4;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        pipeName = NodeIPCFactory_1.default.generateUniquePipeName();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 1:
                        server = _a.sent();
                        return [4 /*yield*/, NodeIPCFactory_1.default.connect(pipeName)];
                    case 2:
                        client = _a.sent();
                        client.close();
                        return [4 /*yield*/, server.close()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        Assert_1.default(false, "Error: " + JSON.stringify(error_4));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, true];
                }
            });
        }); };
        _this._connectMulti = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var pipeName, server, clients, i, _a, _b, i, error_5;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        pipeName = NodeIPCFactory_1.default.generateUniquePipeName();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 1:
                        server = _c.sent();
                        clients = [];
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < 10)) return [3 /*break*/, 5];
                        _a = clients;
                        _b = i;
                        return [4 /*yield*/, NodeIPCFactory_1.default.connect(pipeName)];
                    case 3:
                        _a[_b] = _c.sent();
                        _c.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        for (i = 0; i < 10; i++) {
                            clients[i].close();
                        }
                        return [4 /*yield*/, server.close()];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _c.sent();
                        Assert_1.default(false, "Error: " + JSON.stringify(error_5));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, true];
                }
            });
        }); };
        _this._sendMessagesSingle = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var messages, i, pipeName, server_1, client_1, _a, _b, _i, message, error_6;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        messages = {};
                        for (i = 0; i < 20; i++) {
                            messages[uuid()] = { sent: false, received: false };
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, , 9]);
                        pipeName = NodeIPCFactory_1.default.generateUniquePipeName();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 2:
                        server_1 = _c.sent();
                        server_1.onMessage(function (message) {
                            messages[message].received = true;
                            return Promise.resolve(undefined);
                        });
                        return [4 /*yield*/, NodeIPCFactory_1.default.connect(pipeName)];
                    case 3:
                        client_1 = _c.sent();
                        _a = [];
                        for (_b in messages)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        message = _a[_i];
                        return [4 /*yield*/, client_1.sendMessage(message)];
                    case 5:
                        _c.sent();
                        messages[message].sent = true;
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, Q.Promise(function (resolve, reject) {
                            // give the messages 5 seconds
                            setTimeout(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var message;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            for (message in messages) {
                                                Assert_1.default(messages[message].received, "A message was not received");
                                            }
                                            client_1.close();
                                            return [4 /*yield*/, server_1.close()];
                                        case 1:
                                            _a.sent();
                                            resolve(true);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 5 * 1000);
                        })];
                    case 8:
                        error_6 = _c.sent();
                        Assert_1.default(false, "Error: " + JSON.stringify(error_6));
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        _this._sendMessagesMulti = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var numClients, numMessages, messages, i, j, pipeName, server_2, clients, i, _a, _b, promises, i, error_7;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        numClients = 25;
                        numMessages = 20;
                        messages = [];
                        for (i = 0; i < numClients; i++) {
                            messages[i] = [];
                            for (j = 0; j < numMessages; j++) {
                                messages[i].push({ sent: false, received: false, content: { i: i, j: j } });
                            }
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, , 9]);
                        pipeName = NodeIPCFactory_1.default.generateUniquePipeName();
                        return [4 /*yield*/, NodeIPCFactory_1.default.serve(pipeName)];
                    case 2:
                        server_2 = _c.sent();
                        server_2.onMessage(function (message) {
                            messages[message.i][message.j].received = true;
                            return Promise.resolve(undefined);
                        });
                        clients = [];
                        i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(i < numClients)) return [3 /*break*/, 6];
                        _a = clients;
                        _b = i;
                        return [4 /*yield*/, NodeIPCFactory_1.default.connect(pipeName)];
                    case 4:
                        _a[_b] = _c.sent();
                        _c.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        promises = [];
                        for (i = 0; i < numClients; i++) {
                            promises.push(this._sendMessages(clients[i], messages[i]));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, Q.Promise(function (resolve, reject) {
                                // give the messages 5 seconds
                                setTimeout(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var i, j;
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                for (i = 0; i < numClients; i++) {
                                                    for (j = 0; j < numMessages; j++) {
                                                        Assert_1.default(messages[i][j].received, "A message was not received");
                                                    }
                                                }
                                                return [4 /*yield*/, server_2.close()];
                                            case 1:
                                                _a.sent();
                                                resolve(true);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }, 5 * 1000);
                            })];
                    case 8:
                        error_7 = _c.sent();
                        Assert_1.default(false, "Error: " + JSON.stringify(error_7));
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        _this._sendMessages = function (client, messages) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var sendPromises, i;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sendPromises = [];
                        for (i = 0; i < messages.length; i++) {
                            sendPromises.push(client.sendMessage(messages[i].content));
                        }
                        return [4 /*yield*/, Promise.all(sendPromises)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, client.close()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, Promise.resolve(undefined)];
                }
            });
        }); };
        _this.addTest(new Test_1.default("Create Server", _this._createServer, _this, activityManager));
        _this.addTest(new Test_1.default("Create, Close, and Recreate Server", _this._recreateServer, _this, activityManager));
        _this.addTest(new Test_1.default("Create Server Twice Without Closing", _this._createServerTwice, _this, activityManager));
        _this.addTest(new Test_1.default("Connect Single Client To Server", _this._connectSingle, _this, activityManager));
        _this.addTest(new Test_1.default("Connect Multiple Clients To Server", _this._connectMulti, _this, activityManager));
        _this.addTest(new Test_1.default("Send Messages From Single Client To Server", _this._sendMessagesSingle, _this, activityManager));
        _this.addTest(new Test_1.default("Send Messages From Multiple Clients To Server", _this._sendMessagesMulti, _this, activityManager));
        return _this;
    }
    return NodeIPCTests;
}(TestGroup_1.default));
exports.default = NodeIPCTests;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Q = require("q");
var NodeIPCProtocol_1 = require("./NodeIPCProtocol");
var NodeIPCServer = (function () {
    function NodeIPCServer(_server) {
        var _this = this;
        this._server = _server;
        this._messageHandlers = [];
        this._protocols = [];
        this._server.on("connection", function (socket) {
            var id = ++NodeIPCServer._nextId;
            _this._protocols.push(new NodeIPCProtocol_1.default(socket, id));
            _this._protocols[_this._protocols.length - 1].onMessage(function (message) { return _this._handleMessage(message); });
            socket.on("close", function () {
                for (var i = 0; i < _this._protocols.length; i++) {
                    if (_this._protocols[i].id === id) {
                        _this._protocols.splice(i, 1);
                        break;
                    }
                }
            });
        });
    }
    NodeIPCServer.prototype.onMessage = function (messageHandler) {
        this._messageHandlers.push(messageHandler);
    };
    NodeIPCServer.prototype._handleMessage = function (message) {
        this._messageHandlers.forEach(function (handler) {
            handler(message);
        });
        return Promise.resolve(undefined);
    };
    NodeIPCServer.prototype.sendMessage = function (message) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this._protocols.map(function (protocol) { return protocol.sendMessage(message); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NodeIPCServer.prototype.close = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, Q.Promise(function (resolve, reject) {
                        _this._server.close(function () {
                            resolve(undefined);
                        });
                    })];
            });
        });
    };
    return NodeIPCServer;
}());
NodeIPCServer._nextId = 0;
exports.default = NodeIPCServer;

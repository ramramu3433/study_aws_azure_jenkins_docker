"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var NodeIPCProtocol_1 = require("./NodeIPCProtocol");
var NodeIPCClient = (function () {
    function NodeIPCClient(_socket) {
        this._socket = _socket;
        this._protocol = new NodeIPCProtocol_1.default(_socket, 0);
    }
    NodeIPCClient.prototype.onMessage = function (messageHandler) {
        this._protocol.onMessage(messageHandler);
    };
    NodeIPCClient.prototype.sendMessage = function (message) {
        return this._protocol.sendMessage(message);
    };
    NodeIPCClient.prototype.close = function () {
        this._socket.end();
        return Promise.resolve(undefined);
    };
    return NodeIPCClient;
}());
exports.default = NodeIPCClient;

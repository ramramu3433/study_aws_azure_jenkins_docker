"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var ChildMessagePasser = (function () {
    function ChildMessagePasser() {
        var _this = this;
        this._messageHandlers = [];
        this.onMessage = function (messageHandler) {
            _this._messageHandlers.push(messageHandler);
        };
        this.handleMessage = function (message) {
            _this._messageHandlers.forEach(function (handler) {
                handler(message);
            });
        };
        this.sendMessage = function (message) {
            process.send(message);
            return Q.resolve(null);
        };
    }
    return ChildMessagePasser;
}());
exports.default = ChildMessagePasser;
var messagePasserInstance = new ChildMessagePasser();
exports.Instance = messagePasserInstance;
process.on("message", messagePasserInstance.handleMessage);

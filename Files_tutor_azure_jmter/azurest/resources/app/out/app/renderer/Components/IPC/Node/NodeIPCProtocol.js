"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Q = require("q");
var NodeIPCProtocol = (function () {
    function NodeIPCProtocol(_socket, id) {
        var _this = this;
        this._socket = _socket;
        this.id = id;
        this._messageHandlers = [];
        this._writeBuffer = new (function () {
            function class_1() {
                this._data = [];
                this._totalLength = 0;
            }
            class_1.prototype.add = function (head, body) {
                var wasEmpty = this._totalLength === 0;
                this._data.push(head, body);
                this._totalLength += head.length + body.length;
                return wasEmpty;
            };
            class_1.prototype.take = function () {
                var ret = Buffer.concat(this._data, this._totalLength);
                this._data.length = 0;
                this._totalLength = 0;
                return ret;
            };
            return class_1;
        }());
        var chunks = [];
        var totalLength = 0;
        var state = {
            readHead: true,
            bodyIsJson: false,
            bodyLen: -1
        };
        _socket.on("data", function (data) {
            chunks.push(data);
            totalLength += data.length;
            var _loop_1 = function () {
                if (state.readHead) {
                    // expecting header -> read 17bytes for header
                    // information: `bodyIsJson` and `bodyLen`
                    if (totalLength >= NodeIPCProtocol._headerLen) {
                        var all = Buffer.concat(chunks);
                        state.bodyIsJson = all.readInt8(0) === 1;
                        state.bodyLen = all.readInt32BE(1);
                        state.readHead = false;
                        var rest = all.slice(NodeIPCProtocol._headerLen);
                        totalLength = rest.length;
                        chunks = [rest];
                    }
                    else {
                        return "break";
                    }
                }
                if (!state.readHead) {
                    // expecting body -> read bodyLen-bytes for
                    // the actual message or wait for more data
                    if (totalLength >= state.bodyLen) {
                        var all = Buffer.concat(chunks);
                        var message_1 = all.toString("utf8", 0, state.bodyLen);
                        if (state.bodyIsJson) {
                            message_1 = JSON.parse(message_1);
                        }
                        _this._messageHandlers.forEach(function (handler) {
                            handler(message_1);
                        });
                        var rest = all.slice(state.bodyLen);
                        totalLength = rest.length;
                        chunks = [rest];
                        state.bodyIsJson = false;
                        state.bodyLen = -1;
                        state.readHead = true;
                    }
                    else {
                        return "break";
                    }
                }
            };
            while (totalLength > 0) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
        });
    }
    NodeIPCProtocol.prototype.onMessage = function (messageHandler) {
        this._messageHandlers.push(messageHandler);
    };
    NodeIPCProtocol.prototype.sendMessage = function (message) {
        // [bodyIsJson|bodyLen|message]
        // |^header^^^^^^^^^^^|^data^^]
        var header = Buffer.alloc(NodeIPCProtocol._headerLen);
        // ensure string
        if (typeof message !== "string") {
            message = JSON.stringify(message);
            header.writeInt8(1, 0);
        }
        var data = Buffer.from(message);
        header.writeInt32BE(data.length, 1);
        return this._writeSoon(header, data);
    };
    NodeIPCProtocol.prototype._writeSoon = function (header, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (!this._writePromise) {
                    this._writePromise = Q.defer();
                }
                if (this._writeBuffer.add(header, data)) {
                    setImmediate(function () {
                        // return early if socket has been destroyed in the meantime
                        if (_this._socket.destroyed) {
                            _this._writePromise.reject("Socket destroyed");
                        }
                        // we ignore the returned value from `write` because we would have to cached the data
                        // anyways and nodejs is already doing that for us:
                        // > https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback
                        // > However, the false return value is only advisory and the writable stream will unconditionally
                        // > accept and buffer chunk even if it has not not been allowed to drain.
                        _this._socket.write(_this._writeBuffer.take(), function () {
                            _this._writePromise.resolve(undefined);
                            _this._writePromise = null;
                        });
                    });
                }
                return [2 /*return*/, this._writePromise.promise];
            });
        });
    };
    return NodeIPCProtocol;
}());
NodeIPCProtocol._headerLen = 17;
exports.default = NodeIPCProtocol;

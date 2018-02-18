"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ExceptionSerialization_1 = require("../../Errors/ExceptionSerialization");
var MessageType_1 = require("./MessageType");
var Q = require("q");
var MessagePassingProviderProxy = (function () {
    function MessagePassingProviderProxy(providerNamespace, messageHandler, messageSender, host) {
        var _this = this;
        this._operations = {};
        this.getFunction = function (functionNamespace) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, function (args) {
                        return _this.executeFunction(functionNamespace, args);
                    }];
            });
        }); };
        this.rejectAllPending = function (reason) {
            Object.getOwnPropertyNames(_this._operations).forEach(function (id) {
                var operation = _this._operations[id];
                if (operation) {
                    operation.reject(reason);
                    delete _this._operations[id];
                }
            });
        };
        this.namespace = providerNamespace;
        this._messageHandler = messageHandler;
        this._messageSender = messageSender;
        this._host = host;
        this._messageHandler.onMessage(function (message) { return _this._handleMessageFromChild(message); });
    }
    MessagePassingProviderProxy._getNextId = function () {
        return "MessagePassingProviderProxy" + MessagePassingProviderProxy._nextId++;
    };
    /**
     * Executes a function in the child process and waits for a response
     */
    MessagePassingProviderProxy.prototype.executeFunction = function (functionNamespace, args) {
        var messageId = MessagePassingProviderProxy._getNextId();
        var operationDeferred = Q.defer();
        this._operations[messageId] = operationDeferred;
        var message = {
            id: messageId,
            args: args,
            messageType: MessageType_1.default.FunctionCall,
            providerNamespace: this.namespace,
            functionNamespace: functionNamespace
        };
        this._messageSender.sendMessage(message)
            .catch(operationDeferred.reject);
        return operationDeferred.promise;
    };
    MessagePassingProviderProxy.prototype._handleMessageFromChild = function (message) {
        var _this = this;
        switch (message.messageType) {
            case MessageType_1.default.FunctionResponse:
                var messageId = message.id;
                var operation = this._operations[messageId];
                if (operation) {
                    if (message.response.type === "error") {
                        operation.reject(ExceptionSerialization_1.default.deserialize(message.response.error));
                    }
                    else {
                        operation.resolve(message.response.result);
                    }
                }
                delete this._operations[messageId];
                return;
            case MessageType_1.default.FunctionCall:
                this._host.executeOperation(message.functionNamespace, message.args)
                    .then(function (returnVal) {
                    _this._messageSender.sendMessage({
                        id: message.id,
                        messageType: MessageType_1.default.FunctionResponse,
                        response: { type: "result", result: returnVal }
                    });
                })
                    .catch(function (error) {
                    _this._messageSender.sendMessage({
                        id: message.id,
                        messageType: MessageType_1.default.FunctionResponse,
                        response: { type: "error", error: ExceptionSerialization_1.default.serialize(error) }
                    });
                });
                break;
            case MessageType_1.default.EventCall:
                this._host.raiseEvent(message.functionNamespace, message.args).then(function (returnVal) {
                    _this._messageSender.sendMessage({
                        id: message.id,
                        messageType: MessageType_1.default.EventResponse,
                        response: returnVal
                    });
                });
                break;
            default:
                throw new Error("Unexpected message type from child process: " + message.messageType);
        }
    };
    return MessagePassingProviderProxy;
}());
MessagePassingProviderProxy._nextId = 0;
exports.default = MessagePassingProviderProxy;

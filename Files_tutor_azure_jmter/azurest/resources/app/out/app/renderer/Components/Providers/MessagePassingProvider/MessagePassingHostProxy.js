"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ExceptionSerialization_1 = require("../../Errors/ExceptionSerialization");
var MessageType_1 = require("./MessageType");
var Q = require("q");
var MessagePassingHostProxy = (function () {
    function MessagePassingHostProxy(messageHandler, messageSender, providerFactory) {
        var _this = this;
        this._operations = {};
        this.executeOperation = function (functionNamespace, args) {
            var messageId = MessagePassingHostProxy._getNextId();
            var operationDeferred = Q.defer();
            _this._operations[messageId] = operationDeferred;
            var message = {
                id: messageId,
                args: args,
                messageType: MessageType_1.default.FunctionCall,
                functionNamespace: functionNamespace
            };
            try {
                _this._messageSender.sendMessage(message);
            }
            catch (error) {
                delete _this._operations[messageId];
                operationDeferred.reject(error);
            }
            return operationDeferred.promise;
        };
        this.raiseEvent = function (functionNamespace, args) {
            var messageId = MessagePassingHostProxy._getNextId();
            var operationDeferred = Q.defer();
            _this._operations[messageId] = operationDeferred;
            var message = {
                id: messageId,
                args: args,
                messageType: MessageType_1.default.EventCall,
                functionNamespace: functionNamespace
            };
            try {
                _this._messageSender.sendMessage(message);
            }
            catch (error) {
                delete _this._operations[messageId];
                operationDeferred.reject(error);
            }
            return operationDeferred.promise;
        };
        this._handleMessageFromMessageHandler = function (message) {
            var operationId = message.id;
            var operationPromise = null;
            try {
                switch (message.messageType) {
                    case MessageType_1.default.FunctionCall:
                        operationPromise = _this._providerFactory.executeFunction(message.providerNamespace, message.functionNamespace, message.args);
                        break;
                    case MessageType_1.default.EventResponse:
                    case MessageType_1.default.FunctionResponse:
                        var messageId = message.id;
                        var operation = _this._operations[messageId];
                        if (operation) {
                            if (message.response.type === "error") {
                                operation.reject(ExceptionSerialization_1.default.deserialize(message.response.error));
                            }
                            else {
                                operation.resolve(message.response.result);
                            }
                        }
                        delete _this._operations[messageId];
                        break;
                    default:
                        throw new Error("Unsupported message type " + message.messageType);
                }
            }
            catch (error) {
                operationPromise = Q.reject(error);
            }
            if (operationPromise) {
                var returnMessage = {
                    id: operationId,
                    messageType: MessageType_1.default.FunctionResponse,
                    // These aren't necessary for communication back to the client, but do make it easier to see what's going on
                    providerNamespace: message.providerNamespace,
                    functionNamespace: message.functionNamespace
                };
                operationPromise
                    .then(function (value) {
                    returnMessage.response = { type: "result", result: value };
                    _this._messageSender.sendMessage(returnMessage);
                })
                    .catch(function (error) {
                    returnMessage.response = { type: "error", error: ExceptionSerialization_1.default.serialize(error) };
                    _this._messageSender.sendMessage(returnMessage);
                });
            }
        };
        this._messageHandler = messageHandler;
        this._messageSender = messageSender;
        this._providerFactory = providerFactory;
        this._messageHandler.onMessage(function (message) {
            _this._handleMessageFromMessageHandler(message);
            return Q.resolve(null);
        });
    }
    MessagePassingHostProxy._getNextId = function () {
        return "MessagePassingHostProxy" + MessagePassingHostProxy._nextId++;
    };
    return MessagePassingHostProxy;
}());
MessagePassingHostProxy._nextId = 0;
exports.default = MessagePassingHostProxy;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module
 * Marshals operations to the Cloud Explorer host.
 */
var ExceptionSerialization_1 = require("../Components/Errors/ExceptionSerialization");
var StandardMarshaler_1 = require("./StandardMarshaler");
var daytona_1 = require("daytona");
var q = require("q");
var CloudExplorerProxyMarshaler = (function () {
    function CloudExplorerProxyMarshaler(localProviderFactory) {
        this._operationPromises = {};
        this._operationPromises = {};
        this._nextOperationId = 0;
        this._initializedDeferred = q.defer();
        this._localProviderFactory = localProviderFactory;
    }
    /**
     * TODO: Timeout if operation isn't acknowledged.
     */
    CloudExplorerProxyMarshaler.prototype.raiseEvent = function (namespace, args) {
        var _this = this;
        return q.Promise(function (resolve, reject) {
            var operationId = _this._getNextOperationID();
            _this._operationPromises[operationId] = { resolve: resolve, reject: reject, functionNamespace: namespace };
            _this._initializedDeferred.promise
                .then(function () {
                _this._fireEvent("raiseEvent", {
                    operationId: operationId,
                    functionNamespace: namespace,
                    argsJson: JSON.stringify(args)
                });
            });
        });
    };
    /**
     * TODO: Timeout if operation isn't acknowledged.
     */
    CloudExplorerProxyMarshaler.prototype.executeOperation = function (namespace, args) {
        var _this = this;
        return q.Promise(function (resolve, reject) {
            var operationId = _this._getNextOperationID();
            _this._operationPromises[operationId] = { resolve: resolve, reject: reject, functionNamespace: namespace };
            _this._initializedDeferred.promise
                .then(function () {
                if (!!_this._localProviderFactory && _this._localProviderFactory.functionIsLocal(namespace)) {
                    _this._localProviderFactory.executeLocalFunction(namespace, args)
                        .then(function (response) {
                        _this.finalizeOperation(operationId, JSON.stringify({ type: "result", result: response }));
                    })
                        .catch(function (err) {
                        _this.finalizeOperation(operationId, JSON.stringify({ type: "error", error: ExceptionSerialization_1.default.serialize(err) }));
                    });
                }
                else {
                    _this._fireEvent("executeOperation", {
                        operationId: operationId,
                        functionNamespace: namespace,
                        argsJson: JSON.stringify(args)
                    });
                }
            });
        });
    };
    CloudExplorerProxyMarshaler.prototype.finalizeOperation = function (operationId, json) {
        var operationPromise = this._operationPromises[operationId];
        if (operationPromise) {
            delete this._operationPromises[operationId];
            if (json) {
                var response = JSON.parse(json);
                if (response.type === "error") {
                    operationPromise.reject(ExceptionSerialization_1.default.deserialize(response.error));
                }
                else {
                    operationPromise.resolve(response.result);
                }
            }
            else {
                operationPromise.resolve(null);
            }
        }
    };
    CloudExplorerProxyMarshaler.prototype.ackOperation = function (operationId) {
        var operationPromise = this._operationPromises[operationId];
        if (operationPromise) {
            operationPromise.ack = true;
        }
    };
    CloudExplorerProxyMarshaler.prototype.initialized = function () {
        this._initializedDeferred.resolve();
    };
    CloudExplorerProxyMarshaler.prototype.createMarshaler = function () {
        var _this = this;
        this._cloudExplorerInstance = new daytona_1.JsonPortMarshaler(StandardMarshaler_1.default.getStandardMarshaler({
            finalizeOperation: function (operationId, json) { return _this.finalizeOperation(operationId, json); },
            ackOperation: function (operationId) { return _this.ackOperation(operationId); },
            initialized: function () { return _this.initialized(); }
        }));
        return this._cloudExplorerInstance;
    };
    CloudExplorerProxyMarshaler.prototype.setLocalProviderFactory = function (providerFactory) {
        this._localProviderFactory = providerFactory;
    };
    CloudExplorerProxyMarshaler.prototype._fireEvent = function (name, args) {
        var _this = this;
        this._initializedDeferred.promise
            .then(function () {
            if (_this._cloudExplorerInstance) {
                console.assert(_this._cloudExplorerInstance.instanceInitialized, "Activity Log Marshaler has not been initialized");
                console.assert(_this._cloudExplorerInstance.port.portState === 0, "Activity Log Marshaler Port has been disconnected or closed");
                try {
                    _this._cloudExplorerInstance.fireEvent(name, args);
                }
                catch (error) {
                    // Keep going to other marshalers if there's a failure
                    console.error(error);
                }
            }
        });
    };
    CloudExplorerProxyMarshaler.prototype._getNextOperationID = function () {
        return this._nextOperationId++;
    };
    return CloudExplorerProxyMarshaler;
}());
var instance = new CloudExplorerProxyMarshaler();
if (!global.host) {
    global.host = {
        executeOperation: function (namespace, args) { return instance.executeOperation(namespace, args); },
        raiseEvent: function (namespace, args) { return instance.raiseEvent(namespace, args); }
    };
}
exports.default = instance;

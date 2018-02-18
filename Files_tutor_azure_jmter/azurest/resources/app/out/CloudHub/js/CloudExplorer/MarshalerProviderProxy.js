/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Errors/ExceptionSerialization", "es6-promise"], function (require, exports, ExceptionSerialization_1, es6_promise_1) {
    "use strict";
    /**
     * Proxy class to communicate to the Cloud Explorer host from a provider implemented inside a .NET assembly.
     * CONSIDER: needs a better name
     */
    var MarshalerProviderProxy = (function () {
        function MarshalerProviderProxy(namespace, marshalerProviderConfig) {
            var _this = this;
            /**
             * Initializes the proxy.
             */
            this.initialize = function () {
                return _this._executeOperation("registerProvider", [_this.namespace, _this.marshalerProviderConfig]);
            };
            /**
             * Gets a function to be called by CloudExplorer
             */
            this.getFunction = function (exportId) {
                return function (args) {
                    return _this._executeFunction(exportId, args);
                };
            };
            /**
             * Gets a localized resource
             */
            this.getResourceValues = function (exportId, resourceIds) {
                return es6_promise_1.Promise.resolve();
            };
            /**
             * Executes the given operation with the given arguments in the provider
             * using the host proxy.
             */
            this._executeFunction = function (nameSpace, args) {
                return _this._executeOperation("executeFunction", [_this.namespace, nameSpace, args ? JSON.stringify(args) : args]);
            };
            /**
             * Executes the given operation on the host.
             */
            this._executeOperation = function (functionName, args) {
                var providerManager = MarshalerProviderProxy._marshalerProviderManager;
                // Ensure we receive the expected `Promise` implementation by wrapping the marshaler call in a new `Promise`.
                return new es6_promise_1.Promise(function (resolve, reject) {
                    // Call the Daytona marshaller with the given action name and arguments
                    providerManager._call.apply(MarshalerProviderProxy._marshalerProviderManager, [functionName].concat(args))
                        .then(function (json) {
                        var resultOrError;
                        try {
                            resultOrError = JSON.parse(json);
                        }
                        catch (e) {
                            reject(new TypeError("Unable to parse response from marshaler:\n" + json));
                        }
                        if (resultOrError.type === "error") {
                            reject(ExceptionSerialization_1.default.deserialize(resultOrError.error));
                        }
                        else {
                            resolve(resultOrError.result);
                        }
                    })
                        .then(null, function (operationError) {
                        reject(operationError);
                    });
                });
            };
            this.namespace = namespace;
            this.marshalerProviderConfig = marshalerProviderConfig;
            if (!MarshalerProviderProxy._marshalerProviderManager) {
                MarshalerProviderProxy._marshalerProviderManager = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("MarshalerProviderManager", {}, true);
            }
        }
        return MarshalerProviderProxy;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MarshalerProviderProxy;
});

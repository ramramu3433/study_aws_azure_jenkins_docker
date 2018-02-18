/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Errors/ExceptionSerialization"], function (require, exports, ExceptionSerialization_1) {
    "use strict";
    // Set this to true to run all providers in the local process, even if specified otherwise in config
    var DISABLE_CHILD_PROCESSES = false;
    /**
     * A proxy that communicates with the Cloud Explorer host from a provider inside a NodeJS host
     */
    var NodeJSProviderProxy = (function () {
        function NodeJSProviderProxy(namespace, config) {
            var _this = this;
            /**
             * Initializes the proxy.
             */
            this.initialize = function () {
                return _this._executeOperation("registerProvider", [_this.namespace, _this.nodeJSRequirePath, _this.useChildProcess, _this.debugPort]);
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
                return Promise.resolve();
            };
            /**
             * Executes the given operation with the given arguments in the provider
             * using the host proxy.
             *
             * Since the host is NodeJS, we get a JavaScript object back so we return that.
             */
            this._executeFunction = function (nameSpace, args) {
                return _this._executeOperation("executeFunction", [_this.namespace, nameSpace, args]);
            };
            /**
             * Executes the given operation on the host.
             */
            this._executeOperation = function (functionName, args) {
                var providerManager = NodeJSProviderProxy._marshalerProviderManager;
                // Ensure we receive the expected `Promise` implementation by wrapping the marshaler call in a new `Promise`.
                return new Promise(function (resolve, reject) {
                    // Call the Daytona marshaller with the given action name and arguments
                    providerManager._call.apply(providerManager, [functionName].concat(args))
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
            this.nodeJSRequirePath = config.nodeJSRequirePath;
            this.useChildProcess = !!config.useChildProcess && !DISABLE_CHILD_PROCESSES;
            this.debugPort = config.debugPort;
            if (!NodeJSProviderProxy._marshalerProviderManager) {
                NodeJSProviderProxy._marshalerProviderManager = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("MarshalerProviderManager", {}, true);
            }
        }
        return NodeJSProviderProxy;
    }());
    return NodeJSProviderProxy;
});

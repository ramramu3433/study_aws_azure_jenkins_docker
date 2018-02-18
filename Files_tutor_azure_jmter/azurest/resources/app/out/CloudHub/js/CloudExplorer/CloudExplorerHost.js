/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Debug", "./DaytonaHostProxy", "Common/Errors/ExceptionSerialization", "es6-promise", "CloudExplorer/AppearanceLoader", "Providers/Common/AzureConnection", "Providers/CloudExplorer/CloudExplorerProvider", "Common/Errors", "Common/ErrorsManager", "CloudExplorer/ProviderLoader", "Common/TelemetryActions"], function (require, exports, Debug, DaytonaHostProxy_1, ExceptionSerialization_1, rsvp, AppearanceLoader, AzureConnection, CloudExplorerProvider, Errors, ErrorsManager, ProviderLoader, TelemetryActions) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Routes all operation requests to providers.
     *
     * There is only ever one of these, created in `CloudExplorerViewModel`.
     * It loads a single instance of all of the providers and knows how to execute operations on them.
     */
    var CloudExplorerHost = (function () {
        function CloudExplorerHost(explorerInteractor, themeProvider, panelInteractor) {
            var _this = this;
            this.addPanelProvider = function (panelProvider) {
                _this._panelProviderLookup[panelProvider.namespace] = panelProvider;
            };
            this._onRaiseEventEvent = function (args) {
                var argsJson = args.argsJson;
                var functionNamespace = args.functionNamespace;
                var operationId = args.operationId;
                _this._host.executeOperationUnsafe("CloudExplorerProxy", "ackOperation", [operationId])
                    .then(function () {
                    return _this._executeOperations(functionNamespace, JSON.parse(argsJson));
                })
                    .then(function (results) {
                    var result = { type: "result", result: results };
                    _this._host.executeOperationUnsafe("CloudExplorerProxy", "finalizeOperation", [operationId, JSON.stringify(result)]);
                });
            };
            // Plug-ins fire this event to request an executeOperation take place
            this._onExecuteOperationEvent = function (args) {
                var argsJson = args.argsJson;
                var functionNamespace = args.functionNamespace;
                var operationId = args.operationId;
                var handleError = function (error) {
                    var args = [
                        operationId,
                        JSON.stringify({ type: "error", error: ExceptionSerialization_1.default.serialize(error) })
                    ];
                    return _this._host.executeOperationUnsafe("CloudExplorerProxy", "finalizeOperation", args)
                        .then(null, function (error) {
                        Debug.error("Unable to process operation error in CloudExplorerHost: " + JSON.stringify(error));
                    });
                };
                var handleResult = function (result) {
                    var args = [
                        operationId,
                        JSON.stringify({ type: "result", result: result })
                    ];
                    return _this._host.executeOperationUnsafe("CloudExplorerProxy", "finalizeOperation", args);
                };
                try {
                    _this._host.executeOperationUnsafe("CloudExplorerProxy", "ackOperation", [operationId])
                        .then(function () {
                        return _this.executeProviderOperation(functionNamespace, JSON.parse(argsJson));
                    })
                        .then(handleResult, handleError);
                }
                catch (error) {
                    handleError(error);
                }
            };
            this.getProviderActions = function (namespace) {
                var providerPromises = _this._providerLoader.getMatchingProviders(namespace);
                var providerActions = providerPromises.map(function (providerPriomise) {
                    return providerPriomise.then(function (provider) {
                        return provider.getFunction(namespace);
                    });
                });
                return providerActions;
            };
            this.getProviderAction = function (namespace) {
                var providerPromise = _this._providerLoader.getMatchingProvider(namespace);
                return providerPromise.then(function (provider) {
                    return provider.getFunction(namespace);
                });
            };
            this.getAppearances = function () {
                return Promise.resolve(_this._appearanceLoader.appearance);
            };
            this.executeAttributeLoader = function (namespace, args) {
                if (args === void 0) { args = null; }
                if (!namespace) {
                    return Promise.reject(new Errors.NullArgumentError("namespace"));
                }
                var provider = _this._providerLoader.getMatchingProvider(namespace);
                return provider.then(function (provider) {
                    var attributeLoader = provider.getFunction(namespace);
                    return attributeLoader
                        ? attributeLoader(args)
                        : Promise.reject(new Errors.OperationNotFoundError(namespace));
                });
            };
            this.executeQuery = function (namespace, args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return new Promise(function (resolve, reject) {
                    // Check arguments
                    if (!namespace) {
                        reject(new Errors.NullArgumentError("namespace"));
                        return;
                    }
                    var startTelemetryTimer = Date.now();
                    var provider = _this._providerLoader.getMatchingProvider(namespace);
                    return provider.then(function (provider) {
                        provider.getFunction(namespace)(args, continuationToken)
                            .then(function (queryResult) {
                            resolve(queryResult);
                            var searchQuery = args.$search;
                            var filtered = (!!searchQuery).toString();
                            // Telemetry: Send an query telemetry event
                            var telemetryType = "QueryNamespace";
                            var telemetryProperties = {};
                            telemetryProperties[telemetryType] = namespace;
                            telemetryProperties[telemetryType + ".count"] = queryResult.results.length.toString();
                            telemetryProperties[telemetryType + ".elapsed"] = (Date.now() - startTelemetryTimer).toString();
                            telemetryProperties[telemetryType + ".filtered"] = filtered;
                            _this.telemetry.sendEvent("CloudHub.executeQuery", telemetryProperties);
                        }, reject);
                    });
                });
            };
            this.executeAction = function (namespace, args) {
                if (args === void 0) { args = null; }
                if (!namespace) {
                    return Promise.reject(new Errors.NullArgumentError("namespace"));
                }
                return _this.getProviderAction(namespace)
                    .then(function (actionExecuter) {
                    return actionExecuter(args);
                });
            };
            // TODO: rename to something like broadcastOperation
            this._executeOperations = function (operationNamespace, args) {
                var actionExecutorPromises = _this.getProviderActions(operationNamespace);
                var actionExecutorResultPromises = actionExecutorPromises.map(function (actionExecutorPromise) {
                    return actionExecutorPromise
                        .then(function (actionExecutor) {
                        // A provider exposes the requested operation
                        return actionExecutor(args);
                    }, function (error) {
                        // TODO handle provider didn't provide function.
                    });
                });
                return Promise.all(actionExecutorResultPromises);
            };
            /**
             * Executes an operation on the appropriate provider or marshaller
             */
            this.executeOperation = function (operationNamespace, args) {
                return _this.getProviderAction(operationNamespace).then(function (actionExecutor) {
                    // A provider exposes the requested operation
                    return actionExecutor((args && args.length) ? args[0] : undefined);
                }, function (error) {
                    // This isn't an error, it just means no provider exposes the requested function.
                    // Pass request along to the Daytona host proxy.
                    return _this._host.executeOperation(operationNamespace, args);
                });
            };
            this.executeProviderOperation = function (operationNamespace, args) {
                Debug.assert(!Array.isArray(args), "Pass in an arguments object, not an array, to executeProviderOperation");
                return _this.getProviderAction(operationNamespace)
                    .then(function (actionExecuter) {
                    return actionExecuter(args);
                });
            };
            this.onHostEvent = function (eventNamespace, callback) {
                _this._host.onHostEvent(eventNamespace, callback);
            };
            this.resolveResource = function (namespace, resourceId) {
                return _this.resolveResources(namespace, [resourceId])
                    .then(function (values) { return values[resourceId]; });
            };
            this.resolveResources = function (namespace, resourceIds) {
                return _this._providerLoader.getMatchingProvider(namespace).then(function (provider) { return provider.getResourceValues(namespace, resourceIds)
                    .catch(function (error) { return Promise.reject(new Errors.ResourceNotFoundError(resourceIds, namespace)); }); }, function (error) { return Promise.reject(new Errors.ResourceNamespaceNotFoundError(namespace)); });
            };
            this.sendInitializationMessage = function () {
                _this._host.sendInitializationMessage();
            };
            // Initialize private fields
            this._host = new DaytonaHostProxy_1.default();
            this._panelProviderLookup = {};
            this._appearanceLoader = new AppearanceLoader();
            // Initialize public properties
            this.azureConnection = new AzureConnection(this);
            this.errorsManager = new ErrorsManager(this);
            this.telemetry = new TelemetryActions(this);
            this._host.onHostEvent("CloudExplorerProxy.executeOperation", this._onExecuteOperationEvent);
            this._host.onHostEvent("CloudExplorerProxy.raiseEvent", this._onRaiseEventEvent);
            this._host.executeOperationUnsafe("CloudExplorerProxy", "initialized", []);
            this._providerLoader = new ProviderLoader(this);
            this._providerLoader.createProviderHandlers.push(function (config) {
                return (config.namespace === "CloudExplorer") ?
                    new CloudExplorerProvider(_this, explorerInteractor, themeProvider, panelInteractor) :
                    null;
            });
            this._providerLoader.createProviderHandlers.push(function (config) {
                return _this._panelProviderLookup[config.namespace];
            });
        }
        return CloudExplorerHost;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CloudExplorerHost;
});

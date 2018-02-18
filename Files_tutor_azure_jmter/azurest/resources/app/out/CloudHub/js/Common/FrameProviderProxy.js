/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "./Errors/ExceptionSerialization", "jquery", "Common/Debug", "es6-promise", "URIjs/URITemplate"], function (require, exports, ExceptionSerialization_1, $, Debug, rsvp, URITemplate) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Handles communication between a host and providers
     */
    var FrameProviderProxy = (function () {
        function FrameProviderProxy(host, namespace, requirePath) {
            var _this = this;
            // TODO: Use a different way to identify messages than integers.
            this._messageCount = 0;
            this._operations = {};
            /**
             * Initializes the proxy.
             */
            this.initialize = function () {
                return _this.registerProvider(_this);
            };
            /**
             * Gets a function to be called by CloudExplorer
             */
            this.getFunction = function (exportId) {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return _this.executeOperation(exportId, args);
                };
            };
            /**
             * Gets a localized resource
             */
            this.getResourceValues = function (exportId, resourceIds) {
                return _this.executeOperation("getResourceValues", [exportId, resourceIds]);
            };
            /**
             * Register a provider to handle its communication
             */
            this.registerProvider = function (provider) {
                return new Promise(function (resolve, reject) {
                    var providerNamespace = provider.namespace;
                    var parameters = {
                        debug: Debug.isDebug()
                    };
                    // Load Provider
                    var providerUri = FrameProviderProxy._providerUrl.expand({
                        // We add a random query to the url to force the browser to refresh everytime it loads.
                        "rand": new Date().getTime().toString(),
                        "requirePath": provider.requirePath,
                        parameters: JSON.stringify(parameters)
                    });
                    var $iFrame = $("<iframe src='" + providerUri.toString() + "'></iframe>")[0];
                    // We need to wait until the provider is initialized.
                    _this.waitForInitialization(providerNamespace).then(resolve, reject);
                    // Add iFrame to the page, starting the provider.
                    $(".plugins").append($iFrame);
                    provider.container = $iFrame.contentWindow;
                });
            };
            /**
             * Executes the given operation on the provider with the given namespace.
             */
            this.executeOperation = function (operationNamespace, args) {
                return new Promise(function (resolve, reject) {
                    // Prepare the operation information and save it
                    var operation = {
                        resolve: resolve,
                        reject: reject
                    };
                    var message = {
                        id: _this._messageCount++,
                        messageType: 1 /* FunctionCall */,
                        operationNamespace: operationNamespace,
                        args: args
                    };
                    _this._operations[message.id] = operation;
                    // Send message
                    _this.sendMessage(message, _this.container);
                });
            };
            /**
             * Registers a listener for the an initialization operation
             * from the provider with the given namespace.
             */
            this.waitForInitialization = function (providerNamespace) {
                return new Promise(function (resolve, reject) {
                    Debug.log("Waiting for initialization response from provider " + providerNamespace);
                    // Provider is expected to send a "response" with this ID when it has initialized.  When we get it,
                    // we'll resolve our promise.
                    var initializationOperationId = providerNamespace.toString() + ".initialize";
                    // Prepare the operation information and save it
                    var operation = {
                        resolve: function (response) {
                            Debug.log("FrameProviderProxy: Initialization succeeded for " + providerNamespace);
                            resolve(response);
                        }, reject: function (error) {
                            Debug.error("FrameProviderProxy: Initialization failed for " + providerNamespace);
                            Debug.error(error);
                            reject(error);
                        }
                    };
                    _this._operations[initializationOperationId] = operation;
                });
            };
            /**
             * Gets called when a new message is received.
             */
            this.messageHandler = function (event) {
                // Check the message is coming from this provider
                if (_this.container !== event.source) {
                    return;
                }
                // Retrieve the message
                var message = JSON.parse(event.data);
                // Check if there was a message
                if (!message) {
                    return;
                }
                switch (message.messageType) {
                    case 1 /* FunctionCall */:
                        _this._host.executeOperation(message.operationNamespace, message.args)
                            .then(function (response) {
                            message.response = { type: "result", result: response };
                        }, function (error) {
                            message.response = { type: "error", error: ExceptionSerialization_1.default.serialize(error) };
                        })
                            .then(function () {
                            message.messageType = 2 /* FunctionResponse */;
                            _this.sendMessage(message, event.source);
                        });
                        break;
                    case 2 /* FunctionResponse */:
                    case 5 /* ResolveResourcesResponse */:
                        // Get the operation associated with the message
                        var operation = _this._operations[message.id];
                        // Check the operation is for this host
                        if (!operation) {
                            Debug.warn("Could not find a matching operation for response with id: " + message.id);
                            return;
                        }
                        // Resolve the operation
                        if (message.response) {
                            if (message.response.type === "error") {
                                operation.reject(ExceptionSerialization_1.default.deserialize(message.response.error));
                            }
                            else {
                                operation.resolve(message.response.result);
                            }
                        }
                        else {
                            operation.resolve(message.response);
                        }
                        delete _this._operations[message.id];
                        break;
                    case 3 /* RegisterEvent */:
                        _this._host.onHostEvent(message.eventNamespace, function (hostEvent) {
                            message.event = hostEvent;
                            message.messageType = 0 /* Event */;
                            _this.sendMessage(message, event.source);
                        });
                        break;
                    case 4 /* ResolveResourcesCall */:
                        _this._host.resolveResources(message.resourceNamespace, message.args)
                            .then(function (resources) {
                            message.response = { type: "result", result: resources };
                        }, function (error) {
                            message.response = { type: "error", error: ExceptionSerialization_1.default.serialize(error) };
                        })
                            .then(function () {
                            message.messageType = 5 /* ResolveResourcesResponse */;
                            _this.sendMessage(message, event.source);
                        });
                        break;
                }
            };
            /**
             * Sends a post message to the given container.
             */
            this.sendMessage = function (message, container) {
                // Since IE9 doesn't de/serialize the objects sent using Post Message
                // we need to do it before sending the object.
                var messageString = JSON.stringify(message);
                // The post message system is not compatible with local files URL.
                // We send a broadcast message instead.
                container.postMessage(messageString, "*");
            };
            this._host = host;
            window.addEventListener("message", this.messageHandler);
            this.namespace = namespace;
            this.requirePath = requirePath;
        }
        return FrameProviderProxy;
    }());
    FrameProviderProxy._providerUrl = URITemplate("../Providers/index.html?requirePath={requirePath}&rand={rand}&parameters={parameters}");
    return FrameProviderProxy;
});

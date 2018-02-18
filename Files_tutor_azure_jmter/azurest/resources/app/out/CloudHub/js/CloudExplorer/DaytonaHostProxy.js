/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "../Common/Debug", "Common/Errors/ExceptionSerialization", "Common/Errors", "Common/LazyProperty", "Common/Utilities"], function (require, exports, rsvp, Debug, ExceptionSerialization_1, Errors, LazyProperty, Utilities) {
    "use strict";
    var Promise = rsvp.Promise;
    var environmentMarshallerName = "Environment";
    var reloadEventNameSpace = environmentMarshallerName + ".reload";
    /**
     * These are the environment actions that don't require being executed in the host.
     */
    var environmentClientActions = {
        saveSettings: function (settings) {
            // File creation options
            var options = {
                access: Microsoft.Plugin.Storage.FileAccess.readWrite,
                encoding: "UTF-8",
                mode: Microsoft.Plugin.Storage.FileMode.create,
                persistence: Microsoft.Plugin.Storage.FilePersistence.permanent,
                type: Microsoft.Plugin.Storage.FileType.text
            };
            // Create the file containing the settings
            // Daytona promises doesn't implement the standard promises methods.
            // We have to cast it to any to avoid compiling errors.
            return Microsoft.Plugin.Storage.openFile("CloudExplorer." + settings.namespace + ".json", options)
                .then(function (file) {
                try {
                    var data = JSON.stringify(settings.properties);
                    return file.write(data).then(function () { return file.close(); }, function () { return file.close(); });
                }
                catch (err) {
                    return file.close();
                }
            });
        },
        getSettings: function (namespace) {
            // File creation options
            var options = {
                access: Microsoft.Plugin.Storage.FileAccess.read,
                encoding: "UTF-8",
                mode: Microsoft.Plugin.Storage.FileMode.openOrCreate,
                persistence: Microsoft.Plugin.Storage.FilePersistence.permanent,
                type: Microsoft.Plugin.Storage.FileType.text
            };
            // Read the file containing the settings, if it doesn't exists create it.
            // Daytona promises doesn't implement the standard promises methods.
            // We have to cast it to any to avoid compiling errors.
            return Microsoft.Plugin.Storage.openFile("CloudExplorer." + namespace + ".json", options)
                .then(function (file) {
                return file.read()
                    .then(function (data) {
                    return file.close()
                        .then(function () { return !!data ? JSON.parse(data) : null; });
                }, function () { return file.close(); });
            });
        },
        themeImages: function () {
            // Daytona themes all of the images that have a data-plugin-theme-src attribute in the HTMLDocument
            Microsoft.Plugin.Theme._cssHelpers.processImages(window.document);
            return Promise.resolve();
        },
        getResourceStrings: function (alias, resourceIds) {
            var values = {};
            resourceIds.forEach(function (id) {
                var value = Microsoft.Plugin.Resources.getString("/" + alias + "/" + id);
                values[id] = value;
            });
            return Promise.resolve(values);
        },
        loadResourceFile: function (alias, path) {
            // Dev12 Daytona does not define loadResourceFile. For Dev12-hosted Cloud
            // Explorer, resources must be declared statically in the manifest
            if (Microsoft.Plugin.Resources.loadResourceFile && !Utilities.isRunningOnElectron()) {
                var resourceAlias = {
                    alias: alias,
                    path: path,
                    type: Microsoft.Plugin.Resources.ResourceType.resjson
                };
                return Microsoft.Plugin.Resources.loadResourceFile(resourceAlias)
                    .then(function () { return alias; });
            }
            else {
                return Promise.resolve(alias);
            }
        }
    };
    /**
     * Handles communication between a plugin and its Daytona host.
     */
    var DaytonaHostProxy = (function () {
        function DaytonaHostProxy() {
            var _this = this;
            /**
             * Gets the host process id calling the corresponding host marshaler port.
             */
            this._hostProcessId = new LazyProperty(function () {
                return _this.callMarshaler(_this._marshallers[environmentMarshallerName], "getHostProcessId", []);
            });
            /**
             * Executes the given operation on the host.
             */
            this.executeOperation = function (operationNamespace, args) {
                var marshallerInfo = _this.parseMarshallerNamespace(operationNamespace);
                if (!marshallerInfo) {
                    // TODO: Get rid of this.
                    // DaytonaHostProxy used to only support marshaller namespaces.  This allows it
                    // to handle provider namespaces. Change to only support only provider namespaces.
                    // It's not a marshaler namespace, so pass it through to the Cloud Explorer host's
                    // executeOperation for processing.
                    return _this.executeProviderOperation(operationNamespace, (args && args.length) ? args[0] : undefined);
                }
                // Check if the requested action is one of the client-side ones we defined in this class (e.g. _environmentClientActions),
                // that we can execute here rather than having to pass on to the host.
                var clientAction = marshallerInfo.marshaller[marshallerInfo.functionName];
                if (!!clientAction) {
                    return clientAction.apply(marshallerInfo.marshaller, args);
                }
                else {
                    return _this._hostProcessId.getValue()
                        .then(function (hostProcessId) {
                        // If we don't have hostProcessId, we shouldn't call allowSetForeground
                        if (hostProcessId) {
                            Microsoft.Plugin.Host.allowSetForeground(hostProcessId);
                        }
                        // Call the Daytona marshaller with the given action name and arguments
                        return _this.callMarshaler(marshallerInfo.marshaller, marshallerInfo.functionName, args);
                    });
                }
            };
            // This is confusing but used by external daytona plugins (tabs)
            this.executeProviderOperation = function (operationNamespace, args) {
                // The namespace should always refer to a provider, never a marshaler.
                Debug.assert(!Array.isArray(args), "Pass in an arguments object, not an array, to executeProviderOperation");
                return _this.executeOperationUnsafe("CloudExplorerProxy", "executeOperation", [operationNamespace, args]);
            };
            this.executeOperationUnsafe = function (marshalerName, functionName, args) {
                return _this.callMarshaler(_this._marshallers[marshalerName], functionName, args);
            };
            this.resolveResource = function (namespace, resourceId) {
                return _this.resolveResources(namespace, [resourceId])
                    .then(function (values) { return values[resourceId]; });
            };
            this.resolveResources = function (namespace, resourceIds) {
                return Promise.reject(new Errors.ResourceNamespaceNotFoundError(namespace));
            };
            /**
             * Calls the given callback when the event with the given name happens.
             */
            this.onHostEvent = function (eventNamespace, callback) {
                var marshallerNamespace = _this.parseMarshallerNamespace(eventNamespace.toString());
                marshallerNamespace.marshaller.addEventListener(marshallerNamespace.functionName, callback);
            };
            /**
             * Sends an initialization operation to the host to tell it the app is initialized.
             */
            this.sendInitializationMessage = function () {
                // Plugins that use Daytona don't need to notify that they are initialized.
            };
            /**
             * Find the marshaller that corresponds with the given operation namespace.
             * @returns `null` if it's not a marshaller namespace (i.e., not in the form "Marshaler.Function")
             */
            this.parseMarshallerNamespace = function (marshallerNamespace) {
                // Get the marshaller and function names from the marshaller namespace.
                // The marshaller namespace should be of the format:
                // {MarshallerName}.{FunctionName}
                var operationParts = marshallerNamespace ? marshallerNamespace.split(".") : [];
                // Check if the function name is well formed
                if (operationParts.length !== 2) {
                    return null;
                }
                // Gather marshaller information
                var marshallerName = operationParts[0];
                return {
                    marshaller: _this._marshallers[marshallerName],
                    functionName: operationParts[1]
                };
            };
            this._marshallers = {
                ActivityLog: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("ActivityLog", {}, true),
                Azure: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Azure", {}, true),
                AzureAD: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureAD", {}, true),
                AzureBlobs: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureBlobs", {}, true),
                AzureFiles: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureFiles", {}, true),
                AzureFabric: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureFabric", {}, true),
                AzureQueues: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureQueues", {}, true),
                AzureTables: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureTables", {}, true),
                UserAccounts: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("UserAccounts", {}, true),
                Environment: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject(environmentMarshallerName, environmentClientActions, true),
                // The telemetry marshaller might be initialized already and set to a global variable.
                // We do this when we want to use telemetry actions before requireJS is loaded.
                Telemetry: !!window.TelemetryMarshaler ?
                    window.TelemetryMarshaler :
                    Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Telemetry", {}, true),
                CloudExplorerProxy: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("CloudExplorerProxy", {}, true)
            };
            // Handle the environment reload event so that it refreshes the page
            this.onHostEvent(reloadEventNameSpace.toString(), function () {
                window.location.reload(true);
            });
        }
        DaytonaHostProxy.prototype.callMarshaler = function (marshaler, functionName, args) {
            // Ensure we receive the expected `Promise` implementation by wrapping the marshaler call in a new `Promise`.
            return new Promise(function (resolve, reject) {
                marshaler._call.apply(marshaler, [functionName].concat(args))
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
                    // A separate `then` for handling errors is needed.
                    reject(operationError);
                });
            });
        };
        return DaytonaHostProxy;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DaytonaHostProxy;
});

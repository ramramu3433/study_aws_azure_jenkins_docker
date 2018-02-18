/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "./Debug", "Common/Errors", "Common/LazyProperty", "Common/Utilities"], function (require, exports, rsvp, Debug, Errors, LazyProperty, Utilities) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Handles communication between a plugin and its Daytona host
     */
    var DaytonaHostProxy = (function () {
        function DaytonaHostProxy() {
            var _this = this;
            this._hostProcessId = new LazyProperty(function () {
                // Gets the host process id calling the corresponding
                // host marshaler port.
                return _this._marshallers[DaytonaHostProxy.environmentMarshallerName]._call("getHostProcessId");
            });
            /**
             * Executes the given operation on the host.
             */
            this.executeOperation = function (operationNamespace, args) {
                // Parse the operation namespace
                var marshallerInfo = _this.parseMarshallerNamespace(operationNamespace);
                if (!marshallerInfo) {
                    // TODO Get rid of this. DaytonaHostProxy used to only support marshaller namespaces.  This allows it
                    // to handle provider namespaces.  Change to only support only provider namespaces.
                    // It's not a marshaler namespace, so pass it through to the Cloud Explorer host's executeOperation for processing
                    marshallerInfo = _this.parseMarshallerNamespace("CloudExplorerProxy.executeOperation");
                    args = [operationNamespace, args];
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
                        return marshallerInfo.marshaller._call.apply(marshallerInfo.marshaller, [marshallerInfo.functionName].concat(args))
                            .then(null, function (operationError) {
                            // From daytona host errors we are only interested in the most
                            // inner ones.
                            var err = operationError;
                            while (err.source !== "Host" && err.innerError) {
                                err = err.innerError;
                            }
                            if (err.source === "Host") {
                                // Message is assumed to be a serialized object
                                err = JSON.parse(err.message);
                            }
                            else {
                                if (!err.name) {
                                    err.name = Errors.errorNames.HostOperationError;
                                }
                            }
                            // Add more info for easier debugging
                            err.proxy = {
                                name: _this.constructor.name,
                                operation: operationNamespace
                            };
                            Debug.warn(err);
                            throw err;
                        });
                    });
                }
            };
            this.executeProviderOperation = function (operationNamespace, args) {
                // The namespace should always refer to a provider, never a marshaler.
                Debug.assert(!Array.isArray(args), "Pass in an arguments object, not an array, to executeProviderOperation");
                return _this.executeOperation("CloudExplorerProxy.executeOperation", [operationNamespace, args]);
            };
            this.resolveResource = function (namespace, resourceId) {
                return _this.resolveResources(namespace, [resourceId]).then(function (values) { return values[resourceId]; });
            };
            this.resolveResources = function (namespace, resourceIds) { return Promise.reject(new Errors.ResourceNamespaceNotFoundError(namespace)); };
            /**
             * Calls the given callback when the event with the given name happens.
             */
            this.onHostEvent = function (eventNamespace, callback) {
                // Parse the event namespace
                var marshallerNamespace = _this.parseMarshallerNamespace(eventNamespace.toString());
                marshallerNamespace.marshaller.addEventListener(marshallerNamespace.functionName, callback);
            };
            /**
             * Sends an initialization operation to the host to tell it
             * the app is initialized.
             */
            this.sendInitializationMessage = function () {
                // Plugins that use Daytona host don't need to notify that they are initialized.
            };
            /**
             * Find the marshaller that corresponds with the given operation namespace.
             * @Returns null if it's not a marshaller namespace (i.e., not in the form "Marshaler.Function")
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
                AzureBlobs: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureBlobs", {}, true),
                AzureFiles: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureFiles", {}, true),
                AzureFabric: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureFabric", {}, true),
                AzureQueues: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureQueues", {}, true),
                AzureTables: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("AzureTables", {}, true),
                UserAccounts: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("UserAccounts", {}, true),
                Environment: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject(DaytonaHostProxy.environmentMarshallerName, DaytonaHostProxy._environmentClientActions, true),
                // The telemetry marshaller might be initialized already
                // and set to a global variable.
                // We do this when we want to use telemetry actions before
                // requireJS is loaded.
                Telemetry: !!window.TelemetryMarshaler ?
                    window.TelemetryMarshaler :
                    Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Telemetry", {}, true),
                CloudExplorerProxy: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("CloudExplorerProxy", {}, true)
            };
            // Handle the environment reload event so that it refreshes the page
            this.onHostEvent(DaytonaHostProxy.reloadEventNameSpace.toString(), function () {
                window.location.reload(true);
            });
        }
        return DaytonaHostProxy;
    }());
    DaytonaHostProxy.environmentMarshallerName = "Environment";
    DaytonaHostProxy.reloadEventNameSpace = DaytonaHostProxy.environmentMarshallerName + ".reload";
    // These are the environment actions that don't require
    // being executed in the host.
    DaytonaHostProxy._environmentClientActions = {
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
                    return file.write(data)
                        .then(function () { return file.close(); }, function () { return file.close(); });
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
    return DaytonaHostProxy;
});

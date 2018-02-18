/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "underscore", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureVirtualMachineV2Actions", "Providers/Azure/Loaders/AzureFabricAttributeLoader", "Providers/Azure/Loaders/AzureVirtualMachineScaleSetAttributeLoader", "Providers/Azure/Actions/AzureFabricActions", "Providers/Common/PollingWebRequestParameters", "Common/UIActions", "URIjs/URITemplate"], function (require, exports, rsvp, underscore, AzureConstants, AzureVirtualMachineV2Actions, AzureFabricAttributeLoader, AzureVirtualMachineScaleSetLoader, AzureFabricActions, PollingWebRequestParameters, UIActions, URITemplate) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Actions exposed by the Azure Cloud Explorer plugin.
     */
    var AzureVirtualMachineScaleSetActions = (function () {
        function AzureVirtualMachineScaleSetActions(azureConnection, host) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureVirtualMachineScaleSetActions.viewDiagnosticsNamespace, _this.viewDiagnostics);
                actionBindingManager.addActionBinding(AzureVirtualMachineScaleSetActions.enableDiagnosticsNamespace, _this.enableDiagnostics);
                actionBindingManager.addActionBinding(AzureVirtualMachineScaleSetActions.disableDiagnosticsNamespace, _this.disableDiagnostics);
                actionBindingManager.addActionBinding(AzureVirtualMachineScaleSetActions.updateDiagnosticsNamespace, _this.updateDiagnostics);
                actionBindingManager.addActionBinding(AzureVirtualMachineScaleSetActions.enableEtwListenerNamespace, _this.enableEtwListener);
                actionBindingManager.addActionBinding(AzureVirtualMachineScaleSetActions.disableEtwListenerNamespace, _this.disableEtwListener);
                actionBindingManager.addActionBinding(AzureVirtualMachineScaleSetActions.createEtwListenerWindowNamespace, _this.createEtwListenerWindow);
            };
            this.refreshNode = function (args) {
                var nodeQuery = [{ name: "id", value: args.id }];
                return Promise.all([
                    _this._uiActions.refreshNodeDynamicAttributes(nodeQuery, null),
                    _this._uiActions.refreshNodeChildren(nodeQuery)
                ]);
            };
            // TODO(yantang): This actions is currently set to invisible in the config.
            // It's because the API requires a specific virtual machine id, which is not suitable for VM scale set.
            this.viewDiagnostics = function (args) {
                // This action simply calls into the provider, which can be set at the config file directly.
                // However, we still leave the wrapper function here so it follows the same style as other actions.
                // Moreover, we may have more logic here, e.g., choose one VM from the VMSS to view its logs.
                return _this._host.executeOperation(AzureVirtualMachineScaleSetActions._viewDiagnosticsHostNamespace, [{
                        connectionString: args.diagnosticStorageAccountConnectionString,
                        instanceName: args.name,
                        publicConfig: args.diagnosticsExtensionSettings
                    }]);
            };
            this.enableDiagnostics = function (args) {
                var location = args.location;
                var subscription = JSON.parse(args.subscription);
                var url = AzureVirtualMachineScaleSetActions._resourceUriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: args.id,
                    apiVersion: args.apiVersion
                });
                return _this._host.executeOperation(AzureVirtualMachineScaleSetActions._getInitialDiagnosticsConfig, [{ instanceName: args.name }])
                    .then(function (diagnosticsConfig) {
                    if (diagnosticsConfig && diagnosticsConfig.publicConfig) {
                        var extensions = args.extensions ? args.extensions : [];
                        extensions.push({
                            name: AzureConstants.diagnosticsExtension.defaultName,
                            properties: {
                                publisher: AzureConstants.diagnosticsExtension.publisher,
                                type: AzureConstants.diagnosticsExtension.type,
                                typeHandlerVersion: "1.5",
                                autoUpgradeMinorVersion: true,
                                settings: JSON.parse(diagnosticsConfig.publicConfig),
                                protectedSettings: JSON.parse(diagnosticsConfig.privateConfig)
                            }
                        });
                        var configuration = _this.generateExtensionConfig(extensions, location);
                        var parameters = new PollingWebRequestParameters();
                        parameters.url = url.toString();
                        parameters.subscription = subscription;
                        parameters.method = "PUT";
                        parameters.body = JSON.stringify(configuration);
                        parameters.statusType = args.polling.statusType;
                        parameters.initialStatusText = args.polling.initialStatusType;
                        parameters.timeOutInSeconds = args.polling.timeOutInSeconds;
                        parameters.initialStatusText += args.upgradeMode.toLowerCase() !== "automatic"
                            ? " (" + AzureVirtualMachineScaleSetActions._manualUpgradeModeIndicationText + ")"
                            : "";
                        return _this._azureConnection.pollingWebRequest(parameters);
                    }
                    else {
                        // Configuration dialog was canceled.
                        return Promise.resolve();
                    }
                }).then(null, function (err) {
                    return Promise.reject(err);
                });
            };
            this.disableDiagnostics = function (args) {
                var location = args.location;
                var subscription = JSON.parse(args.subscription);
                var url = AzureVirtualMachineScaleSetActions._resourceUriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: args.id,
                    apiVersion: args.apiVersion
                });
                // Filter out the diagnostics configuration
                var extensions = args.extensions ? args.extensions : [];
                extensions = underscore.filter(extensions, function (extension) {
                    return extension.properties.publisher !== AzureConstants.diagnosticsExtension.publisher
                        || extension.properties.type !== AzureConstants.diagnosticsExtension.type;
                });
                var configuration = _this.generateExtensionConfig(extensions, location);
                var parameters = new PollingWebRequestParameters();
                parameters.url = url.toString();
                parameters.subscription = subscription;
                parameters.method = "PUT";
                parameters.body = JSON.stringify(configuration);
                parameters.statusType = args.polling.statusType;
                parameters.initialStatusText = args.polling.initialStatusType;
                parameters.timeOutInSeconds = args.polling.timeOutInSeconds;
                parameters.initialStatusText += args.upgradeMode.toLowerCase() !== "automatic"
                    ? " (" + AzureVirtualMachineScaleSetActions._manualUpgradeModeIndicationText + ")"
                    : "";
                return _this._azureConnection.pollingWebRequest(parameters);
            };
            this.updateDiagnostics = function (args) {
                var location = args.location;
                var subscription = JSON.parse(args.subscription);
                var url = AzureVirtualMachineScaleSetActions._resourceUriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: args.id,
                    apiVersion: args.apiVersion
                });
                return _this._host.executeOperation(AzureVirtualMachineScaleSetActions._updateDiagnosticsConfig, [{ instanceName: args.name, initialConfiguration: args.diagnosticsExtensionSettings }])
                    .then(function (diagnosticsConfig) {
                    if (diagnosticsConfig && diagnosticsConfig.publicConfig) {
                        var extensions = args.extensions ? args.extensions : [];
                        var diagnosticExtension = underscore.find(extensions, function (extension) {
                            return extension.properties.publisher === AzureConstants.diagnosticsExtension.publisher
                                && extension.properties.type === AzureConstants.diagnosticsExtension.type;
                        });
                        diagnosticExtension.properties.settings = JSON.parse(diagnosticsConfig.publicConfig);
                        diagnosticExtension.properties.protectedSettings = JSON.parse(diagnosticsConfig.privateConfig);
                        var configuration = _this.generateExtensionConfig(extensions, location);
                        var parameters = new PollingWebRequestParameters();
                        parameters.url = url.toString();
                        parameters.subscription = subscription;
                        parameters.method = "PUT";
                        parameters.body = JSON.stringify(configuration);
                        parameters.statusType = args.polling.statusType;
                        parameters.initialStatusText = args.polling.initialStatusType;
                        parameters.timeOutInSeconds = args.polling.timeOutInSeconds;
                        parameters.initialStatusText += args.upgradeMode.toLowerCase() !== "automatic"
                            ? " (" + AzureVirtualMachineScaleSetActions._manualUpgradeModeIndicationText + ")"
                            : "";
                        return _this._azureConnection.pollingWebRequest(parameters);
                    }
                    else {
                        // Configuration dialog was canceled.
                        return Promise.resolve();
                    }
                }).then(null, function (err) {
                    return Promise.reject(err);
                });
            };
            this.enableEtwListener = function (args) {
                return _this._executeRemoteAction(args, function (args) {
                    return _this._getCommonArgs(args)
                        .then(function (scaleSetsArgs) {
                        return _this._fabricAction.setupFeatureOnScaleSets(scaleSetsArgs, AzureFabricActions.defaultEtwListenerPorts, AzureFabricActions.etwListenerInboundNatPoolNamePrefix, _this._fabricAction.setupEtwListenerExtensionOnScaleSets.bind(_this._fabricAction));
                    });
                });
            };
            this.disableEtwListener = function (args) {
                return _this._executeRemoteAction(args, function (args) {
                    return _this._getCommonArgs(args)
                        .then(function (scaleSetsArgs) {
                        return _this._fabricAction.cleanupFeatureFromScaleSets(scaleSetsArgs, AzureFabricActions.defaultEtwListenerPorts, AzureVirtualMachineV2Actions.etwListenerExtension, _this._fabricAction.cleanupEtwListenerExtensionFromScaleSets.bind(_this._fabricAction));
                    });
                });
            };
            this.createEtwListenerWindow = function (args) {
                return _this._fabricAction.createEtwListenerWindow(args);
            };
            this.generateExtensionConfig = function (extensions, location) {
                return {
                    properties: {
                        virtualMachineProfile: {
                            extensionProfile: {
                                extensions: extensions
                            }
                        }
                    },
                    location: location
                };
            };
            // TODO(yantang): We currently do nothing more for manual upgrade mode, as it's doesn't appears to be reliable.
            // But leave these two functions as we may need it when figure out how to handle manual upgrade mode correctly.
            /* tslint:disable:no-unused-variable */
            this.checkVMsStatus = function (upgradeMode, subscription, scaleSetId, apiVersion) {
                // We don't allow user update VM scale set configuration if upgrade policy is manual and not all VMs are running.
                // Otherwise, it may enter into a bad state.
                if (upgradeMode.toLowerCase() === "automatic") {
                    return Promise.resolve();
                }
                else {
                    var url = AzureVirtualMachineScaleSetActions._scaleSetVMsInstanceViewUriTemplate.expand({
                        managementEndpoint: subscription.managementEndpoint,
                        resourceId: scaleSetId,
                        apiVersion: apiVersion
                    });
                    return _this._azureConnection.webRequest(url.toString(), subscription, "GET")
                        .then(function (response) {
                        var virtualMachines = JSON.parse(response).value;
                        var allVMRunning = underscore.every(virtualMachines, function (virtualMachine) {
                            var statuses = virtualMachine.properties.instanceView.statuses;
                            return underscore.any(statuses, function (status) {
                                var splitCode = status.code.split("/");
                                return splitCode.length > 1 && splitCode[0] === "PowerState" && splitCode[1].toLowerCase() === "running";
                            });
                        });
                        return allVMRunning
                            ? Promise.resolve()
                            : Promise.reject({
                                message: "Can't finish the operation. Upgrade policy is Manual, and not all VMs are running."
                            });
                    });
                }
            };
            this.manualUpgradeAllVMs = function (id, apiVersion, subscription, pollingParameters) {
                var url = AzureVirtualMachineScaleSetActions._manualUpgradeVMsUriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: id,
                    apiVersion: apiVersion
                });
                var requestBody = {
                    instanceIds: ["*"]
                };
                var parameters = new PollingWebRequestParameters();
                parameters.url = url.toString();
                parameters.subscription = subscription;
                parameters.method = "POST";
                parameters.body = JSON.stringify(requestBody);
                parameters.statusType = pollingParameters.statusType;
                parameters.initialStatusText = pollingParameters.initialStatusType;
                parameters.timeOutInSeconds = pollingParameters.timeOutInSeconds;
                return _this._azureConnection.pollingWebRequest(parameters);
            };
            // Wrapper for remote actions
            this._executeRemoteAction = function (args, action) {
                if (!args.id) {
                    return Promise.reject("id cannot be empty!");
                }
                if (AzureVirtualMachineScaleSetLoader.scaleSetIdToRemoteActionInProgress[args.id]) {
                    return Promise.reject("A remote action for this scale set has already started!");
                }
                // Ensure that no more than one setup operation is progressing at a time
                AzureVirtualMachineScaleSetLoader.scaleSetIdToRemoteActionInProgress[args.id] = true;
                _this._uiActions.refreshNodeDynamicAttributes([{ name: "id", value: args.id }], args.affectedAttributes);
                return action(args)
                    .then(function () {
                    AzureVirtualMachineScaleSetLoader.scaleSetIdToRemoteActionInProgress[args.id] = false;
                    _this.refreshNode(args);
                    return Promise.resolve(true);
                }, function (error) {
                    AzureVirtualMachineScaleSetLoader.scaleSetIdToRemoteActionInProgress[args.id] = false;
                    _this.refreshNode(args);
                    return Promise.reject(error);
                });
            };
            // Convert a VM scale set args to common fabric actions args
            this._getCommonArgs = function (args) {
                var subscriptionString = args.subscription;
                args.subscription = JSON.parse(subscriptionString);
                var resource = args;
                return _this._fabricAttributeLoader.getScaleSetArgs(resource, subscriptionString, args.apiVersion)
                    .then(function (scaleSetArgs) {
                    return {
                        id: args.id,
                        subscription: subscriptionString,
                        apiVersion: args.apiVersion,
                        scaleSetName: args.name,
                        sku: args.sku,
                        scaleSets: [scaleSetArgs]
                    };
                });
            };
            this._azureConnection = azureConnection;
            this._host = host;
            this._fabricAttributeLoader = new AzureFabricAttributeLoader(azureConnection, host);
            this._fabricAction = new AzureFabricActions(azureConnection, host);
            this._uiActions = new UIActions(host);
        }
        return AzureVirtualMachineScaleSetActions;
    }());
    AzureVirtualMachineScaleSetActions.viewDiagnosticsNamespace = "Azure.Actions.VirtualMachineScaleSet.viewDiagnostics";
    AzureVirtualMachineScaleSetActions.enableDiagnosticsNamespace = "Azure.Actions.VirtualMachineScaleSet.enableDiagnostics";
    AzureVirtualMachineScaleSetActions.disableDiagnosticsNamespace = "Azure.Actions.VirtualMachineScaleSet.disableDiagnostics";
    AzureVirtualMachineScaleSetActions.updateDiagnosticsNamespace = "Azure.Actions.VirtualMachineScaleSet.updateDiagnostics";
    AzureVirtualMachineScaleSetActions.enableEtwListenerNamespace = "Azure.Actions.VirtualMachineScaleSet.enableEtwListener";
    AzureVirtualMachineScaleSetActions.disableEtwListenerNamespace = "Azure.Actions.VirtualMachineScaleSet.disableEtwListener";
    AzureVirtualMachineScaleSetActions.createEtwListenerWindowNamespace = "Azure.Actions.VirtualMachineScaleSet.createEtwListenerWindow";
    AzureVirtualMachineScaleSetActions._viewDiagnosticsHostNamespace = "Azure.Actions.DiagnosticsExtension.viewDiagnostics";
    AzureVirtualMachineScaleSetActions._getInitialDiagnosticsConfig = "Azure.Actions.DiagnosticsExtension.getInitialDiagnosticsConfig";
    AzureVirtualMachineScaleSetActions._updateDiagnosticsConfig = "Azure.Actions.DiagnosticsExtension.updateDiagnosticsConfig";
    AzureVirtualMachineScaleSetActions._resourceUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/?api-version={+apiVersion}");
    AzureVirtualMachineScaleSetActions._scaleSetVMsInstanceViewUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/virtualMachines?api-version={+apiVersion}&$expand=instanceView&$select=instanceView");
    AzureVirtualMachineScaleSetActions._manualUpgradeVMsUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/manualUpgrade?api-version={+apiVersion}");
    AzureVirtualMachineScaleSetActions._manualUpgradeModeIndicationText = "Current upgrade mode is Manual."
        + " You need to trigger manualUpgrade for single VMs to take effect.";
    return AzureVirtualMachineScaleSetActions;
});

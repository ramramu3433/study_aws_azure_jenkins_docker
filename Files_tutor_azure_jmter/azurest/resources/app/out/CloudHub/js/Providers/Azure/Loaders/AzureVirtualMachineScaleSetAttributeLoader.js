/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "underscore", "URIjs/URITemplate", "Providers/Azure/Loaders/AttributeLoaderHelper", "Providers/Azure/Producers/AzureResourceProducer", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureVirtualMachineV2Actions"], function (require, exports, rsvp, underscore, URITemplate, AttributeLoaderHelper, AzureResourceProducer, AzureConstants, AzureVirtualMachineV2Actions) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return Azure Resource entities.
     */
    var AzureVirtualMachineScaleSetAttributeLoader = (function () {
        function AzureVirtualMachineScaleSetAttributeLoader(azureConnection, host) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureVirtualMachineScaleSetAttributeLoader.getAllAttributesNamespace, _this.getAllAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureVirtualMachineScaleSetAttributeLoader.getStateAttributesNamespace, _this.getStateAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureVirtualMachineScaleSetAttributeLoader.getVirtualMachineAttributesNamespace, _this.getVirtualMachineAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureVirtualMachineScaleSetAttributeLoader.getIsRemoteActionInProgressNamespace, _this.getIsRemoteActionInProgressAttribute);
                loaderBindingManger.addAttributeLoaderBinding(AzureVirtualMachineScaleSetAttributeLoader.getEtwStateAttributesNamespace, _this.getEtwStateAttributes);
            };
            this.getAllAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args).then(function (response) {
                    var scaleSet = AzureResourceProducer.addResourceContext(response, args.subscription);
                    var secrets = scaleSet.properties.virtualMachineProfile.osProfile.secrets;
                    var extensionProfile = scaleSet.properties.virtualMachineProfile.extensionProfile;
                    var extensions = extensionProfile ? extensionProfile.extensions : [];
                    var diagnosticsExtension = underscore.find(extensions, function (extension) {
                        return extension.properties.publisher === AzureConstants.diagnosticsExtension.publisher
                            && extension.properties.type === AzureConstants.diagnosticsExtension.type;
                    });
                    var etwExtension = underscore.find(extensions, function (e) { return e.properties.publisher === AzureConstants.ServiceFabric.EtwListenerExtensionPublisher
                        && e.properties.type === AzureConstants.ServiceFabric.EtwListenerExtensionType; });
                    var debuggerExtension = underscore.find(extensions, function (e) { return e.properties.publisher === AzureConstants.RemoteDebugging.RemoteDebuggingExtensionPublisher
                        && e.properties.type === AzureConstants.RemoteDebugging.RemoteDebuggingExtensionType; });
                    var diagnosticsSettings = null;
                    var diagnosticsStorageAccountName = null;
                    var etwListenerExtensionName = null;
                    var etwListenerExtensionVersion = null;
                    var etwEncryptionKey = null;
                    var etwEncryptionIV = null;
                    var debuggerExtensionName = null;
                    var debuggerExtensionVersion = null;
                    var debuggerClientThumbprint = null;
                    var debuggerServerThumbprint = null;
                    if (diagnosticsExtension) {
                        diagnosticsSettings = JSON.stringify(diagnosticsExtension.properties.settings);
                        for (var prop in diagnosticsExtension.properties.settings) {
                            // They don't have an enforced/consistent naming convention for property settings.
                            if (prop.toLowerCase() === "storageaccount") {
                                diagnosticsStorageAccountName = diagnosticsExtension.properties.settings[prop];
                                break;
                            }
                        }
                    }
                    if (etwExtension) {
                        etwListenerExtensionName = etwExtension.name;
                        etwListenerExtensionVersion = etwExtension.properties.typeHandlerVersion;
                        var encryptionInfo = etwExtension.properties.settings.EtwEncryptionKey;
                        if (encryptionInfo !== undefined) {
                            etwEncryptionKey = encryptionInfo.Key;
                            etwEncryptionIV = encryptionInfo.IV;
                        }
                    }
                    if (debuggerExtension) {
                        debuggerExtensionName = debuggerExtension.name;
                        debuggerExtensionVersion = debuggerExtension.properties.typeHandlerVersion;
                        debuggerClientThumbprint = debuggerExtension.properties.settings.clientThumbprint;
                        debuggerServerThumbprint = debuggerExtension.properties.settings.serverThumbprint;
                    }
                    var subscription = JSON.parse(args.subscription);
                    var loadBalancerIds = _this._extractLoadBalancerIds(scaleSet, subscription.id, scaleSet.resourceGroup);
                    var subnetIds = _this._extractSubnetIds(scaleSet, subscription.id, scaleSet.resourceGroup);
                    var expiration = Date.now() + 1000;
                    var attributes = [
                        {
                            name: "extensions",
                            value: extensions,
                            expiration: expiration
                        },
                        {
                            name: "hasDiagnosticsExtension",
                            value: !!diagnosticsExtension,
                            expiration: expiration
                        },
                        {
                            name: "diagnosticsExtensionSettings",
                            value: diagnosticsSettings,
                            expiration: expiration
                        },
                        {
                            name: "diagnosticsStorageAccountName",
                            value: diagnosticsStorageAccountName,
                            expiration: expiration
                        },
                        {
                            name: "etwListenerExtensionName",
                            value: etwListenerExtensionName,
                            expiration: expiration
                        },
                        {
                            name: "etwListenerExtensionVersion",
                            value: etwListenerExtensionVersion,
                            expiration: expiration
                        },
                        {
                            name: "etwEncryptionKey",
                            value: etwEncryptionKey,
                            expiration: expiration
                        },
                        {
                            name: "etwEncryptionIV",
                            value: etwEncryptionIV,
                            expiration: expiration
                        },
                        {
                            name: "debuggerExtensionName",
                            value: debuggerExtensionName,
                            expiration: expiration
                        },
                        {
                            name: "debuggerExtensionVersion",
                            value: debuggerExtensionVersion,
                            expiration: expiration
                        },
                        {
                            name: "debuggerClientThumbprint",
                            value: debuggerClientThumbprint,
                            expiration: expiration
                        },
                        {
                            name: "debuggerServerThumbprint",
                            value: debuggerServerThumbprint,
                            expiration: expiration
                        },
                        {
                            name: "loadBalancerIds",
                            value: loadBalancerIds,
                            expiration: expiration
                        },
                        {
                            name: "subnetIds",
                            value: subnetIds,
                            expiration: expiration
                        },
                        {
                            name: "upgradeMode",
                            value: scaleSet.properties.upgradePolicy.mode,
                            expiration: expiration
                        },
                        {
                            name: "provisioningState",
                            value: scaleSet.properties.provisioningState,
                            expiration: expiration
                        },
                        {
                            name: "networkProfile",
                            value: response.properties.virtualMachineProfile.networkProfile,
                            expiration: expiration
                        },
                        {
                            name: "secrets",
                            value: secrets,
                            expiration: expiration
                        }
                    ];
                    return _this._host.executeOperation(AzureVirtualMachineV2Actions.getEtwListenerVMExtVersionNamespace)
                        .then(function (targetVersion) {
                        // set hasEtwListenerExtension attribute
                        attributes.push({
                            name: "hasEtwListenerExtension",
                            value: targetVersion === etwListenerExtensionVersion,
                            expiration: expiration
                        });
                        return { results: attributes };
                    });
                });
            };
            this.getStateAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AzureVirtualMachineScaleSetAttributeLoader._scaleSetInstanceViewUriTemplate, args)
                    .then(function (resource) {
                    var isUpdating = false;
                    resource.statuses.forEach(function (status) {
                        var splitCode = status.code.split("/");
                        if (splitCode.length > 1) {
                            var state = splitCode[1].toLowerCase();
                            if (splitCode[0] === "ProvisioningState" && state !== "succeeded" && state !== "failed") {
                                isUpdating = true;
                            }
                        }
                    });
                    var expiration = Date.now() + 1000;
                    var attributes = [
                        {
                            name: "updating",
                            value: isUpdating,
                            expiration: expiration
                        }
                    ];
                    return { results: attributes };
                });
            };
            this.getVirtualMachineAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AzureVirtualMachineScaleSetAttributeLoader._scaleSetVirtualMachinesUriTemplate, args)
                    .then(function (response) {
                    var virtualMachines = response.value;
                    var isWindows = underscore.every(virtualMachines, function (virtualMachine) {
                        return virtualMachine.properties.storageProfile.osDisk.osType.toLowerCase() === "windows";
                    });
                    var attributes = [
                        {
                            name: "hasWindowsOS",
                            value: isWindows,
                            expiration: Date.now() + 10000
                        }
                    ];
                    return { results: attributes };
                });
            };
            this.getIsRemoteActionInProgressAttribute = function (args) {
                var isRemoteActionInProgress = false;
                if (AzureVirtualMachineScaleSetAttributeLoader.scaleSetIdToRemoteActionInProgress[args.id]) {
                    isRemoteActionInProgress = true;
                }
                return Promise.resolve({
                    results: [{ name: "isRemoteActionInProgress", value: isRemoteActionInProgress }]
                });
            };
            this.getEtwStateAttributes = function (args) {
                var loadBalancerIds = [];
                if (args.loadBalancerIds != null) {
                    loadBalancerIds = args.loadBalancerIds;
                }
                return Promise.all(loadBalancerIds.map(function (loadBalancerId) {
                    var loadBalancerLoadArgs = {
                        subscription: args.subscription,
                        id: loadBalancerId,
                        apiVersion: args.apiVersion
                    };
                    return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, loadBalancerLoadArgs).then(function (response) {
                        return AzureResourceProducer.addResourceContext(response, args.subscription);
                    });
                })).then(function (loadBalancers) {
                    var hasEtwInboundNatPools = loadBalancers.some(function (loadBalancer) {
                        return loadBalancer.properties.inboundNatPools != null && loadBalancer.properties.inboundNatPools.some(function (np) {
                            return np.properties.backendPort === AzureVirtualMachineV2Actions.defaultEtwListenerPorts.etwListenerPort;
                        });
                    });
                    return {
                        results: [{ name: "hasEtwInboundNatPools", value: hasEtwInboundNatPools }]
                    };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
            this._host = host;
        }
        AzureVirtualMachineScaleSetAttributeLoader.prototype._extractIpConfigurationProperties = function (scaleSet, subscriptionId, resourceGroup, extractor) {
            var retval = [];
            var nicConfigurations = scaleSet.properties.virtualMachineProfile.networkProfile.networkInterfaceConfigurations;
            if (!nicConfigurations) {
                return retval;
            }
            nicConfigurations.forEach(function (nicConfiguration) {
                var ipConfigurations = nicConfiguration.properties.ipConfigurations;
                if (ipConfigurations) {
                    ipConfigurations.forEach(function (ipConfiguration) {
                        var values = extractor(ipConfiguration);
                        if (values) {
                            retval = retval.concat(values);
                        }
                    });
                }
            });
            return underscore.uniq(retval);
        };
        AzureVirtualMachineScaleSetAttributeLoader.prototype._extractLoadBalancerIds = function (scaleSet, subscriptionId, resourceGroup) {
            var loadBalancerRegex = new RegExp("/subscriptions/" + subscriptionId + "/resourceGroups/" + resourceGroup + "/providers/Microsoft.Network/loadBalancers/[^/]+", "i");
            return this._extractIpConfigurationProperties(scaleSet, subscriptionId, resourceGroup, function (ipConfiguration) {
                var lbbaPools = ipConfiguration.properties.loadBalancerBackendAddressPools;
                if (lbbaPools) {
                    var loadBalancerIds = lbbaPools.map(function (lbbaPool) {
                        var match = loadBalancerRegex.exec(lbbaPool.id);
                        if (match) {
                            return match[0];
                        }
                        else {
                            return null;
                        }
                    });
                    return loadBalancerIds.filter(function (id) { return !!id; });
                }
                return null;
            });
        };
        AzureVirtualMachineScaleSetAttributeLoader.prototype._extractSubnetIds = function (scaleSet, subscriptionId, resourceGroup) {
            return this._extractIpConfigurationProperties(scaleSet, subscriptionId, resourceGroup, function (ipConfiguration) {
                var subnetId = ipConfiguration.properties.subnet.id;
                return [subnetId];
            });
        };
        return AzureVirtualMachineScaleSetAttributeLoader;
    }());
    AzureVirtualMachineScaleSetAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.VirtualMachineScaleSet.GetAllAttributes";
    AzureVirtualMachineScaleSetAttributeLoader.getStateAttributesNamespace = "Azure.Attributes.VirtualMachineScaleSet.GetStateAttributes";
    AzureVirtualMachineScaleSetAttributeLoader.getVirtualMachineAttributesNamespace = "Azure.Attributes.VirtualMachineScaleSet.GetVirtualMachineAttributes";
    AzureVirtualMachineScaleSetAttributeLoader.getIsRemoteActionInProgressNamespace = "Azure.Attributes.VirtualMachineScaleSet.GetIsRemoteActionInProgress";
    AzureVirtualMachineScaleSetAttributeLoader.getEtwStateAttributesNamespace = "Azure.Attributes.VirtualMachineScaleSet.GetEtwStateAttributes";
    AzureVirtualMachineScaleSetAttributeLoader._scaleSetInstanceViewUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/instanceView?api-version={+apiVersion}");
    AzureVirtualMachineScaleSetAttributeLoader._scaleSetVirtualMachinesUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/VirtualMachines?api-version={+apiVersion}");
    AzureVirtualMachineScaleSetAttributeLoader.scaleSetIdToRemoteActionInProgress = {};
    return AzureVirtualMachineScaleSetAttributeLoader;
});

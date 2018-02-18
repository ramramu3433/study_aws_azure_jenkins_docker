/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "underscore", "Providers/Common/AzureConstants", "Providers/Azure/Producers/AzureResourceProducer", "Providers/Azure/Actions/AzureVirtualMachineV2Actions", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Providers/Azure/Loaders/AttributeLoaderHelper", "Providers/Common/PollingWebRequestParameters", "Providers/Azure/Resources/AzureResources", "Common/UIActions", "URIjs/URI"], function (require, exports, rsvp, underscore, AzureConstants, AzureResourceProducer, AzureVirtualMachineV2Actions, CloudExplorerActions, AttributeLoaderHelper, PollingWebRequestParameters, AzureResources, UIActions, URI) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Actions exposed by the Azure Cloud Explorer plugin.
     */
    var AzureFabricActions = (function () {
        function AzureFabricActions(azureConnection, host) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureFabricActions.refreshNode, _this.refreshNode);
                actionBindingManager.addActionBinding(AzureFabricActions.openExplorer, _this.openExplorer);
                actionBindingManager.addActionBinding(AzureFabricActions.activateNode, _this.activateNode);
                actionBindingManager.addActionBinding(AzureFabricActions.deactivateNode, _this.deactivateNode);
                actionBindingManager.addActionBinding(AzureFabricActions.unprovisionApplicationType, _this.unprovisionApplicationType);
                actionBindingManager.addActionBinding(AzureFabricActions.deleteApplication, _this.deleteApplication);
                actionBindingManager.addActionBinding(AzureFabricActions.deleteService, _this.deleteService);
                actionBindingManager.addActionBinding(AzureFabricActions.createEtwListenerWindow, _this.createEtwListenerWindow);
                actionBindingManager.addActionBinding(AzureFabricActions.enableDebuggingNamespace, _this.enableDebugging);
                actionBindingManager.addActionBinding(AzureFabricActions.attachDebuggerNamespace, _this.attachDebugger);
                actionBindingManager.addActionBinding(AzureFabricActions.disableDebuggingNamespace, _this.disableDebugging);
                actionBindingManager.addActionBinding(AzureFabricActions.enableEtwListenerNamespace, _this.enableEtwListener);
                actionBindingManager.addActionBinding(AzureFabricActions.disableEtwListenerNamespace, _this.disableEtwListener);
            };
            this.refreshNode = function (args) {
                var nodeQuery = [{ name: "id", value: args.id }];
                return Promise.all([
                    _this._uiActions.refreshNodeDynamicAttributes(nodeQuery, null),
                    _this._uiActions.refreshNodeChildren(nodeQuery)
                ]);
            };
            this.openExplorer = function (args) {
                return _this._uiActions.getTheme().then(function (theme) {
                    var explorerUrl = URI(args.managementEndpoint);
                    explorerUrl.path("Explorer/#/");
                    explorerUrl.query({
                        theme_source: "vs",
                        theme_name: theme
                    });
                    var url = URI.decode(explorerUrl.toString());
                    return _this._host.executeOperation(CloudExplorerActions.openUrlNamespace, [{ url: url }]);
                });
            };
            this.activateNode = function (args) {
                return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.ConfirmActivate").then(function (confirmMessageFormat) {
                    var message = underscore.string.sprintf(confirmMessageFormat, args.name);
                    return _this._host.executeOperation(AzureFabricActions._promptYesNoNamespace, [{ message: message, iconType: "query" }])
                        .then(function (res) {
                        if (res) {
                            return _this._host.executeOperation(AzureFabricActions._activateNodeHostNamespace, [args.name, args.apiServiceId])
                                .then(function () { return _this._refreshNodeStatus(args.id, "Up"); });
                        }
                    });
                });
            };
            this.deactivateNode = function (args) {
                return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.ConfirmDeactivate").then(function (confirmMessageFormat) {
                    var message = underscore.string.sprintf(confirmMessageFormat, args.name);
                    return _this._host.executeOperation(AzureFabricActions._promptYesNoNamespace, [{ message: message, iconType: "query" }])
                        .then(function (res) {
                        if (res) {
                            return _this._host.executeOperation(AzureFabricActions._deactivateNodeHostNamespace, [args.name, args.apiServiceId])
                                .then(function () { return _this._refreshNodeStatus(args.id, "Disabled"); });
                        }
                    });
                });
            };
            this._refreshNodeStatus = function (nodeId, expectedStatus) {
                var refreshCount = 0;
                var initialDelay = 1000;
                var escalationFactor = 1.1;
                var maxUpdateDurationMin = 3;
                var latestUpdateTime = Date.now() + maxUpdateDurationMin * 60000;
                var refresh = function () {
                    _this._uiActions.refreshNodeDynamicAttributes([{ name: "id", value: nodeId }], ["statusProperty", "statusLabel"]).then(function (attributes) {
                        // Expecting one node and one attribute to get refreshed
                        var refreshAgain = true;
                        if (attributes.length >= 1 || attributes[0].length >= 1 || attributes[0][0].name === "statusProperty") {
                            var status = attributes[0][0].value;
                            if (status === expectedStatus || Date.now() > latestUpdateTime) {
                                refreshAgain = false;
                            }
                        }
                        if (refreshAgain) {
                            var timeout = initialDelay * Math.pow(escalationFactor, refreshCount);
                            setTimeout(refresh, timeout);
                        }
                        refreshCount++;
                    });
                };
                refresh();
            };
            this.unprovisionApplicationType = function (args) {
                return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.ConfirmUnprovision").then(function (confirmMessageFormat) {
                    return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.UnprovisionApplicationType").then(function (title) {
                        return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.Unprovision").then(function (actionName) {
                            var message = underscore.string.sprintf(confirmMessageFormat, args.name, args.version, args.clusterName);
                            _this._confirmAction(args.isLocal, message, title, actionName, args.name).then(function (res) {
                                if (res) {
                                    return _this._host.executeOperation(AzureFabricActions._unprovisionApplicationTypeHostNamespace, [args.name, args.version, args.apiServiceId]).then(function () {
                                        _this.refreshNode({ id: args.parentId });
                                    }, function () {
                                        _this.refreshNode({ id: args.parentId });
                                    });
                                }
                            });
                        });
                    });
                });
            };
            this.deleteApplication = function (args) {
                return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.ConfirmDeleteApplication").then(function (confirmMessageFormat) {
                    return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.DeleteApplication").then(function (title) {
                        return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.Delete").then(function (actionName) {
                            var message = underscore.string.sprintf(confirmMessageFormat, args.name, args.clusterName);
                            _this._confirmAction(args.isLocal, message, title, actionName, args.name).then(function (res) {
                                if (res) {
                                    return _this._host.executeOperation(AzureFabricActions._deleteApplicationHostNamespace, [args.applicationId, args.name, args.apiServiceId]).then(function () {
                                        _this.refreshNode({ id: args.parentId });
                                    }, function () {
                                        _this.refreshNode({ id: args.parentId });
                                    });
                                }
                            });
                        });
                    });
                });
            };
            this.deleteService = function (args) {
                return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.ConfirmDeleteService").then(function (confirmMessageFormat) {
                    return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.DeleteService").then(function (title) {
                        return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.Delete").then(function (actionName) {
                            var message = underscore.string.sprintf(confirmMessageFormat, args.name, args.clusterName);
                            _this._confirmAction(args.isLocal, message, title, actionName, args.name).then(function (res) {
                                if (res) {
                                    return _this._host.executeOperation(AzureFabricActions._deleteServiceHostNamespace, [args.applicationId, args.serviceId, args.name, args.apiServiceId]).then(function () {
                                        _this.refreshNode({ id: args.parentId });
                                    }, function () {
                                        _this.refreshNode({ id: args.parentId });
                                    });
                                }
                            });
                        });
                    });
                });
            };
            this.createEtwListenerWindow = function (args) {
                var subscriptionId = null;
                if (args.subscription != null) {
                    var subscriptionString = args.subscription;
                    var subscription = JSON.parse(subscriptionString);
                    subscriptionId = subscription.id;
                }
                var clusterName = "*";
                if (args.clusterName !== undefined && clusterName !== "") {
                    clusterName = args.clusterName;
                }
                else if (args.name !== undefined && args.name !== "") {
                    clusterName = args.name;
                }
                var etwListenerInfo = {
                    Filter: args.diagnosticsFilter,
                    Title: clusterName + (args.nodeName ? " - " + args.nodeName : ""),
                    IPAddress: args.ipAddress,
                    Port: args.port,
                    EncryptionKey: args.encryptionKey,
                    EncryptionIV: args.encryptionIV,
                    SubscriptionId: subscriptionId,
                    IsLocal: args.isLocal
                };
                return _this._host.executeOperation(AzureFabricActions._createEtwListenerWindowHostNamespace, [etwListenerInfo]);
            };
            this.enableDebugging = function (args) {
                if (args.scaleSets && args.scaleSets.length > 0) {
                    return _this._executeRemoteAction(args, function (args) {
                        return _this.setupFeatureOnScaleSets(args, AzureVirtualMachineV2Actions.defaultDebuggingPorts, AzureFabricActions._etwDebuggerInboundNatPoolNamePrefix, _this._setupDebuggerExtension);
                    });
                }
            };
            this.disableDebugging = function (args) {
                if (args.scaleSets && args.scaleSets.length > 0) {
                    return _this._executeRemoteAction(args, function (args) {
                        return _this.cleanupFeatureFromScaleSets(args, AzureVirtualMachineV2Actions.defaultDebuggingPorts, AzureVirtualMachineV2Actions.debuggingExtension, _this._cleanupDebuggingExtension);
                    });
                }
            };
            this.attachDebugger = function (args) {
                var scaleSets = args.scaleSets;
                var debuggees = [];
                var subscriptionId = null;
                if (args.subscription != null) {
                    var subscriptionString = args.subscription;
                    var subscription = JSON.parse(subscriptionString);
                    subscriptionId = subscription.id;
                }
                scaleSets.forEach(function (scaleSet) {
                    // debugging extension present
                    if (scaleSet.debuggingExtension.name) {
                        var clientThumbprint = scaleSet.debuggingExtension.properties.settings.clientThumbprint;
                        var serverThumbprint = scaleSet.debuggingExtension.properties.settings.serverThumbprint;
                        var VMs = scaleSet.vms;
                        VMs.forEach(function (vm) {
                            if (vm.debuggerPorts) {
                                var actionArgs = {
                                    instanceMachineName: vm.name,
                                    dnsName: args.clusterName,
                                    hostName: vm.publicIPAddress,
                                    clientCertificateThumbprint: clientThumbprint,
                                    serverCertificateThumbprint: serverThumbprint,
                                    connectorPort: vm.debuggerPorts.connectorPort,
                                    forwarderPort: vm.debuggerPorts.forwarderPort,
                                    forwarderx86Port: vm.debuggerPorts.forwarderPortx86,
                                    fileUploaderPort: vm.debuggerPorts.fileUploadPort
                                };
                                debuggees.push(actionArgs);
                            }
                        });
                    }
                });
                if (debuggees.length > 0) {
                    var debuggerServiceInfo = {
                        subscriptionId: subscriptionId,
                        apiServiceId: args.apiServiceId,
                        applicationId: args.applicationId,
                        applicationTypeName: args.applicationTypeName,
                        applicationTypeVersion: args.applicationTypeVersion,
                        serviceTypeName: args.serviceTypeName
                    };
                    return _this._host.executeOperation(AzureFabricActions._attachDebuggerHostNamespace, [debuggerServiceInfo, debuggees]);
                }
                else {
                    return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.DebuggingNotEnabled").then(function (errorMessage) {
                        return Promise.reject(new Error(errorMessage));
                    });
                }
            };
            this.enableEtwListener = function (args) {
                return _this._executeRemoteAction(args, function (args) {
                    if (args.scaleSets && args.scaleSets.length > 0) {
                        return _this.setupFeatureOnScaleSets(args, AzureFabricActions.defaultEtwListenerPorts, AzureFabricActions.etwListenerInboundNatPoolNamePrefix, _this.setupEtwListenerExtensionOnScaleSets);
                    }
                    else {
                        return _this._setupFeature(args, AzureFabricActions.defaultEtwListenerPorts, _this._setupEtwListenerExtension);
                    }
                });
            };
            this.disableEtwListener = function (args) {
                return _this._executeRemoteAction(args, function (args) {
                    if (args.scaleSets && args.scaleSets.length > 0) {
                        return _this.cleanupFeatureFromScaleSets(args, AzureFabricActions.defaultEtwListenerPorts, AzureVirtualMachineV2Actions.etwListenerExtension, _this.cleanupEtwListenerExtensionFromScaleSets);
                    }
                    else {
                        return _this._cleanupFeature(args, AzureFabricActions.defaultEtwListenerPorts, AzureVirtualMachineV2Actions.etwListenerExtension, _this._cleanupEtwListenerExtension);
                    }
                });
            };
            this.getLoadBalancers = function (scaleSets, apiVersion) {
                if (!scaleSets || scaleSets.length === 0) {
                    return Promise.resolve([]);
                }
                var uniqueLoadBalancerDescriptors = underscore.uniq(underscore.compact(underscore.flatten(scaleSets.map(function (scaleSet) { return scaleSet.loadBalancerIds
                    ? scaleSet.loadBalancerIds.map(function (id) { return id ? { loadBalancerId: id, scaleSetConsumer: scaleSet } : null; })
                    : []; }))), function (lbDescriptor) { return lbDescriptor.loadBalancerId; });
                var promises = uniqueLoadBalancerDescriptors.map(function (descriptor) {
                    var loadBalancerLoadArgs = {
                        subscription: JSON.stringify(descriptor.scaleSetConsumer.subscription),
                        id: descriptor.loadBalancerId,
                        apiVersion: apiVersion
                    };
                    return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, loadBalancerLoadArgs).then(function (response) {
                        var loadBalancer = AzureResourceProducer.addResourceContext(response, descriptor.scaleSetConsumer.subscription);
                        loadBalancer.scaleSetConsumer = descriptor.scaleSetConsumer;
                        return loadBalancer;
                    });
                });
                return Promise.all(promises);
            };
            this._confirmAction = function (isLocal, message, title, actionName, verificationText) {
                if (isLocal) {
                    return _this._host.executeOperation(AzureFabricActions._promptYesNoNamespace, [{
                            message: message,
                            iconType: "query"
                        }]).then(function (res) {
                        return res;
                    });
                }
                else {
                    return _this._host.executeOperation(AzureFabricActions._promptConfirmActionNamespace, [{
                            title: title,
                            message: message,
                            actionName: actionName,
                            verificationText: verificationText
                        }]).then(function (res) {
                        return res;
                    });
                }
            };
            this._setupFeature = function (args, portMap, installExtensionCallback) {
                var subscriptionString = args.subscription;
                var subscription = JSON.parse(subscriptionString);
                // Update Network Security Groups:
                // since many VMs likely share a security group, create a unified list of network security groups to update
                var networkSecurityGroups = _this._collectNetworkSecurityGroups(args.vms);
                var networkSecurityGroupUpdates = _this._updateNetworkSecurityGroups(networkSecurityGroups, portMap, args, subscription, args.apiVersion);
                // Update LoadBalancers:
                // create unified list of loadBalancers
                // Many VMs may share a loadbalancer, but we only want to update each LB once, with the union of all the needed changes.
                var loadBalancedVMs = underscore.filter(args.vms, function (vm) {
                    return !!vm.loadBalancer;
                });
                var loadBalancers = _this._collectLoadBalancers(loadBalancedVMs);
                var loadBalancerUpdates = _this._updateLoadBalancers(args, loadBalancers, loadBalancedVMs, subscription, args.apiVersion, portMap);
                // wait for the initial set of updates, then proceed:
                return Promise.all(networkSecurityGroupUpdates).then(function () {
                    return Promise.all(loadBalancerUpdates).then(function () {
                        return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.ConfigureNetworkInterface").then(function (statusMessageFormat) {
                            // load balancer rules must exist before network interfaces can reference them.  Update NICs now:
                            var networkInterfaceUpdates = [];
                            for (var i = 0; i < loadBalancedVMs.length; i++) {
                                var vm = loadBalancedVMs[i];
                                var pollingNetworkInterface = {
                                    initialStatusType: underscore.string.sprintf(statusMessageFormat, vm.networkInterface.name, args.clusterName),
                                    statusType: AzureFabricActions._pollingRequestStatusTypeExtension,
                                    timeOutInSeconds: AzureFabricActions._pollingRequestTimeout
                                };
                                networkInterfaceUpdates.push(_this._azureVMv2Actions.updateNetworkInterface(vm.networkInterface, subscription, args.apiVersion, pollingNetworkInterface));
                            }
                            return Promise.all(networkInterfaceUpdates).then(function () {
                                return installExtensionCallback(args);
                            });
                        });
                    });
                });
            };
            this.setupFeatureOnScaleSets = function (args, portMap, inboundNatPoolNamePrefix, installExtensionCallback) {
                var scaleSets = args.scaleSets;
                var subscriptionString = args.subscription;
                var subscription = JSON.parse(subscriptionString);
                var apiVersion = args.apiVersion;
                var networkSecurityGroupUpdates = _this._getNetworkSecurityGroups(scaleSets, args.apiVersion).then(function (networkSecurityGroups) {
                    return Promise.all(_this._updateNetworkSecurityGroups(networkSecurityGroups, portMap, args, subscription, args.apiVersion));
                });
                var loadBalancerUpdates = _this.getLoadBalancers(scaleSets, args.apiVersion).then(function (loadBalancers) {
                    var loadBalancerNatPoolUpdates;
                    try {
                        loadBalancerNatPoolUpdates = _this._computeLoadBalancerInbountNatRules(loadBalancers, inboundNatPoolNamePrefix, portMap);
                    }
                    catch (badLoadBalancerName) {
                        return _this._getStatusMessage("Errors", "ConfigureLoadBalancer", args, badLoadBalancerName)
                            .then(function (statusMessage) {
                            return Promise.reject(statusMessage);
                        });
                    }
                    try {
                        var isScaleSetUpdated = _this._computeScaleSetNatPoolUpdates(loadBalancerNatPoolUpdates);
                    }
                    catch (badScaleSetName) {
                        return _this._getStatusMessage("Errors", "ConfigureScaleSet", args, badScaleSetName)
                            .then(function (statusMessage) {
                            return Promise.reject(statusMessage);
                        });
                    }
                    return Promise.all(loadBalancerNatPoolUpdates.map(function (loadBalancerUpdate) {
                        return _this._applyLoadBalancerNatPoolUpdatesIfNeeded(loadBalancerUpdate, subscription, args, apiVersion).then(function () {
                            if (isScaleSetUpdated) {
                                return _this._applyScaleSetNatPoolUpdates(loadBalancerUpdate.scaleSet, subscription, args, apiVersion);
                            }
                        });
                    }));
                });
                return networkSecurityGroupUpdates.then(function () {
                    return loadBalancerUpdates.then(function () {
                        return installExtensionCallback(args).then(function () { return []; });
                    });
                });
            };
            this._cleanupFeature = function (args, portMap, extension, uninstallExtensionCallBack) {
                var subscriptionString = args.subscription;
                var subscription = JSON.parse(subscriptionString);
                // Remove extensions
                var deleteExtension = uninstallExtensionCallBack(args.clusterName, args.vms, subscription, args.apiVersion);
                // Update LoadBalancers:
                // create unified list of loadBalancers
                // Many VMs may share a loadbalancer, but we only want to update each LB once, with the union of all the needed changes.
                var loadBalancedVMs = underscore.filter(args.vms, function (vm) {
                    return !!vm.loadBalancer;
                });
                var loadBalancers = _this._collectLoadBalancers(loadBalancedVMs);
                // for each VM, accumulate changes on its load balancer, and update its network interface to match.
                // note that nothing is yet pushed to Azure.
                for (var index1 = 0; index1 < loadBalancedVMs.length; index1++) {
                    var vm1 = loadBalancedVMs[index1];
                    _this._azureVMv2Actions.deleteInboundNatRules(loadBalancers[vm1.loadBalancer.id], vm1.networkInterface, portMap);
                }
                // Update NICs now:
                var networkInterfaceUpdates = loadBalancedVMs.map(function (vm2) {
                    return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.RemoveNetworkInterfaceInboundNATRule").then(function (statusMessageFormat) {
                        return _this._azureVMv2Actions.updateNetworkInterface(vm2.networkInterface, subscription, args.apiVersion, {
                            initialStatusType: underscore.string.sprintf(statusMessageFormat, vm2.networkInterface.name, args.clusterName),
                            statusType: AzureFabricActions._pollingRequestStatusTypeExtension,
                            timeOutInSeconds: AzureFabricActions._pollingRequestTimeout
                        });
                    });
                });
                return deleteExtension.then(function () {
                    return Promise.all(networkInterfaceUpdates).then(function () {
                        return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.RemoveLoadbalancerInboundNATRule").then(function (statusMessageFormat) {
                            // update each load balancer, now that the NICs are no longer using the rules.
                            var loadBalancerUpdates = [];
                            for (var index in loadBalancers) {
                                var lb = loadBalancers[index];
                                var pollingLoadBalancer = {
                                    initialStatusType: underscore.string.sprintf(statusMessageFormat, lb.name, args.clusterName),
                                    statusType: AzureFabricActions._pollingRequestStatusTypeExtension,
                                    timeOutInSeconds: AzureFabricActions._pollingRequestTimeout
                                };
                                loadBalancerUpdates.push(_this._azureVMv2Actions.updateLoadBalancer(lb, subscription, args.apiVersion, pollingLoadBalancer));
                            }
                            return Promise.all(loadBalancerUpdates).then(function () {
                                // Update Network Security Groups.
                                // Since many VMs likely share a security group, create a unified list of network security groups to update
                                // Note that it is important to do this *after* removing the extensions from the VMs,
                                // since the code to delete security rules won't remove any rules it thinks are still in use.
                                var networkSecurityGroups = _this._collectNetworkSecurityGroups(args.vms);
                                // now update all the network security groups in Azure
                                var networkSecurityGroupUpdates = _this._removeNetworkSecurityGroupRules(networkSecurityGroups, portMap, args, subscription, args.apiVersion, extension);
                                return Promise.all(networkSecurityGroupUpdates);
                            });
                        });
                    });
                });
            };
            this.cleanupFeatureFromScaleSets = function (args, portMap, extension, uninstallExtensionCallBack) {
                var scaleSets = args.scaleSets;
                var subscription = JSON.parse(args.subscription);
                var apiVersion = args.apiVersion;
                return uninstallExtensionCallBack(args).then(function () {
                    return _this.getLoadBalancers(scaleSets, apiVersion).then(function (loadBalancers) {
                        var affectedResources = _this._disableResourceAccess(scaleSets, loadBalancers, portMap);
                        return _this._getNetworkSecurityGroups(affectedResources.affectedScaleSets, apiVersion).then(function (networkSecurityGroups) {
                            var scaleSetUpdates = affectedResources.affectedScaleSets.map(function (scaleSet) {
                                return _this._applyScaleSetNatPoolUpdates(scaleSet, subscription, args, apiVersion);
                            });
                            return Promise.all(scaleSetUpdates).then(function () {
                                var loadBalancerUpdates = affectedResources.affectedLoadBalancers.map(function (loadBalancer) {
                                    return _this._applyLoadBalancerNatPoolUpdates(loadBalancer, subscription, args, apiVersion);
                                });
                                var networkSecurityGroupUpdates = _this._removeNetworkSecurityGroupRules(networkSecurityGroups, portMap, args, subscription, apiVersion, extension);
                                return Promise.all(networkSecurityGroupUpdates).then(function () {
                                    return Promise.all(loadBalancerUpdates).then(null, function (error) {
                                        if (affectedResources.affectedScaleSets.some(function (scaleSet) {
                                            return scaleSet.upgradeMode.toLowerCase() !== "automatic";
                                        })) {
                                            _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.ManualUpdateLoadBalancer").then(function (message) {
                                                // We won't update load balancer if any of affected scale set has manual upgrade mode.
                                                // Because some of vm still keep the reference to load balancer nat pool until next upgrade, which fails load balancer update operations.
                                                _this._host.executeOperation("Environment.showMessageBox", ["Cloud Explorer", message, "warning"]);
                                            });
                                        }
                                    }).then(function () {
                                        return Promise.resolve();
                                    });
                                });
                            });
                        });
                    });
                });
            };
            // 1. Creates client and server self signed certificate
            // 2. Upload the server cert to Azure Key-Vault
            // 3. Configure the scale sets with the server cert and extension
            this._setupDebuggerExtension = function (args) {
                var scaleSets = args.scaleSets;
                var subscriptionString = args.subscription;
                var subscription = JSON.parse(subscriptionString);
                var targetVersion = AzureVirtualMachineV2Actions.debuggingExtensionVersion;
                var apiVersion = args.apiVersion;
                // ensure we have a usable keyVault & and the needed certs:
                return _this._azureVMv2Actions.getOrCreateKeyVault(subscription, args.resourceGroup, args.location).then(function (keyVault) {
                    return _this._azureVMv2Actions.ensureKeyVaultPermissions(subscription, keyVault).then(function (updatedKeyVault) {
                        return _this._CreateCertAndUploadToKeyVault(args.clusterName, subscription, updatedKeyVault).then(function (certResult) {
                            var promises = scaleSets.map(function (scaleSet) {
                                if (!scaleSet.debuggingExtension.name || scaleSet.debuggingExtension.properties.typeHandlerVersion !== targetVersion) {
                                    // Add debug certificate to scale set
                                    var debuggerCert = {
                                        certificateUrl: certResult.vaultId,
                                        certificateStore: "My"
                                    };
                                    var existingSecert = underscore.find(scaleSet.secrets, function (secret) {
                                        return secret.sourceVault.id === updatedKeyVault.id;
                                    });
                                    if (existingSecert) {
                                        existingSecert.vaultCertificates.push(debuggerCert);
                                    }
                                    else {
                                        var newSecret = {
                                            sourceVault: {
                                                id: updatedKeyVault.id
                                            },
                                            vaultCertificates: []
                                        };
                                        newSecret.vaultCertificates.push(debuggerCert);
                                        scaleSet.secrets.push(newSecret);
                                    }
                                    // Add debug extension to scale set
                                    var debuggingExtensionProfile = {
                                        name: _this._generateUniqueId(AzureFabricActions._debuggerExtensionNamePrefix),
                                        properties: {
                                            publisher: AzureConstants.RemoteDebugging.RemoteDebuggingExtensionPublisher,
                                            type: AzureConstants.RemoteDebugging.RemoteDebuggingExtensionType,
                                            typeHandlerVersion: targetVersion,
                                            autoUpgradeMinorVersion: false,
                                            settings: {
                                                clientThumbprint: certResult.debugCertInfo.clientCertificateThumbprint,
                                                serverThumbprint: certResult.debugCertInfo.serverCertificateThumbprint,
                                                connectorPort: AzureVirtualMachineV2Actions.defaultDebuggingPorts.connectorPort,
                                                fileUploadPort: AzureVirtualMachineV2Actions.defaultDebuggingPorts.fileUploadPort,
                                                forwarderPort: AzureVirtualMachineV2Actions.defaultDebuggingPorts.forwarderPort,
                                                forwarderPortx86: AzureVirtualMachineV2Actions.defaultDebuggingPorts.forwarderPortx86
                                            }
                                        }
                                    };
                                    scaleSet.extensions.push(debuggingExtensionProfile);
                                    // commit both certificte and extension together.
                                    return _this._applyScaleSetExtensionProfile(scaleSet, subscription, args, apiVersion);
                                }
                                else {
                                    return Promise.resolve(null);
                                }
                            });
                            return Promise.all(promises);
                        });
                    });
                });
            };
            this._setupEtwListenerExtension = function (args) {
                var subscriptionString = args.subscription;
                var subscription = JSON.parse(subscriptionString);
                var etwListenerExtensionVersion = _this._host.executeOperation(AzureVirtualMachineV2Actions.getEtwListenerVMExtVersionNamespace);
                return etwListenerExtensionVersion.then(function (targetVersion) {
                    return _this._generateEncryptionKey().then(function (encryptionKeyInfo) {
                        return _this._host.resolveResource(AzureResources.commonNamespace, "Action.ServiceFabric.EnableStreamingTrace").then(function (statusMessageFormat) {
                            var installExtensions = [];
                            for (var i = 0; i < args.vms.length; i++) {
                                var vm = args.vms[i];
                                if (!AttributeLoaderHelper.isInstalledState(vm.etwListenerExtension.properties.provisioningState)
                                    || vm.etwListenerExtension.properties.typeHandlerVersion !== targetVersion) {
                                    var pollingParameters = {
                                        initialStatusType: underscore.string.sprintf(statusMessageFormat, vm.name, args.clusterName),
                                        statusType: AzureFabricActions._pollingRequestStatusTypeExtension,
                                        timeOutInSeconds: AzureFabricActions._pollingRequestTimeout
                                    };
                                    installExtensions.push(_this._azureVMv2Actions.installEtwListenerExtension(subscription, vm.id, args.apiVersion, vm.location, encryptionKeyInfo.Key, encryptionKeyInfo.IV, pollingParameters));
                                }
                            }
                            return Promise.all(installExtensions);
                        });
                    });
                });
            };
            this.setupEtwListenerExtensionOnScaleSets = function (args) {
                var scaleSets = args.scaleSets;
                var subscriptionString = args.subscription;
                var subscription = JSON.parse(subscriptionString);
                var apiVersion = args.apiVersion;
                var etwListenerExtensionVersion = _this._host.executeOperation(AzureVirtualMachineV2Actions.getEtwListenerVMExtVersionNamespace);
                return etwListenerExtensionVersion.then(function (targetVersion) {
                    return _this._generateEncryptionKey().then(function (encryptionKeyInfo) {
                        var promises = scaleSets.map(function (scaleSet) {
                            if (!scaleSet.etwListenerExtension.name || scaleSet.etwListenerExtension.properties.typeHandlerVersion !== targetVersion) {
                                var serverVersion = null;
                                if (scaleSet.etwListenerExtension != null && scaleSet.etwListenerExtension.properties != null) {
                                    serverVersion = scaleSet.etwListenerExtension.properties.typeHandlerVersion;
                                }
                                return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.VirtualMachineScaleSets.CheckEtwListenerVersion.Message")
                                    .then(function (message) {
                                    return _this._azureVMv2Actions.checkEtwListenerVersionPrompt(serverVersion, targetVersion, underscore.string.sprintf(message, scaleSet.name))
                                        .then(function (result) {
                                        var etwExtensionProfile = {
                                            name: _this._generateUniqueId(AzureFabricActions._etwListenerExtensionNamePrefix),
                                            properties: {
                                                publisher: AzureConstants.ServiceFabric.EtwListenerExtensionPublisher,
                                                type: AzureConstants.ServiceFabric.EtwListenerExtensionType,
                                                typeHandlerVersion: targetVersion,
                                                autoUpgradeMinorVersion: false,
                                                settings: {
                                                    EtwEncryptionKey: {
                                                        Key: encryptionKeyInfo.Key,
                                                        IV: encryptionKeyInfo.IV
                                                    }
                                                }
                                            }
                                        };
                                        scaleSet.extensions.push(etwExtensionProfile);
                                        return _this._applyScaleSetExtensionProfile(scaleSet, subscription, args, apiVersion);
                                    });
                                });
                            }
                            else {
                                return Promise.resolve(null);
                            }
                        });
                        return Promise.all(promises);
                    });
                });
            };
            this._cleanupDebuggingExtension = function (args) {
                var scaleSets = args.scaleSets;
                var subscriptionString = args.subscription;
                var subscription = JSON.parse(subscriptionString);
                var clusterName = args.clusterName;
                var apiVersion = args.apiVersion;
                var promises = scaleSets.map(function (scaleSet) {
                    var extensionName = scaleSet.debuggingExtension.name;
                    if (!!extensionName && extensionName.length > 0) {
                        scaleSet.extensions = scaleSet.extensions.filter(function (e) {
                            return e.properties.publisher !== AzureConstants.RemoteDebugging.RemoteDebuggingExtensionPublisher;
                        });
                        _this._removeDebuggerSecret(scaleSet, subscription.id, clusterName);
                        return _this._applyScaleSetExtensionProfile(scaleSet, subscription, args, apiVersion);
                    }
                    else {
                        return Promise.resolve(null);
                    }
                });
                return Promise.all(promises);
            };
            this._removeDebuggerSecret = function (scaleSet, subscrptionId, clusterName) {
                var vaultIDPattern = underscore.string.sprintf("/subscriptions/%0s/resourceGroups/.*/providers/Microsoft.KeyVault/vaults/%1s.*", subscrptionId, AzureVirtualMachineV2Actions.azureToolsPrefix);
                var vaultIDRegEx = new RegExp(vaultIDPattern, "i");
                // sample CertificateUrl = "https://msvsaz4b4f2ml8ss.vault.azure.net/secrets/remotedebugcertravipalss3/c3f4158d0844403c926edbac5bd55822"
                var certificateUrlPattern = underscore.string.sprintf("/secrets/%0s%1s/.*", AzureVirtualMachineV2Actions.remoteDebuggerCertPrefix, clusterName);
                var certificateUrlRegEx = new RegExp(certificateUrlPattern, "i");
                // Get the secret with the vault ID used by Azure tools.
                var azureToolSecret = underscore.find(scaleSet.secrets, function (secret) {
                    return vaultIDRegEx.test(secret.sourceVault.id);
                });
                // Remove the certificates used by remote debugger
                if (azureToolSecret) {
                    azureToolSecret.vaultCertificates = azureToolSecret.vaultCertificates.filter(function (cert) {
                        return !certificateUrlRegEx.test(cert.certificateUrl);
                    });
                    // After removing the remote debugger cert, if the cert list is empty, then remove the secret.
                    if (azureToolSecret.vaultCertificates.length === 0) {
                        scaleSet.secrets = scaleSet.secrets.filter(function (secret) {
                            return secret.sourceVault.id !== azureToolSecret.sourceVault.id;
                        });
                    }
                }
                // Also remove the certificates from the local machine
                var thumbprints = [scaleSet.debuggingExtension.properties.settings.clientThumbprint, scaleSet.debuggingExtension.properties.settings.serverThumbprint];
                return _this._host.executeOperation(AzureFabricActions._removeDebuggerCertificatesNameSpace, [thumbprints]);
            };
            this._cleanupEtwListenerExtension = function (clusterName, vms, subscription, apiVersion) {
                return _this._host.resolveResource(AzureResources.commonNamespace, "Action.ServiceFabric.DisableStreamingTrace").then(function (statusMessageFormat) {
                    var deleteExtensionUpdates = [];
                    for (var i = 0; i < vms.length; i++) {
                        var vm = vms[i];
                        var pollingExtension = {
                            initialStatusType: underscore.string.sprintf(statusMessageFormat, vm.name, clusterName),
                            statusType: AzureFabricActions._pollingRequestStatusTypeExtension,
                            timeOutInSeconds: AzureFabricActions._pollingRequestTimeout
                        };
                        if (!!vm.etwListenerExtension.id) {
                            deleteExtensionUpdates.push(_this._azureVMv2Actions.uninstallVMExtension(vm.etwListenerExtension.id, subscription, apiVersion, pollingExtension));
                        }
                    }
                    return Promise.all(deleteExtensionUpdates);
                });
            };
            this.cleanupEtwListenerExtensionFromScaleSets = function (args) {
                var scaleSets = args.scaleSets;
                var subscriptionString = args.subscription;
                var subscription = JSON.parse(subscriptionString);
                var apiVersion = args.apiVersion;
                var promises = scaleSets.map(function (scaleSet) {
                    var extensionName = scaleSet.etwListenerExtension.name;
                    if (!!extensionName && extensionName.length > 0) {
                        scaleSet.extensions = scaleSet.extensions.filter(function (e) {
                            return e.properties.publisher !== AzureConstants.ServiceFabric.EtwListenerExtensionPublisher;
                        });
                        return _this._applyScaleSetExtensionProfile(scaleSet, subscription, args, apiVersion);
                    }
                    else {
                        return Promise.resolve(null);
                    }
                });
                return Promise.all(promises);
            };
            // Get all network security groups that are associated with passed VM scale sets
            this._getNetworkSecurityGroups = function (scaleSets, apiVersion) {
                if (!scaleSets || scaleSets.length === 0) {
                    return Promise.resolve([]);
                }
                var promises = scaleSets.map(function (scaleSet) {
                    return _this._getSubnets(scaleSet.subnetIds, scaleSet.subscription, scaleSet.resourceGroup, apiVersion);
                });
                return Promise.all(promises).then(function (subnetArrays) {
                    var allSubnets = underscore.flatten(subnetArrays);
                    var uniqueSubnets = underscore.uniq(allSubnets, false, function (subnet) { return subnet.id; });
                    var subnetsWithNetworkSecurityGroups = uniqueSubnets.filter(function (subnet) { return subnet.properties.networkSecurityGroup && !!subnet.properties.networkSecurityGroup.id; });
                    return Promise.all(subnetsWithNetworkSecurityGroups.map(function (subnet) {
                        var networkSecurityGroupLoadArgs = {
                            subscription: JSON.stringify(subnet.subscription),
                            resourceGroupId: subnet.resourceGroup,
                            id: subnet.properties.networkSecurityGroup.id,
                            apiVersion: apiVersion
                        };
                        return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, networkSecurityGroupLoadArgs).then(function (response) {
                            return response;
                        });
                    })).then(function (networkSecurityGroups) {
                        return underscore.uniq(networkSecurityGroups, false, function (nsg) { return nsg.id; });
                    });
                });
            };
            // Subnets might belong to different VNets so there is really no single "root" and we have to query them one by one.
            this._getSubnets = function (subnetIds, subscription, resourceGroup, apiVersion) {
                if (!subnetIds || subnetIds.length === 0) {
                    return Promise.resolve([]);
                }
                var promises = subnetIds.map(function (subnetId) {
                    var subnetLoadArgs = {
                        subscription: JSON.stringify(subscription),
                        resourceGroupId: resourceGroup,
                        id: subnetId,
                        apiVersion: apiVersion
                    };
                    return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, subnetLoadArgs).then(function (response) {
                        return AzureResourceProducer.addResourceContext(response, subscription);
                    });
                });
                return Promise.all(promises);
            };
            this._updateNetworkSecurityGroups = function (networkSecurityGroups, portMap, args, subscription, apiVersion) {
                return networkSecurityGroups.map(function (networkSecurityGroup) {
                    _this._azureVMv2Actions.configNetworkSecurityGroupRules(networkSecurityGroup, portMap);
                    return _this._getStatusMessage("Actions", "ConfigureNetworkSecurityGroup", args, networkSecurityGroup.name).then(function (statusMessage) {
                        var pollingParameters = {
                            initialStatusType: statusMessage,
                            statusType: AzureFabricActions._pollingRequestStatusTypeExtension,
                            timeOutInSeconds: AzureFabricActions._pollingRequestTimeout
                        };
                        return _this._azureVMv2Actions.updateNetworkSecurityGroup(networkSecurityGroup, subscription, pollingParameters, apiVersion);
                    });
                });
            };
            this._removeNetworkSecurityGroupRules = function (networkSecurityGroups, portMap, args, subscription, apiVersion, extension) {
                return networkSecurityGroups.map(function (networkSecurityGroup) {
                    return _this._getStatusMessage("Actions", "ConfigureNetworkSecurityGroup", args, networkSecurityGroup.name).then(function (statusMessage) {
                        var pollingParameters = {
                            initialStatusType: statusMessage,
                            statusType: AzureFabricActions._pollingRequestStatusTypeExtension,
                            timeOutInSeconds: AzureFabricActions._pollingRequestTimeout
                        };
                        return _this._azureVMv2Actions.removeNetworkSecurityGroupRules(networkSecurityGroup, { id: null }, // a fake network interface, since we don't need to exclude any particular interface.
                        subscription, apiVersion, pollingParameters, portMap, extension);
                    });
                });
            };
            this._updateLoadBalancers = function (args, loadBalancers, loadBalancedVMs, subscription, apiVersion, portMap) {
                // for each VM, accumulate changes on its load balancer, and update its network interface to match.
                // note that nothing is yet pushed to Azure.
                for (var i = 0; i < loadBalancedVMs.length; i++) {
                    var vm = loadBalancedVMs[i];
                    _this._azureVMv2Actions.configInboundNatRules(loadBalancers[vm.loadBalancer.id], vm.networkInterface, portMap);
                }
                // update each load balancer.
                var loadBalancerUpdates = [];
                for (var index in loadBalancers) {
                    var lb = loadBalancers[index];
                    var promise = _this._getStatusMessage("Actions", "ConfigureLoadBalancer", args, lb.name).then(function (statusMessage) {
                        var pollingParameters = {
                            initialStatusType: statusMessage,
                            statusType: AzureFabricActions._pollingRequestStatusTypeExtension,
                            timeOutInSeconds: AzureFabricActions._pollingRequestTimeout
                        };
                        return _this._azureVMv2Actions.updateLoadBalancer(lb, subscription, apiVersion, pollingParameters);
                    });
                    loadBalancerUpdates.push(promise);
                }
                return loadBalancerUpdates;
            };
            // Computes the Inbound NAT Pools, given the required port map to expose. If the required NAT pool already exists, it is will be added to existingNatPoolIds.
            // If not, a new NAT Pool will be added to load balancer and the same will be added to newNatPoolIds
            // Returns list of load balancers that includes the NAT Pool for the given port map.
            this._computeLoadBalancerInbountNatRules = function (loadBalancers, newNatPoolNamePrefix, portMap) {
                var retval = [];
                loadBalancers.forEach(function (loadBalancer) {
                    var inboundNatPools = loadBalancer.properties.inboundNatPools;
                    if (!inboundNatPools) {
                        throw loadBalancer.name;
                    }
                    var frontendIpConfigurationId = null;
                    if (loadBalancer.properties.frontendIPConfigurations && loadBalancer.properties.frontendIPConfigurations.length > 0) {
                        // It probably does not matter which public IP we use, so we might just take the first one.
                        frontendIpConfigurationId = loadBalancer.properties.frontendIPConfigurations[0].id;
                    }
                    if (!frontendIpConfigurationId) {
                        throw loadBalancer.name;
                    }
                    var loadBalancerUpdate = new LoadBalancerNatPoolUpdate(loadBalancer.scaleSetConsumer, loadBalancer, [], []);
                    for (var portName in portMap) {
                        var port = portMap[portName];
                        var existingInboundNatPool = underscore.find(inboundNatPools, function (np) { return np.properties.backendPort === port; });
                        if (!!existingInboundNatPool) {
                            loadBalancerUpdate.existingNatPoolIds.push(existingInboundNatPool.id);
                        }
                        else {
                            // To allow expanding the scale set capacity, include buffer in the port range.
                            var minPortCount = 10;
                            var bufferMultiple = 3;
                            var portCount = loadBalancer.scaleSetConsumer.sku.capacity * bufferMultiple;
                            portCount = portCount < minPortCount ? minPortCount : portCount;
                            var frontendPortRange = _this._findAvailablePortRange(inboundNatPools, port, portCount);
                            if (!frontendPortRange) {
                                throw loadBalancer.name;
                            }
                            var newNatPool = {
                                name: _this._generateUniqueId(newNatPoolNamePrefix),
                                properties: {
                                    frontendPortRangeStart: frontendPortRange.start,
                                    frontendPortRangeEnd: frontendPortRange.end,
                                    backendPort: port,
                                    protocol: "Tcp",
                                    frontendIPConfiguration: {
                                        id: frontendIpConfigurationId
                                    }
                                }
                            };
                            inboundNatPools.push(newNatPool);
                            var newNatPoolId = underscore.string.sprintf("/subscriptions/%0s/resourceGroups/%1s/providers/Microsoft.Network/loadBalancers/%2s/inboundNatPools/%3s", loadBalancer.subscription.id, loadBalancer.resourceGroup, loadBalancer.name, newNatPool.name);
                            loadBalancerUpdate.newNatPoolIds.push(newNatPoolId);
                        }
                    }
                    if (loadBalancerUpdate.allNatPoolIds.length > 0) {
                        retval.push(loadBalancerUpdate);
                    }
                });
                return retval;
            };
            this._disableResourceAccess = function (scaleSets, loadBalancers, portsToDisable) {
                var retval = new PortDisablementResult();
                var portNumbersToDisable = [];
                for (var portName in portsToDisable) {
                    portNumbersToDisable.push(portsToDisable[portName]);
                }
                loadBalancers.forEach(function (loadBalancer) {
                    var inboundNatPoolsToRemove = [];
                    if (loadBalancer.properties.inboundNatPools) {
                        inboundNatPoolsToRemove = loadBalancer.properties.inboundNatPools.filter(function (natPool) {
                            return portNumbersToDisable.some(function (port) { return port === natPool.properties.backendPort; });
                        });
                        if (!!inboundNatPoolsToRemove && inboundNatPoolsToRemove.length > 0) {
                            retval.affectedLoadBalancers.push(loadBalancer);
                            // Memorize the NAT pools we need to remove from the current load balancer
                            var natPoolIdsToRemove = inboundNatPoolsToRemove.map(function (natPool) { return natPool.id; });
                            loadBalancer.properties.inboundNatPools = _this._without(loadBalancer.properties.inboundNatPools, natPoolIdsToRemove);
                            // References to NAT pools being removed must also be removed from frontendIPConfigurations
                            loadBalancer.properties.frontendIPConfigurations.forEach(function (frontendIPConfiguration) {
                                frontendIPConfiguration.properties.inboundNatPools = _this._without(frontendIPConfiguration.properties.inboundNatPools, natPoolIdsToRemove);
                            });
                            scaleSets.forEach(function (scaleSet) {
                                // Also update all scale set NIC configurations that use the NAT pools that we are removing
                                var nicConfigurations = _this._findNicConfigurationsUsedByLoadBalancer(scaleSet, loadBalancer);
                                if (!!nicConfigurations && nicConfigurations.length > 0) {
                                    retval.affectedScaleSets.push(scaleSet);
                                    nicConfigurations.forEach(function (nicConfiguration) {
                                        // Iterate over scale set's IP configurations and remove all references to NAT pools that are going away
                                        nicConfiguration.properties.ipConfigurations.forEach(function (ipConfiguration) {
                                            ipConfiguration.properties.loadBalancerInboundNatPools = _this._without(ipConfiguration.properties.loadBalancerInboundNatPools, natPoolIdsToRemove);
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
                retval.removeDuplicateReferences();
                return retval;
            };
            this._computeScaleSetNatPoolUpdates = function (loadBalancerUpdates) {
                var isScaleSetUpdated = false;
                loadBalancerUpdates.forEach(function (loadBalancerUpdate) {
                    // Find all network interface configurations that are using the load balancer affected by the current update
                    var affectedNicConfigurations = _this._findNicConfigurationsUsedByLoadBalancer(loadBalancerUpdate.scaleSet, loadBalancerUpdate.loadBalancer);
                    if (!affectedNicConfigurations || affectedNicConfigurations.length === 0) {
                        throw loadBalancerUpdate.scaleSet.name;
                    }
                    // There is no clear way to tell which NIC, or which IP configuration, should be updated, so we just pick the first one in both cases
                    var nicConfiguration = affectedNicConfigurations[0];
                    var ipConfiguration = nicConfiguration.properties.ipConfigurations.filter(function (ipConfiguration) { return _this._usesLoadBalancer(ipConfiguration, loadBalancerUpdate.loadBalancer); })[0];
                    if (!ipConfiguration.properties.loadBalancerInboundNatPools) {
                        ipConfiguration.properties.loadBalancerInboundNatPools = [];
                    }
                    var existingNatPoolReferences = ipConfiguration.properties.loadBalancerInboundNatPools.map(function (pool) { return pool.id; });
                    var missingNatPoolReferences = underscore.difference(loadBalancerUpdate.allNatPoolIds, existingNatPoolReferences);
                    missingNatPoolReferences.forEach(function (natPoolId) {
                        ipConfiguration.properties.loadBalancerInboundNatPools.push({ id: natPoolId });
                        isScaleSetUpdated = true;
                    });
                });
                return isScaleSetUpdated;
            };
            this._usesLoadBalancer = function (ipConfiguration, loadBalancer) {
                // NIC's ipconfiguration may not have loadbalancerInboundNatPools. So try to match the load balancer on either inboundNatPool or BackendAddressPool
                var loadBalancerIdsInNic = [];
                if (ipConfiguration.properties.loadBalancerInboundNatPools) {
                    loadBalancerIdsInNic = loadBalancerIdsInNic.concat(ipConfiguration.properties.loadBalancerInboundNatPools.map(function (natPool) { return natPool.id; }));
                }
                if (ipConfiguration.properties.loadBalancerBackendAddressPools) {
                    loadBalancerIdsInNic = loadBalancerIdsInNic.concat(ipConfiguration.properties.loadBalancerBackendAddressPools.map(function (natPool) { return natPool.id; }));
                }
                return loadBalancerIdsInNic.some(function (natPoolId) { return natPoolId.indexOf(loadBalancer.id) === 0; });
            };
            this._findNicConfigurationsUsedByLoadBalancer = function (scaleSet, loadBalancer) {
                var nicConfigurations = scaleSet.networkProfile.networkInterfaceConfigurations;
                // Find all network interface configurations that are using the load balancer affected by the current update
                var affectedNicConfigurations = nicConfigurations.filter(function (nicConfig) {
                    return nicConfig.properties.ipConfigurations.some(function (ipConfiguration) {
                        return _this._usesLoadBalancer(ipConfiguration, loadBalancer);
                    });
                });
                return affectedNicConfigurations;
            };
            this._applyLoadBalancerNatPoolUpdatesIfNeeded = function (loadBalancerNatPoolUpdate, subscription, args, apiVersion) {
                if (loadBalancerNatPoolUpdate.isUpdated) {
                    return _this._applyLoadBalancerNatPoolUpdates(loadBalancerNatPoolUpdate.loadBalancer, subscription, args, apiVersion);
                }
                else {
                    return Promise.resolve();
                }
            };
            this._applyLoadBalancerNatPoolUpdates = function (loadBalancer, subscription, args, apiVersion) {
                return _this._getStatusMessage("Actions", "ConfigureLoadBalancer", args, loadBalancer.name).then(function (statusMessage) {
                    var loadBalancerUrl = AttributeLoaderHelper.ResourceUriTemplate.expand({
                        apiVersion: apiVersion,
                        managementEndpoint: subscription.managementEndpoint,
                        resourceId: loadBalancer.id
                    });
                    var requestBody = {
                        name: loadBalancer.name,
                        location: loadBalancer.location,
                        properties: {
                            inboundNatPools: loadBalancer.properties.inboundNatPools,
                            frontendIPConfigurations: loadBalancer.properties.frontendIPConfigurations
                        }
                    };
                    return _this._executePollingRequest(loadBalancerUrl.toString(), subscription, statusMessage, requestBody);
                });
            };
            this._applyScaleSetNatPoolUpdates = function (scaleSet, subscription, args, apiVersion) {
                return _this._getStatusMessage("Actions", "ConfigureScaleSetNetwork", args, scaleSet.name).then(function (statusMessage) {
                    var scaleSetUrl = AttributeLoaderHelper.ResourceUriTemplate.expand({
                        apiVersion: apiVersion,
                        managementEndpoint: subscription.managementEndpoint,
                        resourceId: scaleSet.id
                    });
                    var requestBody = {
                        name: scaleSet.name,
                        location: scaleSet.location,
                        properties: {
                            virtualMachineProfile: {
                                networkProfile: {
                                    networkInterfaceConfigurations: scaleSet.networkProfile.networkInterfaceConfigurations
                                }
                            }
                        }
                    };
                    return _this._executePollingRequest(scaleSetUrl.toString(), subscription, statusMessage, requestBody);
                });
            };
            this._applyScaleSetExtensionProfile = function (scaleSet, subscription, args, apiVersion) {
                return _this._getStatusMessage("Actions", "ConfigureScaleSetExtensions", args, scaleSet.name).then(function (statusMessage) {
                    // If upgrade mode of scale set is not set to automatic, show warning as appendix of status message.
                    if (scaleSet.upgradeMode.toLowerCase() !== "automatic") {
                        return _this._getStatusMessage("Actions", "NeedManualUpgrade", args, scaleSet.name).then(function (appendix) {
                            return statusMessage + " (" + appendix + ")";
                        });
                    }
                    else {
                        return statusMessage;
                    }
                }).then(function (statusMessage) {
                    var scaleSetUrl = AttributeLoaderHelper.ResourceUriTemplate.expand({
                        apiVersion: apiVersion,
                        managementEndpoint: subscription.managementEndpoint,
                        resourceId: scaleSet.id
                    });
                    var requestBody = {
                        name: scaleSet.name,
                        location: scaleSet.location,
                        properties: {
                            virtualMachineProfile: {
                                osProfile: {
                                    secrets: scaleSet.secrets
                                },
                                extensionProfile: {
                                    extensions: scaleSet.extensions
                                }
                            }
                        }
                    };
                    return _this._executePollingRequest(scaleSetUrl.toString(), subscription, statusMessage, requestBody);
                });
            };
            this._executePollingRequest = function (requestUrl, subscription, statusMessage, requestBody) {
                var parameters = new PollingWebRequestParameters();
                parameters.url = requestUrl;
                parameters.subscription = subscription;
                parameters.method = "PUT";
                parameters.body = JSON.stringify(requestBody);
                parameters.statusType = AzureFabricActions._pollingRequestStatusTypeExtension;
                parameters.initialStatusText = statusMessage;
                parameters.timeOutInSeconds = AzureFabricActions._pollingRequestTimeout;
                return _this._azureConnection.pollingWebRequest(parameters);
            };
            this._findAvailablePortRange = function (inboundNatPools, backendPort, frontendPortCount) {
                for (var candidateRangeStart = backendPort; candidateRangeStart < 65536;) {
                    var candidateRangeEnd = candidateRangeStart + frontendPortCount - 1;
                    var conflictingPool = underscore.find(inboundNatPools, function (pool) {
                        return candidateRangeStart <= pool.properties.frontendPortRangeEnd && candidateRangeEnd >= pool.properties.frontendPortRangeStart;
                    });
                    if (!conflictingPool) {
                        return { start: candidateRangeStart, end: candidateRangeEnd };
                    }
                    else {
                        candidateRangeStart = conflictingPool.properties.frontendPortRangeEnd + 1;
                    }
                }
                return null;
            };
            this._generateEncryptionKey = function () {
                return _this._host.executeOperation(AzureFabricActions._generateEncryptionKeyHostNamespace);
            };
            // Create clinet and server certificate for debugger and then upload the server certificate to azure key value.
            this._CreateCertAndUploadToKeyVault = function (clustername, subscription, updatedKeyVault) {
                return _this._azureVMv2Actions.getVmDebugCertificateInformation(clustername).then(function (debugCertInfo) {
                    return _this._azureVMv2Actions.createOrUpdateSecret(subscription, clustername, updatedKeyVault.name, updatedKeyVault.properties.vaultUri, debugCertInfo.serverCertificateForKeyVault).then(function (secretId) {
                        return {
                            debugCertInfo: debugCertInfo,
                            vaultId: secretId
                        };
                    });
                });
            };
            // returns a dictionary of networksecuritygroups indexed by their ids.
            this._collectNetworkSecurityGroups = function (vms) {
                if (!vms) {
                    return [];
                }
                var nsgs = vms.filter(function (vm) {
                    return !!vm.networkSecurityGroup;
                }).map(function (vm) { return vm.networkSecurityGroup; });
                return underscore.uniq(nsgs, false, function (nsg) { return nsg.id; });
            };
            // returns a dictionary of load balancers indexed by their ids.
            this._collectLoadBalancers = function (vms) {
                var loadBalancers = {};
                for (var i = 0; i < vms.length; i++) {
                    var lb = vms[i].loadBalancer;
                    if (!!lb) {
                        if (!loadBalancers[lb.id]) {
                            loadBalancers[lb.id] = lb;
                        }
                    }
                }
                return loadBalancers;
            };
            this._generateUniqueId = function (prefix) {
                var postFix = "";
                // Create 10 random characters 0-9 A-Z
                for (var x = 0; x < 10; x++) {
                    postFix += Math.floor(Math.random() * 36).toString(36);
                }
                return prefix + postFix;
            };
            this._without = function (items, idsToFilterOut) {
                return items.filter(function (item) { return !!item.id && idsToFilterOut.every(function (id) { return id !== item.id; }); });
            };
            // Wrapper for remote actions to ensure no conflict
            this._executeRemoteAction = function (args, action) {
                // Ensure that no more than one setup operation is progressing at a time
                AzureFabricActions._clusterIdToRemoteActionInProgress[args.id] = true;
                _this._uiActions.refreshNodeDynamicAttributes([{ name: "id", value: args.id }], args.affectedAttributes);
                return action(args)
                    .then(function () {
                    AzureFabricActions._clusterIdToRemoteActionInProgress[args.id] = false;
                    _this.refreshNode(args);
                }, function (error) {
                    AzureFabricActions._clusterIdToRemoteActionInProgress[args.id] = false;
                    _this.refreshNode(args);
                    return Promise.reject(error);
                });
            };
            this._getStatusMessage = function (statusType, statusName, args, targetName) {
                var namespace = "";
                var resourceName = "";
                if (args.clusterName) {
                    // ServiceFabric polling status message
                    namespace = "ServiceFabric";
                    resourceName = args.clusterName;
                }
                else if (args.scaleSetName) {
                    // VMScaleSet polling status message
                    namespace = "VirtualMachineScaleSets";
                    resourceName = args.scaleSetName;
                }
                return _this._host.resolveResource(AzureResources.commonNamespace, underscore.string.sprintf("%0s.%1s.%2s", statusType, namespace, statusName))
                    .then(function (statusMessagePattern) {
                    return underscore.string.sprintf(statusMessagePattern, targetName, resourceName);
                });
            };
            this._azureConnection = azureConnection;
            this._host = host;
            this._uiActions = new UIActions(this._host);
            this._azureVMv2Actions = new AzureVirtualMachineV2Actions(azureConnection, host);
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
        }
        return AzureFabricActions;
    }());
    AzureFabricActions.refreshNode = "Azure.Actions.Fabric.refreshNode";
    AzureFabricActions.openExplorer = "Azure.Actions.Fabric.openExplorer";
    AzureFabricActions.activateNode = "Azure.Actions.Fabric.activateNode";
    AzureFabricActions.deactivateNode = "Azure.Actions.Fabric.deactivateNode";
    AzureFabricActions.unprovisionApplicationType = "Azure.Actions.Fabric.unprovisionApplicationType";
    AzureFabricActions.deleteApplication = "Azure.Actions.Fabric.deleteApplication";
    AzureFabricActions.deleteService = "Azure.Actions.Fabric.deleteService";
    AzureFabricActions.createEtwListenerWindow = "Azure.Actions.Fabric.createEtwListenerWindow";
    AzureFabricActions.attachDebuggerNamespace = "Azure.Actions.Fabric.attachDebugger";
    AzureFabricActions.enableDebuggingNamespace = "Azure.Actions.Fabric.enableDebugging";
    AzureFabricActions.disableDebuggingNamespace = "Azure.Actions.Fabric.disableDebugging";
    AzureFabricActions.enableEtwListenerNamespace = "Azure.Actions.Fabric.enableEtwListener";
    AzureFabricActions.disableEtwListenerNamespace = "Azure.Actions.Fabric.disableEtwListener";
    AzureFabricActions.isRemoteActionInProgress = function (id) {
        return AzureFabricActions._clusterIdToRemoteActionInProgress[id];
    };
    AzureFabricActions.defaultEtwListenerPorts = {
        etwListenerPort: 810
    };
    AzureFabricActions.etwListenerInboundNatPoolNamePrefix = "EtwListenerNatPool-";
    AzureFabricActions._pollingRequestStatusTypeExtension = "Extension";
    AzureFabricActions._pollingRequestTimeout = 600;
    AzureFabricActions._etwDebuggerInboundNatPoolNamePrefix = "DebuggerListenerNatPool-";
    AzureFabricActions._etwListenerExtensionNamePrefix = "VsEtwListenerService-";
    AzureFabricActions._debuggerExtensionNamePrefix = "VsDebuggerService-";
    // Map that holds the cluster id to remote action (enable etw/debugger, disable etw/debugger) is being performed.
    AzureFabricActions._clusterIdToRemoteActionInProgress = {};
    AzureFabricActions._promptYesNoNamespace = "CloudExplorer.Actions.Dialog.promptYesNo";
    AzureFabricActions._promptConfirmActionNamespace = "CloudExplorer.Actions.Dialog.promptConfirmAction";
    AzureFabricActions._activateNodeHostNamespace = "AzureFabric.activateNode";
    AzureFabricActions._deactivateNodeHostNamespace = "AzureFabric.deactivateNode";
    AzureFabricActions._unprovisionApplicationTypeHostNamespace = "AzureFabric.unprovisionApplicationType";
    AzureFabricActions._deleteApplicationHostNamespace = "AzureFabric.deleteApplication";
    AzureFabricActions._deleteServiceHostNamespace = "AzureFabric.deleteService";
    AzureFabricActions._createEtwListenerWindowHostNamespace = "AzureFabric.createEtwListenerWindow";
    AzureFabricActions._attachDebuggerHostNamespace = "AzureFabric.attachToVMs";
    AzureFabricActions._generateEncryptionKeyHostNamespace = "AzureFabric.generateEncryptionKey";
    AzureFabricActions._removeDebuggerCertificatesNameSpace = "Azure.RemoveDebuggerCertificates";
    var LoadBalancerNatPoolUpdate = (function () {
        function LoadBalancerNatPoolUpdate(scaleSet, loadBalancer, newNatPoolIds, existingNatPoolIds) {
            this.scaleSet = scaleSet;
            this.loadBalancer = loadBalancer;
            this.newNatPoolIds = (!newNatPoolIds) ? [] : newNatPoolIds;
            this.existingNatPoolIds = (!existingNatPoolIds) ? [] : existingNatPoolIds;
        }
        Object.defineProperty(LoadBalancerNatPoolUpdate.prototype, "isUpdated", {
            get: function () {
                return this.newNatPoolIds.length > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LoadBalancerNatPoolUpdate.prototype, "allNatPoolIds", {
            get: function () {
                return this.newNatPoolIds.concat(this.existingNatPoolIds);
            },
            enumerable: true,
            configurable: true
        });
        return LoadBalancerNatPoolUpdate;
    }());
    var PortRange = (function () {
        function PortRange() {
        }
        return PortRange;
    }());
    var PortDisablementResult = (function () {
        function PortDisablementResult() {
            this.affectedScaleSets = [];
            this.affectedLoadBalancers = [];
        }
        PortDisablementResult.prototype.removeDuplicateReferences = function () {
            this.affectedScaleSets = underscore.uniq(this.affectedScaleSets, false, function (scaleSet) { return scaleSet.id; });
            this.affectedLoadBalancers = underscore.uniq(this.affectedLoadBalancers, false, function (loadBalancer) { return loadBalancer.id; });
        };
        return PortDisablementResult;
    }());
    return AzureFabricActions;
});

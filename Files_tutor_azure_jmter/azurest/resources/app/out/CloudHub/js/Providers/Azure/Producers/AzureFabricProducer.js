/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Actions/AzureFabricActions", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureVirtualMachineV2Actions", "Common/Utilities", "underscore", "es6-promise", "URIjs/URI"], function (require, exports, AzureFabricActions, AzureResourceNodeFactory, AzureResources, AzureVirtualMachineV2Actions, Utilities, Underscore, rsvp, URI) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return service fabric items.
     */
    var AzureFabricProducer = (function () {
        function AzureFabricProducer(host) {
            var _this = this;
            this._applicationGroupIds = {};
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureFabricProducer.getGroupNodes, _this.getGroupNodes);
                queryBindingManager.addProducerBinding(AzureFabricProducer.getApplicationTypes, _this.getApplicationTypes);
                queryBindingManager.addProducerBinding(AzureFabricProducer.getNodes, _this.getNodes);
                queryBindingManager.addProducerBinding(AzureFabricProducer.getApplications, _this.getApplications);
                queryBindingManager.addProducerBinding(AzureFabricProducer.getServices, _this.getServices);
                queryBindingManager.addProducerBinding(AzureFabricProducer.getPartitions, _this.getPartitions);
                queryBindingManager.addProducerBinding(AzureFabricProducer.getReplicas, _this.getReplicas);
            };
            this.getGroupNodes = function (args, continuationToken) {
                if (continuationToken === void 0) { continuationToken = null; }
                if (args.isClusterDown) {
                    return _this._errorNode();
                }
                else {
                    var uri = URI(args.managementEndpoint);
                    var hostname = uri.hostname();
                    var applicationGroupId = _this._applicationGroupIds[hostname];
                    if (!applicationGroupId) {
                        applicationGroupId = Utilities.guid();
                        _this._applicationGroupIds[hostname] = applicationGroupId;
                    }
                    var fabricGroupNodeData = [
                        {
                            type: "Azure.Fabric.ApplicationGroup",
                            name: "Applications",
                            attributes: [
                                { name: "id", value: applicationGroupId },
                                { name: "apiServiceId", value: args.apiServiceId },
                                { name: "diagnosticsFilter", value: null },
                                { name: "clusterName", value: args.clusterName },
                                { name: "subscription", value: args.subscription },
                                { name: "scaleSets", value: args.scaleSets },
                                { name: "isDebuggerFeatureOn", value: args.isDebuggerFeatureOn },
                                { name: "isLocal", value: args.isLocal }
                            ]
                        },
                        {
                            type: "Azure.Fabric.NodeGroup",
                            name: "Nodes",
                            attributes: [
                                { name: "id", value: Utilities.guid() },
                                { name: "clusterName", value: args.clusterName },
                                { name: "apiServiceId", value: args.apiServiceId },
                                { name: "diagnosticsFilter", value: null },
                                { name: "vms", value: args.vms },
                                { name: "scaleSets", value: args.scaleSets },
                                { name: "isEtwFeatureOn", value: args.isEtwFeatureOn },
                                { name: "subscription", value: args.subscription },
                                { name: "isLocal", value: args.isLocal }
                            ]
                        }
                    ];
                    return Promise.resolve({
                        results: AzureResourceNodeFactory.convertToNodeCollection(fabricGroupNodeData)
                    });
                }
            };
            this.getApplicationTypes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var appTypesData = [];
                return _this._host.executeOperation(AzureFabricProducer._getApplicationTypesHostNamespace, [args.apiServiceId])
                    .then(function (appTypes) {
                    for (var i = 0; i < appTypes.length; i++) {
                        var diagnosticsFilter = _this._combineDiagnosticsFilter(args.diagnosticsFilter, "applicationTypeName", appTypes[i].Name);
                        appTypesData.push({
                            type: "Azure.Fabric.ApplicationType",
                            name: appTypes[i].Name,
                            version: appTypes[i].Version,
                            attributes: [
                                { name: "id", value: Utilities.guid() },
                                { name: "parentId", value: args.id },
                                { name: "name", value: appTypes[i].Name },
                                { name: "version", value: appTypes[i].Version },
                                { name: "diagnosticsFilter", value: diagnosticsFilter },
                                { name: "apiServiceId", value: args.apiServiceId },
                                { name: "clusterName", value: args.clusterName },
                                { name: "scaleSets", value: args.scaleSets },
                                { name: "isDebuggerFeatureOn", value: args.isDebuggerFeatureOn },
                                { name: "subscription", value: args.subscription },
                                { name: "isLocal", value: args.isLocal }
                            ]
                        });
                    }
                    return Promise.resolve({
                        results: AzureResourceNodeFactory.convertToNodeCollection(appTypesData)
                    });
                }, function () {
                    return _this._errorNode();
                });
            };
            this.getNodes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var nodesData = [];
                var vms = args.vms;
                var scaleSets = args.scaleSets;
                var scaleSetVMs;
                if (scaleSets && scaleSets.length > 0) {
                    scaleSetVMs = [];
                    scaleSets.forEach(function (scaleSet) {
                        scaleSetVMs = scaleSetVMs.concat(scaleSet.vms);
                    });
                }
                return _this._host.executeOperation(AzureVirtualMachineV2Actions.getEtwListenerVMExtVersionNamespace).then(function (targetVersion) {
                    return _this._host.executeOperation(AzureFabricProducer._getNodesHostNamespace, [args.apiServiceId]).then(function (nodes) {
                        for (var i = 0; i < nodes.length; i++) {
                            var diagnosticsFilter = _this._combineDiagnosticsFilter(args.diagnosticsFilter, "nodeName", nodes[i].Name);
                            var nodeName = nodes[i].Name;
                            // The vms array contains actual vm name, but the nodeName provided by SF has "_" before the VM name.
                            // So removing the "_" to get the actual vm name.
                            nodeName = nodeName.replace(/^_/, "");
                            var ipAddress = null;
                            var port = null;
                            var encryptionKey = null;
                            var encryptionIV = null;
                            var etwTypeHandlerVersion = null;
                            var etwExtProvisioningState = null;
                            var isEtwEnabled = false;
                            if (scaleSetVMs && scaleSetVMs.length > 0) {
                                var scaleSetVM = Underscore.findWhere(scaleSetVMs, { name: nodeName });
                                if (scaleSetVM) {
                                    var scaleSet = Underscore.find(scaleSets, function (scaleSet) {
                                        return scaleSet.vms.some(function (vm) {
                                            return scaleSetVM.name === vm.name;
                                        });
                                    });
                                    ipAddress = scaleSetVM.publicIPAddress;
                                    port = scaleSetVM.etwListernerPort;
                                    encryptionKey = scaleSet.etwListenerExtension.properties.settings.EtwEncryptionKey.Key;
                                    encryptionIV = scaleSet.etwListenerExtension.properties.settings.EtwEncryptionKey.IV;
                                    etwTypeHandlerVersion = scaleSet.etwListenerExtension.properties.typeHandlerVersion;
                                    etwExtProvisioningState = scaleSet.provisioningState;
                                }
                            }
                            else if (vms && vms.length > 0) {
                                var vm = Underscore.findWhere(vms, { name: nodeName });
                                if (vm) {
                                    ipAddress = vm.publicIPAddress;
                                    port = vm.etwListenerExtension.port;
                                    encryptionKey = vm.etwListenerExtension.properties.settings.EtwEncryptionKey.Key;
                                    encryptionIV = vm.etwListenerExtension.properties.settings.EtwEncryptionKey.IV;
                                    etwTypeHandlerVersion = vm.etwListenerExtension.properties.typeHandlerVersion;
                                    etwExtProvisioningState = vm.etwListenerExtension.properties.provisioningState;
                                }
                            }
                            isEtwEnabled = ipAddress !== null && port !== null && encryptionKey !== null && encryptionIV !== null
                                && etwExtProvisioningState === "Succeeded" && etwTypeHandlerVersion === targetVersion;
                            nodesData.push({
                                type: "Azure.Fabric.Node",
                                name: nodes[i].Name,
                                attributes: [
                                    { name: "id", value: Utilities.guid() },
                                    { name: "name", value: nodes[i].Name },
                                    { name: "clusterName", value: args.clusterName },
                                    { name: "diagnosticsFilter", value: diagnosticsFilter },
                                    { name: "apiServiceId", value: args.apiServiceId },
                                    { name: "ipAddress", value: ipAddress },
                                    { name: "port", value: port },
                                    { name: "encryptionKey", value: encryptionKey },
                                    { name: "encryptionIV", value: encryptionIV },
                                    { name: "isEtwEnabled", value: isEtwEnabled },
                                    { name: "isEtwFeatureOn", value: args.isEtwFeatureOn },
                                    { name: "subscription", value: args.subscription },
                                    { name: "isLocal", value: args.isLocal }
                                ]
                            });
                        }
                        return Promise.resolve({
                            results: AzureResourceNodeFactory.convertToNodeCollection(nodesData)
                        });
                    }, function () {
                        return _this._errorNode();
                    });
                });
            };
            this.getApplications = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var appData = [];
                return _this._host.executeOperation(AzureFabricProducer._getApplicationsHostNamespace, [args.apiServiceId]).then(function (apps) {
                    for (var i = 0; i < apps.length; i++) {
                        if (apps[i].TypeName === args.name && apps[i].TypeVersion === args.version) {
                            var diagnosticsFilter = _this._combineDiagnosticsFilter(args.diagnosticsFilter, "applicationName", apps[i].Name);
                            appData.push({
                                type: "Azure.Fabric.Application",
                                name: apps[i].Name,
                                attributes: [
                                    { name: "id", value: Utilities.guid() },
                                    { name: "parentId", value: args.id },
                                    { name: "applicationTypeName", value: args.name },
                                    { name: "applicationTypeVersion", value: args.version },
                                    { name: "name", value: apps[i].Name },
                                    { name: "applicationId", value: apps[i].Id },
                                    { name: "diagnosticsFilter", value: diagnosticsFilter },
                                    { name: "apiServiceId", value: args.apiServiceId },
                                    { name: "clusterName", value: args.clusterName },
                                    { name: "scaleSets", value: args.scaleSets },
                                    { name: "isDebuggerFeatureOn", value: args.isDebuggerFeatureOn },
                                    { name: "subscription", value: args.subscription },
                                    { name: "isLocal", value: args.isLocal }
                                ]
                            });
                        }
                    }
                    return Promise.resolve({
                        results: AzureResourceNodeFactory.convertToNodeCollection(appData)
                    });
                }, function () {
                    return _this._errorNode();
                });
            };
            this.getServices = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var servicesData = [];
                return _this._host.executeOperation(AzureFabricProducer._getServicesHostNamespace, [args.applicationId, args.apiServiceId])
                    .then(function (services) {
                    for (var i = 0; i < services.length; i++) {
                        var diagnosticsFilter = _this._combineDiagnosticsFilter(args.diagnosticsFilter, "serviceName", services[i].Name);
                        servicesData.push({
                            type: "Azure.Fabric.Service",
                            name: services[i].Name,
                            attributes: [
                                { name: "id", value: Utilities.guid() },
                                { name: "parentId", value: args.id },
                                { name: "serviceId", value: services[i].Id },
                                { name: "applicationTypeName", value: args.applicationTypeName },
                                { name: "applicationTypeVersion", value: args.applicationTypeVersion },
                                { name: "applicationId", value: args.applicationId },
                                { name: "diagnosticsFilter", value: diagnosticsFilter },
                                { name: "apiServiceId", value: args.apiServiceId },
                                { name: "name", value: services[i].Name },
                                { name: "clusterName", value: args.clusterName },
                                { name: "scaleSets", value: args.scaleSets },
                                { name: "isDebuggerFeatureOn", value: args.isDebuggerFeatureOn },
                                { name: "subscription", value: args.subscription },
                                { name: "isLocal", value: args.isLocal }
                            ]
                        });
                    }
                    return Promise.resolve({
                        results: AzureResourceNodeFactory.convertToNodeCollection(servicesData)
                    });
                }, function () {
                    return _this._errorNode();
                });
            };
            this.getPartitions = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var partitionsData = [];
                return _this._host.executeOperation(AzureFabricProducer._getPartitionsHostNamespace, [args.applicationId, args.serviceId,
                    args.apiServiceId]).then(function (partitions) {
                    for (var i = 0; i < partitions.length; i++) {
                        var diagnosticsFilter = _this._combineDiagnosticsFilter(args.diagnosticsFilter, "partitionId", partitions[i].PartitionInformation.Id);
                        partitionsData.push({
                            type: "Azure.Fabric.Partition",
                            name: partitions[i].PartitionInformation.Id,
                            attributes: [
                                { name: "id", value: Utilities.guid() },
                                { name: "diagnosticsFilter", value: diagnosticsFilter },
                                { name: "partitionId", value: partitions[i].PartitionInformation.Id },
                                { name: "applicationId", value: args.applicationId },
                                { name: "serviceId", value: args.serviceId },
                                { name: "apiServiceId", value: args.apiServiceId },
                                { name: "clusterName", value: args.clusterName },
                                { name: "subscription", value: args.subscription },
                                { name: "isLocal", value: args.isLocal }
                            ]
                        });
                    }
                    return Promise.resolve({
                        results: AzureResourceNodeFactory.convertToNodeCollection(partitionsData)
                    });
                }, function () {
                    return _this._errorNode();
                });
            };
            this.getReplicas = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var replicaData = [];
                return _this._host.executeOperation(AzureFabricProducer._getReplicasHostNamespace, [args.applicationId, args.serviceId, args.partitionId, args.apiServiceId])
                    .then(function (replicas) {
                    for (var i = 0; i < replicas.length; i++) {
                        var diagnosticsFilter = _this._combineDiagnosticsFilter(args.diagnosticsFilter, "nodeName", replicas[i].NodeName);
                        replicaData.push({
                            type: "Azure.Fabric.Replica",
                            name: replicas[i].NodeName,
                            attributes: [
                                { name: "id", value: Utilities.guid() },
                                { name: "diagnosticsFilter", value: diagnosticsFilter },
                                { name: "applicationId", value: args.applicationId },
                                { name: "serviceId", value: args.serviceId },
                                { name: "partitionId", value: args.partitionId },
                                {
                                    name: "replicaId",
                                    // Stateful services use ReplicaId and Statless services use InstanceId
                                    value: replicas[i].ReplicaId ? replicas[i].ReplicaId : replicas[i].InstanceId
                                },
                                { name: "apiServiceId", value: args.apiServiceId },
                                { name: "name", value: replicas[i].NodeName },
                                { name: "clusterName", value: args.clusterName },
                                { name: "subscription", value: args.subscription },
                                { name: "isLocal", value: args.isLocal }
                            ]
                        });
                    }
                    return Promise.resolve({
                        results: AzureResourceNodeFactory.convertToNodeCollection(replicaData)
                    });
                }, function () {
                    return _this._errorNode();
                });
            };
            this._errorNode = function () {
                return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.ServiceFabric.ErrorNode").then(function (errorMessage) {
                    return Promise.resolve({
                        results: AzureResourceNodeFactory.convertToNodeCollection([{
                                type: "Azure.Fabric.Error",
                                name: errorMessage,
                                attributes: [
                                    { name: "diagnosticsFilter", value: null }
                                ]
                            }])
                    });
                });
            };
            this._combineDiagnosticsFilter = function (parentDiagnosticsFilter, attributeName, attributeValue) {
                var diagnosticsFilter = attributeName + "=\"" + attributeValue + "\"";
                if (parentDiagnosticsFilter && parentDiagnosticsFilter !== "") {
                    diagnosticsFilter += " AND " + parentDiagnosticsFilter;
                }
                return diagnosticsFilter;
            };
            this._host = host;
            this._host.onHostEvent(AzureFabricProducer._clusterChangedHostNamespace, function (event) {
                var applicationGroupId = _this._applicationGroupIds[event.HostName];
                if (!applicationGroupId) {
                    applicationGroupId = _this._applicationGroupIds[event.Hostname];
                }
                if (applicationGroupId) {
                    _this._host.executeOperation(AzureFabricActions.refreshNode, [{ id: applicationGroupId }]);
                }
            });
        }
        return AzureFabricProducer;
    }());
    AzureFabricProducer.getGroupNodes = "Azure.Producers.Fabric.GetGroupNodes";
    AzureFabricProducer.getApplicationTypes = "Azure.Producers.Fabric.GetApplicationTypes";
    AzureFabricProducer.getNodes = "Azure.Producers.Fabric.GetNodes";
    AzureFabricProducer.getApplications = "Azure.Producers.Fabric.GetApplications";
    AzureFabricProducer.getServices = "Azure.Producers.Fabric.GetServices";
    AzureFabricProducer.getPartitions = "Azure.Producers.Fabric.GetPartitions";
    AzureFabricProducer.getReplicas = "Azure.Producers.Fabric.GetReplicas";
    AzureFabricProducer._getApplicationTypesHostNamespace = "AzureFabric.getApplicationTypes";
    AzureFabricProducer._getNodesHostNamespace = "AzureFabric.getNodes";
    AzureFabricProducer._getApplicationsHostNamespace = "AzureFabric.getApplications";
    AzureFabricProducer._getServicesHostNamespace = "AzureFabric.getServices";
    AzureFabricProducer._getPartitionsHostNamespace = "AzureFabric.getPartitions";
    AzureFabricProducer._getReplicasHostNamespace = "AzureFabric.getReplicas";
    AzureFabricProducer._clusterChangedHostNamespace = "AzureFabric.clusterChanged";
    return AzureFabricProducer;
});

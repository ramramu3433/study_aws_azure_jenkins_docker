/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Nodes/AzureResourceNodeFactory", "URIjs/URITemplate", "Common/Utilities", "Providers/Azure/AzureDataFactoryConstants", "es6-promise"], function (require, exports, AzureResourceNodeFactory, URITemplate, Utilities, AzureDataFactoryConstants, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    var ResourceType;
    (function (ResourceType) {
        ResourceType[ResourceType["linkedservices"] = 0] = "linkedservices";
        ResourceType[ResourceType["datasets"] = 1] = "datasets";
        ResourceType[ResourceType["datapipelines"] = 2] = "datapipelines";
    })(ResourceType || (ResourceType = {}));
    /**
     * Contains the query actions that return Azure Data Factory Resources.
     */
    var AzureDataFactoryProducer = (function () {
        function AzureDataFactoryProducer(azureDataFactoryManager) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureDataFactoryProducer.getGroupNodesNamespace, _this.getGroupNodes);
                queryBindingManager.addProducerBinding(AzureDataFactoryProducer.getAllLinkedServicesNamespace, _this.getAllLinkedServices);
                queryBindingManager.addProducerBinding(AzureDataFactoryProducer.getAllDatasetsNamespace, _this.getAllDatasets);
                queryBindingManager.addProducerBinding(AzureDataFactoryProducer.getAllPipelinesNamespace, _this.getAllPipelines);
            };
            /**
             * Gets all Grounp Nodes form a Data Factory.
             */
            this.getGroupNodes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var id = args.id;
                var dataFactoryName = args.dataFactoryName;
                var subscription = args.subscription;
                var attributes = [
                    {
                        name: "dataFactoryName",
                        value: dataFactoryName
                    },
                    {
                        name: "id",
                        value: id
                    },
                    {
                        name: "subscription",
                        value: subscription
                    }
                ];
                var dataFactoryGroupNodeData = [];
                dataFactoryGroupNodeData.push({
                    type: "Azure.DataFactoryLinkedServiceGroup",
                    name: "LinkedServices",
                    attributes: attributes
                });
                dataFactoryGroupNodeData.push({
                    type: "Azure.DataFactoryDatasetGroup",
                    name: "DataSets",
                    attributes: attributes
                });
                dataFactoryGroupNodeData.push({
                    type: "Azure.DataFactoryPipelineGroup",
                    name: "Pipelines",
                    attributes: attributes
                });
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(dataFactoryGroupNodeData)
                });
            };
            /**
             * Gets all Linked Services from a Data Factory.
             */
            this.getAllLinkedServices = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                args.resourceType = ResourceType.linkedservices;
                return _this._getDataFactoryResult(args, continuationToken, "Azure.DataFactoryLinkedService");
            };
            /**
             * Gets all Datasets from a Data Factory.
             */
            this.getAllDatasets = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                args.resourceType = ResourceType.datasets;
                return _this._getDataFactoryResult(args, continuationToken, "Azure.DataFactoryDataset");
            };
            /**
             * Gets all Pipelines from a Data Factory.
             */
            this.getAllPipelines = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                args.resourceType = ResourceType.datapipelines;
                return _this._getDataFactoryResult(args, continuationToken, "Azure.DataFactoryPipeline");
            };
            this._getDataFactoryResult = function (args, continuationToken, nodeType) {
                var dataFactoryName = args.dataFactoryName;
                var id = args.id;
                var resourceType = args.resourceType;
                var subscription = JSON.parse(args.subscription);
                var url = AzureDataFactoryProducer._uriListTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: id,
                    type: ResourceType[resourceType],
                    apiVersion: AzureDataFactoryConstants.apiVersion.currentVersion
                });
                var headers = {};
                headers["x-ms-client-request-id"] = Utilities.guid();
                headers["x-ms-retry-count"] = "0";
                return _this._azureConnection.webRequest(url.toString(), subscription, "GET", headers)
                    .then(function (response) {
                    var resources = [];
                    var parsedResponse = JSON.parse(response);
                    if (!!parsedResponse && !!parsedResponse.value && parsedResponse.value.length) {
                        parsedResponse.value.forEach(function (resource) {
                            var resourceId = resource.id;
                            // TODO: remove the following code after bug 7191875 is fixed.
                            if (resourceType === ResourceType.datasets) {
                                var beforeName = "/tables/";
                                var aftername = "/datasets/";
                                var index = resourceId.lastIndexOf(beforeName);
                                if (index !== -1) {
                                    resourceId = resourceId.substr(0, index) + aftername + resourceId.substr(index + beforeName.length);
                                }
                            }
                            var attributes = [
                                {
                                    name: "dataFactoryName",
                                    value: dataFactoryName
                                },
                                {
                                    name: "id",
                                    value: resourceId
                                },
                                {
                                    name: "subscription",
                                    value: args.subscription
                                },
                                {
                                    name: "name",
                                    value: resource.name
                                },
                                {
                                    name: "nodeType",
                                    value: nodeType
                                }
                            ];
                            if (resourceType === ResourceType.linkedservices) {
                                var linkedservice = resource;
                                attributes.push({ name: "dataStoreType", value: linkedservice.properties.type });
                            }
                            else if (resourceType === ResourceType.datasets) {
                                var table = resource;
                                attributes.push({ name: "createTime", value: new Date(table.properties.createTime).toUTCString() });
                                attributes.push({ name: "type", value: table.properties.type });
                                attributes.push({ name: "provisioningState", value: table.properties.provisioningState });
                            }
                            else if (resourceType === ResourceType.datapipelines) {
                                var pipeline = resource;
                                attributes.push({
                                    name: "deploymentTime",
                                    value: new Date(pipeline.properties.runtimeInfo.deploymentTime).toUTCString()
                                });
                                attributes.push({
                                    name: "startTime",
                                    value: !pipeline.properties.start ? "--" : new Date(pipeline.properties.start).toUTCString()
                                });
                                attributes.push({
                                    name: "endTime",
                                    value: !pipeline.properties.end ? "--" : new Date(pipeline.properties.end).toUTCString()
                                });
                                attributes.push({ name: "isPaused", value: pipeline.properties.isPaused });
                                attributes.push({ name: "provisioningState", value: pipeline.properties.provisioningState });
                            }
                            resources.push({
                                type: nodeType,
                                name: resource.name,
                                attributes: attributes
                            });
                        });
                    }
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(resources),
                        continuationToken: continuationToken
                    };
                });
            };
            this._azureConnection = azureDataFactoryManager;
        }
        return AzureDataFactoryProducer;
    }());
    AzureDataFactoryProducer.getGroupNodesNamespace = "Azure.Producers.DataFactory.GetGroupNodes";
    AzureDataFactoryProducer.getAllLinkedServicesNamespace = "Azure.Producers.DataFactory.GetAllLinkedServices";
    AzureDataFactoryProducer.getAllDatasetsNamespace = "Azure.Producers.DataFactory.getAllDatasets";
    AzureDataFactoryProducer.getAllPipelinesNamespace = "Azure.Producers.DataFactory.GetAllPipelines";
    AzureDataFactoryProducer._uriListTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/{+type}?api-version={+apiVersion}");
    return AzureDataFactoryProducer;
});

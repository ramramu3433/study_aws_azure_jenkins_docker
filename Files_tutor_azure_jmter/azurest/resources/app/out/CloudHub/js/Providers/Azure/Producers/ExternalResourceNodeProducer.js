/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "es6-promise", "Providers/Common/AzureConstants", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Providers/Azure/Resources/AzureResources", "Common/Utilities"], function (require, exports, _, es6_promise_1, AzureConstants, AzureResourceNodeFactory, AzureResources, Utilities) {
    "use strict";
    /**
     * Contains the query actions that return external resource nodes.
     */
    var ExternalResourceNodeProducer = (function () {
        function ExternalResourceNodeProducer(azureConnection, host) {
            var _this = this;
            this.registerStorageProducer = function (azureStorageProducer) {
                _this._azureStorageProducer = azureStorageProducer;
            };
            this.registerDataLakeAnalyticsProducer = function (azureDataLakeAnalyticsProducer) {
                _this._azureDataLakeAnalyticsProducer = azureDataLakeAnalyticsProducer;
            };
            this.registerDocumentDBProducer = function (azureDocumentDBProducer) {
                _this._azureDocumentDBProducer = azureDocumentDBProducer;
            };
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(ExternalResourceNodeProducer.getAllExternalResourceNodesNamespace, _this.getAll);
            };
            /**
             * Gets all external resource nodes.
             */
            this.getAll = function (args, continuationToken, resourceTypes, findExactName, searchResourceName) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                if (resourceTypes === void 0) { resourceTypes = null; }
                if (findExactName === void 0) { findExactName = false; }
                if (searchResourceName === void 0) { searchResourceName = ""; }
                var searchQuery = args.$search;
                var asyncProducers = [];
                // Other than Storage Accounts external nodes, external resource nodes should only show in VS Cloud Explorer.
                if (!Utilities.isRunningOnElectron()) {
                    // If no resource types, include these external resources nodes; otherwise type must be in resourceTypes.
                    if (!resourceTypes || _.contains(resourceTypes, AzureConstants.resourceTypes.ServiceFabricLocalClusters)) {
                        asyncProducers.push(_this.getServiceFabricLocalNode(searchQuery));
                    }
                    if (_this._azureDataLakeAnalyticsProducer) {
                        if (!resourceTypes || _.contains(resourceTypes, AzureConstants.resourceTypes.DataLakeAnalyticsLocal)) {
                            asyncProducers.push(es6_promise_1.Promise.resolve(_this._azureDataLakeAnalyticsProducer.getDataLakeLocalNode(searchQuery)));
                        }
                    }
                }
                // External and local resource nodes for documentDB should only show in Storage Explorer
                if (Utilities.isRunningOnElectron() && _this._azureDocumentDBProducer) {
                    asyncProducers.push(es6_promise_1.Promise.resolve(_this._azureDocumentDBProducer.getExternalDocumentDBNodes(searchQuery, findExactName, searchResourceName)));
                    asyncProducers.push(es6_promise_1.Promise.resolve(_this._azureDocumentDBProducer.getDevelopmentDocumentDBNode(searchQuery)));
                }
                if (_this._azureStorageProducer) {
                    asyncProducers.push(es6_promise_1.Promise.resolve(_this._azureStorageProducer.getDevelopmentStorageAccountNode(searchQuery)));
                    asyncProducers.push(es6_promise_1.Promise.resolve(_this._azureStorageProducer.getExternalStorageAccountNodes(searchQuery, findExactName, searchResourceName)));
                    asyncProducers.push(es6_promise_1.Promise.resolve(_this._azureStorageProducer.getServiceSASNode(searchQuery, findExactName, searchResourceName)));
                }
                return es6_promise_1.Promise.all(asyncProducers)
                    .then(function (asyncResources) {
                    var nodes = [];
                    asyncResources.forEach(function (resources) {
                        nodes = nodes.concat(resources);
                    });
                    return {
                        results: nodes,
                        continuationToken: continuationToken
                    };
                });
            };
            // TODO: move external node generation logic to the respective producers (see AD nodes)
            this.getServiceFabricLocalNode = function (searchQuery) {
                return _this._host.executeOperation(ExternalResourceNodeProducer._isInstalledHostNamespace)
                    .then(function (isInstalled) {
                    return _this._host.resolveResource(AzureResources.commonNamespace, "Properties.ServiceFabric.LocalClusterName")
                        .then(function (localClusterName) {
                        var resources = [];
                        if (isInstalled) {
                            resources = [{
                                    name: localClusterName,
                                    type: AzureConstants.resourceTypes.ServiceFabricLocalClusters,
                                    attributes: [
                                        { name: "id", value: Utilities.guid() },
                                        { name: "name", value: localClusterName },
                                        { name: "diagnosticsFilter", value: null }
                                    ]
                                }];
                        }
                        var nodes = [];
                        resources.forEach(function (resource) {
                            var highlightLocations = Utilities.getHighlightLocations(resource.name, searchQuery);
                            // Add the external resource if there's no search
                            // query, or if the resource contains the search query
                            if (!searchQuery || highlightLocations.length) {
                                var node = ExternalResourceNodeProducer.convertRawDataToNode(resource, searchQuery, highlightLocations);
                                nodes.push(node);
                            }
                        });
                        return es6_promise_1.Promise.resolve(nodes);
                    });
                });
            };
            this._azureConnection = azureConnection;
            this._host = host;
        }
        return ExternalResourceNodeProducer;
    }());
    ExternalResourceNodeProducer.getAllExternalResourceNodesNamespace = "Azure.Producers.ExternalResourceNodes.GetAll";
    ExternalResourceNodeProducer._isInstalledHostNamespace = "AzureFabric.isInstalled";
    ExternalResourceNodeProducer.convertRawDataToNode = function (rawData, searchQuery, highlightLocations) {
        rawData.attributes = rawData.attributes.concat({
            name: "highlightLocations",
            value: JSON.stringify(highlightLocations)
        });
        return AzureResourceNodeFactory.convertAzureResource(rawData);
    };
    return ExternalResourceNodeProducer;
});

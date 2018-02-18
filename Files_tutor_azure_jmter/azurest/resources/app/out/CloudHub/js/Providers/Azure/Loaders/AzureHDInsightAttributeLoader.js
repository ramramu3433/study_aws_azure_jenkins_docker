/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper", "URIjs/URITemplate"], function (require, exports, AttributeLoaderHelper, URITemplate) {
    "use strict";
    /**
     * Contains the query actions that return Azure Resource entitites.
     */
    var AzureHDInsightAttributeLoader = (function () {
        function AzureHDInsightAttributeLoader(azureConnection, hostProxy) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureHDInsightAttributeLoader.getGetClusterDetailsNamespace, _this._getGetClusterDetails);
                loaderBindingManger.addAttributeLoaderBinding(AzureHDInsightAttributeLoader.getDatabasePropertyNamespace, _this.getDatabaseProperty);
                loaderBindingManger.addAttributeLoaderBinding(AzureHDInsightAttributeLoader.getTablePropertyNamespace, _this.getTableProperty);
                loaderBindingManger.addAttributeLoaderBinding(AzureHDInsightAttributeLoader.getStoragePropertyNamespace, _this.getStorageProperty);
            };
            this._getGetClusterDetails = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var attributes = [
                        {
                            name: "clusterProperties",
                            value: resource.properties
                        }
                    ];
                    return { results: attributes };
                });
            };
            /**
             * Get Database and table property from DataLake Service through HDInsightProvider.
             */
            this.getDatabaseProperty = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.HDInsight.GetDatabaseProperty", [{ clusterName: args.clusterName, databaseName: args.databaseName }])
                    .then(function (database) {
                    return {
                        results: [
                            { name: "comment", value: database.comment },
                            { name: "location", value: database.location },
                            { name: "owner", value: database.owner }
                        ]
                    };
                });
            };
            this.getTableProperty = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.HDInsight.GetTableProperty", [{ clusterName: args.clusterName, databaseName: args.databaseName, tableName: args.tableName }])
                    .then(function (table) {
                    return {
                        results: [
                            { name: "databaseName", value: table.databaseName },
                            { name: "sd", value: table.sd },
                            { name: "maxFileSize", value: table.maxFileSize },
                            { name: "minFileSize", value: table.minFileSize },
                            { name: "owner", value: table.owner },
                            { name: "tableType", value: table.tableType },
                            { name: "totalFileSize", value: table.totalFileSize },
                            { name: "totalNumberFiles", value: table.totalNumberFiles }
                        ]
                    };
                });
            };
            this.getStorageProperty = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.HDInsight.GetStorageProperty", [{ clusterName: args.clusterName, wasbAccountName: args.wasbAccountName, key: args.key, defaultStorageTag: args.defaultStorageTag }])
                    .then(function (storage) {
                    return {
                        results: [
                            { name: "created", value: storage.created },
                            { name: "customDomains", value: storage.customDomains },
                            { name: "lastGeoFailover", value: storage.lastGeoFailover },
                            { name: "location", value: storage.location },
                            { name: "primaryRegion", value: storage.primaryRegion },
                            { name: "primaryStatus", value: storage.primaryStatus },
                            { name: "replication", value: storage.replication },
                            { name: "secondaryRegion", value: storage.secondaryRegion },
                            { name: "secondaryStatus", value: storage.secondaryStatus },
                            { name: "status", value: storage.status },
                            { name: "subscriptionId", value: storage.subscriptionId },
                            { name: "subscriptionName", value: storage.subscriptionName }
                        ]
                    };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
            this._host = hostProxy;
        }
        return AzureHDInsightAttributeLoader;
    }());
    AzureHDInsightAttributeLoader.getGetClusterDetailsNamespace = "Azure.Attributes.HDInsight.getGetClusterDetails";
    AzureHDInsightAttributeLoader.getDatabasePropertyNamespace = "Azure.Attributes.HDInsight.getGetDatabaseProperty";
    AzureHDInsightAttributeLoader.getTablePropertyNamespace = "Azure.Attributes.HDInsight.getGetTableProperty";
    AzureHDInsightAttributeLoader.getStoragePropertyNamespace = "Azure.Attributes.HDInsight.getGetStorageProperty";
    AzureHDInsightAttributeLoader.ResourceConfigUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/config/web?api-version={+apiVersion}");
    return AzureHDInsightAttributeLoader;
});

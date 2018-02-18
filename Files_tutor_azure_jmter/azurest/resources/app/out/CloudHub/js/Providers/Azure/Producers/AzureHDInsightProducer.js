/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Providers/Azure/Resources/AzureResources", "Common/Errors", "Providers/CloudExplorer/Actions/CloudExplorerActions", "es6-promise"], function (require, exports, AzureResourceNodeFactory, AzureResources, Errors, CloudExplorerActions, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /* tslint:enable */
    var AzureHDInsightProducer = (function () {
        function AzureHDInsightProducer(host) {
            var _this = this;
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureHDInsightProducer.GetAccountInfoNamespace, _this.getAccountInfo);
                queryBindingManager.addProducerBinding(AzureHDInsightProducer.GetHiveDatabasesNamespace, _this.getHiveDatabases);
                queryBindingManager.addProducerBinding(AzureHDInsightProducer.GetHiveTablesNamespace, _this.getHiveTables);
                queryBindingManager.addActionBinding(AzureHDInsightProducer.GetTableColumnsNamespace, _this.getTableColumns);
                queryBindingManager.addProducerBinding(AzureHDInsightProducer.GetContainersNamespace, _this.getContainers);
                queryBindingManager.addProducerBinding(AzureHDInsightProducer.GetHadoopServicelogTableNamespace, _this.getHadoopServicelogTable);
            };
            this.getAccountInfo = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.HDInsight.DefaultStorageAccount").then(function (defaultStorageAccount) {
                    return _this._host.resolveResource(AzureResources.commonNamespace, "Actions.HDInsight.LinkedStorageAccount").then(function (linkedStorageAccount) {
                        return _this._host.executeOperation("Azure.Actions.HDInsight.GetAccount", [{ clusterName: args.clusterName }])
                            .then(function (response) {
                            var accountGroupData = [];
                            var attributes = [
                                {
                                    name: "clusterName",
                                    value: args.clusterName
                                },
                                // TODO: This is a workaround for AzureResourceProducer.getHighlightLocations logic not being public/reusable.
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ];
                            accountGroupData.push({
                                type: "Azure.HDInsight.HiveDatabaseGroup",
                                name: "Hive Databases",
                                attributes: attributes.concat([{
                                        name: "nodeType",
                                        value: "Azure.HDInsight.HiveDatabaseGroup"
                                    }])
                            });
                            accountGroupData.push({
                                type: "Azure.HDInsight.HadoopServiceLogGroup",
                                name: "Hadoop Service Log",
                                attributes: attributes
                            });
                            var storages = response.hdiStorages;
                            storages.forEach(function (storage) {
                                var wasb = storage.wasbStorage;
                                var storageAttributes = [
                                    {
                                        name: "containers",
                                        value: wasb.containers
                                    },
                                    {
                                        name: "wasbAccountName",
                                        value: wasb.name
                                    },
                                    {
                                        name: "key",
                                        value: storage.key
                                    },
                                    {
                                        name: "defaultContainer",
                                        value: storage.defaultContainer
                                    }
                                ];
                                if (storage.isDefault === true) {
                                    storageAttributes.push({
                                        name: "defaultStorageTag",
                                        value: defaultStorageAccount || "Default Storage Account"
                                    });
                                }
                                else {
                                    storageAttributes.push({
                                        name: "defaultStorageTag",
                                        value: linkedStorageAccount || "Linked Storage Account"
                                    });
                                }
                                accountGroupData.push({
                                    type: "Azure.HDInsight.StorageAccount",
                                    name: wasb.name,
                                    attributes: attributes.concat(storageAttributes)
                                });
                            });
                            return {
                                results: AzureResourceNodeFactory.convertToNodeCollection(accountGroupData)
                            };
                        }, function (error) { AzureHDInsightProducer.handleError(error); });
                    });
                });
            };
            this.getHiveDatabases = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.HDInsight.GetHiveDatabases", [{ clusterName: args.clusterName }])
                    .then(function (result) {
                    var databases = [];
                    result.forEach(function (database) {
                        databases.push({
                            type: "Azure.HDInsight.HiveDatabase",
                            name: database,
                            attributes: [
                                {
                                    name: "clusterName",
                                    value: args.clusterName
                                },
                                {
                                    name: "databaseName",
                                    value: database
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.HDInsight.HiveDatabase"
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(databases)
                    };
                }, function (error) { AzureHDInsightProducer.handleError(error); });
            };
            this.getHiveTables = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.HDInsight.GetHiveTables", [{ clusterName: args.clusterName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var tablesNodeData = [];
                    result.forEach(function (table) {
                        tablesNodeData.push({
                            type: "Azure.HDInsight.Database.Table",
                            name: table,
                            attributes: [
                                {
                                    name: "clusterName",
                                    value: args.clusterName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "tableName",
                                    value: table
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.HDInsight.Database.Table"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(tablesNodeData)
                    };
                }, function (error) { AzureHDInsightProducer.handleError(error); });
            };
            this.getTableColumns = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.HDInsight.GetTableColumns", [{ clusterName: args.clusterName, databaseName: args.databaseName, tableName: args.tableName }])
                    .then(function (result) {
                    var columnsNodeData = [];
                    result.forEach(function (column) {
                        columnsNodeData.push({
                            type: "Azure.HDInsight.Database.Table.Column",
                            name: column.name,
                            attributes: [
                                {
                                    name: "clusterName",
                                    value: args.clusterName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "tableName",
                                    value: args.tableName
                                },
                                {
                                    name: "columnName",
                                    value: column.name
                                },
                                {
                                    name: "columnType",
                                    value: column.type
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.HDInsight.Database.Table.Column"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(columnsNodeData)
                    };
                }, function (error) { AzureHDInsightProducer.handleError(error); });
            };
            /*get containers from local memory, not from DataLakeService*/
            this.getContainers = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.HDInsight.GetContainerProperty", [{
                        clusterName: args.clusterName, wasbAccountName: args.wasbAccountName,
                        key: args.key, defaultStorageTag: args.defaultStorageTag
                    }])
                    .then(function (containerProperties) {
                    var containersNodeData = [];
                    var containers = args.containers;
                    containers.forEach(function (container) {
                        var attributes = [
                            {
                                name: "clusterName",
                                value: args.clusterName
                            },
                            {
                                name: "wasbAccountName",
                                value: args.wasbAccountName
                            },
                            {
                                name: "container",
                                value: container
                            },
                            {
                                name: "key",
                                value: args.key
                            },
                            {
                                name: "defaultStorageTag",
                                value: args.defaultStorageTag
                            },
                            {
                                name: "nodeType",
                                value: "Azure.HDInsight.Storage.Container"
                            },
                            {
                                name: "nodeType",
                                value: "Azure.HDInsight.Storage.Container"
                            },
                            {
                                name: "containerProperties",
                                value: containerProperties.filter(function (r) { return r.name === container; })[0]
                            }
                        ];
                        if (args.defaultContainer === container) {
                            attributes.push({
                                name: "defaultContainerTag",
                                value: "Default Container Account"
                            });
                        }
                        containersNodeData.push({
                            type: "Azure.HDInsight.Storage.Container",
                            name: container,
                            attributes: attributes
                        });
                    });
                    return Promise.resolve({
                        results: AzureResourceNodeFactory.convertToNodeCollection(containersNodeData)
                    });
                });
            };
            this.getHadoopServicelogTable = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.HDInsight.GetHadoopServicelogTable", [{ clusterName: args.clusterName }])
                    .then(function (result) {
                    var logNodeData = [];
                    result.forEach(function (logTableName) {
                        logNodeData.push({
                            type: "Azure.HDInsight.HadoopServiceLogTable",
                            name: logTableName,
                            attributes: [
                                {
                                    name: "clusterName",
                                    value: args.clusterName
                                },
                                {
                                    name: "logTableName",
                                    value: logTableName
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.HDInsight.HadoopServiceLogTable"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(logNodeData)
                    };
                }, function (error) { AzureHDInsightProducer.handleError(error); });
            };
            this._host = host;
        }
        return AzureHDInsightProducer;
    }());
    AzureHDInsightProducer.GetAccountInfoNamespace = "Azure.Producers.HDInsight.GenerateAccountNode";
    AzureHDInsightProducer.GetHiveDatabasesNamespace = "Azure.Producers.HDInsight.GetHiveDatabases";
    AzureHDInsightProducer.GetHiveTablesNamespace = "Azure.Producers.HDInsight.GetHiveTables";
    AzureHDInsightProducer.GetTableColumnsNamespace = "Azure.Producers.HDInsight.GetTableColumns";
    AzureHDInsightProducer.GetContainersNamespace = "Azure.Producers.HDInsight.GetContainers";
    AzureHDInsightProducer.GetHadoopServicelogTableNamespace = "Azure.Producers.HDInsight.GetHadoopServicelogTable";
    AzureHDInsightProducer.handleError = function (error) {
        var errorToThrow = error;
        if (error.name === "DataLakePackageNotInstalled") {
            errorToThrow = new Errors.ActionableError(error, "Cloud Explorer and the Data Lake Tools are out of sync.  To resolve this, please try to update Cloud Explorer in Tools -> Extensions and Updates -> Updates -> Visual Studio Gallery, and install the latest ", "Azure Data Lake Tools.", CloudExplorerActions.openUrlNamespace, { url: "https://go.microsoft.com/fwlink/?LinkID=616477" });
        }
        else {
            errorToThrow = new Errors.DisplayableError(error.message, error);
        }
        throw errorToThrow;
    };
    return AzureHDInsightProducer;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Providers/Azure/Resources/AzureResources", "Common/Errors", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Providers/Azure/Producers/ExternalResourceNodeProducer", "Providers/Common/AzureConstants", "Common/Utilities", "es6-promise"], function (require, exports, AzureResourceNodeFactory, AzureResources, Errors, CloudExplorerActions, ExternalResourceNodeProducer, AzureConstants, Utilities, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /* tslint:enable */
    var AzureDataLakeAnalyticsProducer = (function () {
        function AzureDataLakeAnalyticsProducer(host) {
            var _this = this;
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetAccountInfoNamespace, _this.getAccountInfo);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetLocalAccountNamespace, _this.getLocalAccount);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetDatabasesNamespace, _this.getAllDatabases);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetLinkedStoragesNamespace, _this.getLinkedStorages);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetContainersNamespace, _this.getContainers);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GenerateCatalogDatabaseNode, _this.generateCatalogDatabaseNode);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogAssemblies, _this.getCatalogAssemblies);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogSchemas, _this.getCatalogSchemas);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogTables, _this.getCatalogTables);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogTableTypes, _this.getCatalogTableTypes);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogProcedures, _this.getCatalogProcedures);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogTvfs, _this.getCatalogTvfs);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogViews, _this.getCatalogViews);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogTableInfo, _this.getCatalogTableInfo);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogTableColumns, _this.getCatalogTableColumns);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogTableIndexes, _this.getCatalogTableIndexes);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogTablePartitions, _this.getCatalogTablePartitions);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCatalogTableStatistics, _this.getCatalogTableStatistics);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetCredentials, _this.getCredentials);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetExternalDataSources, _this.getExternalDataSources);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetExternalDataSourceInfo, _this.getExternalDataSourceInfo);
                queryBindingManager.addProducerBinding(AzureDataLakeAnalyticsProducer.GetExternalDataSourcePushdownTypes, _this.getExternalDataSourcePushdownTypes);
            };
            this.getAccountInfo = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.GetAccount", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName }])
                    .then(function (response) {
                    var accountGroupData = [];
                    var attributes = [
                        {
                            name: "dataLakeAnalyticsAccountName",
                            value: args.dataLakeAnalyticsAccountName
                        },
                        // TODO: This is a workaround for AzureResourceProducer.getHighlightLocations logic not being public/reusable.
                        {
                            name: "highlightLocations",
                            value: null
                        }
                    ];
                    accountGroupData.push({
                        type: "Azure.DataLake.Analytics.Catalog.DatabaseGroup",
                        name: "Databases",
                        attributes: attributes.concat([{
                                name: "nodeType",
                                value: "Azure.DataLake.Analytics.Catalog.DatabaseGroup"
                            }])
                    }, {
                        type: "Azure.DataLake.Analytics.Jobs",
                        name: "Jobs",
                        attributes: attributes
                    }, {
                        type: "Azure.DataLake.Analytics.LinkedStorages",
                        name: "Linked Storages",
                        attributes: attributes.concat({
                            name: "linkedStorages",
                            value: response.linkedStorages
                        })
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(accountGroupData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getLocalAccount = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var localNodeData = [];
                var attributes = [
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: "localcomputeaccount"
                    },
                    {
                        name: "highlightLocations",
                        value: null
                    }
                ];
                localNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.DatabaseGroup",
                    name: "Databases",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.DatabaseGroup"
                        }])
                });
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(localNodeData)
                });
            };
            this.getDataLakeLocalNode = function (searchQuery) {
                var nodes = [];
                var resources = [{
                        name: "(Local)",
                        type: AzureConstants.resourceTypes.DataLakeAnalyticsLocal,
                        attributes: [
                            {
                                name: "name",
                                value: null
                            }
                        ]
                    }];
                resources.forEach(function (resource) {
                    var highlightLocations = Utilities.getHighlightLocations(resource.name, searchQuery);
                    // Add the external resource if there's no search
                    // query, or if the resource contains the search query
                    if (!searchQuery || highlightLocations.length) {
                        var node = ExternalResourceNodeProducer.convertRawDataToNode(resource, searchQuery, highlightLocations);
                        nodes.push(node);
                    }
                });
                return nodes;
            };
            this.getAllDatabases = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetDatabases", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName }])
                    .then(function (result) {
                    var databases = [];
                    result.forEach(function (database) {
                        databases.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database",
                            name: database,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
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
                                    value: "Azure.DataLake.Analytics.Catalog.Database"
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(databases)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getLinkedStorages = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var linkedStoragesNodeData = [];
                var linkedStorages = args.linkedStorages;
                return Promise.all([
                    _this._host.resolveResource(AzureResources.commonNamespace, "Actions.DataLake.Analytics.DefaultStorageAccount"),
                    _this._host.executeOperation("Azure.Actions.DataLake.Analytics.GetDefaultStorage", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName }])
                ]).then(function (values) {
                    var defaultStorageAccount = values[0];
                    var defaultAccountName = values[1];
                    linkedStorages.wasbStorages.forEach(function (wasb) {
                        linkedStoragesNodeData.push({
                            type: "Azure.DataLake.Analytics.LinkedStorage.Wasb",
                            name: wasb.name,
                            attributes: [
                                {
                                    name: "containers",
                                    value: wasb.containers
                                },
                                {
                                    name: "wasbAccountName",
                                    value: wasb.name
                                },
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                }
                            ]
                        });
                    });
                    linkedStorages.adlStorages.forEach(function (adl) {
                        var attributes = [
                            {
                                name: "adlAccountName",
                                value: adl.name
                            },
                            {
                                name: "dataLakeAnalyticsAccountName",
                                value: args.dataLakeAnalyticsAccountName
                            }
                        ];
                        if (defaultAccountName === adl.name) {
                            attributes.push({
                                name: "defaultStorageTag",
                                value: defaultStorageAccount || "Default Storage Account"
                            });
                        }
                        linkedStoragesNodeData.push({
                            type: "Azure.DataLake.Store",
                            name: adl.name,
                            attributes: attributes
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(linkedStoragesNodeData)
                    };
                });
            };
            this.getContainers = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var containersNodeData = [];
                var containers = args.containers;
                containers.forEach(function (container) {
                    containersNodeData.push({
                        type: "Azure.DataLake.Analytics.LinkedStorages.Wasb.Container",
                        name: container,
                        attributes: [
                            {
                                name: "dataLakeAnalyticsAccountName",
                                value: args.dataLakeAnalyticsAccountName
                            },
                            {
                                name: "wasbAccountName",
                                value: args.wasbAccountName
                            },
                            {
                                name: "container",
                                value: container
                            }
                        ]
                    });
                });
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(containersNodeData)
                });
            };
            this.generateCatalogDatabaseNode = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var databaseNodeData = [];
                var attributes = [
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: args.dataLakeAnalyticsAccountName
                    },
                    {
                        name: "databaseName",
                        value: args.databaseName
                    },
                    {
                        name: "highlightLocations",
                        value: null
                    }
                ];
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.AssembliesGroup",
                    name: "Assemblies",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.AssembliesGroup"
                        }])
                }, {
                    type: "Azure.DataLake.Analytics.Catalog.Database.SchemasGroup",
                    name: "Schemas",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.SchemasGroup"
                        }])
                }, {
                    type: "Azure.DataLake.Analytics.Catalog.Database.TablesGroup",
                    name: "Tables",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.TablesGroup"
                        }])
                }, {
                    type: "Azure.DataLake.Analytics.Catalog.Database.TvfsGroup",
                    name: "Tvfs",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.TvfsGroup"
                        }])
                });
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.ProceduresGroup",
                    name: "Procedures",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.ProceduresGroup"
                        }])
                });
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.ViewsGroup",
                    name: "Views",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.ViewsGroup"
                        }])
                });
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.TableTypesGroup",
                    name: "TableTypes",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.TableTypesGroup"
                        }])
                });
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.CredentialsGroup",
                    name: "Credentials",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.CredentialsGroup"
                        }])
                });
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.ExternalDataSourcesGroup",
                    name: "ExternalDataSources",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.ExternalDataSourcesGroup"
                        }])
                });
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(databaseNodeData)
                });
            };
            this.getCatalogAssemblies = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetAssemblies", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var assembliesNodeData = [];
                    result.forEach(function (assemblyName) {
                        assembliesNodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.Assembly",
                            name: assemblyName,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "assemblyName",
                                    value: assemblyName
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.Assembly"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(assembliesNodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getCatalogSchemas = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetSchemas", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var schemasNodeData = [];
                    result.forEach(function (schemaName) {
                        schemasNodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.Schema",
                            name: schemaName,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "schemaName",
                                    value: schemaName
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.Schema"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(schemasNodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getCatalogTables = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetTables", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var tablesNodeData = [];
                    result.forEach(function (table) {
                        tablesNodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.Table",
                            name: table.schemaName + "." + table.name,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "schemaName",
                                    value: table.schemaName
                                },
                                {
                                    name: "tableName",
                                    value: table.name
                                },
                                {
                                    name: "table",
                                    value: table
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.Table"
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
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getCatalogTableTypes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetTableTypes", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var nodeData = [];
                    result.forEach(function (type) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.TableType",
                            name: type.schemaName + "." + type.name,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "schemaName",
                                    value: type.schemaName
                                },
                                {
                                    name: "typeName",
                                    value: type.name
                                },
                                {
                                    name: "type",
                                    value: type
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.Table"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getCatalogTvfs = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetTvfs", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var nodeData = [];
                    result.forEach(function (tvf) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.Tvf",
                            name: tvf.schemaName + "." + tvf.name,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "schemaName",
                                    value: tvf.schemaName
                                },
                                {
                                    name: "name",
                                    value: tvf.name
                                },
                                {
                                    name: "content",
                                    value: tvf.definition
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.Tvf"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getCatalogViews = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetViews", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var nodeData = [];
                    result.forEach(function (view) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.View",
                            name: view.schemaName + "." + view.name,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "schemaName",
                                    value: view.schemaName
                                },
                                {
                                    name: "name",
                                    value: view.name
                                },
                                {
                                    name: "content",
                                    value: view.definition
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.View"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getCatalogProcedures = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetProcedures", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var nodeData = [];
                    result.forEach(function (procedure) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.Procedure",
                            name: procedure.schemaName + "." + procedure.name,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "schemaName",
                                    value: procedure.schemaName
                                },
                                {
                                    name: "name",
                                    value: procedure.name
                                },
                                {
                                    name: "content",
                                    value: procedure.definition
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.Procedure"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getCatalogTableInfo = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var databaseNodeData = [];
                var attributes = [
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: args.dataLakeAnalyticsAccountName
                    },
                    {
                        name: "databaseName",
                        value: args.databaseName
                    },
                    {
                        name: "schemaName",
                        value: args.schemaName
                    },
                    {
                        name: "tableName",
                        value: args.tableName
                    },
                    {
                        name: "table",
                        value: args.table
                    },
                    {
                        name: "highlightLocations",
                        value: null
                    }
                ];
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.TableColumnsGroup",
                    name: "Columns",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.TableColumnsGroup"
                        }])
                });
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.TableIndexesGroup",
                    name: "Indexes",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.TableIndexesGroup"
                        }])
                });
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.TableStatisticGroup",
                    name: "Statistics",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.TableStatisticGroup"
                        }])
                });
                databaseNodeData.push({
                    type: "Azure.DataLake.Analytics.Catalog.Database.TablePartitionsGroup",
                    name: "Partitions",
                    attributes: attributes.concat([{
                            name: "nodeType",
                            value: "Azure.DataLake.Analytics.Catalog.Database.TablePartitionsGroup"
                        }])
                });
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(databaseNodeData)
                });
            };
            this.getCatalogTableColumns = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var nodeData = [];
                var attributes = [
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: args.dataLakeAnalyticsAccountName
                    },
                    {
                        name: "databaseName",
                        value: args.databaseName
                    },
                    {
                        name: "schemaName",
                        value: args.schemaName
                    },
                    {
                        name: "tableName",
                        value: args.tableName
                    },
                    {
                        name: "table",
                        value: args.table
                    },
                    {
                        name: "highlightLocations",
                        value: null
                    }
                ];
                var table = args.table;
                if (table) {
                    table.columnList.forEach(function (column) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.TableColumn",
                            name: column.name + ": " + column.type,
                            attributes: attributes.concat([
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.TableColumn"
                                },
                                {
                                    name: "columnName",
                                    value: column.name
                                },
                                {
                                    name: "column",
                                    value: column
                                }
                            ])
                        });
                    });
                }
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                });
            };
            this.getCatalogTableIndexes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var nodeData = [];
                var attributes = [
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: args.dataLakeAnalyticsAccountName
                    },
                    {
                        name: "databaseName",
                        value: args.databaseName
                    },
                    {
                        name: "schemaName",
                        value: args.schemaName
                    },
                    {
                        name: "tableName",
                        value: args.tableName
                    },
                    {
                        name: "table",
                        value: args.table
                    },
                    {
                        name: "highlightLocations",
                        value: null
                    }
                ];
                var table = args.table;
                if (table) {
                    table.indexList.forEach(function (index) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.TableIndex",
                            name: index.name,
                            attributes: attributes.concat([
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.TableIndex"
                                },
                                {
                                    name: "indexName",
                                    value: index.name
                                },
                                {
                                    name: "index",
                                    value: index
                                }
                            ])
                        });
                    });
                }
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                });
            };
            this.getCatalogTablePartitions = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var nodeData = [];
                var table = args.table;
                if (table) {
                    if (table.partitionKeyList) {
                        table.partitionKeyList.forEach(function (partition) {
                            nodeData.push({ type: "Azure.DataLake.Analytics.Catalog.Database.TablePartition", name: partition, attributes: [] });
                        });
                    }
                }
                ;
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                });
            };
            this.getCatalogTableStatistics = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var attributes = [
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: args.dataLakeAnalyticsAccountName
                    },
                    {
                        name: "databaseName",
                        value: args.databaseName
                    },
                    {
                        name: "schemaName",
                        value: args.schemaName
                    },
                    {
                        name: "tableName",
                        value: args.tableName
                    },
                    {
                        name: "table",
                        value: args.table
                    },
                    {
                        name: "nodeType",
                        value: "Azure.DataLake.Analytics.Catalog.Database.TableStatistics"
                    },
                    {
                        name: "highlightLocations",
                        value: null
                    }
                ];
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetTableStatistics", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName, schemaName: args.schemaName, tableName: args.tableName }])
                    .then(function (results) {
                    var nodeData = [];
                    results.forEach(function (s) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.TableStatistics",
                            name: args.schemaName + "." + s.name,
                            attributes: attributes.concat([
                                {
                                    name: "statisticsName",
                                    value: s.name
                                },
                                {
                                    name: "statistics",
                                    value: s
                                },
                                {
                                    name: "createTime",
                                    value: s.createTime
                                },
                                {
                                    name: "updateTime",
                                    value: s.updateTime
                                }
                            ])
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getCredentials = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetCredentials", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var nodeData = [];
                    result.forEach(function (credentialName) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.Credential",
                            name: credentialName,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "credentialName",
                                    value: credentialName
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.Credential"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getExternalDataSources = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.GetExternalDataSources", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    var nodeData = [];
                    result.forEach(function (externalDataSource) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.ExternalDataSource",
                            name: externalDataSource.name,
                            attributes: [
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                },
                                {
                                    name: "externalDataSourceName",
                                    value: externalDataSource.name
                                },
                                {
                                    name: "provider",
                                    value: externalDataSource.provider
                                },
                                {
                                    name: "providerString",
                                    value: externalDataSource.providerString
                                },
                                {
                                    name: "externalDataSource",
                                    value: externalDataSource
                                },
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.ExternalDataSource"
                                },
                                {
                                    name: "highlightLocations",
                                    value: null
                                }
                            ]
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                    };
                }, function (error) { AzureDataLakeAnalyticsProducer.handleError(error); });
            };
            this.getExternalDataSourceInfo = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var nodeData = [];
                var externalDataSource = args.externalDataSource;
                if (externalDataSource) {
                    nodeData.push({
                        type: "Azure.DataLake.Analytics.Catalog.Database.ExternalDataSourcePushdownTypesGroup",
                        name: "Pushdown Types",
                        attributes: [{ name: "pushdownTypes", value: externalDataSource.pushdownTypes }]
                    });
                }
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                });
            };
            this.getExternalDataSourcePushdownTypes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var nodeData = [];
                var pushdownTypes = args.pushdownTypes;
                if (pushdownTypes) {
                    pushdownTypes.forEach(function (pushdownType) {
                        nodeData.push({
                            type: "Azure.DataLake.Analytics.Catalog.Database.ExternalDataSourcePushdownType",
                            name: pushdownType,
                            attributes: []
                        });
                    });
                }
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(nodeData)
                });
            };
            this._host = host;
        }
        return AzureDataLakeAnalyticsProducer;
    }());
    AzureDataLakeAnalyticsProducer.GetAccountInfoNamespace = "Azure.Producers.DataLake.Analytics.GenerateAccountNode";
    AzureDataLakeAnalyticsProducer.GetLocalAccountNamespace = "Azure.Producers.DataLake.Analytics.GetLocalAccountNode";
    AzureDataLakeAnalyticsProducer.GetDatabasesNamespace = "Azure.Producers.DataLake.Analytics.Catalog.GetDatabases";
    AzureDataLakeAnalyticsProducer.GetLinkedStoragesNamespace = "Azure.Producers.DataLake.Analytics.GetLinkedStorages";
    AzureDataLakeAnalyticsProducer.GetContainersNamespace = "Azure.Producers.DataLake.Analytics.GetContainers";
    AzureDataLakeAnalyticsProducer.GenerateCatalogDatabaseNode = "Azure.Producers.DataLake.Analytics.Catalog.GenerateDatabaseNode";
    AzureDataLakeAnalyticsProducer.GetCatalogAssemblies = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetAssemblies";
    AzureDataLakeAnalyticsProducer.GetCatalogSchemas = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetSchemas";
    AzureDataLakeAnalyticsProducer.GetCatalogTables = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTables";
    AzureDataLakeAnalyticsProducer.GetCatalogTableTypes = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableTypes";
    AzureDataLakeAnalyticsProducer.GetCatalogProcedures = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetProcedures";
    AzureDataLakeAnalyticsProducer.GetCatalogTvfs = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTvfs";
    AzureDataLakeAnalyticsProducer.GetCatalogViews = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetViews";
    AzureDataLakeAnalyticsProducer.GetCatalogTableInfo = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableInfo";
    AzureDataLakeAnalyticsProducer.GetCatalogTableColumns = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableColumns";
    AzureDataLakeAnalyticsProducer.GetCatalogTableIndexes = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableIndexes";
    AzureDataLakeAnalyticsProducer.GetCatalogTablePartitions = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTablePartitions";
    AzureDataLakeAnalyticsProducer.GetCatalogTableStatistics = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableStatistics";
    AzureDataLakeAnalyticsProducer.GetCredentials = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetCredentials";
    AzureDataLakeAnalyticsProducer.GetExternalDataSources = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSources";
    AzureDataLakeAnalyticsProducer.GetExternalDataSourceInfo = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSourceInfo";
    AzureDataLakeAnalyticsProducer.GetExternalDataSourcePushdownTypes = "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSourcePushdownTypes";
    AzureDataLakeAnalyticsProducer.handleError = function (error) {
        var errorToThrow = error;
        if (error.name === "DataLakePackageNotInstalled") {
            errorToThrow = new Errors.ActionableError(error, "Cloud Explorer and the Data Lake Tools are out of sync.  To resolve this, please try to update Cloud Explorer in Tools -> Extensions and Updates -> Updates -> Visual Studio Gallery, and install the latest ", "Azure Data Lake Tools.", CloudExplorerActions.openUrlNamespace, { url: "https://go.microsoft.com/fwlink/?LinkID=616477" });
        }
        else {
            errorToThrow = new Errors.DisplayableError(error.message, error);
        }
        throw errorToThrow;
    };
    return AzureDataLakeAnalyticsProducer;
});

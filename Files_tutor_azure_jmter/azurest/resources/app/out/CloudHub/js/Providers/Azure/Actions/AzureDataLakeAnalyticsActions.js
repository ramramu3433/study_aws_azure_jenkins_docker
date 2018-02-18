/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Resources/AzureResources", "Common/Errors", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Common/UIActions", "Common/LazyProperty", "es6-promise"], function (require, exports, AzureResources, Errors, CloudExplorerActions, UIActions, LazyProperty, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /* tslint:enable */
    var AzureDataLakeAnalyticsActions = (function () {
        function AzureDataLakeAnalyticsActions(hostProxy) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.createDatababseNamespace, _this.createDatabase);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteDatababseNamespace, _this.deleteDatabase);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.registerAssemblyNamespace, _this.registerAssembly);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteAssemblyNamespace, _this.deleteAssembly);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.reflectAssemblyNamespace, _this.reflectAssembly);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.downloadAssemblyNamespace, _this.downloadAssembly);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.createSchemaNamespace, _this.createSchema);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteSchemaNamespace, _this.deleteSchema);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.createTableNamespace, _this.createTable);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteTableNamespace, _this.deleteTable);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.createTableTypeNamespace, _this.createTableType);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteTableTypeNamespace, _this.deleteTableType);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.openJobsExplorerNamespace, _this.openJobsExplorer);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.openLinkedADLAFileExplorerNamespace, _this.openLinkedADLAFileExplorer);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.openADLSFileExplorerNamespace, _this.openADLSFileExplorer);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.openWasbFileExplorerNamespace, _this.openWasbContainerExplorer);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.createTableStatisticNamespace, _this.createTableStatistic);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteTableStatisticNamespace, _this.deleteTableStatistic);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.createTableIndexNamespace, _this.createTableIndex);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.openScriptNamespace, _this.openScript);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteTvfNamespace, _this.deleteTvf);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteViewNamespace, _this.deleteView);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteProcedureNamespace, _this.deleteProcedure);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteCredentialNamespace, _this.deleteCredential);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.createCredentialNamespace, _this.createCredential);
                actionBindingManager.addActionBinding(AzureDataLakeAnalyticsActions.deleteExternalDataSourceNamespace, _this.deleteExternalDataSource);
            };
            this.updateNodeStatus = function (query, status) {
                _this._uiActions.setAttribute(query, { name: "operationStatus", value: status });
                _this._uiActions.refreshNodeDynamicAttributes(query, ["operationStatus"]);
            };
            this.createItem = function (parentNodeQuery, attributes, nodeType, operationName, operationParameters, newItemName) {
                var azureResourceNodeFactory = require("Providers/Azure/Nodes/AzureResourceNodeFactory");
                return _this._resources.getValue().then(function (resources) {
                    var node = azureResourceNodeFactory.convertAzureResource({
                        type: nodeType,
                        name: newItemName,
                        attributes: attributes.concat([{ name: "operationStatus", value: resources["Actions.DataLake.Analytics.NodeStatus.Adding"] || "Adding" }, { name: "highlightLocations", value: null }])
                    });
                    _this._uiActions.addChild(parentNodeQuery, node);
                    return _this._host.executeOperation(operationName, operationParameters).
                        then(function (result) {
                        if (result === DataLakeJobResult.submitCanceled) {
                            _this._uiActions.deleteNode(attributes);
                        }
                        else if (result === DataLakeJobResult.succeeded) {
                            _this._uiActions.deleteNode(attributes);
                            _this._uiActions.refreshNodeChildren(parentNodeQuery);
                        }
                        else if (result === DataLakeJobResult.fetchFailed) {
                            _this.updateNodeStatus(attributes, resources["Actions.DataLake.Analytics.NodeStatus.RefreshFailed"] || "Refresh Failed");
                        }
                        else {
                            _this.updateNodeStatus(attributes, resources["Actions.DataLake.Analytics.NodeStatus.AddFailed"] || "Add Failed");
                        }
                    });
                });
            };
            this.deleteItem = function (query, operationName, operationParameters) {
                return _this._resources.getValue().then(function (resources) {
                    _this.updateNodeStatus(query, resources["Actions.DataLake.Analytics.NodeStatus.Deleting"] || "Deleting");
                    return _this._host.executeOperation(operationName, operationParameters).
                        then(function (result) {
                        if (result === DataLakeJobResult.succeeded) {
                            _this._uiActions.deleteNode(query);
                        }
                        else if (result === DataLakeJobResult.submitCanceled) {
                            _this.updateNodeStatus(query, null);
                        }
                        else if (result === DataLakeJobResult.fetchFailed) {
                            _this.updateNodeStatus(query, resources["Actions.DataLake.Analytics.NodeStatus.RefreshFailed"] || "Refresh Failed");
                        }
                        else {
                            _this.updateNodeStatus(query, resources["Actions.DataLake.Analytics.NodeStatus.DeleteFailed"] || "Delete Failed");
                        }
                    });
                });
            };
            this.openScript = function (args) {
                if (args === void 0) { args = null; }
                var content = args.content;
                if (content) {
                    return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.OpenScript", [{
                            dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                            databaseName: args.databaseName,
                            schemaName: args.schemaName,
                            name: args.name,
                            content: content
                        }]);
                }
                return Promise.resolve();
            };
            this.createCredential = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.CreateCredential", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }])
                    .then(function (result) {
                    if (result === null) {
                        return null;
                    }
                    var nodeQuery = [
                        {
                            name: "nodeType",
                            value: args.nodeType
                        },
                        {
                            name: "dataLakeAnalyticsAccountName",
                            value: args.dataLakeAnalyticsAccountName
                        },
                        {
                            name: "databaseName",
                            value: args.databaseName
                        }
                    ];
                    var childNodeType = "Azure.DataLake.Analytics.Catalog.Database.Credential";
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
                            name: "credentialName",
                            value: result.name
                        },
                        {
                            name: "nodeType",
                            value: childNodeType
                        }
                    ];
                    return _this.createItem(nodeQuery, attributes, childNodeType, "Azure.Actions.DataLake.Analytics.WaitJob", [{ jobId: result.jobId }], result.name);
                });
            };
            this.deleteCredential = function (args) {
                if (args === void 0) { args = null; }
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
                        name: "credentialName",
                        value: args.credentialName
                    },
                    {
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, "Azure.Actions.DataLake.Analytics.Catalog.DeleteCredential", [{
                        dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                        databaseName: args.databaseName,
                        credentialName: args.credentialName
                    }]);
            };
            this.deleteExternalDataSource = function (args) {
                if (args === void 0) { args = null; }
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
                        name: "externalDataSourceName",
                        value: args.externalDataSourceName
                    },
                    {
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, "Azure.Actions.DataLake.Analytics.Catalog.DeleteExternalDataSource", [{
                        dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                        databaseName: args.databaseName,
                        externalDataSourceName: args.externalDataSourceName
                    }]);
            };
            this.deleteTvfViewProcedure = function (actionName, args) {
                if (args === void 0) { args = null; }
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
                        name: "name",
                        value: args.name
                    },
                    {
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, actionName, [{
                        dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                        databaseName: args.databaseName,
                        schemaName: args.schemaName,
                        name: args.name
                    }]);
            };
            this.deleteTvf = function (args) {
                if (args === void 0) { args = null; }
                return _this.deleteTvfViewProcedure("Azure.Actions.DataLake.Analytics.Catalog.DeleteTvf", args);
            };
            this.deleteView = function (args) {
                if (args === void 0) { args = null; }
                return _this.deleteTvfViewProcedure("Azure.Actions.DataLake.Analytics.Catalog.DeleteView", args);
            };
            this.deleteProcedure = function (args) {
                if (args === void 0) { args = null; }
                return _this.deleteTvfViewProcedure("Azure.Actions.DataLake.Analytics.Catalog.DeleteProcedure", args);
            };
            this.createTableIndex = function (args) {
                if (args === void 0) { args = null; }
                var table = args.table;
                if (table) {
                    return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.CreateTableIndex", [{
                            dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                            databaseName: args.databaseName,
                            schemaName: args.schemaName,
                            tableName: args.tableName,
                            columns: table.columnList
                        }]).then(function (result) {
                        if (result === null) {
                            return null;
                        }
                        var nodeQuery = [
                            {
                                name: "nodeType",
                                value: args.nodeType
                            },
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
                            }
                        ];
                        var childNodeType = "Azure.DataLake.Analytics.Catalog.Database.TableIndex";
                        var attributes = [
                            {
                                name: "dataLakeAnalyticsAccountName",
                                value: args.dataLakeAnalyticsAccountName
                            },
                            {
                                name: "databaseName",
                                value: args.newChildName
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
                                name: "nodeType",
                                value: childNodeType
                            }
                        ];
                        return _this.createItem(nodeQuery, attributes, childNodeType, "Azure.Actions.DataLake.Analytics.WaitJob", [{ jobId: result.jobId }], args.schemaName + "." + result.name).then(function (reault) {
                            var query = [
                                {
                                    name: "nodeType",
                                    value: "Azure.DataLake.Analytics.Catalog.Database.TablesGroup"
                                },
                                {
                                    name: "dataLakeAnalyticsAccountName",
                                    value: args.dataLakeAnalyticsAccountName
                                },
                                {
                                    name: "databaseName",
                                    value: args.databaseName
                                }
                            ];
                            _this._uiActions.refreshNodeChildren(query);
                        });
                    });
                }
                return Promise.resolve();
            };
            this.createTableStatistic = function (args) {
                if (args === void 0) { args = null; }
                var table = args.table;
                if (table) {
                    var columns = [];
                    table.columnList.forEach(function (c) { return columns.push(c.name); });
                    return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.CreateTableStatistics", [{
                            dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                            databaseName: args.databaseName,
                            schemaName: args.schemaName,
                            tableName: args.tableName,
                            columns: columns
                        }]).then(function (result) {
                        if (result === null) {
                            return null;
                        }
                        var nodeQuery = [
                            {
                                name: "nodeType",
                                value: args.nodeType
                            },
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
                            }
                        ];
                        var childNodeType = "Azure.DataLake.Analytics.Catalog.Database.TableStatistics";
                        var attributes = [
                            {
                                name: "dataLakeAnalyticsAccountName",
                                value: args.dataLakeAnalyticsAccountName
                            },
                            {
                                name: "databaseName",
                                value: args.newChildName
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
                                name: "nodeType",
                                value: childNodeType
                            }
                        ];
                        return _this.createItem(nodeQuery, attributes, childNodeType, "Azure.Actions.DataLake.Analytics.WaitJob", [{ jobId: result.jobId }], args.schemaName + "." + result.name);
                    });
                }
                return Promise.resolve();
            };
            this.deleteTableStatistic = function (args) {
                if (args === void 0) { args = null; }
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
                        name: "statisticsName",
                        value: args.statisticsName
                    },
                    {
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, "Azure.Actions.DataLake.Analytics.Catalog.DeleteTableStatistics", [{
                        dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                        databaseName: args.databaseName,
                        schemaName: args.schemaName,
                        tableName: args.tableName,
                        statisticsName: args.statisticsName
                    }]);
            };
            this.createDatabase = function (args) {
                if (args === void 0) { args = null; }
                var nodeQuery = [
                    {
                        name: "nodeType",
                        value: args.nodeType
                    },
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: args.dataLakeAnalyticsAccountName
                    }
                ];
                var childNodeType = "Azure.DataLake.Analytics.Catalog.Database";
                var attributes = [
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: args.dataLakeAnalyticsAccountName
                    },
                    {
                        name: "databaseName",
                        value: args.newChildName
                    },
                    {
                        name: "nodeType",
                        value: childNodeType
                    }
                ];
                return _this.createItem(nodeQuery, attributes, childNodeType, "Azure.Actions.DataLake.Analytics.Catalog.CreateDatabase", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.newChildName }], args.newChildName);
            };
            this.deleteDatabase = function (args) {
                if (args === void 0) { args = null; }
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
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, "Azure.Actions.DataLake.Analytics.Catalog.DeleteDatabase", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }]);
            };
            this.registerAssembly = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.RegisterAssembly", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }]).
                    then(function (result) {
                    if (result === null) {
                        return null;
                    }
                    var nodeQuery = [
                        {
                            name: "nodeType",
                            value: args.nodeType
                        },
                        {
                            name: "dataLakeAnalyticsAccountName",
                            value: args.dataLakeAnalyticsAccountName
                        },
                        {
                            name: "databaseName",
                            value: args.databaseName
                        }
                    ];
                    var childNodeType = "Azure.DataLake.Analytics.Catalog.Database.Assembly";
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
                            name: "assemblyName",
                            value: result.name
                        },
                        {
                            name: "nodeType",
                            value: childNodeType
                        }
                    ];
                    return _this.createItem(nodeQuery, attributes, childNodeType, "Azure.Actions.DataLake.Analytics.WaitJob", [{ jobId: result.jobId }], result.name);
                });
            };
            this.deleteAssembly = function (args) {
                if (args === void 0) { args = null; }
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
                        name: "assemblyName",
                        value: args.assemblyName
                    },
                    {
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, "Azure.Actions.DataLake.Analytics.Catalog.DeleteAssembly", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName, assemblyName: args.assemblyName }]);
            };
            this.downloadAssembly = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.DownloadAssembly", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName, assemblyName: args.assemblyName }]);
            };
            this.reflectAssembly = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.ReflectAssembly", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName, assemblyName: args.assemblyName }]);
            };
            this.createSchema = function (args) {
                if (args === void 0) { args = null; }
                var nodeQuery = [
                    {
                        name: "nodeType",
                        value: args.nodeType
                    },
                    {
                        name: "dataLakeAnalyticsAccountName",
                        value: args.dataLakeAnalyticsAccountName
                    },
                    {
                        name: "databaseName",
                        value: args.databaseName
                    }
                ];
                var childNodeType = "Azure.DataLake.Analytics.Catalog.Database.Schema";
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
                        value: args.newChildName
                    },
                    {
                        name: "nodeType",
                        value: childNodeType
                    }
                ];
                return _this.createItem(nodeQuery, attributes, childNodeType, "Azure.Actions.DataLake.Analytics.Catalog.CreateSchema", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName, schemaName: args.newChildName }], args.newChildName);
            };
            this.deleteSchema = function (args) {
                if (args === void 0) { args = null; }
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
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, "Azure.Actions.DataLake.Analytics.Catalog.DeleteSchema", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName, schemaName: args.schemaName }]);
            };
            this.createTable = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.CreateTable", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }]).
                    then(function (result) {
                    if (result === null) {
                        return null;
                    }
                    var nodeQuery = [
                        {
                            name: "nodeType",
                            value: args.nodeType
                        },
                        {
                            name: "dataLakeAnalyticsAccountName",
                            value: args.dataLakeAnalyticsAccountName
                        },
                        {
                            name: "databaseName",
                            value: args.databaseName
                        }
                    ];
                    var childNodeType = "Azure.DataLake.Analytics.Catalog.Database.Table";
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
                            value: null
                        },
                        {
                            name: "tableName",
                            value: result.name
                        },
                        {
                            name: "nodeType",
                            value: childNodeType
                        }
                    ];
                    return _this.createItem(nodeQuery, attributes, childNodeType, "Azure.Actions.DataLake.Analytics.WaitJob", [{ jobId: result.jobId }], result.name);
                });
            };
            this.deleteTable = function (args) {
                if (args === void 0) { args = null; }
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
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, "Azure.Actions.DataLake.Analytics.Catalog.DeleteTable", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName, schemaName: args.schemaName, tableName: args.tableName }]);
            };
            this.createTableType = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.Catalog.CreateTableType", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName }]).
                    then(function (result) {
                    if (result === null) {
                        return null;
                    }
                    var nodeQuery = [
                        {
                            name: "nodeType",
                            value: args.nodeType
                        },
                        {
                            name: "dataLakeAnalyticsAccountName",
                            value: args.dataLakeAnalyticsAccountName
                        },
                        {
                            name: "databaseName",
                            value: args.databaseName
                        }
                    ];
                    var childNodeType = "Azure.DataLake.Analytics.Catalog.Database.TableType";
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
                            value: null
                        },
                        {
                            name: "typeName",
                            value: result.name
                        },
                        {
                            name: "nodeType",
                            value: childNodeType
                        }
                    ];
                    return _this.createItem(nodeQuery, attributes, childNodeType, "Azure.Actions.DataLake.Analytics.WaitJob", [{ jobId: result.jobId }], result.name);
                });
            };
            this.deleteTableType = function (args) {
                if (args === void 0) { args = null; }
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
                        name: "typeName",
                        value: args.typeName
                    },
                    {
                        name: "nodeType",
                        value: args.nodeType
                    }
                ];
                return _this.deleteItem(attributes, "Azure.Actions.DataLake.Analytics.Catalog.DeleteTableType", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName, databaseName: args.databaseName, schemaName: args.schemaName, typeName: args.typeName }]);
            };
            this.openJobsExplorer = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Analytics.BrowseJobs", [{ dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName }]).
                    then(null, function (error) { AzureDataLakeAnalyticsActions.handleError(error); });
            };
            this.openLinkedADLAFileExplorer = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Store.OpenLinkedAdlaFileExplorer", [{
                        dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                        dataLakeStorageAccountName: args.dataLakeStorageAccountName
                    }]).
                    then(null, function (error) { AzureDataLakeAnalyticsActions.handleError(error); });
            };
            this.openADLSFileExplorer = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Store.OpenAdlsFileExplorer", [{
                        dataLakeStorageAccountName: args.dataLakeStorageAccountName
                    }]).
                    then(null, function (error) { AzureDataLakeAnalyticsActions.handleError(error); });
            };
            this.openWasbContainerExplorer = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.DataLake.Store.OpenWasbContainerFileExplorer", [{
                        dataLakeAnalyticsAccountName: args.dataLakeAnalyticsAccountName,
                        wasbAccountName: args.wasbAccountName, container: args.container
                    }]).
                    then(null, function (error) { AzureDataLakeAnalyticsActions.handleError(error); });
            };
            this._host = hostProxy;
            this._uiActions = new UIActions(this._host);
            this._resources = new LazyProperty(function () {
                return _this._host.resolveResources(AzureResources.commonNamespace, [
                    "Actions.DataLake.Analytics.NodeStatus.Adding",
                    "Actions.DataLake.Analytics.NodeStatus.AddFailed",
                    "Actions.DataLake.Analytics.NodeStatus.Deleting",
                    "Actions.DataLake.Analytics.NodeStatus.DeleteFailed",
                    "Actions.DataLake.Analytics.NodeStatus.RefreshFailed"
                ]);
            });
        }
        return AzureDataLakeAnalyticsActions;
    }());
    AzureDataLakeAnalyticsActions.createDatababseNamespace = "Azure.DataLake.Analytics.Catalog.createDatabase";
    AzureDataLakeAnalyticsActions.deleteDatababseNamespace = "Azure.DataLake.Analytics.Catalog.deleteDatabase";
    AzureDataLakeAnalyticsActions.registerAssemblyNamespace = "Azure.DataLake.Analytics.Catalog.registerAssembly";
    AzureDataLakeAnalyticsActions.deleteAssemblyNamespace = "Azure.DataLake.Analytics.Catalog.deleteAssembly";
    AzureDataLakeAnalyticsActions.reflectAssemblyNamespace = "Azure.DataLake.Analytics.Catalog.reflectAssembly";
    AzureDataLakeAnalyticsActions.downloadAssemblyNamespace = "Azure.DataLake.Analytics.Catalog.downloadAssembly";
    AzureDataLakeAnalyticsActions.createSchemaNamespace = "Azure.DataLake.Analytics.Catalog.createSchema";
    AzureDataLakeAnalyticsActions.deleteSchemaNamespace = "Azure.DataLake.Analytics.Catalog.deleteSchema";
    AzureDataLakeAnalyticsActions.createTableNamespace = "Azure.DataLake.Analytics.Catalog.createTable";
    AzureDataLakeAnalyticsActions.deleteTableNamespace = "Azure.DataLake.Analytics.Catalog.deleteTable";
    AzureDataLakeAnalyticsActions.createTableTypeNamespace = "Azure.DataLake.Analytics.Catalog.createTableType";
    AzureDataLakeAnalyticsActions.deleteTableTypeNamespace = "Azure.DataLake.Analytics.Catalog.deleteTableType";
    AzureDataLakeAnalyticsActions.openJobsExplorerNamespace = "Azure.DataLake.Analytics.openJobsExplorer";
    AzureDataLakeAnalyticsActions.openLinkedADLAFileExplorerNamespace = "Azure.DataLake.Store.openLinkedADLAFileExplorer";
    AzureDataLakeAnalyticsActions.openADLSFileExplorerNamespace = "Azure.DataLake.Store.openADLSFileExplorer";
    AzureDataLakeAnalyticsActions.openWasbFileExplorerNamespace = "Azure.DataLake.Store.openWasbContainerExplorer";
    AzureDataLakeAnalyticsActions.createTableIndexNamespace = "Azure.DataLake.Analytics.Catalog.createTableIndex";
    AzureDataLakeAnalyticsActions.createTableStatisticNamespace = "Azure.DataLake.Analytics.Catalog.createTableStatistics";
    AzureDataLakeAnalyticsActions.deleteTableStatisticNamespace = "Azure.DataLake.Analytics.Catalog.deleteTableStatistics";
    AzureDataLakeAnalyticsActions.openScriptNamespace = "Azure.DataLake.Analytics.Catalog.openScript";
    AzureDataLakeAnalyticsActions.deleteTvfNamespace = "Azure.DataLake.Analytics.Catalog.deleteTvf";
    AzureDataLakeAnalyticsActions.deleteViewNamespace = "Azure.DataLake.Analytics.Catalog.deleteView";
    AzureDataLakeAnalyticsActions.deleteProcedureNamespace = "Azure.DataLake.Analytics.Catalog.deleteProcedure";
    AzureDataLakeAnalyticsActions.createCredentialNamespace = "Azure.DataLake.Analytics.Catalog.createCredential";
    AzureDataLakeAnalyticsActions.deleteCredentialNamespace = "Azure.DataLake.Analytics.Catalog.deleteCredential";
    AzureDataLakeAnalyticsActions.deleteExternalDataSourceNamespace = "Azure.DataLake.Analytics.Catalog.deleteExternalDataSource";
    AzureDataLakeAnalyticsActions.handleError = function (error) {
        var errorToThrow = error;
        if (error.name === "DataLakePackageNotInstalled") {
            errorToThrow = new Errors.ActionableError(error, "Cloud Explorer and the Data Lake Tools are out of sync.  To resolve this, please try to update Cloud Explorer in Tools -> Extensions and Updates -> Updates -> Visual Studio Gallery, and install the latest ", "Azure Data Lake Tools.", CloudExplorerActions.openUrlNamespace, {
                url: "https://go.microsoft.com/fwlink/?LinkID=616477"
            });
        }
        else {
            errorToThrow = new Errors.DisplayableError(error.message, error);
        }
        throw errorToThrow;
    };
    var DataLakeJobResult;
    (function (DataLakeJobResult) {
        DataLakeJobResult[DataLakeJobResult["none"] = 0] = "none";
        DataLakeJobResult[DataLakeJobResult["succeeded"] = 1] = "succeeded";
        DataLakeJobResult[DataLakeJobResult["cancelled"] = 2] = "cancelled";
        DataLakeJobResult[DataLakeJobResult["failed"] = 3] = "failed";
        DataLakeJobResult[DataLakeJobResult["fetchFailed"] = 4] = "fetchFailed";
        DataLakeJobResult[DataLakeJobResult["submitCanceled"] = 5] = "submitCanceled";
    })(DataLakeJobResult || (DataLakeJobResult = {}));
    return AzureDataLakeAnalyticsActions;
});

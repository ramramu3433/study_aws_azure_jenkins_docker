/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureDataLakeAnalyticsActions", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureDataLakeAnalyticsActions, AzureResources) {
    "use strict";
    var AzureDataLakeAnalyticsConfig = (function () {
        function AzureDataLakeAnalyticsConfig() {
        }
        return AzureDataLakeAnalyticsConfig;
    }());
    AzureDataLakeAnalyticsConfig.Account = {
        aliases: [AzureConstants.resourceTypes.DataLakeAnalytics],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsAccountIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.GenerateAccountNode",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    expression: {
                        requires: ["name", "subscription"],
                        expression: "name + \"@#@\" + JSON.parse(subscription).accountId"
                    }
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.Local = {
        aliases: [AzureConstants.resourceTypes.DataLakeAnalyticsLocal],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsAccountIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.GetLocalAccountNode",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "name"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.Jobs = {
        aliases: ["Azure.DataLake.Analytics.Jobs"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsJobsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsJobsIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.OpenJobExplorer", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsJobsIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsJobsIcon,
                namespace: AzureDataLakeAnalyticsActions.openJobsExplorerNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    }
                },
                isDefault: true
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.Databases = {
        aliases: ["Azure.DataLake.Analytics.Catalog.DatabaseGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogDatabasesIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogDatabasesIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.GetDatabases",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.CreateDatebase", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogDatabasesIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogDatabasesIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                createChild: {
                    newChildName: ""
                },
                namespace: AzureDataLakeAnalyticsActions.createDatababseNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.LinkedStorages = {
        aliases: ["Azure.DataLake.Analytics.LinkedStorages"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsLinkedStoragesIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsLinkedStoragesIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.GetLinkedStorages",
            boundArguments: {
                linkedStorages: {
                    attribute: "linkedStorages"
                },
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.Wasb = {
        aliases: ["Azure.DataLake.Analytics.LinkedStorage.Wasb"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.GetContainers",
            boundArguments: {
                containers: {
                    attribute: "containers"
                },
                wasbAccountName: {
                    attribute: "wasbAccountName"
                },
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.Adl = {
        aliases: ["Azure.DataLake.Store"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeStoreIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeStoreIcon,
        supported: true,
        status: { attribute: "defaultStorageTag" },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.OpenFileExplorer", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeStoreIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeStoreIcon,
                namespace: AzureDataLakeAnalyticsActions.openLinkedADLAFileExplorerNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    dataLakeStorageAccountName: {
                        attribute: "adlAccountName"
                    }
                },
                isDefault: true
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.Container = {
        aliases: ["Azure.DataLake.Analytics.LinkedStorages.Wasb.Container"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountBlobContainerIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountBlobContainerIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.OpenFileExplorer", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountBlobContainerIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountBlobContainerIcon,
                namespace: AzureDataLakeAnalyticsActions.openWasbFileExplorerNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    wasbAccountName: {
                        attribute: "wasbAccountName"
                    },
                    container: {
                        attribute: "container"
                    }
                },
                isDefault: true
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.Database = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogDatabaseIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogDatabaseIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.GenerateDatabaseNode",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.DeleteDatabase", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogDatabaseIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogDatabaseIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteDatababseNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.AssembliesGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.AssembliesGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetAssemblies",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                },
                nodeType: {
                    attribute: "nodeType"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.RegisterAssembly", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogAssemblyIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogAssemblyIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                namespace: AzureDataLakeAnalyticsActions.registerAssemblyNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.SchemasGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.SchemasGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetSchemas",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.CreateSchema", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogSchemaIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogSchemaIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                createChild: {
                    newChildName: ""
                },
                namespace: AzureDataLakeAnalyticsActions.createSchemaNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.TablesGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TablesGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTables",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.CreateTable", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                namespace: AzureDataLakeAnalyticsActions.createTableNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.TableTypesGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TableTypesGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableTypes",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.CreateTableType", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableTypeIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableTypeIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                namespace: AzureDataLakeAnalyticsActions.createTableTypeNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.TvfsGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TvfsGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTvfs",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.ProceduresGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.ProceduresGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetProcedures",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.ViewsGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.ViewsGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetViews",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.CredentialsGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.CredentialsGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetCredentials",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.CreateCredential", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogCredentialIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogCredentialIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                namespace: AzureDataLakeAnalyticsActions.createCredentialNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.ExternalDataSourcesGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.ExternalDataSourcesGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSources",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.Assembly = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.Assembly"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogAssemblyIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogAssemblyIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogAssemblyIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogAssemblyIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteAssemblyNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    assemblyName: {
                        attribute: "assemblyName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.DownloadAssembly", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogAssemblyIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogAssemblyIcon,
                namespace: AzureDataLakeAnalyticsActions.downloadAssemblyNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    assemblyName: {
                        attribute: "assemblyName"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.ReflectAssembly", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogAssemblyIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogAssemblyIcon,
                namespace: AzureDataLakeAnalyticsActions.reflectAssemblyNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    assemblyName: {
                        attribute: "assemblyName"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.Schema = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.Schema"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogSchemaIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogSchemaIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.DeleteSchema", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogDatabaseIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogDatabaseIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteSchemaNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.Table = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.Table"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.DeleteTable", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteTableNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    tableName: {
                        attribute: "tableName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableInfo",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                },
                schemaName: {
                    attribute: "schemaName"
                },
                tableName: {
                    attribute: "tableName"
                },
                table: {
                    attribute: "table"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.TableType = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TableType"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableTypeIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableTypeIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.DeleteTable", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteTableTypeNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    typeName: {
                        attribute: "typeName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.TablePartitionsGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TablePartitionsGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTablePartitions",
            boundArguments: {
                table: {
                    attribute: "table"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.TableColumnsGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TableColumnsGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableColumns",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                },
                schemaName: {
                    attribute: "schemaName"
                },
                tableName: {
                    attribute: "tableName"
                },
                table: {
                    attribute: "table"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.TableIndexesGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TableIndexesGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableIndexes",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                },
                schemaName: {
                    attribute: "schemaName"
                },
                tableName: {
                    attribute: "tableName"
                },
                table: {
                    attribute: "table"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.CreateTableIndex", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableIndexIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableIndexIcon,
                namespace: AzureDataLakeAnalyticsActions.createTableIndexNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    tableName: {
                        attribute: "tableName"
                    },
                    table: {
                        attribute: "table"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.TableStatisticsGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TableStatisticGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableStatistics",
            boundArguments: {
                dataLakeAnalyticsAccountName: {
                    attribute: "dataLakeAnalyticsAccountName"
                },
                databaseName: {
                    attribute: "databaseName"
                },
                schemaName: {
                    attribute: "schemaName"
                },
                tableName: {
                    attribute: "tableName"
                },
                table: {
                    attribute: "table"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.Catalog.CreateTableStatistics", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableStatisticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableStatisticsIcon,
                namespace: AzureDataLakeAnalyticsActions.createTableStatisticNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    tableName: {
                        attribute: "tableName"
                    },
                    table: {
                        attribute: "table"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.TablePartition = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TablePartition"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsMetadataIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsMetadataIcon,
        supported: true
    };
    AzureDataLakeAnalyticsConfig.TableColumn = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TableColumn"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableColumnIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableColumnIcon,
        supported: true
    };
    AzureDataLakeAnalyticsConfig.TableIndex = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TableIndex"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableIndexIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableIndexIcon,
        supported: true,
        status: { attribute: "operationStatus" }
    };
    AzureDataLakeAnalyticsConfig.TableStatistics = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.TableStatistics"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableStatisticsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableStatisticsIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Delete", namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTableStatisticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTableStatisticsIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteTableStatisticNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    tableName: {
                        attribute: "tableName"
                    },
                    statisticsName: {
                        attribute: "statisticsName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ],
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Properties.Name", namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "statisticsName"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Properties.CreateTime", namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "createTime"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Properties.UpdateTime", namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "updateTime"
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.OpenScriptAction = {
        displayName: {
            resource: {
                resourceId: "Actions.DataLake.Analytics.Catalog.OpenScript", namespace: AzureResources.commonNamespace
            }
        },
        icon: AzureConstants.imagePaths.OpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.OpenIcon,
        namespace: AzureDataLakeAnalyticsActions.openScriptNamespace,
        isDefault: true,
        boundArguments: {
            dataLakeAnalyticsAccountName: {
                attribute: "dataLakeAnalyticsAccountName"
            },
            databaseName: {
                attribute: "databaseName"
            },
            schemaName: {
                attribute: "schemaName"
            },
            name: {
                attribute: "name"
            },
            content: {
                attribute: "content"
            },
            nodeType: {
                attribute: "nodeType"
            }
        }
    };
    AzureDataLakeAnalyticsConfig.Tvf = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.Tvf"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTVFIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTVFIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            AzureDataLakeAnalyticsConfig.OpenScriptAction,
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Delete", namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogTVFIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogTVFIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteTvfNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    name: {
                        attribute: "name"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.View = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.View"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogViewIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogViewIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            AzureDataLakeAnalyticsConfig.OpenScriptAction,
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Delete", namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogViewIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogViewIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteViewNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    name: {
                        attribute: "name"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.Procedure = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.Procedure"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogProcedureIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogProcedureIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            AzureDataLakeAnalyticsConfig.OpenScriptAction,
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Delete", namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogViewIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogViewIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteProcedureNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    schemaName: {
                        attribute: "schemaName"
                    },
                    name: {
                        attribute: "name"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.Credential = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.Credential"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogCredentialIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogCredentialIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Delete", namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogCredentialIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogCredentialIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteCredentialNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    credentialName: {
                        attribute: "credentialName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    AzureDataLakeAnalyticsConfig.ExternalDataSourcePushdownTypesGroup = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.ExternalDataSourcePushdownTypesGroup"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeFolderOpenIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeFolderOpenIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSourcePushdownTypes",
            boundArguments: {
                pushdownTypes: {
                    attribute: "pushdownTypes"
                }
            }
        }
    };
    AzureDataLakeAnalyticsConfig.ExternalDataSourcePushdownType = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.ExternalDataSourcePushdownType"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsMetadataIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsMetadataIcon,
        supported: true
    };
    AzureDataLakeAnalyticsConfig.ExternalDataSource = {
        aliases: ["Azure.DataLake.Analytics.Catalog.Database.ExternalDataSource"],
        parentType: AzureConstants.resourceTypes.DataLakeAnalyticsResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogExternalDataSourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogExternalDataSourceIcon,
        supported: true,
        status: { attribute: "operationStatus" },
        actions: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Delete", namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DataLakeAnalyticsCatalogExternalDataSourceIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsCatalogExternalDataSourceIcon,
                namespace: AzureDataLakeAnalyticsActions.deleteExternalDataSourceNamespace,
                boundArguments: {
                    dataLakeAnalyticsAccountName: {
                        attribute: "dataLakeAnalyticsAccountName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    externalDataSourceName: {
                        attribute: "externalDataSourceName"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ],
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Properties.Name", namespace: AzureResources.commonNamespace
                    }
                },
                binding: { attribute: "externalDataSourceName" }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Properties.Provider", namespace: AzureResources.commonNamespace
                    }
                },
                binding: { attribute: "provider" }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.DataLake.Properties.ProviderString", namespace: AzureResources.commonNamespace
                    }
                },
                binding: { attribute: "providerString" }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSourceInfo",
            boundArguments: {
                externalDataSource: {
                    attribute: "externalDataSource"
                }
            }
        }
    };
    return AzureDataLakeAnalyticsConfig;
});

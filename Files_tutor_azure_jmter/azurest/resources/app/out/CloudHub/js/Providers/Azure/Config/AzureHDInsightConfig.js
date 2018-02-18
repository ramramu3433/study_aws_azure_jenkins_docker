/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureHDInsightActions", "Providers/Azure/Loaders/AzureHDInsightAttributeLoader", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureHDInsightActions, AzureHDInsightAttributeLoader, AzureResources) {
    "use strict";
    var AzureHDInsightConfig = (function () {
        function AzureHDInsightConfig() {
        }
        return AzureHDInsightConfig;
    }());
    AzureHDInsightConfig._hdiClusterProperties = [
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.State", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.clusterState"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.ClusterConnectionString", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["name"],
                    expression: "'https://' + name + '.azurehdinsight.net'"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.CreatedDate", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.createdDate"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.ClusterType", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.clusterDefinition.kind"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.Version", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.clusterVersion"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.OSType", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.osType"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.Tier", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.tier"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.HeadNodeSize", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.computeProfile.roles.filter(function (r) { return r.name.toLowerCase() === 'headnode'; })[0].hardwareProfile.vmSize"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.WorkerNodeSize", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.computeProfile.roles.filter(function (r) { return r.name.toLowerCase() === 'workernode'; })[0].hardwareProfile.vmSize"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.WorkerNodeNumber", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.computeProfile.roles.filter(function (r) { return r.name.toLowerCase() === 'workernode'; })[0].targetInstanceCount"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.ZookeeperNodeSize", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.computeProfile.roles.filter(function (r) { return r.name.toLowerCase() === 'zookeepernode'; })[0] == null ? 'Not Available': clusterProperties.computeProfile.roles.filter(function (r) { return r.name.toLowerCase() === 'zookeepernode'; })[0].hardwareProfile.vmSize"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.HttpsEndpoints", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.connectivityEndpoints.filter(function (r) { return r.name === 'HTTPS'; })[0].location"
                }
            }
        },
        {
            displayName: {
                resource: {
                    resourceId: "Actions.HDInsight.Properties.SshEndpoints", namespace: AzureResources.commonNamespace
                }
            },
            binding: {
                expression: {
                    requires: ["clusterProperties"],
                    expression: "clusterProperties.osType=='Linux'?clusterProperties.connectivityEndpoints.filter(function (r) { return r.name === 'SSH'; })[0].location:'Not Available'"
                }
            }
        }
    ];
    AzureHDInsightConfig.Config = {
        aliases: [AzureConstants.resourceTypes.HDInsight],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightIcon,
        supported: true,
        status: {
            expression: {
                requires: ["clusterProperties"],
                expression: "clusterProperties.clusterDefinition.kind"
            }
        },
        childrenQuery: {
            namespace: "Azure.Producers.HDInsight.GenerateAccountNode",
            boundArguments: {
                clusterName: {
                    attribute: "name"
                }
            }
        },
        loaders: [
            {
                namespace: AzureHDInsightAttributeLoader.getGetClusterDetailsNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-03-01-preview"
                    }
                },
                provides: ["clusterProperties"]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.HDInsight.WriteHiveQuery", namespace: AzureResources.commonNamespace }
                },
                namespace: AzureHDInsightActions.writeHiveQueryNamespace,
                boundArguments: {
                    clusterProperties: {
                        attribute: "clusterProperties"
                    },
                    name: {
                        attribute: "name"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["clusterProperties"],
                        expression: "clusterProperties.clusterState === 'Running'"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.HDInsight.ViewJobs", namespace: AzureResources.commonNamespace }
                },
                namespace: AzureHDInsightActions.viewJobsNamespace,
                boundArguments: {
                    clusterProperties: {
                        attribute: "clusterProperties"
                    },
                    name: {
                        attribute: "name"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["clusterProperties"],
                        expression: "clusterProperties.clusterState === 'Running'"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.HDInsight.ViewStormTopologies", namespace: AzureResources.commonNamespace }
                },
                namespace: AzureHDInsightActions.viewStormTopologiesNamespace,
                boundArguments: {
                    clusterProperties: {
                        attribute: "clusterProperties"
                    },
                    name: {
                        attribute: "name"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["clusterProperties"],
                        expression: "clusterProperties.clusterState === 'Running' && clusterProperties.clusterVersion.split('.').length >= 2 && Number(clusterProperties.clusterVersion.split('.')[0]) >= 3 && Number(clusterProperties.clusterVersion.split('.')[1]) >= 2"
                    }
                },
                visible: {
                    expression: {
                        requires: ["clusterProperties"],
                        expression: "clusterProperties.clusterDefinition.kind === 'Storm'"
                    }
                }
            }
        ],
        properties: AzureHDInsightConfig._hdiClusterProperties
    };
    AzureHDInsightConfig.HiveDatabases = {
        aliases: ["Azure.HDInsight.HiveDatabaseGroup"],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightHiveDatabasesIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightHiveDatabasesIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.HDInsight.GetHiveDatabases",
            boundArguments: {
                clusterName: {
                    attribute: "clusterName"
                }
            }
        }
    };
    AzureHDInsightConfig.HiveDatabase = {
        aliases: ["Azure.HDInsight.HiveDatabase"],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightHiveDatabaseIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightHiveDatabaseIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.HDInsight.GetHiveTables",
            boundArguments: {
                clusterName: {
                    attribute: "clusterName"
                },
                databaseName: {
                    attribute: "databaseName"
                }
            }
        },
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Comment",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "comment"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Location",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "location"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Owner",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "owner"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureHDInsightAttributeLoader.getDatabasePropertyNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    }
                },
                provides: [
                    "comment",
                    "location",
                    "owner"
                ]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.HDInsight.CreateTable", namespace: AzureResources.commonNamespace }
                },
                namespace: AzureHDInsightActions.createTableNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    }
                }
            }
        ]
    };
    AzureHDInsightConfig.Table = {
        aliases: ["Azure.HDInsight.Database.Table"],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightTableIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightTableIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.HDInsight.GetTableColumns",
            boundArguments: {
                clusterName: {
                    attribute: "clusterName"
                },
                databaseName: {
                    attribute: "databaseName"
                },
                tableName: {
                    attribute: "tableName"
                }
            }
        },
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.DatabaseName",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "databaseName"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.InputFormat", namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["sd"],
                        expression: "sd.inputFormat"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.Location", namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["sd"],
                        expression: "sd.location"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.MaxFileSize",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "maxFileSize"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.MinFileSize",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "minFileSize"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.OutputFormat", namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["sd"],
                        expression: "sd.outputFormat"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Owner",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "owner"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.TableType",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "tableType"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.TotalFileSize",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "totalFileSize"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Database.Table.TotalNumberFiles",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "totalNumberFiles"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureHDInsightAttributeLoader.getTablePropertyNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    tableName: {
                        attribute: "tableName"
                    }
                },
                provides: [
                    "databaseName",
                    "sd",
                    "maxFileSize",
                    "minFileSize",
                    "owner",
                    "tableType",
                    "totalFileSize",
                    "totalNumberFiles"
                ]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.HDInsight.ViewTableData", namespace: AzureResources.commonNamespace }
                },
                namespace: AzureHDInsightActions.viewTableDataNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    databaseName: {
                        attribute: "databaseName"
                    },
                    tableName: {
                        attribute: "tableName"
                    }
                }
            }
        ]
    };
    AzureHDInsightConfig.Column = {
        aliases: ["Azure.HDInsight.Database.Table.Column"],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightTableColumnIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightTableColumnIcon,
        status: { attribute: "columnType" },
        supported: true
    };
    /* Storage Account lists a group of containers. Equivalent to ContainerGroup. */
    AzureHDInsightConfig.StorageAccount = {
        aliases: ["Azure.HDInsight.StorageAccount"],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightStorageAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightStorageAccountIcon,
        status: { attribute: "defaultStorageTag" },
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.HDInsight.GetContainers",
            boundArguments: {
                containers: {
                    attribute: "containers"
                },
                wasbAccountName: {
                    attribute: "wasbAccountName"
                },
                containerName: {
                    attribute: "containerName"
                },
                key: {
                    attribute: "key"
                },
                defaultContainer: {
                    attribute: "defaultContainer"
                },
                defaultStorageTag: {
                    attribute: "defaultStorageTag"
                },
                clusterName: {
                    attribute: "clusterName"
                }
            }
        },
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.Created",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "created"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.CustomDomains",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "customDomains"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.DefaultContainer",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "defaultContainer"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.LastGeoFailover",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "lastGeoFailover"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.Location",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "location"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.PrimaryRegion",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "primaryRegion"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.PrimaryStatus",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "primaryStatus"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.Replication",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "replication"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.SecondaryRegion",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "secondaryRegion"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.SecondaryStatus",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "secondaryStatus"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.Status",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "status"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.SubscriptionId",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "subscriptionId"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.SubscriptionName",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "subscriptionName"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureHDInsightAttributeLoader.getStoragePropertyNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    wasbAccountName: {
                        attribute: "wasbAccountName"
                    },
                    key: {
                        attribute: "key"
                    },
                    defaultStorageTag: {
                        attribute: "defaultStorageTag"
                    }
                },
                provides: [
                    "created",
                    "customDomains",
                    "lastGeoFailover",
                    "location",
                    "primaryRegion",
                    "primaryStatus",
                    "replication",
                    "secondaryRegion",
                    "secondaryStatus",
                    "status",
                    "subscriptionId",
                    "subscriptionName"
                ]
            }
        ]
    };
    AzureHDInsightConfig.Container = {
        aliases: ["Azure.HDInsight.Storage.Container"],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightContainerIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightContainerIcon,
        status: { attribute: "defaultContainerTag" },
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.HDInsight.ViewContainer", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.HDInsightContainerIcon,
                themeSrc: AzureConstants.imageThemeSrc.HDInsightContainerIcon,
                namespace: AzureHDInsightActions.viewContainerNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    storageName: {
                        attribute: "wasbAccountName"
                    },
                    containerName: {
                        attribute: "container"
                    },
                    key: {
                        attribute: "key"
                    },
                    defaultStorageTag: {
                        attribute: "defaultStorageTag"
                    }
                }
            }
        ],
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.Container.ETag",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["containerProperties"],
                        expression: "containerProperties.eTag"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.Container.LastModified",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["containerProperties"],
                        expression: "containerProperties.lastModified"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.Container.Name",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["containerProperties"],
                        expression: "containerProperties.name"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.HDInsight.Storage.Container.Uri",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["containerProperties"],
                        expression: "containerProperties.uri"
                    }
                }
            }
        ]
    };
    AzureHDInsightConfig.HadoopServiceLogs = {
        aliases: ["Azure.HDInsight.HadoopServiceLogGroup"],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightServiceLogIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightServiceLogIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.HDInsight.GetHadoopServicelogTable",
            boundArguments: {
                clusterName: {
                    attribute: "clusterName"
                }
            }
        }
    };
    AzureHDInsightConfig.HadoopServiceLogTable = {
        aliases: ["Azure.HDInsight.HadoopServiceLogTable"],
        parentType: AzureConstants.resourceTypes.HDInsightResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.HDInsightServiceLogIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightServiceLogIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.HDInsight.ViewHadoopServicelogTable", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.HDInsightServiceLogIcon,
                themeSrc: AzureConstants.imageThemeSrc.HDInsightServiceLogIcon,
                namespace: AzureHDInsightActions.viewHadoopServicelogTableNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    logTableName: {
                        attribute: "logTableName"
                    }
                }
            }
        ]
    };
    return AzureHDInsightConfig;
});

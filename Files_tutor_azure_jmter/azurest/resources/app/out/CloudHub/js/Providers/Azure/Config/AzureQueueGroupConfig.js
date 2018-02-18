/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Common/Utilities"], function (require, exports, AzureStorageConnectionTypeConfig_1, AzureConstants, AzureResources, Utilities) {
    "use strict";
    var AzureQueueGroupConfig = (function () {
        function AzureQueueGroupConfig() {
        }
        return AzureQueueGroupConfig;
    }());
    AzureQueueGroupConfig.Config = {
        aliases: ["Azure.QueueGroup"],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountQueueIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountQueueIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetAllQueues",
            boundArguments: {
                connectionString: {
                    attribute: "connectionString"
                },
                connectionType: {
                    attribute: "connectionType"
                },
                id: {
                    attribute: "id"
                }
            },
            preLoad: true
        },
        searchQuery: {
            namespace: "Azure.Producers.Storage.GetAllQueues",
            boundArguments: {
                connectionString: {
                    attribute: "connectionString"
                },
                connectionType: {
                    attribute: "connectionType"
                },
                id: {
                    attribute: "id"
                },
                searchQuery: {
                    attribute: "searchQuery"
                }
            },
            preLoad: true
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.Queues.Create", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountQueueIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountQueueIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                createChild: {
                    newChildName: "",
                    namespace: "Azure.Actions.Storage.validateQueueName"
                },
                namespace: "Azure.Actions.Storage.safeCreateQueue",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    id: {
                        attribute: "id"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    },
                    connectionType: {
                        attribute: "connectionType"
                    }
                }
            },
            {
                // Localize
                displayName: {
                    value: "Configure CORS Settings..."
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Queue.configureCORS",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    id: {
                        attribute: "id"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    return AzureQueueGroupConfig;
});

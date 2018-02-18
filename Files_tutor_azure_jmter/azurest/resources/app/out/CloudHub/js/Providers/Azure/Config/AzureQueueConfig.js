/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureStorageAttributeLoader", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Common/Utilities", "CloudExplorer/CloudExplorerConstants", "Providers/CloudExplorer/Resources/CloudExplorerResources"], function (require, exports, AzureConstants, AzureResources, AzureStorageAttributeLoader, AzureStorageConnectionTypeConfig_1, Utilities, CloudExplorerConstants, CloudExplorerResources) {
    "use strict";
    var AzureQueueConfig = (function () {
        function AzureQueueConfig() {
        }
        return AzureQueueConfig;
    }());
    AzureQueueConfig.Config = {
        aliases: ["Azure.Queue"],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountQueueIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountQueueIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Queues.Url", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "url"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Queues.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    value: "Queue"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.Open", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountQueueIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountQueueIcon,
                isDefault: true,
                namespace: "Azure.Actions.Storage.showEditor",
                boundArguments: {
                    editorNamespace: {
                        attribute: "editorNamespace"
                    },
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    }
                },
                sortIndex: -1000
            },
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.OpenNewTab", namespace: AzureResources.commonNamespace }
                },
                isDefault: false,
                namespace: "Azure.Actions.Storage.showEditor",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    editorNamespace: {
                        attribute: "editorNamespace"
                    },
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    openNewTab: {
                        value: true
                    }
                },
                sortIndex: -999
            },
            {
                // Localize
                displayName: {
                    value: "Copy Direct Link to Queue"
                },
                isDefault: false,
                visible: {
                    expression: {
                        requires: ["hasSubscription"],
                        expression: "hasSubscription && " + Utilities.isDirectLinkSupported()
                    }
                },
                namespace: "Azure.Actions.Storage.copyLinkToResource",
                boundArguments: {
                    accountId: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    resourceType: {
                        attribute: "nodeType"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Queues.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountQueueIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.Storage.safeDeleteQueue",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            },
            {
                // localize
                displayName: {
                    value: "Get Shared Access Signature..."
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Queue.generateSharedAccessSignature",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    }
                }
            },
            {
                // localize
                displayName: {
                    value: "Manage Access Policies..."
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Queue.manageAccessControlList",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    }
                }
            },
            {
                icon: AzureConstants.imagePaths.QuickAccessIcon,
                themeSrc: AzureConstants.imageThemeSrc.QuickAccessIcon,
                // Localize
                displayName: {
                    resource: { namespace: CloudExplorerResources.namespace, resourceId: "TreeView.QuickAccess.Add" }
                },
                isDefault: false,
                namespace: "Azure.Actions.Storage.addToQuickAccess",
                visible: {
                    expression: {
                        requires: ["hasSubscription"],
                        expression: "hasSubscription && " + Utilities.isRunningOnElectron()
                    }
                },
                boundArguments: {
                    displayName: {
                        attribute: "name"
                    },
                    producerNamespace: {
                        value: "Azure.Producers.Storage.GetSingleQueueByName"
                    },
                    producerArgs: {
                        boundArguments: {
                            connectionString: {
                                attribute: "connectionString"
                            },
                            id: {
                                attribute: "id"
                            },
                            searchQuery: {
                                attribute: "name"
                            }
                        }
                    }
                }
            }
        ],
        loaders: [
            {
                namespace: AzureStorageAttributeLoader.getQueueAttributes,
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    queueName: {
                        attribute: "name"
                    }
                },
                provides: ["url"]
            }
        ]
    };
    return AzureQueueConfig;
});

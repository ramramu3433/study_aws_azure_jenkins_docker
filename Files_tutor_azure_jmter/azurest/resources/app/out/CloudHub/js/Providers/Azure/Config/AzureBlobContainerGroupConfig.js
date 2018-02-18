/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Common/AzureStorageConstants", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureStorageConnectionTypeConfig_1, AzureStorageConstants, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureBlobContainerGroupConfig = (function () {
        function AzureBlobContainerGroupConfig() {
        }
        return AzureBlobContainerGroupConfig;
    }());
    /**
     * Standard blob container group
     */
    AzureBlobContainerGroupConfig.SubscriptionOrKey = {
        aliases: ["Azure.BlobContainerGroup"],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountBlobContainerIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountBlobContainerIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetAllBlobContainers",
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
                subscription: {
                    attribute: "subscription"
                }
            },
            preLoad: true
        },
        searchQuery: {
            namespace: "Azure.Producers.Storage.GetAllBlobContainers",
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
                    resource: { resourceId: "Actions.BlobContainers.Create", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountBlobContainerIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountBlobContainerIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                createChild: {
                    newChildName: "",
                    namespace: "Azure.Actions.Storage.validateBlobContainerName"
                },
                namespace: "Azure.Actions.Storage.safeCreateBlobContainer",
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
                    value: "Paste Blob Container"
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [
                    Utilities.isMac() ? CloudExplorerConstants.keyCodes.MacCommand : CloudExplorerConstants.keyCodes.Ctrl,
                    CloudExplorerConstants.keyCodes.V
                ],
                namespace: "Azure.Actions.Storage.Blob.pasteBlobContainerToStorageAccount",
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
                },
                enabled: {
                    attribute: "canPasteBlobContainerToBlobContainersNode",
                    value: true
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
                namespace: "Azure.Actions.Storage.Blob.configureCORS",
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
        ],
        loaders: [
            {
                namespace: "Azure.Attributes.Storage.getCanPasteBlobContainerAttribute",
                provides: ["canPasteBlobContainerToBlobContainersNode"]
            }
        ]
    };
    /**
     * SAS-attached blob container group
     */
    AzureBlobContainerGroupConfig.Sas = {
        aliases: [AzureStorageConstants.nodeTypes.sasBlobContainerGroup],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        parentType: AzureConstants.resourceTypes.StorageAccountsV2ResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountBlobContainerIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountBlobContainerIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetSASBlobContainers",
            boundArguments: {},
            preLoad: true
        }
    };
    return AzureBlobContainerGroupConfig;
});

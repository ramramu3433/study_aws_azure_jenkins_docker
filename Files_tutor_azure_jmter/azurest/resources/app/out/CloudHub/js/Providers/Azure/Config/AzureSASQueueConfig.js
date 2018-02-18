/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Common/AzureStorageConstants", "CloudExplorer/CloudExplorerConstants", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureStorageConstants, CloudExplorerConstants, AzureStorageConnectionTypeConfig_1, Utilities) {
    "use strict";
    var AzureSASQueueConfig = (function () {
        function AzureSASQueueConfig() {
        }
        return AzureSASQueueConfig;
    }());
    /**
     * Refers to either:
     *   1) a SAS-attached query service node
     *          (hasAccountSas==false and hasServiceSas==true)
     *   2) a query service node inside of a SAS-attached account node
     *          (hasAccountSas==true and hasServiceSas==false)
     */
    AzureSASQueueConfig.Config = {
        aliases: [AzureStorageConstants.nodeTypes.sasQueue],
        inherits: [AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountQueueIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountQueueIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.Open", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountQueueIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountQueueIcon,
                isDefault: true,
                enabled: {
                    value: true
                },
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
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.OpenNewTab", namespace: AzureResources.commonNamespace }
                },
                isDefault: false,
                enabled: {
                    value: true
                },
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
                }
            },
            {
                // Localize
                displayName: {
                    value: "Detach"
                },
                isDefault: false,
                namespace: "Azure.Actions.Storage.detachStorageServiceSAS",
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    connectionString: {
                        attribute: "connectionString"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                },
                visible: {
                    attribute: "hasServiceSas"
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
                    expression: {
                        requires: ["hasServiceSas"],
                        expression: "hasServiceSas !== true"
                    }
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
            }
        ],
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
            },
            {
                displayName: {
                    value: "Shared Access Signature" // Localize
                },
                binding: {
                    attribute: "sharedAccessSignature"
                }
            }
        ]
    };
    return AzureSASQueueConfig;
});

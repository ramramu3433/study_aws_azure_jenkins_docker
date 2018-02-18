/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureStorageAccountAttributeLoader", "Providers/Azure/Config/AzureStorageAccountPiecesConfig", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureStorageAccountAttributeLoader, AzureStorageAccountCopyKeyConfig, CloudExplorerResources, Utilities) {
    "use strict";
    var AzureBlobStorageAccountConfig = (function () {
        function AzureBlobStorageAccountConfig() {
        }
        return AzureBlobStorageAccountConfig;
    }());
    AzureBlobStorageAccountConfig.Config = {
        aliases: [AzureConstants.resourceTypes.StorageAccountsV2],
        parentType: AzureConstants.resourceTypes.StorageAccountsV2ResourceType,
        inherits: [
            AzureConstants.baseTypes.Resource,
            AzureStorageAccountCopyKeyConfig.CopyKey.aliases[0]
        ],
        displayName: { attribute: "name" },
        kind: AzureConstants.resourceKinds.BlobStorage,
        icon: AzureConstants.imagePaths.StorageAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountIcon,
        supported: true,
        status: {
            value: "Blob Storage"
        },
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.StorageAccounts.PrimaryKey",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "primaryKey"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.StorageAccounts.SecondaryKey",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "secondaryKey"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.StorageAccounts.PrimaryConnectionString",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["name", "primaryKey", "endpoints"],
                        expression: "\"DefaultEndpointsProtocol=https;AccountName=\" + name + \";AccountKey=\" + primaryKey + \";\" + endpoints"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.StorageAccounts.SecondaryConnectionString",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    expression: {
                        requires: ["name", "secondaryKey", "endpoints"],
                        expression: "\"DefaultEndpointsProtocol=https;AccountName=\" + name + \";AccountKey=\" + secondaryKey + \";\" + endpoints"
                    }
                }
            }
        ],
        loaders: [
            {
                namespace: AzureStorageAccountAttributeLoader.getKeysV2Attributes,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-05-01-preview"
                    }
                },
                provides: ["primaryKey", "secondaryKey"]
            },
            {
                namespace: AzureStorageAccountAttributeLoader.getV2Attributes,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2016-01-01"
                    }
                },
                provides: ["supportsBlobs", "supportsQueues", "supportsTables", "searchQuery", "shouldPreExpandNodes", "accessTier", "endpoints"]
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetGroupNodes",
            boundArguments: {
                connectionString: {
                    expression: {
                        requires: ["name", "primaryKey", "endpoints"],
                        expression: "\"DefaultEndpointsProtocol=https;AccountName=\" + name + \";AccountKey=\" + primaryKey + \";\" + endpoints"
                    }
                },
                supportsBlobs: {
                    attribute: "supportsBlobs"
                },
                supportsQueues: {
                    attribute: "supportsQueues"
                },
                supportsTables: {
                    attribute: "supportsTables"
                },
                id: {
                    attribute: "id"
                },
                shouldPreExpandNodes: {
                    attribute: "shouldPreExpandNodes"
                },
                connectionType: {
                    value: 2 /* subscription */
                }
            }
        },
        actions: [
            {
                // Localize
                displayName: {
                    value: "Get Shared Access Signature..."
                },
                namespace: "Azure.Actions.Storage.generateSharedAccessSignature",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    connectionString: {
                        expression: {
                            requires: ["name", "primaryKey", "endpoints"],
                            expression: "\"DefaultEndpointsProtocol=https;AccountName=\" + name + \";AccountKey=\" + primaryKey + \";\" + endpoints"
                        }
                    },
                    name: {
                        attribute: "name"
                    },
                    accountKind: {
                        attribute: "kind"
                    }
                }
            },
            {
                // Localize
                displayName: {
                    value: "Copy Direct Link to Account"
                },
                namespace: "Azure.Actions.Storage.copyLinkToResource",
                visible: {
                    value: Utilities.isRunningOnElectron() && (Utilities.isWin() || Utilities.isMac())
                },
                boundArguments: {
                    accountId: {
                        attribute: "id"
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
                namespace: "Azure.Actions.Storage.addToQuickAccess",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    displayName: {
                        attribute: "name"
                    },
                    producerNamespace: {
                        value: "Azure.Producers.Resources.GetFromResourceId"
                    },
                    producerArgs: {
                        boundArguments: {
                            subscription: {
                                attribute: "subscription"
                            },
                            id: {
                                attribute: "id"
                            },
                            apiVersion: {
                                value: "2015-05-01-preview"
                            }
                        }
                    }
                }
            }
        ]
    };
    return AzureBlobStorageAccountConfig;
});

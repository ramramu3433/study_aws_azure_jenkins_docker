/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureStorageAccountAttributeLoader", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureStorageAccountAttributeLoader, CloudExplorerResources, Utilities) {
    "use strict";
    var AzureStorageAccountConfig = (function () {
        function AzureStorageAccountConfig() {
        }
        return AzureStorageAccountConfig;
    }());
    AzureStorageAccountConfig.Config = {
        aliases: [AzureConstants.resourceTypes.StorageAccountsClassic],
        parentType: AzureConstants.resourceTypes.StorageAccountsV2ResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountIcon,
        supported: true,
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
                namespace: AzureStorageAccountAttributeLoader.getKeysAttributes,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2014-06-01"
                    }
                },
                provides: ["primaryKey", "secondaryKey"]
            },
            {
                namespace: AzureStorageAccountAttributeLoader.getAttributes,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2014-06-01"
                    },
                    primaryKey: {
                        attribute: "primaryKey"
                    },
                    secondaryKey: {
                        attribute: "secondaryKey"
                    },
                    name: {
                        attribute: "name"
                    }
                },
                provides: ["supportsBlobs", "supportsQueues", "supportsTables", "supportsFiles", "searchQuery", "shouldPreExpandNodes", "endpoints"]
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
                supportsFiles: {
                    attribute: "supportsFiles"
                },
                id: {
                    attribute: "id"
                },
                // TODO Convert to binding instead?
                shouldPreExpandNodes: {
                    attribute: "shouldPreExpandNodes"
                },
                connectionType: {
                    value: 2 /* subscription */
                },
                subscription: {
                    attribute: "subscription"
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
                // Localize
                displayName: {
                    value: "Copy Primary Key"
                },
                namespace: "Azure.Actions.Storage.copyPrimaryKeyToClipboard",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    primaryKey: {
                        attribute: "primaryKey"
                    }
                }
            },
            {
                // Localize
                displayName: {
                    value: "Copy Secondary Key"
                },
                namespace: "Azure.Actions.Storage.copySecondaryKeyToClipboard",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    secondaryKey: {
                        attribute: "secondaryKey"
                    }
                }
            },
            {
                icon: AzureConstants.imagePaths.QuickAccessIcon,
                themeSrc: AzureConstants.imageThemeSrc.QuickAccessIcon,
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
                                value: "2014-06-01"
                            }
                        }
                    }
                }
            }
        ]
    };
    return AzureStorageAccountConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Config/AzureFileSharePiecesConfig", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureStorageAttributeLoader", "Providers/Common/AzureStorageConstants", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "CloudExplorer/CloudExplorerConstants", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Utilities"], function (require, exports, AzureConstants, AzureFileSharePiecesConfig_1, AzureResources, AzureStorageAttributeLoader, AzureStorageConstants, AzureStorageConnectionTypeConfig_1, CloudExplorerConstants, CloudExplorerResources, Utilities) {
    "use strict";
    var AzureFileShareConfig = (function () {
        function AzureFileShareConfig() {
        }
        return AzureFileShareConfig;
    }());
    AzureFileShareConfig.Config = {
        aliases: [AzureStorageConstants.nodeTypes.fileShare],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0],
            AzureFileSharePiecesConfig_1.default.Rename.aliases[0],
            AzureFileSharePiecesConfig_1.default.Copy.aliases[0]
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountFileShareIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountFileShareIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.Open", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountOpenIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountOpenIcon,
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
                displayName: {
                    resource: { resourceId: "Actions.FileShare.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountDeleteIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.Storage.safeDeleteFileShare",
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
                // Localize
                displayName: {
                    value: "Copy Direct Link to File Share"
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
                // localize
                displayName: {
                    value: "Get Shared Access Signature..."
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.File.generateSharedAccessSignature",
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
                namespace: "Azure.Actions.Storage.File.manageAccessControlList",
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
                        value: "Azure.Producers.Storage.GetSingleFileShareByName"
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
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.FileShare.Url", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "url"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.FileShare.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    value: "File Share"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.FileShare.LastModified", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "lastModified"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.FileShare.Quota", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    expression: {
                        requires: ["quota"],
                        expression: "quota + \" GB\""
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.FileShare.Usage", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "usage"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureStorageAttributeLoader.getFileShareAttributes,
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    shareName: {
                        attribute: "name"
                    }
                },
                provides: ["url", "lastModified", "quota", "usage"]
            }
        ]
    };
    return AzureFileShareConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureStorageAttributeLoader", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Azure/Config/AzureTablePiecesConfig", "CloudExplorer/CloudExplorerConstants", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureStorageAttributeLoader, AzureStorageConnectionTypeConfig_1, AzureTablePiecesConfig_1, CloudExplorerConstants, CloudExplorerResources, Utilities) {
    "use strict";
    var AzureTableConfig = (function () {
        function AzureTableConfig() {
        }
        return AzureTableConfig;
    }());
    AzureTableConfig.Config = {
        aliases: ["Azure.Table"],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0],
            AzureTablePiecesConfig_1.default.Rename.aliases[0]
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountTableIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountTableIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Tables.Url", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "url"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Tables.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    value: "Table"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.Open", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountTableIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountTableIcon,
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
                    },
                    connectionType: {
                        attribute: "connectionType"
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
                    connectionType: {
                        attribute: "connectionType"
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
                    value: "Copy Direct Link to Table"
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
                    resource: { resourceId: "Actions.Tables.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountTableIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.Storage.safeDeleteTable",
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
                displayName: {
                    value: "Get Shared Access Signature..." // Localize
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Table.generateSharedAccessSignature",
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
                // Localize
                displayName: {
                    value: "Copy Table"
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [
                    Utilities.isMac() ? CloudExplorerConstants.keyCodes.MacCommand : CloudExplorerConstants.keyCodes.Ctrl,
                    CloudExplorerConstants.keyCodes.C
                ],
                namespace: "Azure.Actions.Storage.Table.copyTableToClipboard",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    url: {
                        attribute: "url"
                    }
                }
            },
            {
                displayName: {
                    value: "Manage Access Policies..." // Localize
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Table.manageAccessControlList",
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
                        value: "Azure.Producers.Storage.GetSingleTableByName"
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
                namespace: AzureStorageAttributeLoader.getTableAttributes,
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    tableName: {
                        attribute: "name"
                    }
                },
                provides: ["url"]
            }
        ]
    };
    return AzureTableConfig;
});

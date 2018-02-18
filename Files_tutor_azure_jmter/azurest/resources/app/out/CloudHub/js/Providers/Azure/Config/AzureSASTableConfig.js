/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Common/AzureStorageConstants", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Azure/Config/AzureTablePiecesConfig", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureStorageConstants, AzureStorageConnectionTypeConfig_1, AzureTablePiecesConfig_1, CloudExplorerConstants, Utilities) {
    "use strict";
    /**
     * Refers to either:
     *   1) a SAS-attached table service node
     *          (hasAccountSas==false and hasServiceSas==true)
     *   2) a table service node inside of a SAS-attached account node
     *          (hasAccountSas==true and hasServiceSas==false)
     */
    var AzureSASTableConfig = (function () {
        function AzureSASTableConfig() {
        }
        return AzureSASTableConfig;
    }());
    AzureSASTableConfig.Config = {
        aliases: [AzureStorageConstants.nodeTypes.sasTable],
        inherits: [
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
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.Open", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountTableIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountTableIcon,
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
            // TODO: Share redundant actions between SAS/non-SAS
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
                    resource: { resourceId: "Actions.Tables.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountTableIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    expression: {
                        requires: ["hasServiceSas"],
                        expression: "!hasServiceSas"
                    }
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
            }
        ],
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
    return AzureSASTableConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Config/AzureFileSharePiecesConfig", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Common/AzureStorageConstants", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, AzureFileSharePiecesConfig_1, AzureResources, AzureStorageConnectionTypeConfig_1, AzureStorageConstants, CloudExplorerConstants, Utilities) {
    "use strict";
    /**
     * Refers to either:
     *   1) a SAS-attached fileshare node
     *          (hasAccountSas==false and hasServiceSas==true)
     *   2) a fileshare service node inside of a SAS-attached account node
     *          (hasAccountSas==true and hasServiceSas==false)
     */
    var AzureSASFileShareConfig = (function () {
        function AzureSASFileShareConfig() {
        }
        return AzureSASFileShareConfig;
    }());
    AzureSASFileShareConfig.Config = {
        aliases: [AzureStorageConstants.nodeTypes.sasFileShare],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0],
            AzureFileSharePiecesConfig_1.default.Copy.aliases[0],
            AzureFileSharePiecesConfig_1.default.Rename.aliases[0]
        ],
        displayName: {
            value: "File Share"
        },
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
                icon: AzureConstants.imagePaths.StorageAccountFileShareIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountFileShareIcon,
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
                    resource: { resourceId: "Actions.FileShare.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountFileShareIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountFileShareIcon,
                isDefault: false,
                visible: {
                    expression: {
                        requires: ["hasServiceSas"],
                        expression: "!hasServiceSas"
                    }
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
                    value: "Shared Access Signature" // Localize
                },
                binding: {
                    attribute: "sharedAccessSignature"
                }
            }
        ]
    };
    return AzureSASFileShareConfig;
});

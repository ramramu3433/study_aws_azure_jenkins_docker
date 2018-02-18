/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Azure/Resources/AzureResources", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, AzureStorageConnectionTypeConfig_1, AzureResources, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureFileShareGroupConfig = (function () {
        function AzureFileShareGroupConfig() {
        }
        return AzureFileShareGroupConfig;
    }());
    AzureFileShareGroupConfig.Config = {
        aliases: ["Azure.FileShareGroup"],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountFileShareIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountFileShareIcon,
        supported: Utilities.isRunningOnElectron(),
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetAllFileShares",
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
            namespace: "Azure.Producers.Storage.GetAllFileShares",
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
                    resource: { resourceId: "Actions.FileShare.Create", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountCreateIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountCreateIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                createChild: {
                    newChildName: "",
                    namespace: "Azure.Actions.Storage.validateFileShareName"
                },
                namespace: "Azure.Actions.Storage.safeCreateFileShare",
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
                    value: "Paste File Share"
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [
                    Utilities.isMac() ? CloudExplorerConstants.keyCodes.MacCommand : CloudExplorerConstants.keyCodes.Ctrl,
                    CloudExplorerConstants.keyCodes.V
                ],
                namespace: "Azure.Actions.Storage.File.pasteFileShareToStorageAccount",
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
                    expression: {
                        requires: ["canPasteFileShareToFileSharesNode"],
                        expression: "canPasteFileShareToFileSharesNode"
                    },
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
                namespace: "Azure.Actions.Storage.File.configureCORS",
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
                namespace: "Azure.Attributes.Storage.getCanPasteFileShareAttribute",
                provides: ["canPasteFileShareToFileSharesNode"]
            }
        ]
    };
    return AzureFileShareGroupConfig;
});

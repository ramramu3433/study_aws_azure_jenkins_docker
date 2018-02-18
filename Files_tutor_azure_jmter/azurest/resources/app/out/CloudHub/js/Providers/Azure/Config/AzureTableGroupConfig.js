/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureStorageConnectionTypeConfig_1, AzureConstants, AzureResources, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureTableGroupConfig = (function () {
        function AzureTableGroupConfig() {
        }
        return AzureTableGroupConfig;
    }());
    AzureTableGroupConfig.Config = {
        aliases: ["Azure.TableGroup"],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountTableIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountTableIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetAllTables",
            boundArguments: {
                connectionString: {
                    attribute: "connectionString"
                },
                id: {
                    attribute: "id"
                },
                connectionType: {
                    attribute: "connectionType"
                }
            },
            preLoad: true
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.Tables.Create", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountTableIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountTableIcon,
                isDefault: false,
                visible: {
                    value: true
                },
                enabled: {
                    attribute: "canAddDeleteTables"
                },
                createChild: {
                    newChildName: "",
                    namespace: "Azure.Actions.Storage.validateTableName"
                },
                namespace: "Azure.Actions.Storage.safeCreateTable",
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
                    value: "Paste Table"
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [
                    Utilities.isMac() ? CloudExplorerConstants.keyCodes.MacCommand : CloudExplorerConstants.keyCodes.Ctrl,
                    CloudExplorerConstants.keyCodes.V
                ],
                namespace: "Azure.Actions.Storage.Table.pasteTable",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["canPasteTable", "canAddDeleteTables"],
                        expression: "canPasteTable && canAddDeleteTables"
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
                namespace: "Azure.Actions.Storage.Table.configureCORS",
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
                namespace: "Azure.Attributes.Storage.getCanPasteTableAttribute",
                provides: ["canPasteTable"]
            }
        ]
    };
    return AzureTableGroupConfig;
});

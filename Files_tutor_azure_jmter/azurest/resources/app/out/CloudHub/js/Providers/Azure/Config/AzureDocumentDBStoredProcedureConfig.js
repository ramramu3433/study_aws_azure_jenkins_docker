/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureDocumentDBActions", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureDocumentDBActions, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureDocumentDBStoredProcedureConfig = (function () {
        function AzureDocumentDBStoredProcedureConfig() {
        }
        return AzureDocumentDBStoredProcedureConfig;
    }());
    AzureDocumentDBStoredProcedureConfig.Config = {
        aliases: ["Azure.DocumentDB.StoredProcedure"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBStoredProcedureIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBStoredProcedureIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDB.Id", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "id"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDB.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    value: "StoredProcedure"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDB.SelfLink", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "selfLink"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DocumentDB.OpenEditor", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBStoredProcedureIcon,
                isDefault: true,
                namespace: AzureDocumentDBActions.openFileEditorActionNamespace,
                boundArguments: {
                    documentEndpoint: {
                        attribute: "documentEndpoint"
                    },
                    primaryMasterKey: {
                        attribute: "primaryMasterKey"
                    },
                    selfLink: {
                        attribute: "selfLink"
                    },
                    collectionSelfLink: {
                        attribute: "collectionSelfLink"
                    },
                    accountId: {
                        attribute: "accountId"
                    },
                    id: {
                        attribute: "id"
                    },
                    body: {
                        attribute: "body"
                    },
                    resourceType: {
                        value: "StoredProcedure"
                    },
                    openNewTab: {
                        value: false
                    },
                    connectionString: {
                        attribute: "connectionString"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DocumentDB.StoredProcedure.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBCollectionsIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.DocumentDB.safeDeleteStoredProcedure",
                boundArguments: {
                    documentEndpoint: {
                        attribute: "documentEndpoint"
                    },
                    primaryMasterKey: {
                        attribute: "primaryMasterKey"
                    },
                    selfLink: {
                        attribute: "selfLink"
                    },
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
        ]
    };
    return AzureDocumentDBStoredProcedureConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureDocumentDBActions", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureDocumentDBActions, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureDocumentDBUserDefinedFunctionConfig = (function () {
        function AzureDocumentDBUserDefinedFunctionConfig() {
        }
        return AzureDocumentDBUserDefinedFunctionConfig;
    }());
    AzureDocumentDBUserDefinedFunctionConfig.Config = {
        aliases: ["Azure.DocumentDB.UserDefinedFunction"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBUDFIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBUDFIcon,
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
                    value: "UserDefinedFunction"
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
                icon: AzureConstants.imagePaths.DocumentDBUDFIcon,
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
                    accountId: {
                        attribute: "accountId"
                    },
                    id: {
                        attribute: "id"
                    },
                    resourceType: {
                        value: "UDF"
                    },
                    body: {
                        attribute: "body"
                    },
                    collectionSelfLink: {
                        attribute: "collectionSelfLink"
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
                    resource: { resourceId: "Actions.DocumentDB.UserDefinedFunction.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBCollectionsIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.DocumentDB.safeDeleteUserDefinedFunction",
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
    return AzureDocumentDBUserDefinedFunctionConfig;
});

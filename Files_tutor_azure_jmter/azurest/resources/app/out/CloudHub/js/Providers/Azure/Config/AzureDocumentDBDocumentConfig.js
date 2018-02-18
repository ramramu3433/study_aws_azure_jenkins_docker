/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureDocumentDBActions", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureDocumentDBActions, Utilities) {
    "use strict";
    var AzureDocumentDBDocumentConfig = (function () {
        function AzureDocumentDBDocumentConfig() {
        }
        return AzureDocumentDBDocumentConfig;
    }());
    AzureDocumentDBDocumentConfig.Config = {
        aliases: ["Azure.DocumentDB.Document"],
        inherits: [],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBDocumentsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBDocumentsIcon,
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
                    attribute: "type"
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
                icon: AzureConstants.imagePaths.DocumentDBDocumentsIcon,
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
                    databaseId: {
                        attribute: "databaseId"
                    },
                    collectionId: {
                        attribute: "collectionId"
                    },
                    resourceType: {
                        attribute: "defaultExperience"
                    },
                    partitionKeyValue: {
                        attribute: "partitionKeyValue"
                    },
                    partitionKeyPath: {
                        attribute: "partitionKeyPath"
                    },
                    partitionKeyKind: {
                        attribute: "partitionKeyKind"
                    },
                    openNewTab: {
                        value: false
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DocumentDB.OpenNewEditor", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBDocumentsIcon,
                isDefault: false,
                namespace: AzureDocumentDBActions.openFileEditorActionNamespace,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
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
                    databaseId: {
                        attribute: "databaseId"
                    },
                    collectionId: {
                        attribute: "collectionId"
                    },
                    resourceType: {
                        attribute: "defaultExperience"
                    },
                    partitionKeyPath: {
                        attribute: "partitionKeyPath"
                    },
                    partitionKeyKind: {
                        attribute: "partitionKeyKind"
                    },
                    openNewTab: {
                        value: true
                    }
                }
            }
        ]
    };
    return AzureDocumentDBDocumentConfig;
});

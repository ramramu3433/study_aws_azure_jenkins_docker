/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureDocumentDBActions", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureDocumentDBActions, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureDocumentDBTriggerConfig = (function () {
        function AzureDocumentDBTriggerConfig() {
        }
        return AzureDocumentDBTriggerConfig;
    }());
    AzureDocumentDBTriggerConfig.Config = {
        aliases: ["Azure.DocumentDB.Trigger"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBTriggerIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBTriggerIcon,
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
                    value: "Trigger"
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
                icon: AzureConstants.imagePaths.DocumentDBTriggerIcon,
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
                        value: "Trigger"
                    },
                    body: {
                        attribute: "body"
                    },
                    triggerOperation: {
                        attribute: "triggerOperation"
                    },
                    triggerType: {
                        attribute: "triggerType"
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
                    resource: { resourceId: "Actions.DocumentDB.Trigger.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBCollectionsIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.DocumentDB.safeDeleteTrigger",
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
    return AzureDocumentDBTriggerConfig;
});

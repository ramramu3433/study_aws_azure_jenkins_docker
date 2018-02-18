/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/AzureDataFactoryConstants", "Providers/Azure/Actions/AzureDataFactoryActions", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureDataFactoryConstants, AzureDataFactoryActions, AzureResources) {
    "use strict";
    var AzureDataFactoryLinkedServiceConfig = (function () {
        function AzureDataFactoryLinkedServiceConfig() {
        }
        return AzureDataFactoryLinkedServiceConfig;
    }());
    AzureDataFactoryLinkedServiceConfig.Config = {
        aliases: ["Azure.DataFactoryLinkedService"],
        parentType: AzureConstants.resourceTypes.DataFactoriesResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataFactoryLinkedServiceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataFactoryLinkedServiceIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryLinkedService.Name", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryLinkedService.DataStoreType", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "dataStoreType"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryLinkedService.OpenEditor", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryLinkedServiceIcon,
                isDefault: true,
                namespace: AzureDataFactoryActions.openFileEditorActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    type: {
                        value: "LinkedService"
                    },
                    version: {
                        value: AzureDataFactoryConstants.apiVersion.currentVersion
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryLinkedService.AddToProject", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryLinkedServiceIcon,
                isDefault: true,
                namespace: AzureDataFactoryActions.addToProjectActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    name: {
                        attribute: "name"
                    },
                    type: {
                        value: "LinkedService"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryLinkedService.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryLinkedServiceIcon,
                isDefault: true,
                namespace: AzureDataFactoryActions.deleteDataFactoryChildResourceActionNamespace,
                boundArguments: {
                    dataFactoryName: {
                        attribute: "dataFactoryName"
                    },
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    name: {
                        attribute: "name"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    },
                    type: {
                        value: "LinkedService"
                    },
                    version: {
                        value: AzureDataFactoryConstants.apiVersion.currentVersion
                    }
                }
            }
        ]
    };
    return AzureDataFactoryLinkedServiceConfig;
});

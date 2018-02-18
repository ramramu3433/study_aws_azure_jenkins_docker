/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/AzureDataFactoryConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureDataFactoryActions"], function (require, exports, AzureConstants, AzureDataFactoryConstants, AzureResources, AzureDataFactoryActions) {
    "use strict";
    var AzureDataFactoryTableConfig = (function () {
        function AzureDataFactoryTableConfig() {
        }
        return AzureDataFactoryTableConfig;
    }());
    AzureDataFactoryTableConfig.Config = {
        aliases: ["Azure.DataFactoryDataset"],
        parentType: AzureConstants.resourceTypes.DataFactoriesResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataFactoryTableIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataFactoryTableIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryTable.Name", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryTable.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "type"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryTable.CreateTime", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "createTime"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryTable.ProvisioningState", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "provisioningState"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryTable.OpenEditor", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryTableIcon,
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
                        value: "Table"
                    },
                    version: {
                        value: AzureDataFactoryConstants.apiVersion.currentVersion
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryTable.AddToProject", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryTableIcon,
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
                        value: "Table"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryTable.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryTableIcon,
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
                        value: "DataSet"
                    },
                    version: {
                        value: AzureDataFactoryConstants.apiVersion.currentVersion
                    }
                }
            }
        ]
    };
    return AzureDataFactoryTableConfig;
});

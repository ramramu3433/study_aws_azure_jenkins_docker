/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/AzureDataFactoryConstants", "Providers/Azure/Actions/AzureDataFactoryActions", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureDataFactoryConstants, AzureDataFactoryActions, AzureResources) {
    "use strict";
    var AzureDataFactoryConfig = (function () {
        function AzureDataFactoryConfig() {
        }
        return AzureDataFactoryConfig;
    }());
    AzureDataFactoryConfig.Config = {
        aliases: [AzureConstants.resourceTypes.DataFactories],
        parentType: AzureConstants.resourceTypes.DataFactoriesResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataFactoriesIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataFactoriesIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataFactory.GetGroupNodes",
            boundArguments: {
                dataFactoryName: {
                    attribute: "name"
                },
                id: {
                    attribute: "id"
                },
                subscription: {
                    attribute: "subscription"
                },
                resourceGroup: {
                    attribute: "resourceGroup"
                }
            }
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactory.ExportToProject", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoriesIcon,
                isDefault: true,
                namespace: AzureDataFactoryActions.exportDataFactoryActionNamespace,
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
                    version: {
                        value: AzureDataFactoryConstants.apiVersion.currentVersion
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactory.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoriesIcon,
                isDefault: true,
                namespace: AzureDataFactoryActions.deleteDataFactoryActionNamespace,
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
                    version: {
                        value: AzureDataFactoryConstants.apiVersion.currentVersion
                    }
                }
            }
        ]
    };
    return AzureDataFactoryConfig;
});

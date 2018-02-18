/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/AzureDataFactoryConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureDataFactoryActions"], function (require, exports, AzureConstants, AzureDataFactoryConstants, AzureResources, AzureDataFactoryActions) {
    "use strict";
    var AzureDataFactoryPipelineConfig = (function () {
        function AzureDataFactoryPipelineConfig() {
        }
        return AzureDataFactoryPipelineConfig;
    }());
    AzureDataFactoryPipelineConfig.Config = {
        aliases: ["Azure.DataFactoryPipeline"],
        parentType: AzureConstants.resourceTypes.DataFactoriesResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataFactoryPipelineIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataFactoryPipelineIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryPipeline.Name", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryPipeline.Deployed", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "deploymentTime"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryPipeline.StartTime", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "startTime"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryPipeline.EndTime", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "endTime"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryPipeline.Paused", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "isPaused"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DataFactoryPipeline.ProvisioningState", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "provisioningState"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryPipeline.OpenEditor", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryPipelineIcon,
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
                        value: "Pipeline"
                    },
                    version: {
                        value: AzureDataFactoryConstants.apiVersion.currentVersion
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryPipeline.AddToProject", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryPipelineIcon,
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
                        value: "Pipeline"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DataFactoryPipeline.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataFactoryPipelineIcon,
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
                        value: "Pipeline"
                    },
                    version: {
                        value: AzureDataFactoryConstants.apiVersion.currentVersion
                    }
                }
            }
        ]
    };
    return AzureDataFactoryPipelineConfig;
});

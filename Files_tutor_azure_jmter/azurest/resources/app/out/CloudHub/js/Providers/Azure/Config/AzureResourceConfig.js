/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureActions", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureActions, AzureResources) {
    "use strict";
    var AzureResourceConfig = (function () {
        function AzureResourceConfig() {
        }
        return AzureResourceConfig;
    }());
    AzureResourceConfig.refreshAction = {
        displayName: {
            resource: { resourceId: "Actions.Resources.Refresh", namespace: AzureResources.commonNamespace }
        },
        visible: {
            value: true
        },
        icon: AzureConstants.imagePaths.RefreshIcon,
        themeSrc: AzureConstants.imageThemeSrc.RefreshIcon,
        namespace: "CloudExplorer.ElementInteraction.refresh",
        sortIndex: 1000
    };
    AzureResourceConfig.Config = {
        aliases: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        actions: [
            AzureResourceConfig.refreshAction,
            {
                displayName: {
                    resource: { resourceId: "Actions.Resources.OpenInPortal", namespace: AzureResources.commonNamespace }
                },
                visible: {
                    value: true
                },
                icon: AzureConstants.imagePaths.OpenInPortalIcon,
                themeSrc: AzureConstants.imageThemeSrc.OpenInPortalIcon,
                namespace: AzureActions.openResourceInPortalNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    tenantId: {
                        attribute: "tenantId"
                    }
                }
            }
        ],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.Name", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "type"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.Subscription", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "subscriptionName"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.ResourceGroup", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "resourceGroup"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.Location", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "location"
                }
            }
        ]
    };
    AzureResourceConfig.NoActionsConfig = {
        aliases: [AzureConstants.baseTypes.ResourceNoActions],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.Name", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "type"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.Subscription", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "subscriptionName"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.ResourceGroup", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "resourceGroup"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Resources.Location", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "location"
                }
            }
        ]
    };
    AzureResourceConfig.RefreshActionConfig = {
        aliases: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        supported: true,
        actions: [
            AzureResourceConfig.refreshAction
        ]
    };
    AzureResourceConfig.ResourceTypeChildrenQueryConfig = {
        aliases: [AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.ResourceTypes.GetResourcesByType",
            boundArguments: {
                resourceTypes: {
                    attribute: "resourceTypes"
                },
                type: {
                    attribute: "type"
                },
                $cloudName: {
                    attribute: "$cloudName"
                },
                subscription: {
                    attribute: "subscription"
                }
            }
        }
    };
    return AzureResourceConfig;
});

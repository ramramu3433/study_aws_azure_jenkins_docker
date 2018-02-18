/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Actions/AzureActions", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureActions, AzureConstants, AzureResources) {
    "use strict";
    var AzureResourceGroupConfig = (function () {
        function AzureResourceGroupConfig() {
        }
        return AzureResourceGroupConfig;
    }());
    AzureResourceGroupConfig.Config = {
        aliases: ["Azure.ResourceGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ResourceGroupIcon,
        themeSrc: AzureConstants.imageThemeSrc.ResourceGroupIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        attributes: [{
                name: "type",
                value: "AzureResourceGroup"
            }],
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
                    resource: { resourceId: "Properties.Resources.Subscription", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "subscriptionName"
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
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.Resources.OpenInPortal", namespace: AzureResources.commonNamespace }
                },
                visible: {
                    value: true
                },
                icon: AzureConstants.imagePaths.OpenInPortalIcon,
                themeSrc: AzureConstants.imageThemeSrc.OpenInPortalIcon,
                namespace: AzureActions.openResourceGroupInPortalNamespace,
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
        childrenQuery: {
            namespace: "Azure.Producers.Resources.GetFromResourceGroup",
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
                // TODO figure out why a childrenQuery would need highlightLocations ... that doesn't make sense.
                highlightLocations: {
                    attribute: "highlightLocations"
                }
            }
        }
    };
    return AzureResourceGroupConfig;
});

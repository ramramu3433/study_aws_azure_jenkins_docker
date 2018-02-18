/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureGatewayAttributeLoader", "Providers/Azure/Loaders/AzureWebsiteAttributeLoader"], function (require, exports, AzureConstants, AzureResources, AzureGatewayAttributeLoader, AzureWebsiteAttributeLoader) {
    "use strict";
    var AzureGatewayConfig = (function () {
        function AzureGatewayConfig() {
        }
        return AzureGatewayConfig;
    }());
    AzureGatewayConfig.Config = {
        aliases: [AzureConstants.resourceTypes.Gateways],
        parentType: AzureConstants.resourceTypes.GatewayResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.GatewaysIcon,
        themeSrc: AzureConstants.imageThemeSrc.GatewaysIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Gateways.Url", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "url"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Gateways.Status", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "status"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Gateways.AutoUpdatePolicy", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "autoUpdatePolicy"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureWebsiteAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "siteId"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2014-06-01"
                    }
                },
                provides: ["url", "status"]
            },
            {
                namespace: AzureGatewayAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-03-01-preview"
                    }
                },
                provides: ["autoUpdatePolicy", "siteId"]
            }
        ]
    };
    return AzureGatewayConfig;
});

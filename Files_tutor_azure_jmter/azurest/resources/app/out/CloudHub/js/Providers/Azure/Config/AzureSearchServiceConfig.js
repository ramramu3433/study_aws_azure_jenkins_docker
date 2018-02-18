/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureSearchServiceAttributeLoader"], function (require, exports, AzureConstants, AzureResources, AzureSearchAttributeLoader) {
    "use strict";
    var AzureSearchServiceConfig = (function () {
        function AzureSearchServiceConfig() {
        }
        return AzureSearchServiceConfig;
    }());
    AzureSearchServiceConfig.Config = {
        aliases: [AzureConstants.resourceTypes.SearchServices],
        parentType: AzureConstants.resourceTypes.SearchServicesResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.SearchServicesIcon,
        themeSrc: AzureConstants.imageThemeSrc.SearchServicesIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.SearchServices.Url", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "url"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.SearchServices.PricingTier", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "pricingTier"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.SearchServices.Status", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "status"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.SearchServices.PrimaryKey", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "primaryKey"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.SearchServices.SecondaryKey", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "secondaryKey"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureSearchAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-02-28"
                    }
                },
                provides: ["url", "pricingTier", "status"]
            },
            {
                namespace: AzureSearchAttributeLoader.getKeysAttributes,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-02-28"
                    }
                },
                provides: ["primaryKey", "secondaryKey"]
            }
        ]
    };
    return AzureSearchServiceConfig;
});

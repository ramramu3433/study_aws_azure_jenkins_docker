/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureSubscriptionAttributeLoader"], function (require, exports, AzureConstants, AzureResources, AzureSubscriptionAttributeLoader) {
    "use strict";
    var AzureSubscriptionConfig = (function () {
        function AzureSubscriptionConfig() {
        }
        return AzureSubscriptionConfig;
    }());
    AzureSubscriptionConfig.Subscription = {
        aliases: ["Azure.Subscription"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.SubscriptionIcon,
        themeSrc: AzureConstants.imageThemeSrc.SubscriptionIcon,
        supported: true,
        status: {
            attribute: "email"
        },
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Subscription.Email", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "email"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Subscription.Environment", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "endpoint"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureSubscriptionAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    subscription: {
                        attribute: "subscription"
                    }
                },
                provides: ["email", "endpoint"]
            }
        ]
    };
    AzureSubscriptionConfig.SubscriptionWithResourceTypes = {
        aliases: ["Azure.SubscriptionWithResourceTypes"],
        inherits: ["Azure.Subscription"],
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.ResourceTypes.GetAll",
            boundArguments: {
                subscription: {
                    attribute: "subscription"
                }
            }
        }
    };
    AzureSubscriptionConfig.SubscriptionWithResourceGroups = {
        aliases: ["Azure.SubscriptionWithResourceGroups"],
        inherits: ["Azure.Subscription"],
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.ResourceGroups.GetAll",
            boundArguments: {
                subscription: {
                    attribute: "subscription"
                }
            }
        }
    };
    AzureSubscriptionConfig.SubscriptionWithResourceTypesStorageExplorer = {
        aliases: ["Azure.StorageExplorerSubscriptionWithResourceTypes"],
        inherits: ["Azure.Subscription"],
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.ResourceTypes.GetAll",
            boundArguments: {
                supportedResourceTypes: {
                    value: [AzureConstants.resourceTypes.StorageAccountsClassic,
                        AzureConstants.resourceTypes.StorageAccountsV2,
                        AzureConstants.resourceTypes.DocumentDBAccounts]
                },
                subscription: {
                    attribute: "subscription"
                },
                // pre-expand the resource types
                preExpand: {
                    value: true
                }
            },
            canRunWithoutSubscription: true
        }
    };
    AzureSubscriptionConfig.ExternalSubscription = {
        aliases: ["Azure.ExternalSubscription"],
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        displayName: { attribute: "name" },
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.ResourceTypes.GetAllExternal",
            boundArguments: {},
            canRunWithoutSubscription: true
        }
    };
    AzureSubscriptionConfig.QuickAccess = {
        aliases: ["Azure.QuickAccess"],
        icon: AzureConstants.imagePaths.QuickAccessIcon,
        themeSrc: AzureConstants.imageThemeSrc.QuickAccessIcon,
        displayName: { attribute: "name" },
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.ResourceTypes.GetQuickAccess",
            boundArguments: {},
            canRunWithoutSubscription: true,
            preLoad: true
        }
    };
    AzureSubscriptionConfig.RecentlyUsed = {
        aliases: ["Azure.RecentlyUsed"],
        icon: AzureConstants.imagePaths.QuickAccessIcon,
        themeSrc: AzureConstants.imageThemeSrc.QuickAccessIcon,
        displayName: { attribute: "name" },
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.ResourceTypes.GetRecentlyUsed",
            boundArguments: {},
            canRunWithoutSubscription: true,
            preLoad: true
        }
    };
    return AzureSubscriptionConfig;
});

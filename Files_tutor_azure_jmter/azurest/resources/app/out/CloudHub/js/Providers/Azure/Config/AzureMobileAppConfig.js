/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Loaders/AzurePermissionsAttributeLoader", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureWebsiteAttributeLoader", "Providers/Azure/Config/AzureWebsiteConfig"], function (require, exports, AzureConstants, AzurePermissionsAttributeLoader, AzureResources, AzureWebsiteAttributeLoader, AzureWebsiteConfig) {
    "use strict";
    // This config is older version Mobile App (kind = mobileAppCode)
    var AzureMobileAppConfig = (function () {
        function AzureMobileAppConfig() {
        }
        return AzureMobileAppConfig;
    }());
    AzureMobileAppConfig.Config = {
        aliases: [AzureConstants.resourceTypes.WebSites],
        parentType: AzureConstants.resourceTypes.WebSitesResourceType,
        kind: AzureConstants.resourceKinds.MobileAppCode,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.MobileAppsIcon,
        themeSrc: AzureConstants.imageThemeSrc.MobileAppsIcon,
        supported: true,
        deepSearchSupported: { synchronousAttribute: "deepSearch" },
        loaders: [
            {
                namespace: AzureWebsiteAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-08-01"
                    }
                },
                provides: ["status", "url", "webAppSku", "kind"]
            },
            {
                namespace: AzureWebsiteAttributeLoader.getConfigAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-08-01"
                    }
                },
                provides: ["apiDefinition"]
            },
            {
                namespace: AzureWebsiteAttributeLoader.getStateNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    websiteName: {
                        attribute: "name"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                provides: ["isProfiling"]
            },
            {
                namespace: AzurePermissionsAttributeLoader.getPermissionsAttributeNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    requestedActions: {
                        value: ["Microsoft.Web/sites/*"]
                    },
                    attributeName: {
                        value: "canAttachDebugger"
                    }
                },
                provides: ["canAttachDebugger"]
            },
            {
                namespace: AzureWebsiteAttributeLoader.getPublishCredentialNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-08-01"
                    }
                },
                provides: ["scmUrl"]
            },
            {
                namespace: AzureWebsiteAttributeLoader.getAzureStackRemoteDebuggerProfilerNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                provides: ["canAttachRemoteDebuggerInAzureStack", "canAttachRemoteProfilerInAzureStack"]
            }
        ],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.Url", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "url"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.Status", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "status"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.ApiDefinition", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "apiDefinition"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.Sku", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "webAppSku"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.Kind", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "kind"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.isProfiling", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "isProfiling"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.DeepSearch", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "deepSearch"
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Website.GetGroupNodes",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                name: {
                    attribute: "name"
                },
                url: {
                    attribute: "url"
                },
                resourceGroup: {
                    attribute: "resourceGroup"
                },
                subscription: {
                    attribute: "subscription"
                },
                supportsSlots: {
                    value: true
                },
                supportsWebJobs: {
                    value: true
                }
            }
        },
        actions: AzureWebsiteConfig.getCommonActions("id", "name")
    };
    return AzureMobileAppConfig;
});

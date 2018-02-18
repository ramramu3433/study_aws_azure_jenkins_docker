/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Loaders/AzurePermissionsAttributeLoader", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureWebsiteAttributeLoader", "Providers/Azure/Config/AzureWebsiteConfig"], function (require, exports, AzureConstants, AzurePermissionsAttributeLoader, AzureResources, AzureWebsiteAttributeLoader, AzureWebsiteConfig) {
    "use strict";
    var AzureApiAppConfig = (function () {
        function AzureApiAppConfig() {
        }
        return AzureApiAppConfig;
    }());
    AzureApiAppConfig.Config = {
        aliases: [AzureConstants.resourceTypes.WebSites],
        parentType: AzureConstants.resourceTypes.WebSitesResourceType,
        kind: AzureConstants.resourceKinds.ApiApp,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ApiAppsIcon,
        themeSrc: AzureConstants.imageThemeSrc.ApiAppsIcon,
        supported: true,
        deepSearchSupported: { synchronousAttribute: "deepSearch" },
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
                provides: ["url", "status", "webAppSku", "kind"]
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
                    attributeName: {
                        value: "canAttachDebugger"
                    },
                    requestedActions: {
                        value: ["Microsoft.Web/sites/*"]
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
        actions: AzureWebsiteConfig.getCommonActions("id", "name"),
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
        }
    };
    return AzureApiAppConfig;
});

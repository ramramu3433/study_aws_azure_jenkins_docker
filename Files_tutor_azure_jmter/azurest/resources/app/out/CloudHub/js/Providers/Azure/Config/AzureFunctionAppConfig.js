/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Loaders/AzurePermissionsAttributeLoader", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureWebsiteAttributeLoader", "Providers/Azure/Config/AzureWebsiteConfig"], function (require, exports, AzureConstants, AzurePermissionsAttributeLoader, AzureResources, AzureWebsiteAttributeLoader, AzureWebsiteConfig) {
    "use strict";
    var AzureFunctionAppConfig = (function () {
        function AzureFunctionAppConfig() {
        }
        return AzureFunctionAppConfig;
    }());
    AzureFunctionAppConfig.Config = {
        aliases: [AzureConstants.resourceTypes.WebSites],
        parentType: AzureConstants.resourceTypes.WebSitesResourceType,
        kind: AzureConstants.resourceKinds.FunctionApp,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.FunctionAppIcon,
        themeSrc: AzureConstants.imageThemeSrc.FunctionsAppIcon,
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
                    value: false
                }
            }
        }
    };
    return AzureFunctionAppConfig;
});

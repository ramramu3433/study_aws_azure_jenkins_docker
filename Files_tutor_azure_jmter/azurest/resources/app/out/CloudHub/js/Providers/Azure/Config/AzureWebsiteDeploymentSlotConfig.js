/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureGeneralActions", "Providers/Azure/Loaders/AzurePermissionsAttributeLoader", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureWebsiteAttributeLoader", "Providers/CloudExplorer/Actions/CloudExplorerActions"], function (require, exports, AzureConstants, AzureGeneralActions, AzurePermissionsAttributeLoader, AzureResources, AzureWebsiteAttributeLoader, CloudExplorerActions) {
    "use strict";
    var AzureWebsiteDeploymentSlotConfig = (function () {
        function AzureWebsiteDeploymentSlotConfig() {
        }
        return AzureWebsiteDeploymentSlotConfig;
    }());
    AzureWebsiteDeploymentSlotConfig.getActions = function (idAttributeName, nameAttributeName) {
        var actions = [
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.OpenInBrowser", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.OpenWebsiteIcon,
                themeSrc: AzureConstants.imageThemeSrc.OpenWebsiteIcon,
                namespace: CloudExplorerActions.openUrlNamespace,
                boundArguments: {
                    url: {
                        attribute: "url"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.OpenInKudu", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.KuduIcon,
                themeSrc: AzureConstants.imageThemeSrc.KuduIcon,
                namespace: CloudExplorerActions.openUrlNamespace,
                boundArguments: {
                    url: {
                        attribute: "scmUrl"
                    }
                },
                visible: {
                    expression: {
                        requires: ["scmUrl"],
                        expression: "String(scmUrl).indexOf('https://') == 0" // startsWith not supported in IE. Don't use it.
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.AttachDebugger", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartDebuggingIcon,
                namespace: "Azure.Actions.Website.attachDebugger",
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    websiteName: {
                        attribute: nameAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    canAttachDebugger: {
                        attribute: "canAttachDebugger"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["canAttachDebugger", "status", "canAttachRemoteDebuggerInAzureStack"],
                        expression: "!!canAttachDebugger && status && status.toLowerCase() === 'running' && canAttachRemoteDebuggerInAzureStack"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["canAttachDebugger", "status", "canAttachRemoteDebuggerInAzureStack"],
                        expression: "!!canAttachDebugger && status && status.toLowerCase() === 'running' && canAttachRemoteDebuggerInAzureStack"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.AttachSnapshotDebugger", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartDebuggingIcon,
                namespace: "Azure.Actions.Website.attachSnapshotDebugger",
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    websiteName: {
                        attribute: nameAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["canAttachDebugger", "status", "canAttachSnapshotDebugger"],
                        expression: "!!canAttachDebugger && status && status.toLowerCase() === 'running' && canAttachSnapshotDebugger"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["canAttachDebugger", "status", "canAttachSnapshotDebugger"],
                        expression: "!!canAttachDebugger && status && status.toLowerCase() === 'running' && canAttachSnapshotDebugger"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.StartProfiling", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartProfilerIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartProfilerIcon,
                namespace: "Azure.Actions.Website.startProfiler",
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    websiteName: {
                        attribute: nameAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-02-01"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status", "webAppSku", "kind", "isProfiling"],
                        expression: "String(status).toLowerCase() === 'running' && (String(webAppSku).toLowerCase() === 'basic' || String(webAppSku).toLowerCase() === 'standard' || String(webAppSku).toLowerCase() === 'premium') && String(kind).toLowerCase() !== 'functionapp' && !isProfiling"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["status", "webAppSku", "kind", "isProfiling"],
                        expression: "String(status).toLowerCase() === 'running' && (String(webAppSku).toLowerCase() === 'basic' || String(webAppSku).toLowerCase() === 'standard' || String(webAppSku).toLowerCase() === 'premium') && String(kind).toLowerCase() !== 'functionapp' && !isProfiling"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.StopProfiling", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StopProfilerIcon,
                themeSrc: AzureConstants.imageThemeSrc.StopProfilerIcon,
                namespace: "Azure.Actions.Website.stopProfiler",
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    websiteName: {
                        attribute: nameAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-02-01"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status", "webAppSku", "kind", "isProfiling"],
                        expression: "String(status).toLowerCase() == 'running' && (String(webAppSku).toLowerCase() !== 'basic' || String(webAppSku).toLowerCase() !== 'standard' || String(webAppSku).toLowerCase() !== 'premium') && String(kind).toLowerCase() !== 'functionapp' && isProfiling"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["webAppSku", "kind", "isProfiling"],
                        expression: "(String(webAppSku).toLowerCase() !== 'basic' || String(webAppSku).toLowerCase() !== 'standard' || String(webAppSku).toLowerCase() !== 'premium') && String(kind).toLowerCase() !== 'functionapp' && isProfiling"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.ViewStreamingLogs", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartStreamingLogsIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartStreamingLogsIcon,
                namespace: "Azure.Actions.Website.startStreamingLogs",
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    websiteName: {
                        attribute: nameAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status"],
                        expression: "status && status.toLowerCase() === 'running'"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["status"],
                        expression: "status && status.toLowerCase() === 'running'"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.Start", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartIcon,
                namespace: AzureGeneralActions.postActionNamespace,
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-02-01"
                    },
                    resourceAction: {
                        value: "start"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status"],
                        expression: "status && status.toLowerCase() !== 'running'"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["status"],
                        expression: "status && status.toLowerCase() === 'stopped'"
                    },
                    value: true
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.Stop", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StopIcon,
                themeSrc: AzureConstants.imageThemeSrc.StopIcon,
                namespace: AzureGeneralActions.postActionNamespace,
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-02-01"
                    },
                    resourceAction: {
                        value: "stop"
                    }
                },
                visible: {
                    expression: {
                        requires: ["status"],
                        expression: "status && status.toLowerCase() === 'running'"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.DownloadPublishProfile", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DownloadIcon,
                themeSrc: AzureConstants.imageThemeSrc.DownloadIcon,
                namespace: "Azure.Actions.Website.downloadPublishSettings",
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    websiteName: {
                        attribute: nameAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    openFolder: {
                        value: true
                    },
                    apiVersion: {
                        value: "2015-02-01"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.SwapSlot", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.WebsiteSlotSwapIcon,
                themeSrc: AzureConstants.imageThemeSrc.WebsiteSlotSwapIcon,
                namespace: "Azure.Actions.Website.swapSlot",
                boundArguments: {
                    id: {
                        attribute: idAttributeName
                    },
                    websiteName: {
                        attribute: nameAttributeName
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-08-01"
                    },
                    resourceAction: {
                        value: "slotsswap"
                    }
                }
            }
        ];
        return actions;
    };
    AzureWebsiteDeploymentSlotConfig.Config = {
        aliases: [AzureConstants.resourceTypes.WebSitesSlots],
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { value: "Deployment Slots" },
        icon: AzureConstants.imagePaths.WebsiteIcon,
        themeSrc: AzureConstants.imageThemeSrc.WebsiteIcon,
        supported: true,
        hideTypeNode: true,
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
                namespace: AzureWebsiteAttributeLoader.getAttachSnapshotDebuggerNamespace,
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
                provides: ["canAttachSnapshotDebugger"]
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
                resourceGroup: {
                    attribute: "resourceGroup"
                },
                subscription: {
                    attribute: "subscription"
                },
                supportsWebJobs: {
                    value: true
                }
            }
        },
        actions: AzureWebsiteDeploymentSlotConfig.getActions("id", "name")
    };
    return AzureWebsiteDeploymentSlotConfig;
});

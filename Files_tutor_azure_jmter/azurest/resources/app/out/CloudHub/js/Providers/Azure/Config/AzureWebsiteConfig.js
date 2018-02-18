/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureGeneralActions", "Providers/Azure/Loaders/AzurePermissionsAttributeLoader", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureWebsiteAttributeLoader", "Providers/CloudExplorer/Actions/CloudExplorerActions"], function (require, exports, AzureConstants, AzureGeneralActions, AzurePermissionsAttributeLoader, AzureResources, AzureWebsiteAttributeLoader, CloudExplorerActions) {
    "use strict";
    var AzureWebsiteConfig = (function () {
        function AzureWebsiteConfig() {
        }
        return AzureWebsiteConfig;
    }());
    AzureWebsiteConfig.getCommonActions = function (idAttributeName, nameAttributeName) {
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
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status", "webAppSku", "kind", "isProfiling", "canAttachRemoteProfilerInAzureStack"],
                        expression: "String(status).toLowerCase() === 'running' && (String(webAppSku).toLowerCase() === 'basic' || String(webAppSku).toLowerCase() === 'standard' || String(webAppSku).toLowerCase() === 'premium') && String(kind).toLowerCase() !== 'functionapp' && !isProfiling && canAttachRemoteProfilerInAzureStack"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["status", "webAppSku", "kind", "isProfiling", "canAttachRemoteProfilerInAzureStack"],
                        expression: "String(status).toLowerCase() === 'running' && (String(webAppSku).toLowerCase() === 'basic' || String(webAppSku).toLowerCase() === 'standard' || String(webAppSku).toLowerCase() === 'premium') && String(kind).toLowerCase() !== 'functionapp' && !isProfiling && canAttachRemoteProfilerInAzureStack"
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
                    }
                },
                enabled: {
                    expression: {
                        requires: ["status", "webAppSku", "kind", "isProfiling", "canAttachRemoteProfilerInAzureStack"],
                        expression: "String(status).toLowerCase() == 'running' && (String(webAppSku).toLowerCase() !== 'basic' || String(webAppSku).toLowerCase() !== 'standard' || String(webAppSku).toLowerCase() !== 'premium') && String(kind).toLowerCase() !== 'functionapp' && isProfiling && canAttachRemoteProfilerInAzureStack"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["webAppSku", "kind", "isProfiling", "canAttachRemoteProfilerInAzureStack"],
                        expression: "(String(webAppSku).toLowerCase() !== 'basic' || String(webAppSku).toLowerCase() !== 'standard' || String(webAppSku).toLowerCase() !== 'premium') && String(kind).toLowerCase() !== 'functionapp' && isProfiling && canAttachRemoteProfilerInAzureStack"
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
            }
        ];
        return actions;
    };
    // website node
    AzureWebsiteConfig.Config = {
        aliases: [AzureConstants.resourceTypes.WebSites],
        parentType: AzureConstants.resourceTypes.WebSitesResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.WebsiteIcon,
        themeSrc: AzureConstants.imageThemeSrc.WebsiteIcon,
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
                    resource: { resourceId: "Properties.Website.ScmUrl", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "scmUrl"
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
    // Files directory node
    AzureWebsiteConfig.DirectoryConfig = {
        aliases: ["Azure.Website.Directory"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.GenericFolderIcon,
        themeSrc: AzureConstants.imageThemeSrc.GenericFolderIcon,
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
                    resource: { resourceId: "Properties.Website.ScmUrl", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "scmUrl"
                }
            }
        ],
        loaders: [
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
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.DownloadFilesAsZip", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DownloadIcon,
                themeSrc: AzureConstants.imageThemeSrc.DownloadIcon,
                namespace: "Azure.Actions.Website.downloadFilesAsZip",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    scmUrl: {
                        attribute: "scmUrl"
                    },
                    sitePath: {
                        value: "site/wwwroot/"
                    },
                    openFolder: {
                        value: "true"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    relativeUrl: {
                        attribute: "relativeUrl"
                    }
                },
                visible: {
                    expression: {
                        requires: ["scmUrl", "relativeUrl"],
                        expression: "scmUrl && relativeUrl.length === 0"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.UploadFile", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.UploadIcon,
                themeSrc: AzureConstants.imageThemeSrc.UploadIcon,
                namespace: "Azure.Actions.Website.uploadFile",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    scmUrl: {
                        attribute: "scmUrl"
                    },
                    sitePath: {
                        value: "site/wwwroot/"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    relativeUrl: {
                        attribute: "relativeUrl"
                    }
                },
                visible: {
                    expression: {
                        requires: ["scmUrl"],
                        expression: "scmUrl"
                    },
                    value: false
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Website.GetFileSystemObjects",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                websiteName: {
                    attribute: "websiteName"
                },
                websiteUrl: {
                    attribute: "websiteUrl"
                },
                relativeUrl: {
                    attribute: "relativeUrl"
                },
                resourceGroup: {
                    attribute: "resourceGroup"
                },
                subscription: {
                    attribute: "subscription"
                },
                directoryResourceType: {
                    value: "Azure.Website.Directory"
                },
                fileResourceType: {
                    value: "Azure.Website.File"
                },
                root: {
                    value: "Files"
                },
                scmUrl: {
                    attribute: "scmUrl"
                }
            },
            preLoad: false
        }
    };
    // File node under Files
    AzureWebsiteConfig.FileConfig = {
        aliases: ["Azure.Website.File"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.GenericFileIcon,
        themeSrc: AzureConstants.imageThemeSrc.GenericFileIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.Open", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.OpenIcon,
                isDefault: true,
                themeSrc: AzureConstants.imageThemeSrc.OpenIcon,
                namespace: "Azure.Actions.Website.openFile",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    relativeUrl: {
                        attribute: "relativeUrl"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    root: {
                        value: "Files"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.DeleteFile", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DeleteIcon,
                themeSrc: AzureConstants.imageThemeSrc.DeleteIcon,
                namespace: "Azure.Actions.Website.deleteFile",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    relativeUrl: {
                        attribute: "relativeUrl"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    root: {
                        value: "Files"
                    }
                },
                visible: {
                    expression: {
                        requires: ["isDeleteFileEnabled"],
                        expression: "isDeleteFileEnabled"
                    },
                    value: false
                }
            },
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
                },
                visible: {
                    expression: {
                        requires: ["relativeUrl"],
                        expression: "relativeUrl && (/.+\\.(as[m|p]x?|x?html?|svc|php)$/i).test(relativeUrl)"
                    },
                    value: true
                }
            }
        ],
        loaders: [
            {
                namespace: AzureWebsiteAttributeLoader.getIsDeleteFileEnabledNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    }
                },
                provides: ["isDeleteFileEnabled"]
            }
        ],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.LastModified", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "lastModified"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.Size", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "size"
                }
            }
        ]
    };
    // Log Files directory node
    AzureWebsiteConfig.LogDirectoryConfig = {
        aliases: ["Azure.Website.LogDirectory"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.GenericFolderIcon,
        themeSrc: AzureConstants.imageThemeSrc.GenericFolderIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Website.GetFileSystemObjects",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                websiteName: {
                    attribute: "websiteName"
                },
                websiteUrl: {
                    attribute: "websiteUrl"
                },
                relativeUrl: {
                    attribute: "relativeUrl"
                },
                resourceGroup: {
                    attribute: "resourceGroup"
                },
                subscription: {
                    attribute: "subscription"
                },
                directoryResourceType: {
                    value: "Azure.Website.LogDirectory"
                },
                fileResourceType: {
                    value: "Azure.Website.LogFile"
                },
                root: {
                    value: "LogFiles"
                }
            },
            preLoad: false
        }
    };
    // File node under Log Files
    AzureWebsiteConfig.LogFileConfig = {
        aliases: ["Azure.Website.LogFile"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.GenericFileIcon,
        themeSrc: AzureConstants.imageThemeSrc.GenericFileIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.Open", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.OpenIcon,
                isDefault: true,
                themeSrc: AzureConstants.imageThemeSrc.OpenIcon,
                namespace: "Azure.Actions.Website.openFile",
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    websiteName: {
                        attribute: "websiteName"
                    },
                    relativeUrl: {
                        attribute: "relativeUrl"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    readOnly: {
                        value: true
                    },
                    root: {
                        value: "LogFiles"
                    }
                }
            }
        ],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.Website.LastModified", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "lastModified"
                }
            }
        ]
    };
    AzureWebsiteConfig.SlotsGroupConfig = {
        aliases: ["Azure.Website.SlotsGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DeploymentSlotsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DeploymentSlotsIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Website.GetSlots",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                subscription: {
                    attribute: "subscription"
                }
            },
            preLoad: false
        }
    };
    AzureWebsiteConfig.WebJobsGroupConfig = {
        aliases: ["Azure.Website.WebJobsGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.WebjobIcon,
        themeSrc: AzureConstants.imageThemeSrc.WebjobIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Website.GetWebJobs",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                websiteName: {
                    attribute: "websiteName"
                },
                resourceGroup: {
                    attribute: "resourceGroup"
                },
                subscription: {
                    attribute: "subscription"
                }
            },
            preLoad: false
        }
    };
    AzureWebsiteConfig.WebJobsGroupContinuousConfig = {
        aliases: ["Azure.Website.WebJobsGroup.Continuous"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.GenericFolderIcon,
        themeSrc: AzureConstants.imageThemeSrc.GenericFolderIcon,
        supported: true
    };
    AzureWebsiteConfig.WebJobsGroupTriggeredConfig = {
        aliases: ["Azure.Website.WebJobsGroup.Triggered"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.GenericFolderIcon,
        themeSrc: AzureConstants.imageThemeSrc.GenericFolderIcon,
        supported: true
    };
    return AzureWebsiteConfig;
});

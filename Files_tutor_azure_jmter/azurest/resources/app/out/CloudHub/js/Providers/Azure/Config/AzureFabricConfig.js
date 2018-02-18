/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureFabricAttributeLoader", "Providers/Azure/Actions/AzureFabricActions"], function (require, exports, AzureConstants, AzureResources, AzureFabricAttributeLoader, AzureFabricActions) {
    "use strict";
    var AzureFabricConfig = (function () {
        function AzureFabricConfig() {
        }
        return AzureFabricConfig;
    }());
    AzureFabricConfig.Base = {
        aliases: [AzureConstants.baseTypes.Fabric],
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        displayName: { attribute: "name" },
        supported: true,
        actions: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.ViewStreamingTraces",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.ViewLogIcon,
                themeSrc: AzureConstants.imageThemeSrc.ViewLogIcon,
                namespace: AzureFabricActions.createEtwListenerWindow,
                boundArguments: {
                    diagnosticsFilter: {
                        attribute: "diagnosticsFilter"
                    },
                    clusterName: {
                        attribute: "clusterName"
                    },
                    nodeName: {
                        attribute: "name"
                    }
                },
                // Temporarily hiding action on remote clusters until feature is ready
                visible: {
                    expression: {
                        requires: ["isLocal"],
                        expression: "isLocal"
                    },
                    value: false
                }
            }
        ]
    };
    AzureFabricConfig.Root = {
        aliases: [AzureConstants.resourceTypes.ServiceFabricClusters],
        parentType: AzureConstants.resourceTypes.ServiceFabricClustersResourceType,
        inherits: [AzureConstants.baseTypes.Resource, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        status: {
            attribute: "statusLabel"
        },
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.ManagementEndpoint",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "managementEndpoint"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.HealthState",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "healthState"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.HealthySeedNodes",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "healthySeedNodes"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.UpgradeDomains",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "upgradeDomains"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.FaultDomains",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "faultDomains"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureFabricAttributeLoader.getRemoteClusterAttributes,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2016-03-01"
                    },
                    name: {
                        attribute: "name"
                    },
                    isInitialized: {
                        attribute: "isInitialized"
                    }
                },
                provides: ["statusLabel",
                    "apiServiceId",
                    "managementEndpoint",
                    "healthState",
                    "healthySeedNodes",
                    "upgradeDomains",
                    "faultDomains",
                    "isClusterDown",
                    "clusterId"
                ]
            },
            {
                namespace: AzureFabricAttributeLoader.getFeatureSwitchAttribute,
                boundArguments: {
                    featureName: {
                        value: "Etw"
                    }
                },
                provides: ["isEtwFeatureOn"]
            },
            {
                namespace: AzureFabricAttributeLoader.getFeatureSwitchAttribute,
                boundArguments: {
                    featureName: {
                        value: "Debugger"
                    }
                },
                provides: ["isDebuggerFeatureOn"]
            },
            {
                namespace: AzureFabricAttributeLoader.getVMsAttribute,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    resourceGroup: {
                        attribute: "resourceGroup"
                    },
                    clusterId: {
                        attribute: "clusterId"
                    },
                    apiVersion: {
                        value: "2015-05-01-preview"
                    },
                    isEtwFeatureOn: {
                        attribute: "isEtwFeatureOn"
                    },
                    isDebuggerFeatureOn: {
                        attribute: "isDebuggerFeatureOn"
                    }
                },
                provides: ["vms"]
            },
            {
                namespace: AzureFabricAttributeLoader.getVMScaleSetsAttribute,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    resourceGroup: {
                        attribute: "resourceGroup"
                    },
                    clusterId: {
                        attribute: "clusterId"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    isEtwFeatureOn: {
                        attribute: "isEtwFeatureOn"
                    },
                    isDebuggerFeatureOn: {
                        attribute: "isDebuggerFeatureOn"
                    }
                },
                provides: ["scaleSets"]
            },
            {
                namespace: AzureFabricAttributeLoader.getEtwExtensionStateAttribute,
                boundArguments: {
                    vms: {
                        attribute: "vms"
                    },
                    scaleSets: {
                        attribute: "scaleSets"
                    }
                },
                provides: ["isEtwDisabledOnAnyVM", "isEtwEnabledOnAnyVM"]
            },
            {
                namespace: AzureFabricAttributeLoader.getDebuggerVMExtensionStateAttribute,
                boundArguments: {
                    scaleSets: {
                        attribute: "scaleSets"
                    }
                },
                provides: ["isDebuggerDisabledOnAnyVM", "isDebuggerEnabledOnAnyVM"]
            },
            {
                namespace: AzureFabricAttributeLoader.getIsRemoteActionInProgressAttribute,
                boundArguments: {
                    id: {
                        attribute: "id"
                    }
                },
                provides: ["isRemoteActionInProgress"]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.EnableDebugging",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.EnableDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableDebuggingIcon,
                namespace: AzureFabricActions.enableDebuggingNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "name"
                    },
                    id: {
                        attribute: "id"
                    },
                    scaleSets: {
                        attribute: "scaleSets"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    resourceGroup: {
                        attribute: "resourceGroup"
                    },
                    location: {
                        attribute: "location"
                    },
                    apiVersion: {
                        value: "2015-05-01-preview"
                    },
                    affectedAttributes: {
                        value: ["isRemoteActionInProgress"]
                    }
                },
                visible: {
                    expression: {
                        requires: ["isDebuggerFeatureOn", "isDebuggerDisabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isDebuggerFeatureOn && isDebuggerDisabledOnAnyVM && !isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.EnableDebuggingInProgress",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.EnableDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableDebuggingIcon,
                namespace: AzureFabricActions.enableDebuggingNamespace,
                enabled: {
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["isDebuggerFeatureOn", "isDebuggerDisabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isDebuggerFeatureOn && isDebuggerDisabledOnAnyVM && isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.DisableDebugging",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DisableDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.DisableDebuggingIcon,
                namespace: AzureFabricActions.disableDebuggingNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "name"
                    },
                    id: {
                        attribute: "id"
                    },
                    scaleSets: {
                        attribute: "scaleSets"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-05-01-preview"
                    },
                    affectedAttributes: {
                        value: ["isRemoteActionInProgress"]
                    }
                },
                visible: {
                    expression: {
                        requires: ["isDebuggerFeatureOn", "isDebuggerEnabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isDebuggerFeatureOn && isDebuggerEnabledOnAnyVM && !isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.DisableDebuggingInProgress",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DisableDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.DisableDebuggingIcon,
                namespace: AzureFabricActions.disableDebuggingNamespace,
                enabled: {
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["isDebuggerFeatureOn", "isDebuggerEnabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isDebuggerFeatureOn && isDebuggerEnabledOnAnyVM && isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.AttachDebugger",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.StartDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartDebuggingIcon,
                namespace: AzureFabricActions.attachDebuggerNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "name"
                    },
                    scaleSets: {
                        attribute: "scaleSets"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                visible: {
                    expression: {
                        requires: ["isDebuggerFeatureOn", "isDebuggerEnabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isDebuggerFeatureOn && isDebuggerEnabledOnAnyVM && !isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.AttachDebuggerInProgress",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.StartDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartDebuggingIcon,
                namespace: AzureFabricActions.attachDebuggerNamespace,
                enabled: {
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["isDebuggerFeatureOn", "isDebuggerEnabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isDebuggerFeatureOn && isDebuggerEnabledOnAnyVM && isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.OpenExplorer",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.ServiceFabricColorIcon,
                themeSrc: AzureConstants.imageThemeSrc.ServiceFabricColorIcon,
                namespace: AzureFabricActions.openExplorer,
                boundArguments: {
                    managementEndpoint: {
                        attribute: "managementEndpoint"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.EnableStreamingTraces",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.EnableLogIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableLogIcon,
                namespace: AzureFabricActions.enableEtwListenerNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "name"
                    },
                    id: {
                        attribute: "id"
                    },
                    vms: {
                        attribute: "vms"
                    },
                    scaleSets: {
                        attribute: "scaleSets"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    resourceGroup: {
                        attribute: "resourceGroup"
                    },
                    location: {
                        attribute: "location"
                    },
                    apiVersion: {
                        value: "2015-05-01-preview"
                    },
                    affectedAttributes: {
                        value: ["isRemoteActionInProgress"]
                    }
                },
                visible: {
                    expression: {
                        requires: ["isEtwFeatureOn", "isEtwDisabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isEtwFeatureOn && isEtwDisabledOnAnyVM && !isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.EnableStreamingTracesInProgress",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.EnableLogIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableLogIcon,
                namespace: AzureFabricActions.enableEtwListenerNamespace,
                enabled: {
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["isEtwFeatureOn", "isEtwDisabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isEtwFeatureOn && isEtwDisabledOnAnyVM && isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.DisableStreamingTraces",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DisableLogIcon,
                themeSrc: AzureConstants.imageThemeSrc.DisableLogIcon,
                namespace: AzureFabricActions.disableEtwListenerNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "name"
                    },
                    id: {
                        attribute: "id"
                    },
                    vms: {
                        attribute: "vms"
                    },
                    scaleSets: {
                        attribute: "scaleSets"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-05-01-preview"
                    },
                    affectedAttributes: {
                        value: ["isRemoteActionInProgress"]
                    }
                },
                visible: {
                    expression: {
                        requires: ["isEtwFeatureOn", "isEtwEnabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isEtwFeatureOn && isEtwEnabledOnAnyVM && !isRemoteActionInProgress"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.DisableStreamingTracesInProgress",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DisableLogIcon,
                themeSrc: AzureConstants.imageThemeSrc.DisableLogIcon,
                namespace: AzureFabricActions.disableEtwListenerNamespace,
                enabled: {
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["isEtwFeatureOn", "isEtwEnabledOnAnyVM", "isRemoteActionInProgress"],
                        expression: "isEtwFeatureOn && isEtwEnabledOnAnyVM && isRemoteActionInProgress"
                    },
                    value: false
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Fabric.GetGroupNodes",
            boundArguments: {
                clusterName: {
                    attribute: "name"
                },
                apiServiceId: {
                    attribute: "apiServiceId"
                },
                managementEndpoint: {
                    attribute: "managementEndpoint"
                },
                isClusterDown: {
                    attribute: "isClusterDown"
                },
                vms: {
                    attribute: "vms"
                },
                scaleSets: {
                    attribute: "scaleSets"
                },
                isEtwFeatureOn: {
                    attribute: "isEtwFeatureOn"
                },
                isDebuggerFeatureOn: {
                    attribute: "isDebuggerFeatureOn"
                },
                subscription: {
                    attribute: "subscription"
                },
                isLocal: {
                    value: false
                }
            },
            preLoad: false
        }
    };
    AzureFabricConfig.Local = {
        aliases: [AzureConstants.resourceTypes.ServiceFabricLocalClusters],
        parentType: AzureConstants.resourceTypes.ServiceFabricClustersResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        status: {
            attribute: "statusLabel"
        },
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.ManagementEndpoint",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "managementEndpoint"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.HealthState",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "healthState"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.HealthySeedNodes",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "healthySeedNodes"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.UpgradeDomains",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "upgradeDomains"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.FaultDomains",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "faultDomains"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureFabricAttributeLoader.getLocalClusterAttributes,
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    id: {
                        attribute: "id"
                    },
                    isInitialized: {
                        attribute: "isInitialized"
                    }
                },
                provides: ["statusLabel",
                    "apiServiceId",
                    "managementEndpoint",
                    "healthState",
                    "healthySeedNodes",
                    "upgradeDomains",
                    "faultDomains",
                    "isClusterDown"
                ]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.OpenExplorer",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.ServiceFabricColorIcon,
                themeSrc: AzureConstants.imageThemeSrc.ServiceFabricColorIcon,
                namespace: AzureFabricActions.openExplorer,
                boundArguments: {
                    managementEndpoint: {
                        attribute: "managementEndpoint"
                    }
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Fabric.GetGroupNodes",
            boundArguments: {
                apiServiceId: {
                    attribute: "apiServiceId"
                },
                clusterName: {
                    attribute: "name"
                },
                isClusterDown: {
                    attribute: "isClusterDown"
                },
                isLocal: {
                    value: true
                }
            },
            preLoad: false
        }
    };
    AzureFabricConfig.ApplicationGroup = {
        aliases: ["Azure.Fabric.ApplicationGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Fabric.GetApplicationTypes",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                apiServiceId: {
                    attribute: "apiServiceId"
                },
                clusterName: {
                    attribute: "clusterName"
                },
                scaleSets: {
                    attribute: "scaleSets"
                },
                isDebuggerFeatureOn: {
                    attribute: "isDebuggerFeatureOn"
                },
                subscription: {
                    attribute: "subscription"
                },
                isLocal: {
                    attribute: "isLocal"
                }
            },
            preLoad: false
        }
    };
    AzureFabricConfig.NodeGroup = {
        aliases: ["Azure.Fabric.NodeGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Fabric.GetNodes",
            boundArguments: {
                clusterName: {
                    attribute: "clusterName"
                },
                apiServiceId: {
                    attribute: "apiServiceId"
                },
                vms: {
                    attribute: "vms"
                },
                scaleSets: {
                    attribute: "scaleSets"
                },
                isEtwFeatureOn: {
                    attribute: "isEtwFeatureOn"
                },
                subscription: {
                    attribute: "subscription"
                },
                isLocal: {
                    attribute: "isLocal"
                }
            },
            preLoad: false
        }
    };
    AzureFabricConfig.Node = {
        aliases: ["Azure.Fabric.Node"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        status: {
            attribute: "statusLabel"
        },
        properties: [
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.Name",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.HealthState",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "healthState"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.Status",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "statusProperty"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.Type",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "type"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.UpgradeDomain",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "upgradeDomain"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.FaultDomain",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "faultDomain"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.IpAddressOrFQDN",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "ipAddressOrFQDN"
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Properties.ServiceFabric.IsSeedNode",
                        namespace: AzureResources.commonNamespace
                    }
                },
                binding: {
                    attribute: "isSeedNode"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureFabricAttributeLoader.getNodeAttributes,
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    }
                },
                provides: [
                    "statusProperty",
                    "statusLabel",
                    "healthState",
                    "type",
                    "upgradeDomain",
                    "faultDomain",
                    "ipAddressOrFQDN",
                    "isSeedNode"
                ]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.ServiceFabric.Activate", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartIcon,
                namespace: AzureFabricActions.activateNode,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["statusLabel"],
                        expression: "statusLabel !== ''"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.ServiceFabric.Deactivate", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StopIcon,
                themeSrc: AzureConstants.imageThemeSrc.StopIcon,
                namespace: AzureFabricActions.deactivateNode,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["statusLabel"],
                        expression: "statusLabel === ''"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.ViewStreamingTraces",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.ViewLogIcon,
                themeSrc: AzureConstants.imageThemeSrc.ViewLogIcon,
                namespace: AzureFabricActions.createEtwListenerWindow,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    nodeName: {
                        attribute: "name"
                    },
                    ipAddress: {
                        attribute: "ipAddress"
                    },
                    port: {
                        attribute: "port"
                    },
                    encryptionKey: {
                        attribute: "encryptionKey"
                    },
                    encryptionIV: {
                        attribute: "encryptionIV"
                    },
                    isEtwEnabled: {
                        attribute: "isEtwEnabled"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    isLocal: {
                        attribute: "isLocal"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["isEtwEnabled"],
                        expression: "isEtwEnabled === true"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["isEtwFeatureOn"],
                        expression: "isEtwFeatureOn === true"
                    },
                    value: false
                }
            }
        ]
    };
    AzureFabricConfig.ApplicationType = {
        aliases: ["Azure.Fabric.ApplicationType"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        status: {
            attribute: "version"
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.ServiceFabric.Unprovision", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DeleteApplicationIcon,
                themeSrc: AzureConstants.imageThemeSrc.DeleteApplicationIcon,
                namespace: AzureFabricActions.unprovisionApplicationType,
                boundArguments: {
                    parentId: {
                        attribute: "parentId"
                    },
                    name: {
                        attribute: "name"
                    },
                    version: {
                        attribute: "version"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    },
                    clusterName: {
                        attribute: "clusterName"
                    },
                    isLocal: {
                        attribute: "isLocal"
                    }
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Fabric.GetApplications",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                name: {
                    attribute: "name"
                },
                apiServiceId: {
                    attribute: "apiServiceId"
                },
                version: {
                    attribute: "version"
                },
                diagnosticsFilter: {
                    attribute: "diagnosticsFilter"
                },
                clusterName: {
                    attribute: "clusterName"
                },
                scaleSets: {
                    attribute: "scaleSets"
                },
                isDebuggerFeatureOn: {
                    attribute: "isDebuggerFeatureOn"
                },
                subscription: {
                    attribute: "subscription"
                },
                isLocal: {
                    attribute: "isLocal"
                }
            }
        }
    };
    AzureFabricConfig.Application = {
        aliases: ["Azure.Fabric.Application"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        status: {
            attribute: "statusLabel"
        },
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Name", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.HealthState", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "healthState"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Status", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "statusProperty"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.ApplicationType", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "applicationType"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Version", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "version"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureFabricAttributeLoader.getApplicationAttributes,
                boundArguments: {
                    applicationId: {
                        attribute: "applicationId"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    }
                },
                provides: [
                    "statusProperty",
                    "statusLabel",
                    "healthState",
                    "applicationType",
                    "version"
                ]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.ServiceFabric.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DeleteApplicationIcon,
                themeSrc: AzureConstants.imageThemeSrc.DeleteApplicationIcon,
                namespace: AzureFabricActions.deleteApplication,
                boundArguments: {
                    parentId: {
                        attribute: "parentId"
                    },
                    name: {
                        attribute: "name"
                    },
                    applicationId: {
                        attribute: "applicationId"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    },
                    clusterName: {
                        attribute: "clusterName"
                    },
                    isLocal: {
                        attribute: "isLocal"
                    }
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Fabric.GetServices",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                applicationId: {
                    attribute: "applicationId"
                },
                apiServiceId: {
                    attribute: "apiServiceId"
                },
                applicationTypeName: {
                    attribute: "applicationTypeName"
                },
                applicationTypeVersion: {
                    attribute: "applicationTypeVersion"
                },
                diagnosticsFilter: {
                    attribute: "diagnosticsFilter"
                },
                clusterName: {
                    attribute: "clusterName"
                },
                scaleSets: {
                    attribute: "scaleSets"
                },
                isDebuggerFeatureOn: {
                    attribute: "isDebuggerFeatureOn"
                },
                subscription: {
                    attribute: "subscription"
                },
                isLocal: {
                    attribute: "isLocal"
                }
            }
        }
    };
    AzureFabricConfig.Service = {
        aliases: ["Azure.Fabric.Service"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        status: {
            attribute: "statusLabel"
        },
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Name", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.HealthState", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "healthState"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Status", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "statusProperty"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.ServiceKind", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "serviceKind"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.ServiceType", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "serviceType"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.ServiceTypeVersion", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "serviceTypeVersion"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.InstanceCount", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "instanceCount"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.MinReplicaSetSize", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "minReplicaSetSize"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.TargetReplicaSetSize", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "targetReplicaSetSize"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureFabricAttributeLoader.getServiceAttributes,
                boundArguments: {
                    applicationId: {
                        attribute: "applicationId"
                    },
                    serviceId: {
                        attribute: "serviceId"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    }
                },
                provides: [
                    "statusProperty",
                    "statusLabel",
                    "healthState",
                    "serviceKind",
                    "serviceType",
                    "serviceTypeVersion",
                    "instanceCount",
                    "minReplicaSetSize",
                    "targetReplicaSetSize"
                ]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.AttachDebugger",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.StartDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartDebuggingIcon,
                namespace: AzureFabricActions.attachDebuggerNamespace,
                boundArguments: {
                    clusterName: {
                        attribute: "clusterName"
                    },
                    scaleSets: {
                        attribute: "scaleSets"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    applicationId: {
                        attribute: "applicationId"
                    },
                    applicationTypeName: {
                        attribute: "applicationTypeName"
                    },
                    applicationTypeVersion: {
                        attribute: "applicationTypeVersion"
                    },
                    serviceTypeName: {
                        attribute: "serviceType"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    }
                },
                enabled: {
                    value: false
                },
                visible: {
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.ServiceFabric.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DeleteApplicationIcon,
                themeSrc: AzureConstants.imageThemeSrc.DeleteApplicationIcon,
                namespace: AzureFabricActions.deleteService,
                boundArguments: {
                    parentId: {
                        attribute: "parentId"
                    },
                    name: {
                        attribute: "name"
                    },
                    applicationId: {
                        attribute: "applicationId"
                    },
                    serviceId: {
                        attribute: "serviceId"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    },
                    clusterName: {
                        attribute: "clusterName"
                    },
                    isLocal: {
                        attribute: "isLocal"
                    }
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Fabric.GetPartitions",
            boundArguments: {
                applicationId: {
                    attribute: "applicationId"
                },
                serviceId: {
                    attribute: "serviceId"
                },
                apiServiceId: {
                    attribute: "apiServiceId"
                },
                diagnosticsFilter: {
                    attribute: "diagnosticsFilter"
                },
                clusterName: {
                    attribute: "clusterName"
                },
                subscription: {
                    attribute: "subscription"
                },
                isLocal: {
                    attribute: "isLocal"
                }
            }
        }
    };
    AzureFabricConfig.Partition = {
        aliases: ["Azure.Fabric.Partition"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        status: {
            attribute: "statusLabel"
        },
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Id", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "partitionId"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.HealthState", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "healthState"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Status", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "statusProperty"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.PartitionKind", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "partitionKind"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.InstanceCount", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "instanceCount"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.LowKey", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "lowKey"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.HighKey", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "highKey"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.MinReplicaSetSize", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "minReplicaSetSize"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.TargetReplicaSetSize", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "targetReplicaSetSize"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureFabricAttributeLoader.getPartitionAttributes,
                boundArguments: {
                    applicationId: {
                        attribute: "applicationId"
                    },
                    serviceId: {
                        attribute: "serviceId"
                    },
                    partitionId: {
                        attribute: "partitionId"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    }
                },
                provides: [
                    "statusProperty",
                    "statusLabel",
                    "healthState",
                    "partitionKind",
                    "instanceCount",
                    "lowKey",
                    "highKey",
                    "minReplicaSetSize",
                    "targetReplicaSetSize"
                ]
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.Fabric.GetReplicas",
            boundArguments: {
                applicationId: {
                    attribute: "applicationId"
                },
                serviceId: {
                    attribute: "serviceId"
                },
                partitionId: {
                    attribute: "partitionId"
                },
                apiServiceId: {
                    attribute: "apiServiceId"
                },
                diagnosticsFilter: {
                    attribute: "diagnosticsFilter"
                },
                clusterName: {
                    attribute: "clusterName"
                },
                subscription: {
                    attribute: "subscription"
                },
                isLocal: {
                    attribute: "isLocal"
                }
            }
        }
    };
    AzureFabricConfig.Replica = {
        aliases: ["Azure.Fabric.Replica"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.Fabric],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true,
        status: {
            attribute: "statusLabel"
        },
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.HealthState", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "healthState"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Status", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "statusProperty"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Node", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "name"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Address", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "address"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.ServiceFabric.Role", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "role"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureFabricAttributeLoader.getReplicaAttributes,
                boundArguments: {
                    applicationId: {
                        attribute: "applicationId"
                    },
                    serviceId: {
                        attribute: "serviceId"
                    },
                    partitionId: {
                        attribute: "partitionId"
                    },
                    replicaId: {
                        attribute: "replicaId"
                    },
                    apiServiceId: {
                        attribute: "apiServiceId"
                    }
                },
                provides: [
                    "statusProperty",
                    "statusLabel",
                    "healthState",
                    "address",
                    "role"
                ]
            }
        ]
    };
    AzureFabricConfig.Error = {
        aliases: ["Azure.Fabric.Error"],
        displayName: { value: "Error" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true
    };
    return AzureFabricConfig;
});

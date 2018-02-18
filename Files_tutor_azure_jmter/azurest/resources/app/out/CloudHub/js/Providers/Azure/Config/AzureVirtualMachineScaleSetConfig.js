/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureVirtualMachineScaleSetActions", "Providers/Azure/Loaders/AzureVirtualMachineScaleSetAttributeLoader", "Providers/Azure/Loaders/AzureStorageAccountAttributeLoader", "Providers/Azure/Loaders/AzureVirtualMachineV2AttributeLoader"], function (require, exports, AzureConstants, AzureResources, AzureVirtualMachineScaleSetActions, AzureVirtualMachineScaleSetAttributeLoader, AzureStorageAccountAttributeLoader, AzureVirtualMachineV2AttributeLoader) {
    "use strict";
    var AzureVirtualMachineScaleSetConfig = (function () {
        function AzureVirtualMachineScaleSetConfig() {
        }
        return AzureVirtualMachineScaleSetConfig;
    }());
    AzureVirtualMachineScaleSetConfig.Config = {
        aliases: [AzureConstants.resourceTypes.VirtualMachineScaleSets],
        parentType: AzureConstants.resourceTypes.VirtualMachineScaleSetsResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.VirtualMachineScaleSetIcon,
        themeSrc: AzureConstants.imageThemeSrc.VirtualMachineScaleSetIcon,
        supported: true,
        loaders: [
            {
                namespace: AzureVirtualMachineScaleSetAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                provides: ["extensions", "hasDiagnosticsExtension", "diagnosticsExtensionSettings", "diagnosticsStorageAccountName",
                    "upgradeMode", "hasEtwListenerExtension", "loadBalancerIds"]
            },
            {
                namespace: AzureVirtualMachineScaleSetAttributeLoader.getStateAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                provides: ["updating"]
            },
            {
                namespace: AzureVirtualMachineScaleSetAttributeLoader.getVirtualMachineAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                provides: ["hasWindowsOS"]
            },
            {
                namespace: AzureStorageAccountAttributeLoader.getConnectionStringAttributeNamespace,
                boundArguments: {
                    subscription: {
                        attribute: "subscription"
                    },
                    storageAccountName: {
                        attribute: "diagnosticsStorageAccountName"
                    },
                    connectionStringAttribute: {
                        value: "diagnosticStorageAccountConnectionString"
                    }
                },
                provides: ["diagnosticStorageAccountConnectionString"]
            },
            {
                // Add this attribute, since etw feature depends on Service Fabric tools at this moment.
                namespace: AzureVirtualMachineV2AttributeLoader.getIsEtwFeatureOnAttributeNamespace,
                provides: ["isEtwFeatureOn"]
            },
            {
                namespace: AzureVirtualMachineScaleSetAttributeLoader.getIsRemoteActionInProgressNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    }
                },
                provides: ["isRemoteActionInProgress"]
            },
            {
                namespace: AzureVirtualMachineScaleSetAttributeLoader.getEtwStateAttributesNamespace,
                boundArguments: {
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    loadBalancerIds: {
                        attribute: "loadBalancerIds"
                    }
                },
                provides: ["hasEtwInboundNatPools"]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.VirtualMachineScaleSets.ViewDiagnostics",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.ViewDiagnosticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.ViewDiagnosticsIcon,
                namespace: AzureVirtualMachineScaleSetActions.viewDiagnosticsNamespace,
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    diagnosticsExtensionSettings: {
                        attribute: "diagnosticsExtensionSettings"
                    },
                    diagnosticStorageAccountConnectionString: {
                        attribute: "diagnosticStorageAccountConnectionString"
                    }
                },
                visible: {
                    value: false
                },
                enabled: {
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachineScaleSets.EnableDiagnostics", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.EnableDiagnosticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableDiagnosticsIcon,
                namespace: AzureVirtualMachineScaleSetActions.enableDiagnosticsNamespace,
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
                    location: {
                        attribute: "location"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    extensions: {
                        attribute: "extensions"
                    },
                    upgradeMode: {
                        attribute: "upgradeMode"
                    },
                    polling: {
                        value: {
                            initialStatusType: "Enabling diagnostics extension",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingManualUpgrade: {
                        value: {
                            initialStatusType: "Upgrade all VMs in scale set",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "hasWindowsOS"],
                        expression: "!hasDiagnosticsExtension && hasWindowsOS"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "updating"],
                        expression: "!hasDiagnosticsExtension && !updating"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachineScaleSets.UpdateDiagnostics", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.EnableDiagnosticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableDiagnosticsIcon,
                namespace: AzureVirtualMachineScaleSetActions.updateDiagnosticsNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    location: {
                        attribute: "location"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    extensions: {
                        attribute: "extensions"
                    },
                    diagnosticsExtensionSettings: {
                        attribute: "diagnosticsExtensionSettings"
                    },
                    upgradeMode: {
                        attribute: "upgradeMode"
                    },
                    polling: {
                        value: {
                            initialStatusType: "Updating diagnostics extension",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingManualUpgrade: {
                        value: {
                            initialStatusType: "Upgrade all VMs in scale set",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "hasWindowsOS"],
                        expression: "hasDiagnosticsExtension && hasWindowsOS"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "updating"],
                        expression: "hasDiagnosticsExtension && !updating"
                    }
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.VirtualMachineScaleSets.DisableDiagnostics",
                        namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DisableDiagnosticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.DisableDiagnosticsIcon,
                namespace: AzureVirtualMachineScaleSetActions.disableDiagnosticsNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    location: {
                        attribute: "location"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    extensions: {
                        attribute: "extensions"
                    },
                    upgradeMode: {
                        attribute: "upgradeMode"
                    },
                    polling: {
                        value: {
                            initialStatusType: "Disabling diagnostics extension",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingManualUpgrade: {
                        value: {
                            initialStatusType: "Upgrade all VMs in scale set",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "hasWindowsOS"],
                        expression: "hasDiagnosticsExtension && hasWindowsOS"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "updating"],
                        expression: "hasDiagnosticsExtension && !updating"
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
                namespace: AzureVirtualMachineScaleSetActions.enableEtwListenerNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    location: {
                        attribute: "location"
                    },
                    name: {
                        attribute: "name"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    resourceGroup: {
                        attribute: "resourceGroup"
                    },
                    sku: {
                        attribute: "sku"
                    },
                    type: {
                        attribute: "type"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    affectedAttributes: {
                        value: ["isRemoteActionInProgress"]
                    }
                },
                visible: {
                    expression: {
                        requires: ["hasWindowsOS", "isEtwFeatureOn", "hasEtwListenerExtension"],
                        expression: "hasWindowsOS && isEtwFeatureOn && !hasEtwListenerExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["updating", "isRemoteActionInProgress"],
                        expression: "!updating && !isRemoteActionInProgress"
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
                namespace: AzureVirtualMachineScaleSetActions.disableEtwListenerNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    location: {
                        attribute: "location"
                    },
                    name: {
                        attribute: "name"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    resourceGroup: {
                        attribute: "resourceGroup"
                    },
                    sku: {
                        attribute: "sku"
                    },
                    type: {
                        attribute: "type"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    affectedAttributes: {
                        value: ["isRemoteActionInProgress"]
                    }
                },
                visible: {
                    expression: {
                        requires: ["hasWindowsOS", "isEtwFeatureOn", "hasEtwListenerExtension", "hasEtwInboundNatPools"],
                        expression: "hasWindowsOS && isEtwFeatureOn && (hasEtwListenerExtension || hasEtwInboundNatPools)"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["updating", "isRemoteActionInProgress"],
                        expression: "!updating && !isRemoteActionInProgress"
                    },
                    value: false
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.VirtualMachineScaleSet.GetVirtualMachines",
            boundArguments: {
                id: {
                    attribute: "id"
                },
                name: {
                    attribute: "name"
                },
                subscription: {
                    attribute: "subscription"
                },
                apiVersion: {
                    value: "2015-06-15"
                }
            }
        }
    };
    return AzureVirtualMachineScaleSetConfig;
});

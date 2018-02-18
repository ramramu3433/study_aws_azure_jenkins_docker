/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureGeneralActions", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureVirtualMachineV2Actions"], function (require, exports, AzureConstants, AzureGeneralActions, AzureResources, AzureVirtualMachineV2Actions) {
    "use strict";
    var AzureVirtualMachineV2DiagnosticsConfig = (function () {
        function AzureVirtualMachineV2DiagnosticsConfig() {
        }
        return AzureVirtualMachineV2DiagnosticsConfig;
    }());
    AzureVirtualMachineV2DiagnosticsConfig.Config = {
        aliases: ["Vm2Diagnostics"],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.ViewDiagnostics", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.ViewDiagnosticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.ViewDiagnosticsIcon,
                namespace: AzureVirtualMachineV2Actions.viewDiagnosticsNamespace,
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    diagnosticsExtensionSettings: {
                        attribute: "diagnosticsExtensionSettings"
                    },
                    diagnosticStorageAccountConnectionString: {
                        attribute: "diagnosticStorageAccountConnectionString"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                visible: {
                    expression: {
                        requires: ["running", "hasDiagnosticsExtension", "hasWindowsOS"],
                        expression: "hasWindowsOS && running && hasDiagnosticsExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "updating"],
                        expression: "hasDiagnosticsExtension && !updating"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.EnableDiagnostics", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.EnableDiagnosticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableDiagnosticsIcon,
                namespace: AzureVirtualMachineV2Actions.enableDiagnosticsNamespace,
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
                    polling: {
                        value: {
                            initialStatusType: "Enabling diagnostics extension",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "running", "hasWindowsOS"],
                        expression: "hasWindowsOS && running && !hasDiagnosticsExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "updating"],
                        expression: "!hasDiagnosticsExtension && !updating"
                    },
                    value: true
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.UpdateDiagnostics", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.EnableDiagnosticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableDiagnosticsIcon,
                namespace: AzureVirtualMachineV2Actions.updateDiagnosticsNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    diagnosticsExtensionId: {
                        attribute: "diagnosticsExtensionId"
                    },
                    diagnosticsExtensionName: {
                        attribute: "diagnosticsExtensionName"
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
                    diagnosticsExtensionSettings: {
                        attribute: "diagnosticsExtensionSettings"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    polling: {
                        value: {
                            initialStatusType: "Updating diagnostics extension",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "running", "hasWindowsOS"],
                        expression: "hasWindowsOS && running && hasDiagnosticsExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["hasDiagnosticsExtension", "updating"],
                        expression: "hasDiagnosticsExtension && !updating"
                    },
                    value: true
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.DisableDiagnostics", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DisableDiagnosticsIcon,
                themeSrc: AzureConstants.imageThemeSrc.DisableDiagnosticsIcon,
                namespace: AzureGeneralActions.deleteActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "diagnosticsExtensionId"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    polling: {
                        value: {
                            initialStatusType: "Disabling diagnostics extension",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["running", "hasDiagnosticsExtension", "hasWindowsOS"],
                        expression: "hasWindowsOS && running && hasDiagnosticsExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["hasDiagnosticsExtension"],
                        expression: "hasDiagnosticsExtension"
                    },
                    value: false
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
                namespace: AzureVirtualMachineV2Actions.enableEtwListenerNamespace,
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
                    networkSecurityGroup: {
                        attribute: "networkSecurityGroup"
                    },
                    etwListenerExtensionState: {
                        attribute: "etwListenerExtensionState"
                    },
                    etwListenerExtensionVersion: {
                        attribute: "etwListenerExtensionVersion"
                    },
                    loadBalancer: {
                        attribute: "loadBalancer"
                    },
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    pollingNetworkSecurityGroup: {
                        value: {
                            initialStatusType: "Configuring networking security group streaming trace port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingLoadBalancer: {
                        value: {
                            initialStatusType: "Configuring load balancer streaming trace port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingNetworkInterface: {
                        value: {
                            initialStatusType: "Configuring network interface streaming trace port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingExtension: {
                        value: {
                            initialStatusType: "Enabling streaming trace",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["running", "hasWindowsOS", "isEtwFeatureOn", "hasEtwListenerExtension"],
                        expression: "running && hasWindowsOS && isEtwFeatureOn && !hasEtwListenerExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["updating", "isConfiguringEtwListener", "isLoadBalancerBusy"],
                        expression: "!updating && !isConfiguringEtwListener && !isLoadBalancerBusy"
                    },
                    value: false
                }
            },
            {
                displayName: {
                    resource: {
                        resourceId: "Actions.ServiceFabric.DisableStreamingTraces", namespace: AzureResources.commonNamespace
                    }
                },
                icon: AzureConstants.imagePaths.DisableLogIcon,
                themeSrc: AzureConstants.imageThemeSrc.DisableLogIcon,
                namespace: AzureVirtualMachineV2Actions.disableEtwListenerNamespace,
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
                    networkSecurityGroup: {
                        attribute: "networkSecurityGroup"
                    },
                    etwListenerExtensionId: {
                        attribute: "etwListenerExtensionId"
                    },
                    loadBalancer: {
                        attribute: "loadBalancer"
                    },
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    pollingNetworkSecurityGroup: {
                        value: {
                            initialStatusType: "Configuring networking security group streaming trace port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingLoadBalancer: {
                        value: {
                            initialStatusType: "Configuring load balancer streaming trace port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingNetworkInterface: {
                        value: {
                            initialStatusType: "Configuring network interface streaming trace port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingExtension: {
                        value: {
                            initialStatusType: "Disabling streaming trace",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["running", "hasWindowsOS", "isEtwFeatureOn", "hasEtwListenerExtension"],
                        expression: "running && hasWindowsOS && isEtwFeatureOn && hasEtwListenerExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["updating", "isConfiguringEtwListener", "isLoadBalancerBusy"],
                        expression: "!updating && !isConfiguringEtwListener && !isLoadBalancerBusy"
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
                namespace: AzureVirtualMachineV2Actions.createEtwListenerWindowNamespace,
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    ipAddress: {
                        attribute: "publicIpAddress"
                    },
                    port: {
                        attribute: "etwListenerPort"
                    },
                    encryptionKey: {
                        attribute: "etwEncryptionKey"
                    },
                    encryptionIV: {
                        attribute: "etwEncryptionIV"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["publicIpAddress", "hasEtwListenerExtension"],
                        expression: "publicIpAddress && hasEtwListenerExtension"
                    },
                    value: false
                },
                visible: {
                    expression: {
                        requires: ["isEtwFeatureOn"],
                        expression: "isEtwFeatureOn"
                    },
                    value: false
                }
            }
        ]
    };
    return AzureVirtualMachineV2DiagnosticsConfig;
});

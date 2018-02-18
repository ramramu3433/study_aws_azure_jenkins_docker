/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureVirtualMachineV2Actions"], function (require, exports, AzureConstants, AzureResources, AzureVirtualMachineV2Actions) {
    "use strict";
    var AzureVirtualMachineV2DebuggingConfig = (function () {
        function AzureVirtualMachineV2DebuggingConfig() {
        }
        return AzureVirtualMachineV2DebuggingConfig;
    }());
    AzureVirtualMachineV2DebuggingConfig.Config = {
        aliases: ["Vm2Debugging"],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.AttachDebugger", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StartDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.StartDebuggingIcon,
                namespace: AzureVirtualMachineV2Actions.attatchDebuggerNamespace,
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    remoteDebuggingExtensionSettings: {
                        attribute: "remoteDebuggingExtensionSettings"
                    },
                    publicIpAddress: {
                        attribute: "publicIpAddress"
                    },
                    loadBalancer: {
                        attribute: "loadBalancer"
                    },
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                visible: {
                    expression: {
                        requires: ["running", "hasCompatibleDebuggingExtension", "hasWindowsOS"],
                        expression: "hasWindowsOS && running && hasCompatibleDebuggingExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["hasCompatibleDebuggingExtension", "updating"],
                        expression: "hasCompatibleDebuggingExtension && !updating"
                    },
                    value: true
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.EnableDebugging", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.EnableDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.EnableDebuggingIcon,
                namespace: AzureVirtualMachineV2Actions.enableDebuggingNamespace,
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
                    location: {
                        attribute: "location"
                    },
                    name: {
                        attribute: "name"
                    },
                    networkSecurityGroup: {
                        attribute: "networkSecurityGroup"
                    },
                    loadBalancer: {
                        attribute: "loadBalancer"
                    },
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    pollingNetworkSecurityGroup: {
                        value: {
                            initialStatusType: "Configuring networking security group debugging port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingLoadBalancer: {
                        value: {
                            initialStatusType: "Configuring load balancer debugging port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingNetworkInterface: {
                        value: {
                            initialStatusType: "Configuring network interface debugging port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingExtension: {
                        value: {
                            initialStatusType: "Enabling debugging extension",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["running", "hasCompatibleDebuggingExtension", "hasWindowsOS"],
                        expression: "hasWindowsOS && running && !hasCompatibleDebuggingExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["hasCompatibleDebuggingExtension", "updating", "isEnablingRemoteDebug", "isLoadBalancerBusy"],
                        expression: "!hasCompatibleDebuggingExtension && !updating && !isEnablingRemoteDebug && !isLoadBalancerBusy"
                    },
                    value: true
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.DisableDebugging", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DisableDebuggingIcon,
                themeSrc: AzureConstants.imageThemeSrc.DisableDebuggingIcon,
                namespace: AzureVirtualMachineV2Actions.disableDebuggingNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    remoteDebuggingExtensionId: {
                        attribute: "remoteDebuggingExtensionId"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    networkSecurityGroup: {
                        attribute: "networkSecurityGroup"
                    },
                    loadBalancer: {
                        attribute: "loadBalancer"
                    },
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    pollingExtension: {
                        value: {
                            initialStatusType: "Disabling debugging extension",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    },
                    pollingNetworkSecurityGroup: {
                        value: {
                            initialStatusType: "Configuring networking security group debugging port",
                            statusType: "Extension",
                            timeOutInSeconds: 300
                        }
                    }
                },
                visible: {
                    expression: {
                        requires: ["running", "hasCompatibleDebuggingExtension", "hasWindowsOS"],
                        expression: "hasWindowsOS && running && hasCompatibleDebuggingExtension"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["hasCompatibleDebuggingExtension", "isDisablingRemoteDebug", "isLoadBalancerBusy"],
                        expression: "hasCompatibleDebuggingExtension && !isDisablingRemoteDebug && !isLoadBalancerBusy"
                    },
                    value: false
                }
            }
        ]
    };
    return AzureVirtualMachineV2DebuggingConfig;
});

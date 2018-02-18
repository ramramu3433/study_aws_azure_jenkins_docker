/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureVirtualMachineV2AttributeLoader", "Providers/Azure/Loaders/AzureStorageAccountAttributeLoader"], function (require, exports, AzureResources, AzureVirtualMachineV2AttributeLoader, AzureStorageAccountAttributeLoader) {
    "use strict";
    var AzureVirtualMachineV2PropertiesAndLoadersConfig = (function () {
        function AzureVirtualMachineV2PropertiesAndLoadersConfig() {
        }
        return AzureVirtualMachineV2PropertiesAndLoadersConfig;
    }());
    AzureVirtualMachineV2PropertiesAndLoadersConfig.Config = {
        aliases: ["Vm2PropertiesAndLoaders"],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.VirtualMachinesV2.State", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "state"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureVirtualMachineV2AttributeLoader.getAllAttributesNamespace,
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
                provides: ["networkInterfaceId", "diagnosticsExtensionSettings", "diagnosticsStorageAccountName", "diagnosticsExtensionId",
                    "diagnosticsExtensionName", "remoteDebuggingExtensionSettings", "remoteDebuggingExtensionId", "hasWindowsOS",
                    "etwListenerExtensionId", "etwListenerExtensionName", "etwListenerExtensionState", "etwListenerExtensionVersion", "etwEncryptionKey",
                    "etwEncryptionIV", "hasEtwListenerExtension"]
            },
            {
                namespace: AzureVirtualMachineV2AttributeLoader.getApplicationInsightsAttributesNamespace,
                boundArguments: {
                    diagnosticsExtensionSettings: {
                        attribute: "diagnosticsExtensionSettings"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-05-01"
                    }
                },
                provides: ["diagnosticsAppInsightsId"]
            },
            {
                namespace: AzureVirtualMachineV2AttributeLoader.getNetworkInterfaceAttributeNamespace,
                boundArguments: {
                    id: {
                        attribute: "networkInterfaceId"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                provides: ["networkInterface"]
            },
            {
                namespace: AzureVirtualMachineV2AttributeLoader.getLoadBalancerAttributeNamespace,
                boundArguments: {
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                provides: ["loadBalancer"]
            },
            {
                namespace: AzureVirtualMachineV2AttributeLoader.getNetworkSecurityGroupAttributeNamespace,
                boundArguments: {
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                provides: ["networkSecurityGroup"]
            },
            {
                namespace: AzureVirtualMachineV2AttributeLoader.getIpAddressAttribute,
                boundArguments: {
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    loadBalancer: {
                        attribute: "loadBalancer"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    }
                },
                provides: ["publicIpAddress"]
            },
            {
                namespace: AzureVirtualMachineV2AttributeLoader.getStateAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    loadBalancer: {
                        attribute: "loadBalancer"
                    },
                    apiVersion: {
                        value: "2015-06-15"
                    },
                    etwListenerExtensionVersion: {
                        attribute: "etwListenerExtensionVersion"
                    }
                },
                provides: ["state", "hasCompatibleDebuggingExtension", "hasDiagnosticsExtension", "running", "starting", "stopping",
                    "stopped", "updating", "isEnablingRemoteDebug", "isDisablingRemoteDebug", "isConfiguringEtwListener", "isLoadBalancerBusy"
                ]
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
                namespace: AzureVirtualMachineV2AttributeLoader.getEtwListenerPortAttributeNamespace,
                boundArguments: {
                    networkInterface: {
                        attribute: "networkInterface"
                    },
                    loadBalancer: {
                        attribute: "loadBalancer"
                    }
                },
                provides: ["etwListenerPort"]
            }
        ]
    };
    return AzureVirtualMachineV2PropertiesAndLoadersConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureScaleSetInstanceAttributeLoader", "Providers/Azure/Actions/AzureVirtualMachineScaleSetActions", "Providers/Azure/Loaders/AzureVirtualMachineV2AttributeLoader"], function (require, exports, AzureConstants, AzureResources, AzureScaleSetInstanceAttributeLoader, AzureVirtualMachineScaleSetActions, AzureVirtualMachineV2AttributeLoader) {
    "use strict";
    var AzureVirtualMachineScaleSetInstanceConfig = (function () {
        function AzureVirtualMachineScaleSetInstanceConfig() {
        }
        return AzureVirtualMachineScaleSetInstanceConfig;
    }());
    AzureVirtualMachineScaleSetInstanceConfig.Config = {
        aliases: ["Microsoft.Compute/virtualMachineScaleSets/virtualMachines"],
        inherits: [
            AzureConstants.baseTypes.Resource,
            "Vm2PropertiesAndLoaders",
            "Vm2BaseActions"
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.VirtualMachineIcon,
        themeSrc: AzureConstants.imageThemeSrc.VirtualMachineIcon,
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
                namespace: AzureVirtualMachineScaleSetActions.createEtwListenerWindowNamespace,
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    nodeName: {
                        attribute: "name"
                    },
                    scaleSetName: {
                        attribute: "scaleSetName"
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
        ],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.VirtualMachineScaleSets.UpdateDomain", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "updateDomain"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.VirtualMachineScaleSets.FaultDomain", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "faultDomain"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.VirtualMachineScaleSets.PrivateIP", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "privateIp"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureScaleSetInstanceAttributeLoader.getInstanceViewAttributes,
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
                provides: ["updateDomain", "faultDomain"]
            },
            {
                namespace: AzureScaleSetInstanceAttributeLoader.getPrivateIpAttribute,
                boundArguments: {
                    networkInterface: {
                        attribute: "networkInterface"
                    }
                },
                provides: ["privateIp"]
            },
            {
                // Add this attribute, since etw feature depends on Service Fabric tools at this moment.
                namespace: AzureVirtualMachineV2AttributeLoader.getIsEtwFeatureOnAttributeNamespace,
                provides: ["isEtwFeatureOn"]
            }
        ]
    };
    return AzureVirtualMachineScaleSetInstanceConfig;
});

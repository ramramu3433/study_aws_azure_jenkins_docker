/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureVirtualMachineAttributeLoader", "Providers/CloudExplorer/Actions/CloudExplorerActions"], function (require, exports, AzureConstants, AzureResources, AzureVirtualMachineAttributeLoader, CloudExplorerActions) {
    "use strict";
    var AzureVirtualMachineConfig = (function () {
        function AzureVirtualMachineConfig() {
        }
        return AzureVirtualMachineConfig;
    }());
    AzureVirtualMachineConfig.Config = {
        aliases: [AzureConstants.resourceTypes.VirtualMachinesClassic],
        parentType: AzureConstants.resourceTypes.VirtualMachinesClassicResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.VirtualMachineIcon,
        themeSrc: AzureConstants.imageThemeSrc.VirtualMachineIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.VirtualMachines.Status", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "status"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.VirtualMachines.Size", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "size"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.VirtualMachines.Dns", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "dns"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureVirtualMachineAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2014-06-01"
                    }
                },
                provides: ["status", "size", "dns"]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachines.OpenServerExplorer", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DefaultResourceIcon,
                themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
                namespace: CloudExplorerActions.openServerExplorerNamespace,
                visible: {
                    value: true
                },
                enabled: {
                    value: true
                }
            }
        ]
    };
    return AzureVirtualMachineConfig;
});

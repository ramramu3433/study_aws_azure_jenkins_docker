/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureActions"], function (require, exports, AzureConstants, AzureResources, AzureActions) {
    "use strict";
    var AzureVirtualMachineV2Config = (function () {
        function AzureVirtualMachineV2Config() {
        }
        return AzureVirtualMachineV2Config;
    }());
    AzureVirtualMachineV2Config.Config = {
        aliases: [AzureConstants.resourceTypes.VirtualMachinesV2],
        parentType: AzureConstants.resourceTypes.VirtualMachinesV2ResourceType,
        inherits: [
            AzureConstants.baseTypes.Resource,
            "Vm2PropertiesAndLoaders",
            "Vm2BaseActions",
            "Vm2Debugging",
            "Vm2Diagnostics"
        ],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.VirtualMachineIcon,
        themeSrc: AzureConstants.imageThemeSrc.VirtualMachineIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.VirtualMachinesV2.PublicIP", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "publicIpAddress"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.VirtualMachinesV2.OpenApplicationInsights", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.OpenApplicationInsightsIcon,
                themeSrc: AzureConstants.imageThemeSrc.OpenApplicationInsightsIcon,
                namespace: AzureActions.openResourceInPortalNamespace,
                boundArguments: {
                    id: {
                        attribute: "diagnosticsAppInsightsId"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    tenantId: {
                        attribute: "tenantId"
                    }
                },
                visible: {
                    expression: {
                        requires: ["diagnosticsAppInsightsId"],
                        expression: "diagnosticsAppInsightsId"
                    },
                    value: false
                },
                enabled: {
                    expression: {
                        requires: ["diagnosticsAppInsightsId"],
                        expression: "diagnosticsAppInsightsId"
                    },
                    value: false
                }
            }
        ]
    };
    return AzureVirtualMachineV2Config;
});

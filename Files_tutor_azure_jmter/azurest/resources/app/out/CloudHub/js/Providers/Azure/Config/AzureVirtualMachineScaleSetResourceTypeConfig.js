/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureVirtualMachineScaleSetResourceTypeConfig = (function () {
        function AzureVirtualMachineScaleSetResourceTypeConfig() {
        }
        return AzureVirtualMachineScaleSetResourceTypeConfig;
    }());
    AzureVirtualMachineScaleSetResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.VirtualMachineScaleSetsResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Virtual Machine Scale Sets" },
        icon: AzureConstants.imagePaths.VirtualMachineScaleSetIcon,
        themeSrc: AzureConstants.imageThemeSrc.VirtualMachineScaleSetIcon,
        supported: true
    };
    return AzureVirtualMachineScaleSetResourceTypeConfig;
});

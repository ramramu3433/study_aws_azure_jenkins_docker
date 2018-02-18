/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureVirtualMachineV2ResourceTypeConfig = (function () {
        function AzureVirtualMachineV2ResourceTypeConfig() {
        }
        return AzureVirtualMachineV2ResourceTypeConfig;
    }());
    AzureVirtualMachineV2ResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.VirtualMachinesV2ResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Virtual Machines" },
        icon: AzureConstants.imagePaths.VirtualMachineIcon,
        themeSrc: AzureConstants.imageThemeSrc.VirtualMachineIcon,
        supported: true
    };
    return AzureVirtualMachineV2ResourceTypeConfig;
});

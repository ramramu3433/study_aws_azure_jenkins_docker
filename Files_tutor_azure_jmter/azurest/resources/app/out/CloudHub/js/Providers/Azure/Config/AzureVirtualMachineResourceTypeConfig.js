/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureVirtualMachineResourceTypeConfig = (function () {
        function AzureVirtualMachineResourceTypeConfig() {
        }
        return AzureVirtualMachineResourceTypeConfig;
    }());
    AzureVirtualMachineResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.VirtualMachinesClassicResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Virtual Machines (Classic)" },
        icon: AzureConstants.imagePaths.VirtualMachineIcon,
        themeSrc: AzureConstants.imageThemeSrc.VirtualMachineIcon,
        supported: true
    };
    return AzureVirtualMachineResourceTypeConfig;
});

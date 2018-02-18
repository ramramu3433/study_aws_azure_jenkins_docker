/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureFabricResourceTypeConfig = (function () {
        function AzureFabricResourceTypeConfig() {
        }
        return AzureFabricResourceTypeConfig;
    }());
    AzureFabricResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.ServiceFabricClustersResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Service Fabric" },
        icon: AzureConstants.imagePaths.ServiceFabricIcon,
        themeSrc: AzureConstants.imageThemeSrc.ServiceFabricIcon,
        supported: true
    };
    return AzureFabricResourceTypeConfig;
});

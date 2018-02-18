/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureWebHostingPlanResourceTypeConfig = (function () {
        function AzureWebHostingPlanResourceTypeConfig() {
        }
        return AzureWebHostingPlanResourceTypeConfig;
    }());
    AzureWebHostingPlanResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.WebHostingPlanResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "App Service Plans" },
        icon: AzureConstants.imagePaths.WebHostingIcon,
        themeSrc: AzureConstants.imageThemeSrc.WebHostingIcon,
        supported: true
    };
    return AzureWebHostingPlanResourceTypeConfig;
});

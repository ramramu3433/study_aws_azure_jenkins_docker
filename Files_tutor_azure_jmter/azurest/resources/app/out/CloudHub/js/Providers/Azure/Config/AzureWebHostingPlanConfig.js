/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureWebHostingPlanConfig = (function () {
        function AzureWebHostingPlanConfig() {
        }
        return AzureWebHostingPlanConfig;
    }());
    AzureWebHostingPlanConfig.Config = {
        aliases: [AzureConstants.resourceTypes.WebHostingPlan],
        parentType: AzureConstants.resourceTypes.WebHostingPlanResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.WebHostingIcon,
        themeSrc: AzureConstants.imageThemeSrc.WebHostingIcon,
        supported: true
    };
    return AzureWebHostingPlanConfig;
});

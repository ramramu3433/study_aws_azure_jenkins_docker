/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureApplicationInsightsResourceTypeConfig = (function () {
        function AzureApplicationInsightsResourceTypeConfig() {
        }
        return AzureApplicationInsightsResourceTypeConfig;
    }());
    AzureApplicationInsightsResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.AzureApplicationInsightsResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Application Insights" },
        icon: AzureConstants.imagePaths.ApplicationInsightsIcon,
        themeSrc: AzureConstants.imageThemeSrc.ApplicationInsightsIcon,
        supported: true
    };
    return AzureApplicationInsightsResourceTypeConfig;
});

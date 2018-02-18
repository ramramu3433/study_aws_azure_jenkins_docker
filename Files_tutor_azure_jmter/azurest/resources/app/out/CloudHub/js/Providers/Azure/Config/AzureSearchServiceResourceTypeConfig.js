/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureSearchServiceResourceTypeConfig = (function () {
        function AzureSearchServiceResourceTypeConfig() {
        }
        return AzureSearchServiceResourceTypeConfig;
    }());
    AzureSearchServiceResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.SearchServicesResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Search Services" },
        icon: AzureConstants.imagePaths.SearchServicesIcon,
        themeSrc: AzureConstants.imageThemeSrc.SearchServicesIcon,
        supported: true
    };
    return AzureSearchServiceResourceTypeConfig;
});

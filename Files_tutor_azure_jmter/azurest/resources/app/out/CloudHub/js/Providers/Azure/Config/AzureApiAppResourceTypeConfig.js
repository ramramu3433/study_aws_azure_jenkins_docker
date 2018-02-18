/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureApiAppResourceTypeConfig = (function () {
        function AzureApiAppResourceTypeConfig() {
        }
        return AzureApiAppResourceTypeConfig;
    }());
    AzureApiAppResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.ApiAppsResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "API Apps" },
        icon: AzureConstants.imagePaths.ApiAppsIcon,
        themeSrc: AzureConstants.imageThemeSrc.ApiAppsIcon,
        supported: true
    };
    return AzureApiAppResourceTypeConfig;
});

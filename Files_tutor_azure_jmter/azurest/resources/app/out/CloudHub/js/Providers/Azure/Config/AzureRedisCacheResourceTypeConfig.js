/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureRedisCacheResourceTypeConfig = (function () {
        function AzureRedisCacheResourceTypeConfig() {
        }
        return AzureRedisCacheResourceTypeConfig;
    }());
    AzureRedisCacheResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.RedisCachesResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Redis Caches" },
        icon: AzureConstants.imagePaths.RedisCacheIcon,
        themeSrc: AzureConstants.imageThemeSrc.RedisCacheIcon,
        supported: true
    };
    return AzureRedisCacheResourceTypeConfig;
});

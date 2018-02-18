/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureDataLakeAnalyticsResourceTypeConfig = (function () {
        function AzureDataLakeAnalyticsResourceTypeConfig() {
        }
        return AzureDataLakeAnalyticsResourceTypeConfig;
    }());
    AzureDataLakeAnalyticsResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.DataLakeAnalyticsResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Data Lake Analytics" },
        icon: AzureConstants.imagePaths.DataLakeAnalyticsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeAnalyticsIcon,
        supported: true
    };
    return AzureDataLakeAnalyticsResourceTypeConfig;
});

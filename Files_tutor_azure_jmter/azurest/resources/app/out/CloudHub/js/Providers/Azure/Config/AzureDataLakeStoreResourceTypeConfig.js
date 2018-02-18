/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureDataLakeStoreResourceTypeConfig = (function () {
        function AzureDataLakeStoreResourceTypeConfig() {
        }
        return AzureDataLakeStoreResourceTypeConfig;
    }());
    AzureDataLakeStoreResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.DataLakeStoreResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Data Lake Store" },
        icon: AzureConstants.imagePaths.DataLakeStoreIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeStoreIcon,
        supported: true
    };
    return AzureDataLakeStoreResourceTypeConfig;
});

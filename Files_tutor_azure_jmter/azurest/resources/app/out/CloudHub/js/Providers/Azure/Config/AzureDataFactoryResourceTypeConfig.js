/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureDataFactoryResourceTypeConfig = (function () {
        function AzureDataFactoryResourceTypeConfig() {
        }
        return AzureDataFactoryResourceTypeConfig;
    }());
    AzureDataFactoryResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.DataFactoriesResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Data Factories" },
        icon: AzureConstants.imagePaths.DataFactoriesIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataFactoriesIcon,
        supported: true
    };
    return AzureDataFactoryResourceTypeConfig;
});

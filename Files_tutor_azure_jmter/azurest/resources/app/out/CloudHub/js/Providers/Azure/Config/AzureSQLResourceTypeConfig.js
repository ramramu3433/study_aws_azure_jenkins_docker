/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureSQLResourceTypeConfig = (function () {
        function AzureSQLResourceTypeConfig() {
        }
        return AzureSQLResourceTypeConfig;
    }());
    AzureSQLResourceTypeConfig.DatabaseConfig = {
        aliases: [AzureConstants.resourceTypes.SQLDatabasesResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "SQL Databases" },
        icon: AzureConstants.imagePaths.SQLDatabaseIcon,
        themeSrc: AzureConstants.imageThemeSrc.SQLDatabaseIcon,
        supported: true
    };
    AzureSQLResourceTypeConfig.ServerConfig = {
        aliases: [AzureConstants.resourceTypes.SQLServersResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "SQL Servers" },
        icon: AzureConstants.imagePaths.SQLDatabaseServersIcon,
        themeSrc: AzureConstants.imageThemeSrc.SQLDatabaseServersIcon,
        supported: true
    };
    return AzureSQLResourceTypeConfig;
});

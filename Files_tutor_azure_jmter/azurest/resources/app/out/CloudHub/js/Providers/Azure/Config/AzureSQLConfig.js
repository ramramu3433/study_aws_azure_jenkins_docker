/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureSQLActions", "Providers/Azure/Loaders/AzureSQLAttributeLoader"], function (require, exports, AzureConstants, AzureResources, AzureSQLActions, AzureSQLAttributeLoader) {
    "use strict";
    var AzureSQLConfig = (function () {
        function AzureSQLConfig() {
        }
        return AzureSQLConfig;
    }());
    AzureSQLConfig.AzureSQLDatabaseConfig = {
        aliases: [AzureConstants.resourceTypes.SQLDatabases],
        parentType: AzureConstants.resourceTypes.SQLDatabasesResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.SQLDatabaseIcon,
        themeSrc: AzureConstants.imageThemeSrc.SQLDatabaseIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.SqlDatabases.Server", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "server"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.SqlDatabases.AdministratorLogin", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "administratorLogin"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.SqlDatabases.OpenObjectExplorer", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.OpenInSQLServerObjectExplorerIcon,
                themeSrc: AzureConstants.imageThemeSrc.OpenInSQLServerObjectExplorerIcon,
                namespace: AzureSQLActions.showSQLServerObjectExplorerNamespace,
                boundArguments: {
                    subscription: {
                        attribute: "subscription"
                    },
                    server: {
                        attribute: "server"
                    },
                    name: {
                        attribute: "name"
                    },
                    administratorLogin: {
                        attribute: "administratorLogin"
                    }
                }
            }
        ],
        loaders: [
            {
                namespace: AzureSQLAttributeLoader.getAzureSQLDatabaseAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        // Originally "2015-02-28", but web requests were failing with this version.
                        // See https://msdn.microsoft.com/en-us/library/azure/mt163571.aspx#sqlrestcommon
                        value: "2014-04-01-preview"
                    }
                },
                provides: ["administratorLogin"]
            }
        ]
    };
    AzureSQLConfig.AzureSQLServerConfig = {
        aliases: [AzureConstants.resourceTypes.SQLServers],
        parentType: AzureConstants.resourceTypes.SQLServersResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.SQLDatabaseServersIcon,
        themeSrc: AzureConstants.imageThemeSrc.SQLDatabaseServersIcon,
        supported: true
    };
    return AzureSQLConfig;
});

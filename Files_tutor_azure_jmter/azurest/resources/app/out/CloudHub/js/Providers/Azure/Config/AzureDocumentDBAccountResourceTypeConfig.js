/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Common/Utilities"], function (require, exports, AzureConstants, Utilities) {
    "use strict";
    var AzureDocumentDBAccountResourceTypeConfig = (function () {
        function AzureDocumentDBAccountResourceTypeConfig() {
        }
        return AzureDocumentDBAccountResourceTypeConfig;
    }());
    AzureDocumentDBAccountResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.DocumentDBAccountsResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        // Localize
        displayName: { value: Utilities.isRunningOnElectron() ? "Cosmos DB Accounts (Preview)" : "Cosmos DB Accounts" },
        icon: AzureConstants.imagePaths.DocumentDBAccountsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBAccountsIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    value: "Connect to Azure Cosmos DB..." // Localize
                },
                icon: AzureConstants.imagePaths.DocumentDBAccountsIcon,
                themeSrc: AzureConstants.imagePaths.DocumentDBAccountsIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.DocumentDB.connectAccount"
            }
        ]
    };
    AzureDocumentDBAccountResourceTypeConfig.ExternalConfig = {
        aliases: [AzureConstants.resourceTypes.ExternalDocumentDBAccountsResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig, AzureConstants.resourceTypes.DocumentDBAccountsResourceType],
        supported: true
    };
    return AzureDocumentDBAccountResourceTypeConfig;
});

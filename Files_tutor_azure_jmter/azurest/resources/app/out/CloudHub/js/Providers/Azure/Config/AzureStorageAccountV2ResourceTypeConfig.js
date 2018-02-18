/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Common/Utilities"], function (require, exports, AzureConstants, Utilities) {
    "use strict";
    var AzureStorageAccountV2ResourceTypeConfig = (function () {
        function AzureStorageAccountV2ResourceTypeConfig() {
        }
        return AzureStorageAccountV2ResourceTypeConfig;
    }());
    AzureStorageAccountV2ResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.StorageAccountsV2ResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Storage Accounts" },
        icon: AzureConstants.imagePaths.StorageAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountIcon,
        supported: true,
        actions: [
            {
                // localize
                displayName: {
                    value: "Connect to Azure storage..."
                },
                icon: AzureConstants.imagePaths.StorageAccountIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "StorageExplorer.OpenConnectDialog"
            }
        ]
    };
    AzureStorageAccountV2ResourceTypeConfig.ExternalConfig = {
        aliases: [AzureConstants.resourceTypes.ExternalStorageAccountsV2ResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig, AzureConstants.resourceTypes.StorageAccountsV2ResourceType],
        supported: true
    };
    return AzureStorageAccountV2ResourceTypeConfig;
});

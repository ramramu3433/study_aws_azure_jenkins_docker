/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Common/AzureStorageConstants", "Providers/Azure/Config/AzureStorageConnectionTypeConfig"], function (require, exports, AzureConstants, AzureStorageConstants, AzureStorageConnectionTypeConfig_1) {
    "use strict";
    var AzureSASFileShareGroupConfig = (function () {
        function AzureSASFileShareGroupConfig() {
        }
        return AzureSASFileShareGroupConfig;
    }());
    AzureSASFileShareGroupConfig.Config = {
        aliases: [AzureStorageConstants.nodeTypes.sasFileShareGroup],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        parentType: AzureConstants.resourceTypes.StorageAccountsV2ResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountFileShareIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountFileShareIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetSASFileShares",
            boundArguments: {},
            preLoad: true
        }
    };
    return AzureSASFileShareGroupConfig;
});

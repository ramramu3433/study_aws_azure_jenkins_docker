/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Common/AzureStorageConstants"], function (require, exports, AzureConstants, AzureStorageConnectionTypeConfig_1, AzureStorageConstants) {
    "use strict";
    var AzureSASQueueGroupConfig = (function () {
        function AzureSASQueueGroupConfig() {
        }
        return AzureSASQueueGroupConfig;
    }());
    AzureSASQueueGroupConfig.Config = {
        aliases: [AzureStorageConstants.nodeTypes.sasQueueGroup],
        displayName: { value: "Queue" },
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        parentType: AzureConstants.resourceTypes.StorageAccountsV2ResourceType,
        icon: AzureConstants.imagePaths.StorageAccountQueueIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountQueueIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetSASQueues",
            boundArguments: {},
            preLoad: true
        }
    };
    return AzureSASQueueGroupConfig;
});

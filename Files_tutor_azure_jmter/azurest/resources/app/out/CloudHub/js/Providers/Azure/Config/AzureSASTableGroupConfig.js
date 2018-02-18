/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Common/AzureConstants", "Providers/Common/AzureStorageConstants"], function (require, exports, AzureStorageConnectionTypeConfig_1, AzureConstants, AzureStorageConstants) {
    "use strict";
    var AzureSASTableGroupConfig = (function () {
        function AzureSASTableGroupConfig() {
        }
        return AzureSASTableGroupConfig;
    }());
    AzureSASTableGroupConfig.Config = {
        aliases: [AzureStorageConstants.nodeTypes.sasTableGroup],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0]
        ],
        parentType: AzureConstants.resourceTypes.StorageAccountsV2ResourceType,
        displayName: { value: "Table" },
        icon: AzureConstants.imagePaths.StorageAccountTableIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountTableIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetSASTables",
            boundArguments: {
                connectionType: {
                    attribute: "connectionType"
                }
            },
            preLoad: true
        }
    };
    return AzureSASTableGroupConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureLocalStorageAccountConfig = (function () {
        function AzureLocalStorageAccountConfig() {
        }
        return AzureLocalStorageAccountConfig;
    }());
    AzureLocalStorageAccountConfig.Config = {
        aliases: [AzureConstants.resourceTypes.LocalStorageAccounts],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        parentType: AzureConstants.resourceTypes.ExternalStorageAccountsV2ResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        properties: [],
        loaders: [],
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetGroupNodes",
            boundArguments: {
                connectionString: {
                    value: "UseDevelopmentStorage=true"
                },
                supportsBlobs: {
                    attribute: "supportsBlobs"
                },
                supportsQueues: {
                    attribute: "supportsQueues"
                },
                supportsTables: {
                    attribute: "supportsTables"
                },
                supportsFiles: false,
                // TODO Convert to binding instead?
                shouldPreExpandNodes: {
                    attribute: "shouldPreExpandNodes"
                },
                connectionType: {
                    value: 5 /* development */
                }
            }
        }
    };
    return AzureLocalStorageAccountConfig;
});

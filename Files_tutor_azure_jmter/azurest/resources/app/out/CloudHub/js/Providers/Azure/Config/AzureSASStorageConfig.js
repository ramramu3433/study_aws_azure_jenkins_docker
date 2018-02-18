/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    /**
     * This configuration is for the special "(SAS-Attached Services)" node
     */
    var AzureSASStorageConfig = (function () {
        function AzureSASStorageConfig() {
        }
        return AzureSASStorageConfig;
    }());
    AzureSASStorageConfig.Config = {
        aliases: [AzureConstants.resourceTypes.SASStorage],
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
            namespace: "Azure.Producers.Storage.GetSASGroupNodes",
            boundArguments: {
                supportsBlobs: {
                    attribute: "supportsBlobs"
                },
                supportsQueues: {
                    attribute: "supportsQueues"
                },
                supportsTables: {
                    attribute: "supportsTables"
                },
                supportsFiles: {
                    attribute: "supportsFiles"
                },
                shouldPreExpandNodes: {
                    attribute: "shouldPreExpandNodes"
                },
                connectionType: {
                    value: 4 /* sasAttachedService */
                }
            }
        }
    };
    return AzureSASStorageConfig;
});

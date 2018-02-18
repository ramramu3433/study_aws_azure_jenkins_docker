/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureExternalStorageAccountConfig = (function () {
        function AzureExternalStorageAccountConfig() {
        }
        return AzureExternalStorageAccountConfig;
    }());
    AzureExternalStorageAccountConfig.Config = {
        aliases: [AzureConstants.resourceTypes.ExternalStorageAccounts],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        parentType: AzureConstants.resourceTypes.ExternalStorageAccountsV2ResourceType,
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountIcon,
        supported: true,
        status: {
            attribute: "status"
        },
        highlightLocations: {
            attribute: "highlightLocations"
        },
        properties: [
            {
                displayName: { value: "Permissions" },
                binding: { attribute: "permissions" }
            }
        ],
        loaders: [],
        childrenQuery: {
            namespace: "Azure.Producers.Storage.GetGroupNodes",
            boundArguments: {
                connectionString: {
                    attribute: "connectionString"
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
                supportsFiles: {
                    attribute: "supportsFiles"
                },
                shouldPreExpandNodes: {
                    attribute: "shouldPreExpandNodes"
                },
                connectionType: {
                    attribute: "connectionType"
                },
                permissions: {
                    attribute: "permissions"
                }
            }
        },
        actions: [
            {
                // Localize
                displayName: {
                    value: "Detach"
                },
                isDefault: false,
                namespace: "Azure.Actions.Storage.detachStorageAccount",
                visible: {
                    attribute: "isAttachedAccount"
                },
                boundArguments: {
                    storageAccountName: {
                        attribute: "name"
                    },
                    isAttachedAccount: {
                        attribute: "isAttachedAccount"
                    },
                    connectionString: {
                        attribute: "connectionString"
                    },
                    endpointsDomain: {
                        attribute: "endpointsDomain"
                    },
                    connectionType: {
                        attribute: "connectionType"
                    }
                }
            }
        ]
    };
    return AzureExternalStorageAccountConfig;
});

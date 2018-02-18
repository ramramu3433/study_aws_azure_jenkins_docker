/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Config/AzureBlobContainerPiecesConfig", "Providers/Common/AzureConstants", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Common/AzureStorageConstants"], function (require, exports, AzureBlobContainerPiecesConfig_1, AzureConstants, AzureStorageConnectionTypeConfig_1, AzureStorageConstants) {
    "use strict";
    var AzureBlobContainerConfig = (function () {
        function AzureBlobContainerConfig() {
        }
        return AzureBlobContainerConfig;
    }());
    /**
     * A blob container attached via subscription or account name/key (not service or account SAS)
     */
    AzureBlobContainerConfig.SubscriptionOrKey = {
        aliases: [AzureStorageConstants.nodeTypes.blobContainer],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureBlobContainerPiecesConfig_1.default.Common.aliases[0],
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Delete.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Rename.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Copy.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.CopyLink.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.SasSapManagement.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.PublicAccessLevel.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Leases.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.LastModified.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.PinToQuickAccess.aliases[0]
        ]
    };
    /**
     * A blob container attached via an account SAS, not a service SAS
     */
    AzureBlobContainerConfig.InSasAccount = {
        aliases: [AzureStorageConstants.nodeTypes.blobContainerInSasAccount],
        inherits: [
            // This includes a default icon, so must come first
            AzureConstants.baseTypes.ResourceRefreshAction,
            AzureBlobContainerPiecesConfig_1.default.Common.aliases[0],
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Delete.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Rename.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Copy.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Leases.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.LastModified.aliases[0]
        ],
        properties: [
            {
                displayName: {
                    value: "Shared Access Signature" // Localize
                },
                binding: {
                    attribute: "sharedAccessSignature"
                }
            }
        ]
    };
    /**
     * A blob container attached via a blob service SAS (and not an account SAS)
     */
    AzureBlobContainerConfig.ServiceSas = {
        aliases: [AzureStorageConstants.nodeTypes.sasBlobContainer],
        inherits: [
            // (no refresh)
            AzureBlobContainerPiecesConfig_1.default.Common.aliases[0],
            AzureStorageConnectionTypeConfig_1.default.Config.aliases[0],
            AzureBlobContainerPiecesConfig_1.default.Copy.aliases[0]
        ],
        actions: [
            {
                // Localize
                displayName: {
                    value: "Detach"
                },
                isDefault: false,
                namespace: "Azure.Actions.Storage.detachStorageServiceSAS",
                boundArguments: {
                    name: {
                        attribute: "name"
                    },
                    connectionString: {
                        attribute: "connectionString"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ],
        properties: [
            {
                displayName: {
                    value: "Shared Access Signature" // Localize
                },
                binding: {
                    attribute: "sharedAccessSignature"
                }
            }
        ]
    };
    return AzureBlobContainerConfig;
});

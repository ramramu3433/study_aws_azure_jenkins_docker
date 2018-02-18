/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AzureStorageAttributeLoader"], function (require, exports, AzureStorageAttributeLoader) {
    "use strict";
    /**
     * Provides the getConnectionTypeAttributes loader
     */
    var AzureStorageConnectionTypeConfig = (function () {
        function AzureStorageConnectionTypeConfig() {
        }
        return AzureStorageConnectionTypeConfig;
    }());
    // CONSIDER placing these attributes directly into the appropriate nodes by the producer
    /**
     * Given the connectionType attribute, determines all the broken-down attributes that depend on it
     */
    AzureStorageConnectionTypeConfig.Config = {
        aliases: ["Azure.Storage.Pieces.ConnectionTypeLoader"],
        loaders: [
            {
                namespace: AzureStorageAttributeLoader.getConnectionTypeAttributes,
                boundArguments: {
                    connectionType: {
                        attribute: "connectionType"
                    }
                },
                provides: [
                    // Found on all storage container-level nodes.  True if the node is a service-SAS-attached node (e.g.,
                    //   a blob container attached via SAS, otherwise false.
                    "hasAccountSas",
                    // Found on all storage container-level nodes.  True if the node is inside a SAS-attached storage account node (e.g.,
                    //   a blob container inside an account node attached via SAS), otherwise false.
                    "hasServiceSas",
                    // Found on all storage container-level nodes.  True if that the account containing this node has access to an account name and key
                    // (which includes subscription nodes, external-attached nodes [since we can ask Azure for the key/name], and development nodes),
                    // otherwise false.
                    "hasAccountKey",
                    // Found on all storage container-level nodes.  True if the account containing this node is the emulator, otherwise false.
                    "isDevelopment",
                    // Found on all storage container-level nodes.  True if the account containing this node is external with key
                    // (i.e., if it's attached with name and key), otherwise false.
                    "isExternalWithKey",
                    // Found on all storage container-level nodes.  True if the account containing this node is subscription-based, otherwise false.
                    "hasSubscription"
                ]
            }
        ]
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AzureStorageConnectionTypeConfig;
});

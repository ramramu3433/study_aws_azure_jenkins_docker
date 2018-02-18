/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Utilities"], function (require, exports, Utilities) {
    "use strict";
    var AzureStorageAccountPiecesConfig = (function () {
        function AzureStorageAccountPiecesConfig() {
        }
        return AzureStorageAccountPiecesConfig;
    }());
    AzureStorageAccountPiecesConfig.CopyKey = {
        aliases: ["Azure.Storage.Account.CopyKey"],
        actions: [
            {
                // Localize
                displayName: {
                    value: "Copy Primary Key"
                },
                namespace: "Azure.Actions.Storage.copyPrimaryKeyToClipboard",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    primaryKey: {
                        attribute: "primaryKey"
                    }
                },
                sortIndex: 990
            },
            {
                // Localize
                displayName: {
                    value: "Copy Secondary Key"
                },
                namespace: "Azure.Actions.Storage.copySecondaryKeyToClipboard",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    secondaryKey: {
                        attribute: "secondaryKey"
                    }
                },
                sortIndex: 991
            }
        ]
    };
    return AzureStorageAccountPiecesConfig;
});

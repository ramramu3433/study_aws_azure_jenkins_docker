/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Resources/AzureResources", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureResources, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureFileSharePiecesConfig = (function () {
        function AzureFileSharePiecesConfig() {
        }
        return AzureFileSharePiecesConfig;
    }());
    // Rename
    AzureFileSharePiecesConfig.Rename = {
        aliases: ["Azure.FileShare.Pieces.Rename"],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.FileShare.Rename", namespace: AzureResources.commonNamespace }
                },
                isDefault: false,
                keyboard: [CloudExplorerConstants.keyCodes.F2],
                namespace: "Azure.Actions.Storage.File.renameFileShare",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    id: {
                        attribute: "id"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                },
                visible: {
                    expression: {
                        requires: ["hasServiceSas"],
                        expression: "!hasServiceSas && " + Utilities.isRunningOnElectron()
                    }
                }
            }
        ]
    };
    // Copy
    AzureFileSharePiecesConfig.Copy = {
        aliases: ["Azure.FileShare.Pieces.Copy"],
        actions: [
            {
                // Localize
                displayName: {
                    value: "Copy File Share"
                },
                isDefault: false,
                keyboard: [
                    Utilities.isMac() ? CloudExplorerConstants.keyCodes.MacCommand : CloudExplorerConstants.keyCodes.Ctrl,
                    CloudExplorerConstants.keyCodes.C
                ],
                namespace: "Azure.Actions.Storage.File.copyFileShareToClipboard",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    quota: {
                        attribute: "quota"
                    }
                },
                visible: {
                    value: Utilities.isRunningOnElectron()
                }
            }
        ]
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AzureFileSharePiecesConfig;
});

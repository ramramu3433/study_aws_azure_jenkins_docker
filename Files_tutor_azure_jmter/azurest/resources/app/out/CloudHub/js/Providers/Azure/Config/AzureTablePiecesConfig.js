/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Resources/AzureResources", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureResources, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureTablePiecesConfig = (function () {
        function AzureTablePiecesConfig() {
        }
        return AzureTablePiecesConfig;
    }());
    AzureTablePiecesConfig.Rename = {
        aliases: ["Azure.Table.Base.Rename"],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.Tables.Rename", namespace: AzureResources.commonNamespace }
                },
                isDefault: false,
                visible: {
                    expression: {
                        requires: ["hasServiceSas"],
                        expression: "!hasServiceSas && " + Utilities.isRunningOnElectron()
                    }
                },
                keyboard: [CloudExplorerConstants.keyCodes.F2],
                namespace: "Azure.Actions.Storage.Table.renameTable",
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
                }
            }
        ]
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AzureTablePiecesConfig;
});

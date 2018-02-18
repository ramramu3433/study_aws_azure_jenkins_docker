/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var NodeJSDocumentDBProviderConfig = (function () {
        function NodeJSDocumentDBProviderConfig() {
            this.namespace = "NodeJS.Azure.DocumentDB";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/DocumentDBProvider" // (path relative to app\renderer)
            };
            this.exports = [
                "Azure.openDocumentDBTab",
                // handle all producer requests
                "Azure.documentDBRequest",
                "Azure.Actions.DocumentDB.refreshNode",
                "Azure.Actions.DocumentDB.closeActiveEditor",
                "Azure.Actions.DocumentDB.updateNode",
                "Azure.Actions.DocumentDB.createStoredProcedure",
                "Azure.Actions.DocumentDB.createTrigger",
                "Azure.Actions.DocumentDB.createUDF",
                "Azure.Actions.DocumentDB.createCollection",
                "Azure.Actions.DocumentDB.createDatabase",
                "Azure.Actions.DocumentDB.deleteDatabase",
                "Azure.Actions.DocumentDB.deleteCollection",
                "Azure.Actions.DocumentDB.deleteStoredProcedure",
                "Azure.Actions.DocumentDB.deleteTrigger",
                "Azure.Actions.DocumentDB.deleteUserDefinedFunction",
                "Azure.Actions.DocumentDB.getTokenFromMasterKey",
                "Azure.openDocumentDBDocument",
                "Azure.Actions.DocumentDB.closeCollectionTabs"
            ];
        }
        return NodeJSDocumentDBProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = NodeJSDocumentDBProviderConfig;
});

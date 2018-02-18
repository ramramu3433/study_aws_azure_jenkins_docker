/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var AzureDocumentDBProviderConfig = (function () {
        function AzureDocumentDBProviderConfig() {
            this.namespace = "Azure.CloudExplorer";
            this.requirePath = "Providers/Azure/AzureDocumentDBProvider";
            this.exports = [
                // Actions
                "Azure.Actions.DocumentDB.connectAccount",
                "Azure.Actions.DocumentDB.detachAccount",
                "Azure.Actions.DocumentDB.OpenCreateCollectionDialogAction",
                "Azure.Actions.DocumentDB.OpenPortalBladeAction",
                "Azure.Actions.DocumentDB.OpenFileEditorAction",
                "Azure.Actions.DocumentDB.ValidateScriptNameAction",
                "Azure.Actions.DocumentDB.CreateDatabaseAction",
                "Azure.Actions.DocumentDB.CreateStoredProcedureAction",
                "Azure.Actions.DocumentDB.CreateTriggerAction",
                "Azure.Actions.DocumentDB.CreateUDFAction",
                "Azure.Actions.DocumentDB.safeDeleteDatabase",
                "Azure.Actions.DocumentDB.safeDeleteColection",
                "Azure.Actions.DocumentDB.safeDeleteStoredProcedure",
                "Azure.Actions.DocumentDB.safeDeleteTrigger",
                "Azure.Actions.DocumentDB.safeDeleteUserDefinedFunction",
                // Attributs
                "Azure.Attributes.DocumentDB.GetAttributes",
                "Azure.Attributes.DocumentDB.ListKeys",
                // Producers
                "Azure.Producers.DocumentDB.GetAllDatabases",
                "Azure.Producers.DocumentDB.GetAllDatabasesFromLocal",
                "Azure.Producers.DocumentDB.GetSingleDatabase",
                "Azure.Producers.DocumentDB.GetAllCollections",
                "Azure.Producers.DocumentDB.GetSingleCollection",
                "Azure.Producers.DocumentDB.GetAllDocuments",
                "Azure.Producers.DocumentDB.GetAllStoredProcedures",
                "Azure.Producers.DocumentDB.GetAllUserDefinedFunctions",
                "Azure.Producers.DocumentDB.GetAllTriggers",
                "Azure.Producers.DocumentDB.GetCollectionChildNodes"
            ];
        }
        return AzureDocumentDBProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AzureDocumentDBProviderConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * Contains constants for azure CosmosDB.
     */
    var AzureCosmosDBConstants;
    (function (AzureCosmosDBConstants) {
        AzureCosmosDBConstants.CosmosDBDefaultExperience = {
            DocumentDB: "DocumentDB",
            Table: "Table",
            MongoDB: "MongoDB",
            Graph: "Graph"
        };
        AzureCosmosDBConstants.CosmosDBKind = {
            GlobalDocumentDB: "GlobalDocumentDB",
            MongoDB: "MongoDB"
        };
        AzureCosmosDBConstants.nodeTypes = {
            document: "Azure.DocumentDB.Document",
            database: "Azure.DocumentDB.Database",
            storedProcedure: "Azure.DocumentDB.StoredProcedure",
            storedProcedureGroup: "Azure.DocumentDB.StoredProcedureGroup",
            userDefinedFunction: "Azure.DocumentDB.UserDefinedFunction",
            userDefinedFunctionGroup: "Azure.DocumentDB.UserDefinedFunctionGroup",
            trigger: "Azure.DocumentDB.Trigger",
            triggerGroup: "Azure.DocumentDB.TriggerGroup"
        };
        AzureCosmosDBConstants.resourceTypes = {
            Document: "Document",
            UDF: "UDF",
            Trigger: "Trigger",
            StoredProcedure: "StoredProcedure"
        };
    })(AzureCosmosDBConstants || (AzureCosmosDBConstants = {}));
    return AzureCosmosDBConstants;
});

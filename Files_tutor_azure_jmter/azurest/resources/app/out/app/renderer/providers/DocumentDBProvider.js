"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var DocumentDBManager_1 = require("../Azure/AzureDocumentDB/DocumentDBManager");
var host = global.host;
var documentDBProvider = {
    "Azure.Actions.DocumentDB.deleteUserDefinedFunction": function (args) { return DocumentDBManager_1.default.deleteUserDefinedFunction(args.endpointUrl, args.masterKey, args.resourceSelfLink); },
    "Azure.Actions.DocumentDB.deleteTrigger": function (args) { return DocumentDBManager_1.default.deleteTrigger(args.endpointUrl, args.masterKey, args.resourceSelfLink); },
    "Azure.Actions.DocumentDB.deleteStoredProcedure": function (args) { return DocumentDBManager_1.default.deleteStoredProcedure(args.endpointUrl, args.masterKey, args.resourceSelfLink); },
    "Azure.Actions.DocumentDB.deleteCollection": function (args) { return DocumentDBManager_1.default.deleteCollection(args.endpointUrl, args.masterKey, args.resourceSelfLink); },
    "Azure.Actions.DocumentDB.deleteDatabase": function (args) { return DocumentDBManager_1.default.deleteDatabase(args.endpointUrl, args.masterKey, args.resourceSelfLink); },
    "Azure.documentDBRequest": function (args) { return DocumentDBManager_1.default.handleProducerRequest(args.requestNamespace, args.endpointUrl, args.masterKey, args.resourceSelfLink, args.continuationToken); },
    "Azure.Actions.DocumentDB.createDatabase": function (args) { return DocumentDBManager_1.default.createDatabase(args.documentEndpoint, args.primaryMasterKey, args.newChildName, null); },
    "Azure.Actions.DocumentDB.createCollection": function (args) { return DocumentDBManager_1.default.createCollection(args.documentEndpoint, args.primaryMasterKey, args.databaseSelfLink, args.collectionId, args.offerThroughput, args.partitionKey, null); },
    "Azure.Actions.DocumentDB.createStoredProcedure": function (args) { return DocumentDBManager_1.default.createStoredProcedure(args.documentEndpoint, args.primaryMasterKey, args.selfLink, args.newChildName); },
    "Azure.Actions.DocumentDB.createTrigger": function (args) { return DocumentDBManager_1.default.createTrigger(args.documentEndpoint, args.primaryMasterKey, args.selfLink, args.newChildName); },
    "Azure.Actions.DocumentDB.createUDF": function (args) { return DocumentDBManager_1.default.createUDF(args.documentEndpoint, args.primaryMasterKey, args.selfLink, args.newChildName); },
    "Azure.Actions.DocumentDB.refreshNode": function (args) { return DocumentDBManager_1.default.refreshNode(host, args.selfLink, args.nodeType); },
    "Azure.Actions.DocumentDB.closeActiveEditor": function (args) { return DocumentDBManager_1.default.closeEditor(); },
    "Azure.Actions.DocumentDB.updateNode": function (args) { return DocumentDBManager_1.default.updateNode(host, args.selfLink, args.nodeType, args.attributes); },
    "Azure.Actions.DocumentDB.getTokenFromMasterKey": function (args) { return DocumentDBManager_1.default.getTokenFromMasterKey(args.masterKey, args.text); },
    "Azure.openDocumentDBTab": function (args) { return DocumentDBManager_1.default.openTab(args.endpointUrl, args.authorizationKey, args.resourceSelfLink, args.resourceType, args.openNewTab, args.isNew, args.metadata); },
    "Azure.Actions.DocumentDB.closeCollectionTabs": function (args) { return DocumentDBManager_1.default.closeCollectionTabs(args.selfLink); }
};
module.exports = documentDBProvider;

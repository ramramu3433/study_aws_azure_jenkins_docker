/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore.string", "Providers/Common/AzureConstants", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Providers/Common/AzureCosmosDBConstants", "Common/Utilities", "Common/AzureCosmosDBAccountManager", "Providers/Azure/Producers/ExternalResourceNodeProducer", "es6-promise"], function (require, exports, underscore_string_1, AzureConstants, AzureResourceNodeFactory, AzureCosmosDBConstants, Utilities, AzureCosmosDBAccountManager_1, ExternalResourceNodeProducer, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /* tslint:enable */
    var nodeTypes = AzureCosmosDBConstants.nodeTypes;
    var AzureDocumentDBProducer = (function () {
        function AzureDocumentDBProducer(host, azureConnection) {
            var _this = this;
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getSingleDatabaeNamespace, _this.getSingleDocumentDBDatabase);
                queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getAllDatabaesNamespace, _this.getDocumentDBDatabases);
                queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getAllDatabaesFromLocalNamespace, _this.getDocumentDBDatabasesFromLocal);
                queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getSingleCollectionNamespace, _this.getSingleDocumentDBCollection);
                queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getAllCollectionsNamespace, _this.getDocumentDBCollections);
                if (Utilities.isRunningOnElectron()) {
                    queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getCollectionChildNodesNamespace, _this.getCollectionGroupNodes);
                }
                else {
                    queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getCollectionChildNodesNamespace, _this.getDocumentDBDocuments);
                }
                queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getAllStoredProceduresNamespace, _this.getDocumentDBStoredProcedures);
                queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getAllUserDefinedFunctionsNamespace, _this.getDocumentUserDefinedFunctions);
                queryBindingManager.addProducerBinding(AzureDocumentDBProducer.getAllTriggersNamespace, _this.getDocumentTriggers);
            };
            this.getDocumentTriggers = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getDocumentDBResults(args, continuationToken, "ListTriggers", AzureDocumentDBProducer.getAllDatabaesNamespace, "Triggers", "Azure.DocumentDB.Trigger");
            };
            this.getDocumentUserDefinedFunctions = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getDocumentDBResults(args, continuationToken, "ListUDFs", AzureDocumentDBProducer.getAllDatabaesNamespace, "UserDefinedFunctions", "Azure.DocumentDB.UserDefinedFunction");
            };
            this.getDocumentDBStoredProcedures = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getDocumentDBResults(args, continuationToken, "ListStoredProcedures", AzureDocumentDBProducer.getAllDatabaesNamespace, "StoredProcedures", "Azure.DocumentDB.StoredProcedure");
            };
            this.getCollectionGroupNodes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var collectionGroupNodeData = [];
                var attributes = [];
                Object.keys(args).forEach(function (key) {
                    attributes.push({
                        name: key,
                        value: args[key]
                    });
                });
                attributes.push({
                    name: "collectionId",
                    value: args.id
                });
                var defaultExperience = args.defaultExperience || AzureCosmosDBConstants.CosmosDBDefaultExperience.DocumentDB;
                var documentNode = nodeTypes.document;
                var documentNodeName = _this._getDocumentNodeName(defaultExperience);
                collectionGroupNodeData.push({
                    type: documentNode,
                    name: documentNodeName,
                    attributes: attributes.concat([
                        {
                            name: "nodeUid",
                            value: "Documents"
                        },
                        {
                            name: "nodeType",
                            value: documentNode
                        },
                        {
                            name: "type",
                            value: documentNodeName
                        }
                    ]),
                    uidAttribute: "nodeUid"
                });
                var procedureNode = nodeTypes.storedProcedureGroup;
                collectionGroupNodeData.push({
                    type: procedureNode,
                    name: "Stored Procedures",
                    attributes: attributes.concat([
                        {
                            name: "nodeUid",
                            value: "Stored Procedures"
                        },
                        {
                            name: "nodeType",
                            value: procedureNode
                        },
                        {
                            name: "canAddDeleteStoredProcedures",
                            value: "true"
                        }
                    ]),
                    uidAttribute: "nodeUid"
                });
                var udfNode = nodeTypes.userDefinedFunctionGroup;
                collectionGroupNodeData.push({
                    type: udfNode,
                    name: "User Defined Functions",
                    attributes: attributes.concat([
                        {
                            name: "nodeUid",
                            value: "User Defined Functions"
                        },
                        {
                            name: "nodeType",
                            value: udfNode
                        }
                    ]),
                    uidAttribute: "nodeUid"
                });
                var triggerNode = nodeTypes.triggerGroup;
                collectionGroupNodeData.push({
                    type: triggerNode,
                    name: "Triggers",
                    attributes: attributes.concat([
                        {
                            name: "nodeUid",
                            value: "Triggers"
                        },
                        {
                            name: "nodeType",
                            value: triggerNode
                        }
                    ]),
                    uidAttribute: "nodeUid"
                });
                var documentdbResources = [];
                collectionGroupNodeData.forEach(function (node) {
                    documentdbResources.push({
                        type: node.type,
                        name: node.name,
                        attributes: attributes.concat(node.attributes)
                    });
                });
                return Promise.resolve({
                    results: AzureResourceNodeFactory.convertToNodeCollection(documentdbResources)
                });
            };
            this.getSingleDocumentDBDatabase = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getDocumentDBResults(args, continuationToken, "ListSingleDatabase", AzureDocumentDBProducer.getSingleDatabaeNamespace, "Database", "Azure.DocumentDB.Database");
            };
            this.getDocumentDBDatabases = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                if (!args.defaultExperience && !!args.tags) {
                    args.defaultExperience = _this._getDefaultExperience(args.kind, JSON.parse(args.tags));
                }
                return _this.getDocumentDBResults(args, continuationToken, "ListDatabases", AzureDocumentDBProducer.getAllDatabaesNamespace, "Database", "Azure.DocumentDB.Database");
            };
            this.getDocumentDBDatabasesFromLocal = function (args) {
                if (args === void 0) { args = null; }
                // TODO query cosmosdb emulator
                return Promise.resolve({
                    results: [],
                    continuationToken: null
                });
            };
            this.getSingleDocumentDBCollection = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getDocumentDBResults(args, continuationToken, "ListSingleCollection", AzureDocumentDBProducer.getSingleCollectionNamespace, "Collection", "Azure.DocumentDB.Collection");
            };
            this.getDocumentDBCollections = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getDocumentDBResults(args, continuationToken, "ListCollections", AzureDocumentDBProducer.getAllCollectionsNamespace, "Collection", "Azure.DocumentDB.Collection");
            };
            this.getDocumentDBDocuments = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getDocumentDBResults(args, continuationToken, "ListDocuments", AzureDocumentDBProducer.getAllDocumentsNamespace, "Document", "Azure.DocumentDB.Document");
            };
            this.getDocumentDBResults = function (args, continuationToken, requestNameSpace, getMoreNameSpace, editorNameSpace, nodeType) {
                var documentEndpoint = args.documentEndpoint;
                var primaryMasterKey = args.primaryMasterKey;
                var resourceSelfLink = args.selfLink || null;
                var needSubscription = args.needSubscription;
                return _this._azureConnection.documentdbRequest(requestNameSpace, documentEndpoint, primaryMasterKey, resourceSelfLink, continuationToken)
                    .then(function (response) {
                    // TODO need to get connection string for different default experience of CosmosDB
                    var connectionString = "AccountEndpoint=" + documentEndpoint + ";AccountKey=" + primaryMasterKey + ";";
                    var attributes = [
                        {
                            name: "editorNamespace",
                            value: editorNameSpace
                        },
                        {
                            name: "documentEndpoint",
                            value: documentEndpoint
                        },
                        {
                            name: "primaryMasterKey",
                            value: primaryMasterKey
                        },
                        {
                            name: "accountId",
                            value: args.accountId
                        },
                        {
                            name: "resourceId",
                            value: args.resourceId
                        },
                        {
                            name: "defaultExperience",
                            value: args.defaultExperience
                        },
                        {
                            name: "pricingTier",
                            value: args.pricingTier
                        },
                        {
                            name: "connectionString",
                            value: connectionString
                        },
                        {
                            name: "needSubscription",
                            value: needSubscription
                        }
                    ];
                    switch (editorNameSpace) {
                        case "Collection":
                            attributes.push({
                                name: "databaseId",
                                value: args.id
                            });
                            attributes.push({
                                name: "databaseRid",
                                value: args.documentdbResourceId
                            });
                            break;
                        case "Document":
                            attributes.push({
                                name: "databaseId",
                                value: args.databaseId
                            });
                            attributes.push({
                                name: "collectionId",
                                value: args.id
                            });
                            attributes.push({
                                name: "partitionKeyPath",
                                value: args.partitionKeyPath
                            });
                            attributes.push({
                                name: "partitionKeyKind",
                                value: args.partitionKeyKind
                            });
                            break;
                        case "StoredProcedures":
                        case "Triggers":
                        case "UserDefinedFunctions":
                            attributes.push({
                                name: "collectionSelfLink",
                                value: resourceSelfLink
                            });
                            attributes.push({
                                name: "partitionKeyKind",
                                value: args.partitionKeyKind
                            });
                            break;
                    }
                    var documentdbResources = [];
                    response.documentdbResources.forEach(function (documentdbResource) {
                        var addedAttributes = documentdbResource.attributes.concat([
                            { name: "name", value: documentdbResource.id },
                            { name: "nodeType", value: nodeType }
                        ]);
                        documentdbResources.push({
                            type: nodeType,
                            name: documentdbResource.id,
                            attributes: attributes.concat(addedAttributes)
                        });
                    });
                    return {
                        results: AzureResourceNodeFactory.convertToNodeCollection(documentdbResources),
                        continuationToken: response.continuationToken
                    };
                });
            };
            this.getDevelopmentDocumentDBNode = function (searchQuery) {
                var nodes = [];
                var resources = [{
                        name: "(Development)",
                        type: AzureConstants.resourceTypes.LocalDocumentDBAccounts,
                        attributes: []
                    }];
                resources.forEach(function (resource) {
                    var highlightLocations = Utilities.getHighlightLocations(resource.name, searchQuery);
                    // Add the external resource if there's no search
                    // query, or if the resource contains the search query
                    if (!searchQuery || highlightLocations.length) {
                        var node = ExternalResourceNodeProducer.convertRawDataToNode(resource, searchQuery, highlightLocations);
                        nodes.push(node);
                    }
                });
                return nodes;
            };
            this.getExternalDocumentDBNodes = function (searchQuery, findExactName, searchName) {
                if (searchName === void 0) { searchName = ""; }
                // External storage nodes are only supported in Standalone currently
                if (!Utilities.isRunningOnElectron()) {
                    return Promise.resolve([]);
                }
                var resources = [];
                return AzureCosmosDBAccountManager_1.default.loadStorageAccounts(_this._host).then(function (cachedAccounts) {
                    if (cachedAccounts) {
                        cachedAccounts
                            .filter(function (account) {
                            var isAccountIncluded = false;
                            if (!searchQuery) {
                                isAccountIncluded = true;
                            }
                            else {
                                // There is a search query.
                                var lowerCaseSearchName = searchName && searchName.toLowerCase();
                                var lowerCaseAccountName = account.accountName.toLowerCase();
                                if (findExactName && lowerCaseAccountName === lowerCaseSearchName) {
                                    isAccountIncluded = true;
                                }
                                else if (!findExactName && underscore_string_1.contains(account.accountName, searchQuery)) {
                                    // normal search query
                                    isAccountIncluded = true;
                                }
                            }
                            return isAccountIncluded;
                        })
                            .forEach(function (account) {
                            var rawData = {
                                type: AzureConstants.resourceTypes.ExternalDocumentDBAccounts,
                                name: account.accountName,
                                attributes: [
                                    {
                                        name: "documentEndpoint",
                                        value: account.accountEndpoint
                                    },
                                    {
                                        name: "primaryMasterKey",
                                        value: account.accountKey
                                    },
                                    {
                                        name: "resourceId",
                                        value: account.accountName
                                    },
                                    {
                                        name: "accountId",
                                        value: account.accountName
                                    },
                                    {
                                        name: "id",
                                        value: "attached-account/" + account.accountEndpoint + "/" + account.accountName
                                    },
                                    {
                                        name: "defaultExperience",
                                        value: account.defaultExperience
                                    },
                                    {
                                        name: "isAttachedAccount",
                                        value: true
                                    }
                                ]
                            };
                            resources = resources.concat(rawData);
                        });
                    }
                    return resources;
                }).then(function (rowData) {
                    return _this._getDocumentDBAcountNodes(rowData, findExactName ? searchName : searchQuery);
                });
            };
            this._getDocumentDBAcountNodes = function (resources, searchQuery) {
                var nodes = [];
                resources.forEach(function (resource) {
                    var highlightLocations = Utilities.getHighlightLocations(resource.name, searchQuery);
                    // Add the external resource if there's no search
                    // query, or if the resource contains the search query
                    if (!searchQuery || highlightLocations.length) {
                        var node = ExternalResourceNodeProducer.convertRawDataToNode(resource, searchQuery, highlightLocations);
                        nodes.push(node);
                    }
                });
                return Promise.resolve(nodes);
            };
            this._getDocumentNodeName = function (defaultExperience) {
                switch (defaultExperience) {
                    case AzureCosmosDBConstants.CosmosDBDefaultExperience.MongoDB:
                    case AzureCosmosDBConstants.CosmosDBDefaultExperience.DocumentDB:
                        return "Documents";
                    case AzureCosmosDBConstants.CosmosDBDefaultExperience.Table:
                        return "Entities";
                    case AzureCosmosDBConstants.CosmosDBDefaultExperience.Graph:
                        return "Graph";
                }
                return "Documents";
            };
            this._getDefaultExperience = function (kind, tags) {
                var defaultExperience = tags.defaultExperience || "";
                if (!defaultExperience) {
                    switch (kind) {
                        case AzureCosmosDBConstants.CosmosDBKind.GlobalDocumentDB:
                            defaultExperience = AzureCosmosDBConstants.CosmosDBDefaultExperience.DocumentDB;
                            break;
                        case AzureCosmosDBConstants.CosmosDBKind.MongoDB:
                            defaultExperience = AzureCosmosDBConstants.CosmosDBDefaultExperience.MongoDB;
                            break;
                        default:
                            // set to DocumentDB by default
                            defaultExperience = AzureCosmosDBConstants.CosmosDBDefaultExperience.DocumentDB;
                    }
                }
                return defaultExperience;
            };
            this._host = host;
            this._azureConnection = azureConnection;
        }
        return AzureDocumentDBProducer;
    }());
    AzureDocumentDBProducer.getSingleDatabaeNamespace = "Azure.Producers.DocumentDB.GetSingleDatabase";
    AzureDocumentDBProducer.getAllDatabaesNamespace = "Azure.Producers.DocumentDB.GetAllDatabases";
    AzureDocumentDBProducer.getAllDatabaesFromLocalNamespace = "Azure.Producers.DocumentDB.GetAllDatabasesFromLocal";
    AzureDocumentDBProducer.getSingleCollectionNamespace = "Azure.Producers.DocumentDB.GetSingleCollection";
    AzureDocumentDBProducer.getAllCollectionsNamespace = "Azure.Producers.DocumentDB.GetAllCollections";
    AzureDocumentDBProducer.getAllDocumentsNamespace = "Azure.Producers.DocumentDB.GetAllDocuments";
    AzureDocumentDBProducer.getAllStoredProceduresNamespace = "Azure.Producers.DocumentDB.GetAllStoredProcedures";
    AzureDocumentDBProducer.getAllUserDefinedFunctionsNamespace = "Azure.Producers.DocumentDB.GetAllUserDefinedFunctions";
    AzureDocumentDBProducer.getAllTriggersNamespace = "Azure.Producers.DocumentDB.GetAllTriggers";
    AzureDocumentDBProducer.getCollectionChildNodesNamespace = "Azure.Producers.DocumentDB.GetCollectionChildNodes";
    return AzureDocumentDBProducer;
});

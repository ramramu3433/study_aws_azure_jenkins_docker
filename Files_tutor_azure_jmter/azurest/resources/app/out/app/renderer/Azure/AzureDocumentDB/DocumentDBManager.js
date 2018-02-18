"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var buffer = require("buffer");
var crypto = require("crypto");
var ThemeManager_1 = require("../../UI/ThemeManager");
var ShellViewModel_1 = require("../../UI/ShellViewModel");
var documentdb = require("documentdb");
var Q = require("q");
var HostProxyMarshaler_1 = require("../../marshalers/HostProxyMarshaler");
var telemetryMarshaler = require("../../marshalers/TelemetryMarshaler");
var IsolatedEnvironment_1 = require("../../UI/Tabs/IsolatedEnvironment");
var Buffer = buffer.Buffer;
var DocumentDBManager = (function () {
    function DocumentDBManager() {
    }
    DocumentDBManager.deleteCollection = function (endpointUrl, masterKey, collectionSelfLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.deleteCollection(collectionSelfLink, function (error, resource, headers) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(true);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.deleteUserDefinedFunction = function (endpointUrl, masterKey, udfSelfLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.deleteUserDefinedFunction(udfSelfLink, function (error, resource, headers) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(true);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.deleteTrigger = function (endpointUrl, masterKey, triggerSelfLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.deleteTrigger(triggerSelfLink, function (error, resource, headers) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(true);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.deleteStoredProcedure = function (endpointUrl, masterKey, storedProcedureSelfLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.deleteStoredProcedure(storedProcedureSelfLink, function (error, resource, headers) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(true);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.deleteDatabase = function (endpointUrl, masterKey, databaseSelfLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.deleteDatabase(databaseSelfLink, function (error, resource, headers) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(true);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.handleProducerRequest = function (requestNamespace, endpointUrl, masterKey, resourceSelfLink, continuationToken) {
        switch (requestNamespace) {
            case "ListSingleDatabase":
                return DocumentDBManager.listSingleDatabase(endpointUrl, masterKey, resourceSelfLink);
            case "ListDatabases":
                return DocumentDBManager.listDatabases(endpointUrl, masterKey);
            case "ListSingleCollection":
                return DocumentDBManager.ListSingleCollection(endpointUrl, masterKey, resourceSelfLink);
            case "ListCollections":
                return DocumentDBManager.listCollections(endpointUrl, masterKey, resourceSelfLink);
            case "ListStoredProcedures":
                return DocumentDBManager.listStoredProcedures(endpointUrl, masterKey, resourceSelfLink);
            case "ListUDFs":
                return DocumentDBManager.listUDFs(endpointUrl, masterKey, resourceSelfLink);
            case "ListTriggers":
                return DocumentDBManager.listTriggers(endpointUrl, masterKey, resourceSelfLink);
            default:
                return Q.reject("Invalid container type");
        }
    };
    DocumentDBManager.getOrCreateDatabaseAndCollection = function (endpoint, authKey, databaseId, collectionId, offerThroughput, rupm, partitionKey, options) {
        var deferred = Q.defer();
        DocumentDBManager.getDocumentClient(endpoint, authKey).then(function (client) {
            DocumentDBManager.getDatabase(client, databaseId, options)
                .then(function (existingDatabase) {
                if (deferred.promise.isRejected() === true) {
                    return;
                }
                if (existingDatabase) {
                    DocumentDBManager.createCollection(endpoint, authKey, existingDatabase._self, collectionId, offerThroughput, partitionKey, options)
                        .then(function (collection) {
                        deferred.resolve(collection);
                    }, function (_createCollectionError) {
                        deferred.reject(_createCollectionError);
                    });
                    return;
                }
                DocumentDBManager.createDatabase(endpoint, authKey, databaseId, options)
                    .then(function (createdDatabase) {
                    if (deferred.promise.isRejected() === true) {
                        return;
                    }
                    // get collection fails with HTTP 401 for new databases, so directly create collection
                    DocumentDBManager.createCollection(endpoint, authKey, createdDatabase._self, collectionId, offerThroughput, partitionKey, options)
                        .then(function (collection) {
                        deferred.resolve(collection);
                    }, function (_createCollectionError) {
                        deferred.reject(_createCollectionError);
                    });
                }, function (_createDatabaseError) {
                    deferred.reject(_createDatabaseError);
                    return null;
                });
            }, function (_getDatabaseError) {
                deferred.reject(_getDatabaseError);
                return null;
            });
        });
        return deferred.promise;
    };
    DocumentDBManager.getDatabase = function (client, databaseId, options) {
        var deferred = Q.defer();
        var querySpec = {
            query: "SELECT * FROM root r WHERE r.id= @id",
            parameters: [{
                    name: "@id",
                    value: databaseId
                }]
        };
        client.queryDatabases(querySpec, options).toArray(function (queryDatabasesError, results) {
            if (queryDatabasesError) {
                deferred.reject(queryDatabasesError);
                return;
            }
            if (results.length > 0) {
                deferred.resolve(results[0]);
            }
            else {
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    };
    DocumentDBManager.getCollection = function (client, database, collectionId, options) {
        var deferred = Q.defer();
        var querySpec = {
            query: "SELECT * FROM root r WHERE r.id=@id",
            parameters: [{
                    name: "@id",
                    value: collectionId
                }]
        };
        client.queryCollections(database, querySpec, options).toArray(function (queryCollectionsError, results) {
            if (queryCollectionsError) {
                deferred.reject(queryCollectionsError);
                return;
            }
            if (results.length > 0) {
                deferred.resolve(results[0]);
            }
            else {
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    };
    DocumentDBManager.createDatabase = function (endpoint, masterKey, databaseId, options) {
        return DocumentDBManager.getDocumentClient(endpoint, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.createDatabase({ id: databaseId }, options, function (createDatabaseError, created) {
                if (createDatabaseError) {
                    deferred.reject(createDatabaseError);
                }
                else {
                    deferred.resolve(created);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.createCollection = function (endpoint, masterKey, database, collectionId, offerThroughput, partitionKey, options) {
        options = options || {};
        options.offerThroughput = offerThroughput;
        var collectionBody = {
            id: collectionId,
            partitionKey: (partitionKey) ? partitionKey : undefined
        };
        return DocumentDBManager.getDocumentClient(endpoint, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.createCollection(database, collectionBody, options, function (createCollectionError, createdCollection) {
                if (createCollectionError) {
                    deferred.reject(createCollectionError);
                }
                else {
                    deferred.resolve(createdCollection);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.createStoredProcedure = function (documentEndpoint, primaryMasterKey, selfLink, newChildName) {
        return DocumentDBManager.getDocumentClient(documentEndpoint, primaryMasterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.createStoredProcedure(selfLink, { id: newChildName, body: "function storedProcedure(){}" }, null, function (err, result, header) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(result);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.createTrigger = function (documentEndpoint, primaryMasterKey, selfLink, newChildName) {
        return DocumentDBManager.getDocumentClient(documentEndpoint, primaryMasterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.createTrigger(selfLink, { id: newChildName, body: "function trigger(){}", triggerOperation: "All", triggerType: "Pre" }, null, function (err, result, header) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(result);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.createUDF = function (documentEndpoint, primaryMasterKey, selfLink, newChildName) {
        return DocumentDBManager.getDocumentClient(documentEndpoint, primaryMasterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.createUserDefinedFunction(selfLink, { id: newChildName, body: "function userDefinedFunction(){}" }, null, function (err, result, header) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(result);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.listSingleDatabase = function (endpointUrl, masterKey, databaseSelflink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.readDatabase(databaseSelflink, function (error, database, headers) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve({
                        documentdbResources: DocumentDBManager.createDoucmentDBResources([database]),
                        continuationToken: null
                    });
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.listDatabases = function (endpointUrl, masterKey) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            var iterator = documentClient.readDatabases(null);
            iterator.toArray(function (error, databases, headers) {
                if (!error) {
                    deferred.resolve({
                        documentdbResources: DocumentDBManager.createDoucmentDBResources(databases),
                        continuationToken: null
                    });
                }
                else {
                    deferred.reject(error);
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.ListSingleCollection = function (endpointUrl, masterKey, collectionLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            documentClient.readCollection(collectionLink, function (error, collection, headers) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    var attributes = [
                        {
                            name: "selfLink",
                            value: collection._self
                        },
                        {
                            name: "id",
                            value: collection.id
                        },
                        {
                            name: "partitionKeyKind",
                            value: !!collection.partitionKey ? collection.partitionKey.kind : null
                        },
                        {
                            name: "partitionKeyPath",
                            value: !!collection.partitionKey && !!collection.partitionKey.paths && collection.partitionKey.paths.length > 0
                                ? collection.partitionKey.paths[0] : null
                        }
                    ];
                    var resource = [{
                            id: collection.id,
                            attributes: attributes
                        }];
                    deferred.resolve({
                        documentdbResources: resource,
                        continuationToken: null
                    });
                }
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.listCollections = function (endpointUrl, masterKey, databaseLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            var iterator = documentClient.readCollections(databaseLink);
            iterator.toArray(function (error, collections, headers) {
                var resources = [];
                collections.forEach(function (collection) {
                    var attributes = [
                        {
                            name: "selfLink",
                            value: collection._self
                        },
                        {
                            name: "id",
                            value: collection.id
                        },
                        // TODO remove the partitionKeyKind and partitionKeyPath
                        {
                            name: "partitionKeyKind",
                            value: !!collection.partitionKey ? collection.partitionKey.kind : null
                        },
                        {
                            name: "partitionKeyPath",
                            value: !!collection.partitionKey && !!collection.partitionKey.paths && collection.partitionKey.paths.length > 0
                                ? collection.partitionKey.paths[0] : null
                        },
                        {
                            name: "partitionKey",
                            value: JSON.stringify(collection.partitionKey)
                        },
                        {
                            name: "defaultTtl",
                            value: collection.defaultTtl
                        },
                        {
                            name: "indexingPolicy",
                            value: JSON.stringify(collection.indexingPolicy)
                        }
                    ];
                    resources.push({
                        id: collection.id,
                        attributes: attributes
                    });
                });
                deferred.resolve({
                    documentdbResources: resources,
                    continuationToken: null
                });
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.listStoredProcedures = function (endpointUrl, masterKey, resourceSelfLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            var iterator = documentClient.readStoredProcedures(resourceSelfLink, null);
            iterator.toArray(function (error, storedProcedures, headers) {
                var resources = [];
                storedProcedures.forEach(function (storedProcedure) {
                    resources.push({
                        id: storedProcedure.id,
                        attributes: [
                            {
                                name: "selfLink",
                                value: storedProcedure._self
                            },
                            {
                                name: "id",
                                value: storedProcedure.id
                            },
                            {
                                name: "body",
                                value: storedProcedure.body
                            }
                        ]
                    });
                });
                deferred.resolve({
                    documentdbResources: resources,
                    continuationToken: null
                });
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.listUDFs = function (endpointUrl, masterKey, resourceSelfLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            var iterator = documentClient.readUserDefinedFunctions(resourceSelfLink, null);
            iterator.toArray(function (error, UDFs, headers) {
                var resources = [];
                // The `body` field is missing in `UserDefinedFunctionMeta` of documentdb DTS file. We need to define `udf` as `any`
                UDFs.forEach(function (udf) {
                    resources.push({
                        id: udf.id,
                        attributes: [
                            {
                                name: "id",
                                value: udf.id
                            },
                            {
                                name: "selfLink",
                                value: udf._self
                            },
                            {
                                name: "body",
                                value: udf.body
                            }
                        ]
                    });
                });
                deferred.resolve({
                    documentdbResources: resources,
                    continuationToken: null
                });
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.listTriggers = function (endpointUrl, masterKey, resourceSelfLink) {
        return DocumentDBManager.getDocumentClient(endpointUrl, masterKey).then(function (documentClient) {
            var deferred = Q.defer();
            var iterator = documentClient.readTriggers(resourceSelfLink, null);
            iterator.toArray(function (error, triggers, headers) {
                var resources = [];
                triggers.forEach(function (trigger) {
                    resources.push({
                        id: trigger.id,
                        attributes: [
                            {
                                name: "selfLink",
                                value: trigger._self
                            },
                            {
                                name: "id",
                                value: trigger.id
                            },
                            {
                                name: "body",
                                value: trigger.body
                            },
                            {
                                name: "triggerOperation",
                                value: trigger.triggerOperation
                            },
                            {
                                name: "triggerType",
                                value: trigger.triggerType
                            }
                        ]
                    });
                });
                deferred.resolve({
                    documentdbResources: resources,
                    continuationToken: null
                });
            });
            return deferred.promise;
        });
    };
    DocumentDBManager.createDoucmentDBResources = function (queueResults) {
        var resources = [];
        if (queueResults) {
            queueResults.forEach(function (queueResult) {
                resources.push({
                    id: queueResult.id,
                    attributes: [
                        {
                            name: "selfLink",
                            value: queueResult._self
                        },
                        {
                            name: "id",
                            value: queueResult.id
                        }
                    ]
                });
            });
        }
        return resources;
    };
    DocumentDBManager.getDocumentClient = function (endpointUrl, masterKey) {
        if (!endpointUrl || !masterKey) {
            // Localize
            var err = "Cannot connect to this CosmosDB account. " +
                "The account may in create or delete process. " +
                "Please refresh the accounts list later and try again.";
            return Promise.reject(err);
        }
        var auth = {
            masterKey: masterKey
        };
        return Promise.resolve(new documentdb.DocumentClient(endpointUrl, auth));
    };
    // TODO move to cosmosdb data explorer
    DocumentDBManager.refreshNode = function (host, selfLink, nodeType) {
        DocumentDBManager._getNodes(host, [{ name: "selfLink", value: selfLink }, { name: "nodeType", value: nodeType }])
            .then(function (queryResult) {
            host.executeOperation("CloudExplorer.ElementInteraction.refreshChildren", {
                queryResult: queryResult
            });
        });
    };
    DocumentDBManager._getNodes = function (host, query) {
        var queryString = DocumentDBManager._convertQueryToQueryString(query);
        return host.executeOperation("CloudExplorer.ElementInteraction.query", {
            selector: queryString
        });
    };
    DocumentDBManager._convertQueryToQueryString = function (query) {
        var queryString = "";
        query.forEach(function (attribute) {
            queryString += "[" + attribute.name + " = \"" + attribute.value + "\"]";
        });
        return queryString;
    };
    DocumentDBManager.closeEditor = function () {
        ShellViewModel_1.default.editorPanelViewModel.closeActiveTab();
    };
    DocumentDBManager.updateNode = function (host, selfLink, nodeType, attributes) {
        DocumentDBManager._getNodes(host, [{ name: "selfLink", value: selfLink }, { name: "nodeType", value: nodeType }])
            .then(function (queryResult) {
            attributes.forEach(function (attribute) {
                host.executeOperation("CloudExplorer.ElementInteraction.setAttribute", {
                    queryResult: queryResult,
                    newAttribute: attribute
                });
            });
        });
    };
    DocumentDBManager.getTokenFromMasterKey = function (masterKey, text) {
        var key = new Buffer(masterKey, "base64");
        var body = new Buffer(text, "utf8");
        var sig = crypto.createHmac("sha256", key).update(body).digest("base64");
        return Promise.resolve("type=master&ver=1.0&sig=" + sig);
    };
    DocumentDBManager.openTab = function (endpoint, masterKey, selfLink, resourceType, openNewTab, isNew, metadata) {
        var parameters = {
            id: metadata.id,
            endpoint: endpoint,
            masterKey: masterKey,
            selfLink: selfLink,
            resourceType: resourceType
        };
        var tabName = metadata.id;
        var iconPath = "";
        var editorNamespace = "";
        switch (resourceType) {
            case "DocumentDB":
            case "MongoDB":
                parameters.partitionKeyKind = metadata.partitionKeyKind;
                parameters.partitionKeyPath = metadata.partitionKeyPath;
                iconPath = "../../CloudHub/images/CloudExplorer/AzureDocumentDBDocument_16x.png";
                editorNamespace = "DocumentDB";
                break;
            case "StoredProcedure":
                parameters.body = metadata.body;
                parameters.isNew = isNew;
                parameters.collectionSelfLink = metadata.collectionSelfLink;
                parameters.scriptName = metadata.id;
                parameters.isPartition = !!metadata.partitionKeyKind;
                iconPath = "../../CloudHub/images/CloudExplorer/AzureDocumentDBStoredProcedure_16x.png";
                editorNamespace = "StoredProcedures";
                break;
            case "Trigger":
                parameters.body = metadata.body;
                parameters.triggerOperation = metadata.triggerOperation;
                parameters.triggerType = metadata.triggerType;
                parameters.isNew = isNew;
                parameters.collectionSelfLink = metadata.collectionSelfLink;
                parameters.scriptName = metadata.id;
                parameters.isPartition = !!metadata.partitionKeyKind;
                iconPath = "../../CloudHub/images/CloudExplorer/AzureDocumentDBTrigger_16x.png";
                editorNamespace = "Triggers";
                break;
            case "UDF":
                parameters.body = metadata.body;
                parameters.isNew = isNew;
                parameters.collectionSelfLink = metadata.collectionSelfLink;
                parameters.scriptName = metadata.id;
                parameters.isPartition = !!metadata.partitionKeyKind;
                iconPath = "../../CloudHub/images/CloudExplorer/AzureDocumentDBUDF_16x.png";
                editorNamespace = "UserDefinedFunctions";
                break;
            case "Settings":
                if (!!metadata.defaultTtl) {
                    parameters.defaultTtl = JSON.parse(metadata.defaultTtl);
                }
                if (!!metadata.indexingPolicy) {
                    parameters.indexingPolicy = JSON.parse(metadata.indexingPolicy);
                }
                if (!!metadata.partitionKey) {
                    parameters.partitionKey = JSON.parse(metadata.partitionKey);
                }
                editorNamespace = "Settings";
                break;
        }
        ThemeManager_1.default.getTheme().then(function (theme) {
            parameters.theme = theme;
            ShellViewModel_1.default.editorPanelViewModel.showTab(tabName, metadata.path, {
                environment: IsolatedEnvironment_1.default.DaytonaIframe,
                iconPath: iconPath,
                nodeID: metadata.target,
                parameters: parameters,
                editorNamespace: editorNamespace,
                source: "./app/renderer/manifests/DocumentDBTab.json",
                marshalers: {
                    "Telemetry": telemetryMarshaler,
                    "HostProxy": HostProxyMarshaler_1.default
                },
                temporaryTab: metadata.source === "singleClick",
                newTab: openNewTab
            });
        });
    };
    DocumentDBManager.closeCollectionTabs = function (selfLink) {
        var tabs = ShellViewModel_1.default.editorPanelViewModel.openTabs();
        var toCloseTabs = tabs.filter(function (tab) {
            return tab.parameters.selfLink === selfLink ||
                tab.parameters.collectionSelfLink === selfLink;
        });
        toCloseTabs.forEach(function (tab) {
            ShellViewModel_1.default.editorPanelViewModel.closeTab(tab);
        });
    };
    return DocumentDBManager;
}());
exports.default = DocumentDBManager;

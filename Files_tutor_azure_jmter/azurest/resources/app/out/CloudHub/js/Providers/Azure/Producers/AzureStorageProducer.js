/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore.string", "es6-promise", "Providers/Common/AzureStorageConstants", "Providers/Common/AzureConstants", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Providers/Common/AzureStorageRequestParameters", "Common/AzureStorageUtilities", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Common/ConnectionString", "Common/Debug", "Providers/Azure/Producers/ExternalResourceNodeProducer", "Common/Errors", "Common/SASResourceType", "Common/Utilities"], function (require, exports, underscore_string_1, es6_promise_1, AzureStorageConstants, AzureConstants, AzureResourceNodeFactory, AzureStorageRequestParameters, AzureStorageUtilities, CloudExplorerActions, ConnectionString_1, Debug, ExternalResourceNodeProducer, Errors, SASResourceType_1, Utilities) {
    "use strict";
    var nodeTypes = AzureStorageConstants.nodeTypes;
    /**
     * A producer that provides query actions to return Azure Resource containers of different types.
     */
    var AzureStorageProducer = (function () {
        function AzureStorageProducer(host, azureStorageManager) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureStorageProducer.getAllQueuesNamespace, _this.getAllQueues);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSingleQueueByNameNamespace, _this.getSingleQueueByName);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getAllBlobContainersNamespace, _this.getAllBlobContainers);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSingleBlobContainerByNameNamespace, _this.getSingleBlobContainerByName);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getAllFileSharesNamespace, _this.getAllFileShares);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSingleFileShareByNameNamespace, _this.getSingleFileShareByName);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getAllTablesNamespace, _this.getAllTables);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSingleTableByNameNamespace, _this.getSingleTableByName);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getGroupNodes, _this.getGroupNodes);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSASGroupNodesNamespace, _this.getSASStorageGroupNodes);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSASBlobContainersNamespace, _this.getSASBlobContainers);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSASFileSharesNamespace, _this.getSASFileShares);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSASQueuesNamespace, _this.getSASQueues);
                queryBindingManager.addProducerBinding(AzureStorageProducer.getSASTablesNamespace, _this.getSASTables);
            };
            /**
             * Gets the group nodes (e.g., Blob Containers, Files Shares...) appropriate for a particular account node
             */
            this.getGroupNodes = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getStorageGroupNodesCore(false, args, continuationToken);
            };
            /**
             * Gets the group nodes (e.g., Blob Containers, Files Shares...) for the "(SAS-Attached Services)" node
             */
            this.getSASStorageGroupNodes = function (args) {
                if (args === void 0) { args = null; }
                return _this.getStorageGroupNodesCore(true, args, null);
            };
            /**
             * Gets all Queues Groups from all subscriptions.
             */
            this.getAllQueues = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getQueuesCore("ListQueues", args, continuationToken);
            };
            this.getSingleQueueByName = function (args) {
                if (args === void 0) { args = null; }
                return _this.getQueuesCore("ListSingleQueueByName", args);
            };
            this.getAllBlobContainers = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getBlobContainersCore("ListBlobContainers", args, continuationToken);
            };
            this.getSingleBlobContainerByName = function (args) {
                if (args === void 0) { args = null; }
                return _this.getBlobContainersCore("ListSingleBlobContainerByName", args);
            };
            this.getAllFileShares = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getFileSharesCore("ListFileShares", args, continuationToken);
            };
            this.getSingleFileShareByName = function (args) {
                if (args === void 0) { args = null; }
                return _this.getFileSharesCore("ListSingleFileShareByName", args);
            };
            this.getAllTables = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                return _this.getTablesCore("ListTables", args, continuationToken);
            };
            this.getSingleTableByName = function (args) {
                if (args === void 0) { args = null; }
                return _this.getTablesCore("ListSingleTableByName", args);
            };
            this.getStorageAccountResult = function (connectionString, sas, continuationToken, requestNameSpace, getMoreNameSpace, editorNameSpace, nodeType, id, searchQuery, extraAttributes, numberOfResults, subscription) {
                if (!connectionString) {
                    // Localize
                    return es6_promise_1.Promise.resolve({
                        results: [],
                        // We have to pass a generic object instead of an Error object,
                        // because Error objects can't be serialized across iframes.
                        error: {
                            name: Errors.errorNames.DisplayableError,
                            message: "Could not obtain keys for Storage Account." +
                                " Please check that you have the correct permissions."
                        }
                    });
                }
                var parameters = new AzureStorageRequestParameters();
                parameters.requestNamespace = requestNameSpace;
                parameters.connectionString = connectionString;
                parameters.searchQuery = searchQuery;
                parameters.continuationToken = continuationToken;
                parameters.numberOfResults = numberOfResults;
                return _this._azureConnection.storageRequest(parameters)
                    .then(function (response) {
                    var continuationToken = response.continuationToken;
                    var storageResources = [];
                    var attributes = [
                        { name: "connectionString", value: connectionString },
                        { name: "editorNamespace", value: editorNameSpace },
                        { name: "id", value: id },
                        { name: "sharedAccessSignature", value: sas },
                        { name: "subscription", value: subscription }
                    ];
                    if (extraAttributes) {
                        attributes = attributes.concat(extraAttributes);
                    }
                    response.storageResources.forEach(function (storageResource) {
                        var addedAttributes = storageResource.attributes.concat([
                            { name: "name", value: storageResource.name },
                            { name: "nodeType", value: nodeType }
                        ]);
                        storageResources.push({
                            type: nodeType,
                            name: storageResource.name,
                            attributes: attributes.concat(addedAttributes),
                            uidAttribute: "url"
                        });
                    });
                    return {
                        // localize
                        noResultsString: null,
                        results: AzureResourceNodeFactory.convertToNodeCollection(storageResources, searchQuery),
                        continuationToken: continuationToken
                    };
                }, function (err) {
                    var errorToThrow = err;
                    if (err.name === "StorageEmulatorNotAvailable") {
                        errorToThrow = new Errors.TryableActionError(err, "Azure Storage Emulator is not installed.", "Download the latest version", CloudExplorerActions.openUrlNamespace, {
                            url: "https://go.microsoft.com/fwlink/?LinkID=618667"
                        });
                    }
                    else if (err.name === "VersionNotSupportedByEmulator") {
                        errorToThrow = new Errors.TryableActionError(err, "The REST version of this request is not supported by this release of the Storage Emulator." +
                            " Please upgrade the storage emulator to the latest version.", "Download the latest version", CloudExplorerActions.openUrlNamespace, {
                            url: "https://go.microsoft.com/fwlink/?LinkID=618667"
                        });
                    }
                    else if (err.name === "AuthenticationFailedError" || err.name === "AuthorizationServiceMismatch") {
                        errorToThrow = new Errors.DisplayableError(err.message, err);
                    }
                    throw errorToThrow;
                });
            };
            this.getSASBlobContainers = function (args) {
                if (args === void 0) { args = null; }
                return _this.getSASResources(args.searchQuery, "SASBlobContainers", "BlobContainer", nodeTypes.sasBlobContainer);
            };
            this.getSASFileShares = function (args) {
                if (args === void 0) { args = null; }
                return _this.getSASResources(args.searchQuery, "SASFileShares", "FileShare", nodeTypes.sasFileShare);
            };
            this.getSASQueues = function (args) {
                if (args === void 0) { args = null; }
                return _this.getSASResources(args.searchQuery, "SASQueues", "Queue", nodeTypes.sasQueue);
            };
            this.getSASTables = function (args) {
                if (args === void 0) { args = null; }
                return _this.getSASResources(args.searchQuery, "SASTables", "Table", nodeTypes.sasTable);
            };
            this.getSASResources = function (searchQuery, requestNameSpace, editorNamespace, nodeType) {
                // Get the SAS resource type associated with the node type.
                var sasResourceType;
                switch (nodeType) {
                    case nodeTypes.sasBlobContainer:
                        sasResourceType = SASResourceType_1.default.blob;
                        break;
                    case nodeTypes.sasFileShare:
                        sasResourceType = SASResourceType_1.default.file;
                        break;
                    case nodeTypes.sasQueue:
                        sasResourceType = SASResourceType_1.default.queue;
                        break;
                    case nodeTypes.sasTable:
                        sasResourceType = SASResourceType_1.default.table;
                        break;
                }
                // Load the SAS services from persistent storage
                return AzureStorageUtilities.loadStorageServiceSASResources(_this._host, sasResourceType)
                    .then(function (cachedResources) {
                    if (cachedResources && cachedResources.length) {
                        var containers = [];
                        cachedResources.forEach(function (resource) {
                            var connectionString = ConnectionString_1.default.createFromSAS(sasResourceType, resource);
                            var reference = {
                                connectionString: connectionString,
                                name: resource.resourceName
                            };
                            containers.push(reference);
                        });
                        // Retrieve nodes for each of the SAS services that were persisted
                        return _this.getSASStorageResult(requestNameSpace, editorNamespace, nodeType, containers, searchQuery);
                    }
                    else {
                        return es6_promise_1.Promise.resolve({ results: [] });
                    }
                });
            };
            /**
             * Retrieves a result for a service SAS node
             */
            this.getSASStorageResult = function (requestNameSpace, editorNameSpace, nodeType, references, searchQuery) {
                if (searchQuery === void 0) { searchQuery = null; }
                var extraAttributes = [
                    { name: "hasServiceSas", value: true },
                    { name: "connectionType", value: 4 /* sasAttachedService */ }
                ];
                // Package up our references into a fake connection string. It gets unpackaged in CommonStorageManager.listContainersSegmented().
                // TODO: Clean up the APIs so we don't have to do this (probably separate storageRequest action into 2 actions).
                var fakeConnectionString = JSON.stringify(references);
                return _this.getStorageAccountResult(fakeConnectionString, null, // sas
                null, requestNameSpace, null, editorNameSpace, nodeType, null, searchQuery, extraAttributes);
            };
            this.getDevelopmentStorageAccountNode = function (searchQuery) {
                var nodes = [];
                // Development storage (i.e., storage emulator) is only supported on windows currently.
                if (!Utilities.isWin()) {
                    return nodes;
                }
                var resources = [{
                        name: "(Development)",
                        type: AzureConstants.resourceTypes.LocalStorageAccounts,
                        attributes: [
                            {
                                name: "supportsBlobs",
                                value: true
                            },
                            {
                                name: "supportsQueues",
                                value: true
                            },
                            {
                                name: "supportsTables",
                                value: true
                            },
                            {
                                name: "supportsFiles",
                                value: true
                            },
                            {
                                name: "highlightLocations",
                                value: null
                            },
                            {
                                name: "connectionType",
                                value: 5 /* development */
                            }
                        ]
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
            this.getExternalStorageAccountNodes = function (searchQuery, findExactName, searchName) {
                if (searchName === void 0) { searchName = ""; }
                // External storage nodes are only supported in Standalone currently
                if (!Utilities.isRunningOnElectron()) {
                    return es6_promise_1.Promise.resolve([]);
                }
                var resources = [];
                return AzureStorageUtilities.loadStorageAccounts(_this._host, AzureStorageUtilities.sessionKeyOfStorageAccounts)
                    .then(function (cachedStorageAccounts) {
                    if (cachedStorageAccounts) {
                        cachedStorageAccounts
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
                            var extraAttributes = AzureStorageUtilities.getExternalAccountAttributes(account);
                            var rawData = AzureStorageUtilities.wrapStorageAccountRawData(
                            /*resourceType*/ AzureConstants.resourceTypes.ExternalStorageAccounts, 
                            /*displayName*/ account.accountName, extraAttributes);
                            rawData.uidAttribute = "nodeUid";
                            resources = resources.concat(rawData);
                        });
                    }
                    return resources;
                }).then(function (rawData) {
                    return _this.getStorageAccountNodes(resources, findExactName ? searchName : searchQuery);
                });
            };
            this.getStorageAccountNodes = function (resources, searchQuery) {
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
                return es6_promise_1.Promise.resolve(nodes);
            };
            /**
             * Retrieves the "(Sas-Attached Services)" node
             */
            this.getServiceSASNode = function (searchQuery, findExactName, searchName) {
                if (searchName === void 0) { searchName = ""; }
                // Service SAS storage nodes are only supported in Standalone currently
                if (!Utilities.isRunningOnElectron()) {
                    return es6_promise_1.Promise.resolve([]);
                }
                var displayName = "(SAS-Attached Services)"; // Localize
                var extraAttributes = [
                    { name: "connectionType", value: 4 /* sasAttachedService */ },
                    { name: "nodeType", value: AzureConstants.resourceTypes.SASStorage }
                ];
                var resources = [AzureStorageUtilities.wrapStorageAccountRawData(AzureConstants.resourceTypes.SASStorage, displayName, extraAttributes)];
                return _this.getStorageAccountNodes(resources, findExactName ? searchName : searchQuery);
            };
            this._host = host;
            this._azureConnection = azureStorageManager;
        }
        AzureStorageProducer.prototype.getStorageGroupNodesCore = function (isSas, args, continuationToken) {
            if (args === void 0) { args = null; }
            if (continuationToken === void 0) { continuationToken = null; }
            var connectionString = args.connectionString;
            var storageAccountId = args.id;
            var storageSupportsBlobs = args.supportsBlobs;
            var storageSupportsQueues = args.supportsQueues;
            var storageSupportsTables = args.supportsTables;
            var storageSupportsFiles = args.supportsFiles;
            var searchQuery = args.searchQuery;
            var shouldPreExpandNodes = args.shouldPreExpandNodes;
            var connectionType = args.connectionType;
            var subscription = args.subscription;
            Debug.assert(connectionType, "Missing connectionType");
            var promises = [];
            var attributes;
            if (isSas) {
                attributes = [
                    { name: "searchQuery", value: searchQuery },
                    { name: "connectionType", value: connectionType }
                ];
            }
            else {
                attributes = [
                    {
                        name: "connectionString",
                        value: connectionString
                    },
                    {
                        name: "id",
                        value: storageAccountId
                    },
                    {
                        name: "searchQuery",
                        value: searchQuery
                    },
                    {
                        name: "connectionType",
                        value: connectionType
                    },
                    {
                        name: "subscription",
                        value: subscription
                    }
                ];
            }
            var storageGroupNodeData = [];
            if (storageSupportsBlobs) {
                var nodeType = isSas ? nodeTypes.sasBlobContainerGroup : nodeTypes.blobContainerGroup;
                storageGroupNodeData.push({
                    type: nodeType,
                    name: "Blob Containers",
                    attributes: attributes.concat([
                        {
                            name: "nodeUid",
                            value: "Blob Containers"
                        },
                        {
                            name: "nodeType",
                            value: nodeType
                        }
                    ]),
                    uidAttribute: "nodeUid"
                });
            }
            if (storageSupportsFiles) {
                var nodeType = isSas ? nodeTypes.sasFileShareGroup : nodeTypes.fileShareGroup;
                storageGroupNodeData.push({
                    type: nodeType,
                    name: "File Shares",
                    attributes: attributes.concat([
                        {
                            name: "nodeUid",
                            value: "File Shares"
                        },
                        {
                            name: "nodeType",
                            value: nodeType
                        }
                    ]),
                    uidAttribute: "nodeUid"
                });
            }
            if (storageSupportsQueues) {
                var nodeType = isSas ? nodeTypes.sasQueueGroup : nodeTypes.queueGroup;
                storageGroupNodeData.push({
                    type: nodeType,
                    name: "Queues",
                    attributes: attributes.concat([
                        {
                            name: "nodeUid",
                            value: "Queues"
                        },
                        {
                            name: "nodeType",
                            value: nodeType
                        }
                    ]),
                    uidAttribute: "nodeUid"
                });
            }
            var tableNodeType = isSas ? nodeTypes.sasTableGroup : nodeTypes.tableGroup;
            var showTablesPromise = es6_promise_1.Promise.resolve(false);
            var tableNodes;
            if (storageSupportsTables) {
                showTablesPromise = es6_promise_1.Promise.resolve(true);
            }
            else {
                // The account doesn't officially support tables (e.g., it's Blob Storage
                // or a premium account), but it can still have metrics tables created by Azure.
                // So we will show the node only if it has an table endpoint and any metrics tables.
                var connectionStringObject = new ConnectionString_1.default(connectionString);
                var hasNoTableEndpoint = connectionStringObject.containsSAS()
                    && !(connectionStringObject.values[AzureStorageConstants.connectionStringKeys.tableEndpoint]);
                if (hasNoTableEndpoint) {
                    // We'll get an uncatchable exception from the client library if the connection string is a SAS account and
                    // it doesn't have a table endpoint, so don't try.
                    showTablesPromise = es6_promise_1.Promise.resolve(false);
                }
                else {
                    showTablesPromise = this.getAllTables(args, continuationToken)
                        .then(function (result) {
                        tableNodes = result.results;
                        return !!tableNodes.length;
                    })
                        .catch(function (error) { return false; });
                }
            }
            promises.push(showTablesPromise.then(function (showTables) {
                if (showTables) {
                    var node = {
                        type: tableNodeType,
                        name: "Tables",
                        attributes: attributes.concat([
                            {
                                name: "nodeUid",
                                value: "Tables"
                            },
                            {
                                name: "nodeType",
                                value: tableNodeType
                            },
                            {
                                name: "canAddDeleteTables",
                                value: storageSupportsTables
                            }
                        ]),
                        uidAttribute: "nodeUid"
                    };
                    storageGroupNodeData.push(node);
                }
            }));
            return es6_promise_1.Promise.all(promises)
                .then(function () {
                var resultINode = AzureResourceNodeFactory.convertToNodeCollection(storageGroupNodeData);
                resultINode.forEach(function (iNode) {
                    if (shouldPreExpandNodes) {
                        iNode.preExpanded = true;
                    }
                    if (iNode.type === tableNodeType && tableNodes) {
                    }
                });
                return {
                    results: resultINode
                };
            });
        };
        AzureStorageProducer.prototype.getQueuesCore = function (requestNamespace, args, continuationToken) {
            if (args === void 0) { args = null; }
            if (continuationToken === void 0) { continuationToken = null; }
            var connectionString = args.connectionString;
            var storageAccountId = args.id;
            var searchQuery = args.searchQuery;
            var sas = new ConnectionString_1.default(connectionString).getSAS();
            var extraAttributes = [{ name: "connectionType", value: args.connectionType ? args.connectionType : 3 /* key */ }];
            var numberOfResults = args.numberOfResults;
            return this.getStorageAccountResult(connectionString, sas, continuationToken, requestNamespace, AzureStorageProducer.getAllQueuesNamespace, "Queue", sas ? nodeTypes.sasQueue : nodeTypes.queue, storageAccountId, searchQuery, extraAttributes, numberOfResults);
        };
        AzureStorageProducer.prototype.getBlobContainersCore = function (requestNamespace, args, continuationToken) {
            if (args === void 0) { args = null; }
            if (continuationToken === void 0) { continuationToken = null; }
            var connectionString = args.connectionString;
            var storageAccountId = args.id;
            var searchQuery = args.searchQuery;
            var connectionStringObject = new ConnectionString_1.default(connectionString);
            var sas = connectionStringObject.getSAS();
            var extraAttributes = [{ name: "connectionType", value: args.connectionType ? args.connectionType : 3 /* key */ }];
            var numberOfResults = args.numberOfResults;
            var subscription = args.subscription;
            return this.getStorageAccountResult(connectionString, sas, continuationToken, requestNamespace, AzureStorageProducer.getAllBlobContainersNamespace, "BlobContainer", sas ? nodeTypes.blobContainerInSasAccount : nodeTypes.blobContainer, storageAccountId, searchQuery, extraAttributes, numberOfResults, subscription);
        };
        AzureStorageProducer.prototype.getFileSharesCore = function (requestNamespace, args, continuationToken) {
            if (args === void 0) { args = null; }
            if (continuationToken === void 0) { continuationToken = null; }
            var connectionString = args.connectionString;
            var storageAccountId = args.id;
            var searchQuery = args.searchQuery;
            var sas = new ConnectionString_1.default(connectionString).getSAS();
            var extraAttributes = [{ name: "connectionType", value: args.connectionType ? args.connectionType : 3 /* key */ }];
            var numberOfResults = args.numberOfResults;
            return this.getStorageAccountResult(connectionString, sas, continuationToken, requestNamespace, AzureStorageProducer.getAllFileSharesNamespace, "FileShare", sas ? nodeTypes.sasFileShare : nodeTypes.fileShare, storageAccountId, searchQuery, extraAttributes, numberOfResults);
        };
        AzureStorageProducer.prototype.getTablesCore = function (requestNamespace, args, continuationToken) {
            if (args === void 0) { args = null; }
            if (continuationToken === void 0) { continuationToken = null; }
            var connectionString = args.connectionString;
            var storageAccountId = args.id;
            var searchQuery = args.searchQuery;
            var sas = new ConnectionString_1.default(connectionString).getSAS();
            var extraAttributes = [{ name: "connectionType", value: args.connectionType ? args.connectionType : 3 /* key */ }];
            var numberOfResults = args.numberOfResults;
            return this.getStorageAccountResult(connectionString, sas, continuationToken, requestNamespace, AzureStorageProducer.getAllTablesNamespace, "Table", sas ? nodeTypes.sasTable : nodeTypes.table, storageAccountId, searchQuery, extraAttributes, numberOfResults);
        };
        return AzureStorageProducer;
    }());
    AzureStorageProducer.getGroupNodes = "Azure.Producers.Storage.GetGroupNodes";
    AzureStorageProducer.getAllQueuesNamespace = "Azure.Producers.Storage.GetAllQueues";
    AzureStorageProducer.getSingleQueueByNameNamespace = "Azure.Producers.Storage.GetSingleQueueByName";
    AzureStorageProducer.getAllBlobContainersNamespace = "Azure.Producers.Storage.GetAllBlobContainers";
    AzureStorageProducer.getSingleBlobContainerByNameNamespace = "Azure.Producers.Storage.GetSingleBlobContainerByName";
    AzureStorageProducer.getAllFileSharesNamespace = "Azure.Producers.Storage.GetAllFileShares";
    AzureStorageProducer.getSingleFileShareByNameNamespace = "Azure.Producers.Storage.GetSingleFileShareByName";
    AzureStorageProducer.getAllTablesNamespace = "Azure.Producers.Storage.GetAllTables";
    AzureStorageProducer.getSingleTableByNameNamespace = "Azure.Producers.Storage.GetSingleTableByName";
    AzureStorageProducer.getSASGroupNodesNamespace = "Azure.Producers.Storage.GetSASGroupNodes";
    AzureStorageProducer.getSASBlobContainersNamespace = "Azure.Producers.Storage.GetSASBlobContainers";
    AzureStorageProducer.getSASFileSharesNamespace = "Azure.Producers.Storage.GetSASFileShares";
    AzureStorageProducer.getSASQueuesNamespace = "Azure.Producers.Storage.GetSASQueues";
    AzureStorageProducer.getSASTablesNamespace = "Azure.Producers.Storage.GetSASTables";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AzureStorageProducer;
});

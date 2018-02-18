define(["require", "exports", "q", "./Constants", "./HeadersUtility"], function (require, exports, Q, Constants, HeadersUtility) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var DocumentClientUtilityBase = (function () {
        function DocumentClientUtilityBase(documentClientFactory, endpoint, masterKey) {
            this.documentClientFactory = documentClientFactory;
            this._client = this.documentClientFactory.createDocumentClient({
                endpoint: endpoint || "",
                masterKey: masterKey || ""
            });
        }
        DocumentClientUtilityBase.prototype.queryDocuments = function (container, query, options) {
            options = this._getCommonQueryOptions(container.self, options);
            var documentsIterator = this._client.queryDocuments(container.self, query, options);
            return Q.resolve(documentsIterator);
        };
        DocumentClientUtilityBase.prototype.nextIteratorItem = function (documentsIterator, pageSize, previousResults, deferred) {
            var _this = this;
            documentsIterator.nextItem(function (error, document) {
                if (error) {
                    deferred.reject(error);
                    return;
                }
                if (!document) {
                    deferred.resolve(previousResults);
                    return;
                }
                previousResults.push(document);
                if (previousResults.length >= pageSize) {
                    deferred.resolve(previousResults);
                    return;
                }
                _this.nextIteratorItem(documentsIterator, pageSize, previousResults, deferred);
            });
        };
        DocumentClientUtilityBase.prototype._readNextDocument = function (documentsIterator) {
            var deferred = Q.defer();
            var element = documentsIterator.nextItem(function (error, document) {
                if (error) {
                    deferred.reject(error);
                    return;
                }
                deferred.resolve(document);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readStoredProcedures = function (collection, options) {
            var deferred = Q.defer();
            var iterator = this._client.readStoredProcedures(collection.self, options);
            iterator.toArray(function (readStoredProceduresError, storedProcedures) {
                if (readStoredProceduresError) {
                    deferred.reject(readStoredProceduresError);
                    return;
                }
                deferred.resolve(storedProcedures);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readUserDefinedFunctions = function (collection, options) {
            var deferred = Q.defer();
            var iterator = this._client.readUserDefinedFunctions(collection.self, options);
            iterator.toArray(function (readUserDefinedFunctionsError, userDefinedFunctions) {
                if (readUserDefinedFunctionsError) {
                    deferred.reject(readUserDefinedFunctionsError);
                    return;
                }
                deferred.resolve(userDefinedFunctions);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readTriggers = function (collection, options) {
            var deferred = Q.defer();
            var iterator = this._client.readTriggers(collection.self, options);
            iterator.toArray(function (readTriggersError, triggers) {
                if (readTriggersError) {
                    deferred.reject(readTriggersError);
                    return;
                }
                deferred.resolve(triggers);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.extractPartitionKey = function (document, partitionKeyDefinition) {
            var partitionKeyResult = this._client.extractPartitionKey(document, partitionKeyDefinition);
            return partitionKeyResult && partitionKeyResult[0];
        };
        DocumentClientUtilityBase.prototype.queryDocumentsPage = function (collection, query, continuationToken, firstItemIndex, options) {
            var deferred = Q.defer();
            options = this._getCommonQueryOptions(collection.self, options);
            var documentsIterator = this._client.queryDocuments(collection.self, query, options);
            documentsIterator.continuation = continuationToken;
            documentsIterator.executeNext(function (error, documents, headers) {
                if (error) {
                    deferred.reject(error);
                    return;
                }
                var itemCount = documents && documents.length || 0;
                headers = headers || {};
                deferred.resolve({
                    documents: documents,
                    continuation: documentsIterator.continuation,
                    itemCount: itemCount,
                    firstItemIndex: Number(firstItemIndex) + 1,
                    lastItemIndex: Number(firstItemIndex) + Number(itemCount),
                    headers: headers,
                    activityId: headers[Constants.HttpHeaders.activityId],
                    requestCharge: headers[Constants.HttpHeaders.requestCharge]
                });
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readDocument = function (documentId, options) {
            options = options || {};
            options.partitionKey = options.partitionKey || this.getPartitionKeyHeader(documentId);
            var deferred = Q.defer();
            var document = this._client.readDocument(documentId.self, options, function (error, document) {
                if (error) {
                    deferred.reject(error);
                    return;
                }
                deferred.resolve(document);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readStoredProcedure = function (selfLink, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.readStoredProcedure(selfLink, options, function (error, storedProcedure) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(storedProcedure);
                }
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readTrigger = function (selfLink, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.readTrigger(selfLink, options, function (error, trigger) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(trigger);
                }
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readUserDefinedFunction = function (selfLink, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.readUserDefinedFunction(selfLink, options, function (error, udf) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(udf);
                }
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.getPartitionKeyHeader = function (documentId) {
            var partitionKeyDefinition = documentId.partitionKey;
            var partitionKeyValue = documentId.partitionKeyValue;
            if (!partitionKeyDefinition) {
                return undefined;
            }
            if (partitionKeyValue === undefined) {
                return [{}];
            }
            return [partitionKeyValue];
        };
        DocumentClientUtilityBase.prototype.updateCollection = function (collection, newCollection, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.replaceCollection(collection.self, newCollection, options, function (replaceCollectionError, replacedCollection) {
                if (replaceCollectionError) {
                    deferred.reject(replaceCollectionError);
                    return;
                }
                deferred.resolve(replacedCollection);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.updateDocument = function (documentId, newDocument, options) {
            options = options || {};
            options.partitionKey = options.partitionKey || this.getPartitionKeyHeader(documentId);
            options.skipGetPartitionKeyDefinition = true;
            var deferred = Q.defer();
            this._client.replaceDocument(documentId.self, newDocument, options, function (updateDocumentError, updatedDocument) {
                if (updateDocumentError) {
                    deferred.reject(updateDocumentError);
                    return;
                }
                deferred.resolve(updatedDocument);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.updateOffer = function (offer, newOffer) {
            var deferred = Q.defer();
            this._client.replaceOffer(offer._self, newOffer, function (replaceOfferError, replacedOffer) {
                if (replaceOfferError) {
                    deferred.reject(replaceOfferError);
                    return;
                }
                deferred.resolve(replacedOffer);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.updateStoredProcedure = function (storedProcedure, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.replaceStoredProcedure(storedProcedure._self, storedProcedure, options, function (updateStoredProcedureError, updatedStoredProcedure) {
                if (updateStoredProcedureError) {
                    deferred.reject(updateStoredProcedureError);
                    return;
                }
                deferred.resolve(updatedStoredProcedure);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.updateUserDefinedFunction = function (userDefinedFunction, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.replaceUserDefinedFunction(userDefinedFunction._self, userDefinedFunction, options, function (updateUserDefinedFunctionError, updatedUserDefinedFunction) {
                if (updateUserDefinedFunctionError) {
                    deferred.reject(updateUserDefinedFunctionError);
                    return;
                }
                deferred.resolve(updatedUserDefinedFunction);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.updateTrigger = function (trigger, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.replaceTrigger(trigger._self, trigger, options, function (updateTriggerError, updatedTrigger) {
                if (updateTriggerError) {
                    deferred.reject(updateTriggerError);
                    return;
                }
                deferred.resolve(updatedTrigger);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.createDocument = function (container, newDocument, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.createDocument(container.self, newDocument, options, function (saveDocumentError, savedDocument) {
                if (saveDocumentError) {
                    deferred.reject(saveDocumentError);
                    return;
                }
                deferred.resolve(savedDocument);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.createStoredProcedure = function (container, newStoredProcedure, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.createStoredProcedure(container.self, newStoredProcedure, options, function (createStoredProcedureError, createdStoredProcedure) {
                if (createStoredProcedureError) {
                    deferred.reject(createStoredProcedureError);
                    return;
                }
                deferred.resolve(createdStoredProcedure);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.createUserDefinedFunction = function (collection, newUserDefinedFunction, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.createUserDefinedFunction(collection.self, newUserDefinedFunction, options, function (createUserDefinedFunctionError, createdUserDefinedFunction) {
                if (createUserDefinedFunctionError) {
                    deferred.reject(createUserDefinedFunctionError);
                    return;
                }
                deferred.resolve(createdUserDefinedFunction);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.createTrigger = function (collection, newTrigger, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.createTrigger(collection.self, newTrigger, options, function (createTriggerError, createdTrigger) {
                if (createTriggerError) {
                    deferred.reject(createTriggerError);
                    return;
                }
                deferred.resolve(createdTrigger);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.deleteDocument = function (documentId, options) {
            options = options || {};
            options.partitionKey = options.partitionKey || this.getPartitionKeyHeader(documentId);
            var deferred = Q.defer();
            this._client.deleteDocument(documentId.self, options, function (deleteDocumentError, response) {
                if (deleteDocumentError) {
                    deferred.reject(deleteDocumentError);
                    return;
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.deleteCollection = function (collection, options) {
            var deferred = Q.defer();
            this._client.deleteCollection(collection.self, options, function (deleteCollectionError, response) {
                if (deleteCollectionError) {
                    deferred.reject(deleteCollectionError);
                    return;
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.deleteDatabase = function (database, options) {
            var deferred = Q.defer();
            this._client.deleteDatabase(database.self, options, function (deleteDatabaseError, response) {
                if (deleteDatabaseError) {
                    deferred.reject(deleteDatabaseError);
                    return;
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.deleteStoredProcedure = function (storedProcedure, options) {
            var deferred = Q.defer();
            this._client.deleteStoredProcedure(storedProcedure._self, options, function (deleteStoredProcedureError, response) {
                if (deleteStoredProcedureError) {
                    deferred.reject(deleteStoredProcedureError);
                    return;
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.deleteUserDefinedFunction = function (userDefinedFunction, options) {
            var deferred = Q.defer();
            this._client.deleteUserDefinedFunction(userDefinedFunction._self, options, function (deleteUserDefinedFunctionError, response) {
                if (deleteUserDefinedFunctionError) {
                    deferred.reject(deleteUserDefinedFunctionError);
                    return;
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.deleteTrigger = function (trigger, options) {
            var deferred = Q.defer();
            this._client.deleteTrigger(trigger._self, options, function (deleteTriggerError, response) {
                if (deleteTriggerError) {
                    deferred.reject(deleteTriggerError);
                    return;
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readCollections = function (database, options) {
            var deferred = Q.defer();
            var collectionsIterator = this._client.readCollections(database.self, options);
            collectionsIterator.toArray(function (readCollectionsError, collections) {
                if (readCollectionsError) {
                    deferred.reject(readCollectionsError);
                }
                deferred.resolve(collections);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readCollectionQuotaInfo = function (collection, options) {
            options = options || {};
            options.populateQuotaInfo = true;
            options.initialHeaders = options.initialHeaders || {};
            options.initialHeaders[Constants.HttpHeaders.populatePartitionStatistics] = true;
            var deferred = Q.defer();
            var collectionsIterator = this._client.readCollection(collection._self, options, function (readCollectionError, collection, headers) {
                if (readCollectionError) {
                    deferred.reject(readCollectionError);
                    return;
                }
                var quota = HeadersUtility.getQuota(headers);
                quota["usageSizeInKB"] = collection.statistics.reduce(function (previousValue, currentValue, currentIndex, array) {
                    return previousValue + currentValue.sizeInKB;
                }, 0);
                quota["numPartitions"] = collection.statistics.length;
                deferred.resolve(quota);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readOffer = function (collection, options) {
            options = options || {};
            var deferred = Q.defer();
            this._client.readOffers().toArray(function (readOffersError, offers, headers) {
                if (readOffersError) {
                    deferred.reject(readOffersError);
                    return;
                }
                offers = offers.filter(function (o) {
                    return o.resource.indexOf(collection._rid) >= 0;
                }) || [];
                deferred.resolve(offers[0]);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.readDatabases = function (options) {
            var deferred = Q.defer();
            this._client.readDatabases(options)
                .toArray(function (readDatabasesError, databses) {
                if (readDatabasesError) {
                    deferred.reject(readDatabasesError);
                }
                deferred.resolve(databses);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype.getOrCreateDatabaseAndCollection = function (databaseId, collectionId, offerThroughput, rupm, partitionKey, options, afterGetOrCreateDatabase) {
            var _this = this;
            var deferred = Q.defer();
            var defaultAfterGetOrCreateDatabase = function (database) { return Q(database); };
            afterGetOrCreateDatabase = afterGetOrCreateDatabase || defaultAfterGetOrCreateDatabase;
            this._getDatabase(databaseId, options)
                .then(function (existingDatabase) {
                return afterGetOrCreateDatabase(existingDatabase).finally(function () {
                    return existingDatabase;
                });
            }, function (_getDatabaseError) {
                deferred.reject(_getDatabaseError);
                return null;
            })
                .then(function (existingDatabase) {
                if (deferred.promise.isRejected() === true) {
                    return;
                }
                if (existingDatabase) {
                    _this._createCollection(existingDatabase, collectionId, offerThroughput, rupm, partitionKey, options)
                        .then(function (collection) {
                        deferred.resolve(collection);
                    }, function (_createCollectionError) {
                        deferred.reject(_createCollectionError);
                    });
                    return;
                }
                _this._createDatabase(databaseId, options)
                    .then(function (createdDatabase) {
                    return afterGetOrCreateDatabase(createdDatabase).finally(function () {
                        return createdDatabase;
                    });
                }, function (_createDatabaseError) {
                    deferred.reject(_createDatabaseError);
                    return null;
                }).
                    then(function (createdDatabase) {
                    if (deferred.promise.isRejected() === true) {
                        return;
                    }
                    // get collection fails with HTTP 401 for new databases, so directly create collection
                    _this._createCollection(createdDatabase, collectionId, offerThroughput, rupm, partitionKey, options)
                        .then(function (collection) {
                        deferred.resolve(collection);
                    }, function (_createCollectionError) {
                        deferred.reject(_createCollectionError);
                    });
                });
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype._getOrCreateCollection = function (database, collectionId, offerThroughput, rupm, partitionKey, options) {
            var _this = this;
            var deferred = Q.defer();
            this._getCollection(database, collectionId, options)
                .then(function (collection) {
                if (collection) {
                    deferred.resolve(collection);
                    return;
                }
                _this._createCollection(database, collectionId, offerThroughput, rupm, partitionKey, options)
                    .then(function (collection) { return deferred.resolve(collection); }, function (_createCollectionError) { return deferred.reject(_createCollectionError); });
            }, function (_getCollectionError) {
                deferred.reject(_getCollectionError);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype._getDatabase = function (databaseId, options) {
            var deferred = Q.defer();
            var querySpec = {
                query: 'SELECT * FROM root r WHERE r.id= @id',
                parameters: [{
                        name: '@id',
                        value: databaseId
                    }]
            };
            this._client.queryDatabases(querySpec, options).toArray(function (queryDatabasesError, results) {
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
        DocumentClientUtilityBase.prototype._getCollection = function (database, collectionId, options) {
            var deferred = Q.defer();
            var querySpec = {
                query: 'SELECT * FROM root r WHERE r.id=@id',
                parameters: [{
                        name: '@id',
                        value: collectionId
                    }]
            };
            this._client.queryCollections(database._self, querySpec, options).toArray(function (queryCollectionsError, results) {
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
        DocumentClientUtilityBase.prototype._createDatabase = function (databaseId, options) {
            var deferred = Q.defer();
            this._client.createDatabase({ id: databaseId }, options, function (createDatabaseError, created) {
                if (createDatabaseError) {
                    deferred.reject(createDatabaseError);
                    return;
                }
                deferred.resolve(created);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype._createCollection = function (database, collectionId, offerThroughput, rupm, partitionKey, options) {
            options = options || {};
            options.offerThroughput = offerThroughput;
            options.offerEnableRUPerMinuteThroughput = rupm;
            var deferred = Q.defer();
            var collectionBody = {
                id: collectionId,
                partitionKey: (partitionKey) ? partitionKey : undefined
            };
            this._client.createCollection(database._self, collectionBody, options, function (createCollectionError, createdCollection) {
                if (createCollectionError) {
                    deferred.reject(createCollectionError);
                    return;
                }
                deferred.resolve(createdCollection);
            });
            return deferred.promise;
        };
        DocumentClientUtilityBase.prototype._getCommonQueryOptions = function (selfLink, options) {
            options = options || {};
            options.enableScanInQuery = options.enableScanInQuery || true;
            options.maxItemCount = options.maxItemCount || Constants.Queries.itemsPerPage;
            options.maxDegreeOfParallelism = -1;
            return options;
        };
        return DocumentClientUtilityBase;
    }());
    return DocumentClientUtilityBase;
});

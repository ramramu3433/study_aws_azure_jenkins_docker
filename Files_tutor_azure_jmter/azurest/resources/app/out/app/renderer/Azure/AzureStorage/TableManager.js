"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var AzureStorage = require("azure-storage");
var Q = require("q");
var parseCsv = require("csv-parse");
var _ = require("underscore");
var _string = require("underscore.string");
var TableManagerHelper = require("./TableManagerHelper");
var StorageErrors_1 = require("./StorageErrors");
var StorageManagerHelper_1 = require("./StorageManagerHelper");
var StorageEmulatorHelper = require("./StorageEmulatorHelper");
var StorageErrors = require("./StorageErrors");
var StorageManagerHelper = require("./StorageManagerHelper");
var host = global.host;
/**
 * @param callerName Identifies the caller for telemetry purposes.
 *
 * Generally you should just pass in the caller function name.
 *
 * @param useRetryPolicy Optional. Determines whether a retry policy filter will
 * be applied to the service client object. Defaults to true.
 *
 * Due to a known bug in the azure storage library, a retry policy might cause a
 * failed request to be repeated indefinitely. This can happen, for example,
 * when attempting to find metrics tables for a premium storage account using
 * proxy settings. In these situations, removing the retry policy fixes the
 * issue.
 */
function getTableService(connectionString, callerName, useRetryPolicy, retryDuration) {
    if (useRetryPolicy === void 0) { useRetryPolicy = true; }
    if (retryDuration === void 0) { retryDuration = StorageManagerHelper_1.RetryDurations.Short; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var storageApiVersion;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!!host) return [3 /*break*/, 2];
                    return [4 /*yield*/, host.executeOperation("StorageApiSettingManager.getStorageApiSetting", {})];
                case 1:
                    storageApiVersion = _a.sent();
                    AzureStorage.Constants.HeaderConstants.TARGET_STORAGE_VERSION = storageApiVersion;
                    _a.label = 2;
                case 2: return [2 /*return*/, Q.Promise(function (resolve, reject) {
                        var localStorage = StorageManagerHelper.isDevelopment(connectionString);
                        function prepareTableService(service) {
                            StorageManagerHelper.setRequestEventHandler(service);
                            if (useRetryPolicy) {
                                var retryPolicy = StorageManagerHelper.createStorageRetryPolicy(callerName, retryDuration);
                                return service.withFilter(retryPolicy);
                            }
                            else {
                                return service;
                            }
                        }
                        if (localStorage) {
                            if (StorageManagerHelper.isStorageEmulatorSupported()) {
                                StorageEmulatorHelper.startStorageEmulator().then(function () {
                                    var devStoreCreds = AzureStorage.generateDevelopmentStorageCredentials();
                                    var tableService = AzureStorage.createTableService(devStoreCreds, null, null);
                                    resolve(prepareTableService(tableService));
                                }, function (error) {
                                    reject(error);
                                });
                            }
                            else {
                                reject(new StorageEmulatorHelper.StorageEmulatorNotSupportedError());
                            }
                        }
                        else {
                            var tableService = AzureStorage.createTableService(connectionString, null, null);
                            resolve(prepareTableService(tableService));
                        }
                    })];
            }
        });
    });
}
/**
 * Create a table.
 */
function createTable(connectionString, tableName) {
    return getTableService(connectionString, "createTable").then(function (tableService) {
        var deferred = Q.defer();
        tableService.createTable(tableName, null, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    });
}
exports.createTable = createTable;
/**
 * Get a table.
 */
function getTable(connectionString, tableName) {
    return getTableService(connectionString, "getTable").then(function (tableService) {
        var tableAttributes = [
            {
                name: "url",
                value: tableService.getUrl(tableName)
            }
        ];
        var results = { name: tableName, attributes: tableAttributes };
        return Q.resolve(results);
    });
}
exports.getTable = getTable;
/**
 * Delete a table.
 */
function deleteTable(connectionString, tableName) {
    return getTableService(connectionString, "deleteTable").then(function (tableService) {
        var deferred = Q.defer();
        tableService.deleteTable(tableName, null, function (error, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(response);
            }
        });
        return deferred.promise;
    });
}
exports.deleteTable = deleteTable;
function addEntity(connectionString, tableName, newEntity, operation) {
    if (operation === void 0) { operation = "insert"; }
    return getTableService(connectionString, "addEntity").then(function (tableService) {
        var deferred = Q.defer();
        var callback = function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(result);
            }
        };
        newEntity = TableManagerHelper.resolveEntityValues(newEntity);
        switch (operation) {
            case "insert":
                tableService.insertEntity(tableName, newEntity, callback);
                break;
            case "merge":
                tableService.insertOrMergeEntity(tableName, newEntity, callback);
                break;
            case "replace":
                tableService.insertOrReplaceEntity(tableName, newEntity, callback);
                break;
        }
        return deferred.promise;
    });
}
exports.addEntity = addEntity;
function addEntities(connectionString, tableName, newEntities, operation) {
    if (operation === void 0) { operation = "insert"; }
    return executeBatchOperation(connectionString, tableName, newEntities, function (tableBatch, entity) {
        entity = TableManagerHelper.resolveEntityValues(entity);
        switch (operation) {
            case "insert":
                tableBatch.insertEntity(entity, null);
                break;
            case "merge":
                tableBatch.insertOrMergeEntity(entity);
                break;
            case "replace":
                tableBatch.insertOrReplaceEntity(entity);
                break;
        }
    });
}
exports.addEntities = addEntities;
;
function updateEntity(connectionString, tableName, newEntity) {
    return getTableService(connectionString, "updateEntity").then(function (tableService) {
        var deferred = Q.defer();
        newEntity = TableManagerHelper.resolveEntityValues(newEntity);
        tableService.replaceEntity(tableName, newEntity, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    });
}
exports.updateEntity = updateEntity;
function deleteEntities(connectionString, tableName, entities) {
    return executeBatchOperation(connectionString, tableName, entities, function (tableBatch, entity) {
        tableBatch.deleteEntity(entity);
    });
}
exports.deleteEntities = deleteEntities;
function doesTableExist(connectionString, tableName) {
    return getTableService(connectionString, "doesTableExist", false)
        .then(function (tableService) {
        return doesTableExistCore(tableService, { connectionString: connectionString, tableName: tableName });
    });
}
exports.doesTableExist = doesTableExist;
function doesTableExistCore(tableService, tableReference) {
    var deferred = Q.defer();
    tableService.doesTableExist(tableReference.tableName, function (error, result, response) {
        if (error && error.code === "NotImplemented") {
            // We get this when we ask if a table exists in a cool storage account, which doesn't support user-created tables, but
            // can have pre-defined metrics tables.
            // So we have to try actually querying for entities to see if it succeeds (with results or without). To encourage a quick
            // response, we use partition/row keys that aren't likely to exist.
            listTableEntitiesSegmented(tableReference, null, 1, {
                filter: "PartitionKey eq '$FAKE$PARTITIONKEY$' and RowKey eq '$FAKE$ROWKEY$'"
            }).then(function () {
                // Succeeded, then it must exist
                deferred.resolve(true);
            }).catch(function (error) {
                deferred.resolve(false);
            });
        }
        else if (error && error.code === "ENOTFOUND") {
            deferred.resolve(false);
        }
        else if (error) {
            // Some other error
            deferred.reject(error);
        }
        else {
            deferred.resolve(result.exists);
        }
    });
    return deferred.promise;
}
/**
 * List all Tables in a storage account.
 */
function listTablesSegmented(connectionString, currentToken, searchQuery, numResults) {
    return getTableService(connectionString, "listTablesSegmented", false)
        .then(function (tableService) {
        var deferred = Q.defer();
        var options = { maxResults: numResults };
        var regularTableNames = [];
        var existingMetricsTableNames = [];
        var promises = [];
        var nextContinuationToken;
        var listTablesPromise = Q.Promise(function (resolve, reject) {
            tableService.listTablesSegmentedWithPrefix(searchQuery, currentToken, options, function (error, result, response) {
                if (error) {
                    if (error.code === "ENOTFOUND" || error.code === "NotImplemented") {
                        // No user-defined tables available
                        resolve(null);
                    }
                    else {
                        reject(StorageManagerHelper.processError(error));
                    }
                }
                else {
                    regularTableNames = result.entries || [];
                    nextContinuationToken = result.continuationToken;
                    resolve(null);
                }
            });
        });
        promises.push(listTablesPromise);
        if (!currentToken) {
            // Metrics tables are hidden from list tables calls and need to be added manually.
            // More details: https://msdn.microsoft.com/en-us/library/hh343258.aspx
            var possibleMetricsTableNames = [
                "$MetricsHourPrimaryTransactionsBlob",
                "$MetricsHourPrimaryTransactionsFile",
                "$MetricsHourPrimaryTransactionsTable",
                "$MetricsHourPrimaryTransactionsQueue",
                "$MetricsMinutePrimaryTransactionsBlob",
                "$MetricsMinutePrimaryTransactionsFile",
                "$MetricsMinutePrimaryTransactionsTable",
                "$MetricsMinutePrimaryTransactionsQueue",
                "$MetricsHourSecondaryTransactionsBlob",
                "$MetricsHourSecondaryTransactionsFile",
                "$MetricsHourSecondaryTransactionsTable",
                "$MetricsHourSecondaryTransactionsQueue",
                "$MetricsMinuteSecondaryTransactionsBlob",
                "$MetricsMinuteSecondaryTransactionsFile",
                "$MetricsMinuteSecondaryTransactionsTable",
                "$MetricsMinuteSecondaryTransactionsQueue",
                "$MetricsCapacityBlob"
            ];
            possibleMetricsTableNames.forEach(function (table) {
                var tableReference = {
                    tableName: table,
                    connectionString: connectionString
                };
                var promise = doesTableExistCore(tableService, tableReference)
                    .then(function (exists) {
                    if (exists) {
                        existingMetricsTableNames.push(table);
                    }
                })
                    .catch(function (error) {
                    // Ignore, assume doesn't exist
                });
                promises.push(promise);
            });
        }
        Q.all(promises).then(function (results) {
            var allTables = existingMetricsTableNames.concat(regularTableNames);
            var azureStorageResources = [];
            allTables.forEach(function (tableName) {
                azureStorageResources.push({
                    name: tableName,
                    attributes: [
                        {
                            name: "url",
                            value: tableService.getUrl(tableName)
                        }
                    ]
                });
            });
            deferred.resolve({
                storageResources: azureStorageResources,
                continuationToken: nextContinuationToken
            });
        }).catch(function (error) {
            deferred.reject(StorageManagerHelper.processError(error));
        });
        return deferred.promise;
    });
}
exports.listTablesSegmented = listTablesSegmented;
function listSingleTableByName(connectionString, tableName) {
    return getTableService(connectionString, "getSingleTableByName")
        .then(function (tableService) {
        return Q.Promise(function (resolve, reject) {
            doesTableExist(connectionString, tableName).then(function (exists) {
                if (!exists) {
                    var error = StorageManagerHelper.processError({ code: "NotFound" });
                    reject(error);
                }
                else {
                    resolve({
                        storageResources: [
                            {
                                name: tableName,
                                attributes: [
                                    {
                                        name: "url",
                                        value: tableService.getUrl(tableName)
                                    }
                                ]
                            }
                        ],
                        continuationToken: null
                    });
                }
            });
        });
    });
}
exports.listSingleTableByName = listSingleTableByName;
function getSASTables(tables, searchQuery) {
    var promises = [];
    tables.forEach(function (table) {
        promises.push(getSASTable(table.connectionString, searchQuery, table.name));
    });
    return Q.all(promises).then(function (promiseResults) {
        var azureStorageResources = [];
        promiseResults.forEach(function (result) {
            azureStorageResources = azureStorageResources.concat(result.storageResources);
        });
        return {
            storageResources: azureStorageResources,
            continuationToken: null
        };
    });
}
exports.getSASTables = getSASTables;
/**
 * List (Query) entities in a table.
 */
function listTableEntitiesSegmented(tableReference, continuationToken, numResults, tableQuery) {
    var connectionString = tableReference.connectionString;
    return getTableService(connectionString, "listTableEntitiesSegmented").then(function (tableService) {
        var deferred = Q.defer();
        var query = new AzureStorage.TableQuery();
        if (tableQuery.select) {
            query = query.select(tableQuery.select);
        }
        if (tableQuery.top) {
            query = query.top(tableQuery.top);
        }
        else {
            query = query.top(numResults);
        }
        if (tableQuery.filter) {
            query = query.where(tableQuery.filter);
        }
        var options = {
            payloadFormat: AzureStorage.TableUtilities.PayloadFormat.MINIMAL_METADATA
        };
        tableService.queryEntities(tableReference.tableName, query, continuationToken, options, function (error, result, response) {
            if (error) {
                deferred.reject(StorageManagerHelper.processError(error, { tableQuery: tableQuery }));
            }
            else {
                var entities = result.entries ?
                    result.entries.map(function (entity) { return TableManagerHelper.resolveEntityTypes(entity); }) :
                    [];
                deferred.resolve({
                    Results: entities,
                    ContinuationToken: result.continuationToken
                });
            }
        });
        return deferred.promise;
    });
}
exports.listTableEntitiesSegmented = listTableEntitiesSegmented;
/**
 * Generate shared access signature for table or table partition.
 */
function generateSharedAccessSignature(connectionString, tableName, expiry, // Expiry is mandatory
    start, permissions, startPartitionKey, endPartitionKey, startRowKey, endRowKey) {
    return getTableService(connectionString, "generateSharedAccessSignature")
        .then(function (tableService) {
        var deferred = Q.defer();
        try {
            var accessPolicy = {
                Expiry: expiry,
                Permissions: undefined
            };
            // If we add a property to the access policy information with a null value,
            // we will get an authentication error when using the SAS token.
            // Add the properties only when they have a value.
            if (start) {
                accessPolicy.Start = start;
            }
            if (permissions) {
                accessPolicy.Permissions = permissions;
            }
            if (startPartitionKey) {
                accessPolicy.StartPk = startPartitionKey;
            }
            if (endPartitionKey) {
                accessPolicy.EndPk = endPartitionKey;
            }
            if (startRowKey) {
                accessPolicy.StartRk = startRowKey;
            }
            if (endRowKey) {
                accessPolicy.EndRk = endRowKey;
            }
            var sharedAccessPolicy = {
                AccessPolicy: accessPolicy
            };
            var sasToken = tableService.generateSharedAccessSignature(tableName, sharedAccessPolicy);
            var sasUrl = tableService.getUrl(tableName, sasToken);
            var results = {
                sasToken: sasToken,
                sasUrl: sasUrl
            };
            deferred.resolve(results);
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    });
}
exports.generateSharedAccessSignature = generateSharedAccessSignature;
/**
 * Generate shared access signature with policy ID for table.
 */
function generateSharedAccessSignatureWithPolicy(connectionString, tableName, accessPolicyId) {
    return getTableService(connectionString, "generateSharedAccessSignatureWithPolicy")
        .then(function (tableService) {
        var deferred = Q.defer();
        try {
            var sharedAccessPolicy = {
                Id: accessPolicyId,
                AccessPolicy: null
            };
            var sasToken = tableService.generateSharedAccessSignature(tableName, sharedAccessPolicy);
            var sasUrl = tableService.getUrl(tableName, sasToken);
            var results = {
                sasToken: sasToken,
                sasUrl: sasUrl
            };
            deferred.resolve(results);
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    });
}
exports.generateSharedAccessSignatureWithPolicy = generateSharedAccessSignatureWithPolicy;
/**
 * Get container access control lists.
 */
function getAccessControlList(connectionString, tableName) {
    return getTableService(connectionString, "getAccessControlList")
        .then(function (tableService) {
        var deferred = Q.defer();
        try {
            tableService.getTableAcl(tableName, function (error, result, response) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(StorageManagerHelper.AccessPoliciesFromSignedIdentifierMap(result.signedIdentifiers));
                }
            });
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    });
}
exports.getAccessControlList = getAccessControlList;
/**
 * Set container access control lists.
 */
function setAccessControlList(connectionString, tableName, sharedAccessPolicies) {
    return getTableService(connectionString, "setAccessControlList")
        .then(function (tableService) {
        var deferred = Q.defer();
        try {
            var azurePolicies = {};
            sharedAccessPolicies.forEach(function (policy) {
                var policyId = policy.Id;
                if (!policyId) {
                    throw StorageErrors.NullOrEmptyArgumentError.getHostErrorInstance("policy.Id");
                }
                if (azurePolicies[policyId]) {
                    throw StorageErrors.PolicyAlreadyExistsError.getHostErrorInstance("policy.Id", policyId);
                }
                azurePolicies[policyId] = {
                    Expiry: new Date(policy.AccessPolicy.Expiry.toString()),
                    Start: policy.AccessPolicy.Start ? new Date(policy.AccessPolicy.Start.toString()) : undefined,
                    Permissions: policy.AccessPolicy.Permissions ? policy.AccessPolicy.Permissions : undefined,
                    StartPk: policy.AccessPolicy.StartPk ? policy.AccessPolicy.Permissions : undefined,
                    EndPk: policy.AccessPolicy.EndPk ? policy.AccessPolicy.EndPk : undefined,
                    StartRk: policy.AccessPolicy.StartRk ? policy.AccessPolicy.StartRk : undefined,
                    EndRk: policy.AccessPolicy.EndRk ? policy.AccessPolicy.EndRk : undefined
                };
            });
            tableService.setTableAcl(tableName, azurePolicies, /*options*/ null, function (error, result, ignoredResponse) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(result);
                }
            });
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    });
}
exports.setAccessControlList = setAccessControlList;
function parseFromCsv(lines) {
    var deferred = Q.defer();
    var parseOptions = {
        delimiter: ",",
        skip_empty_lines: true
    };
    var data;
    if (_.isArray(lines)) {
        data = lines.join("\n");
    }
    else {
        data = lines;
    }
    parseCsv(data, parseOptions, function (error, output) {
        if (error) {
            deferred.reject(error);
        }
        deferred.resolve(output);
    });
    return deferred.promise;
}
exports.parseFromCsv = parseFromCsv;
function getSASTable(connectionString, searchQuery, tableName) {
    // Prefix search for UX consistency since other search is prefix at the moment
    if (searchQuery && !_string.startsWith(tableName, searchQuery)) {
        // Table name doesn't satisfy search query.
        return Q.resolve({
            storageResources: [],
            continuationToken: null
        });
    }
    return getTableService(connectionString, "getSASTable")
        .then(function (tableService) {
        var azureStorageResources = [];
        azureStorageResources.push({
            name: tableName,
            attributes: [
                {
                    name: "connectionString",
                    value: connectionString
                },
                {
                    name: "url",
                    value: tableService.getUrl(tableName)
                }
            ]
        });
        return {
            storageResources: azureStorageResources,
            continuationToken: null
        };
    });
}
exports.getSASTable = getSASTable;
/**
 * Get CORS Rules
 */
function getCorsRules(connectionString) {
    return getTableService(connectionString, "getServiceProperties").then(function (tableService) {
        var deferred = Q.defer();
        tableService.getServiceProperties(function (error, result, response) {
            if (error) {
                deferred.reject(StorageManagerHelper.processError(error));
            }
            else {
                var rules = result.Cors.CorsRule;
                deferred.resolve(rules);
            }
        });
        return deferred.promise;
    });
}
exports.getCorsRules = getCorsRules;
/**
 * Set CORS Rules
 */
function setCorsRules(connectionString, rules) {
    return getTableService(connectionString, "setServiceProperties").then(function (tableService) {
        var deferred = Q.defer();
        var serviceProperties;
        serviceProperties = {
            Cors: {
                CorsRule: rules
            }
        };
        try {
            tableService.setServiceProperties(serviceProperties, function (error, response) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(null);
                }
            });
        }
        catch (error) {
            deferred.reject(error);
        }
        ;
        return deferred.promise;
    });
}
exports.setCorsRules = setCorsRules;
function divideEntitiesBasedOnPartitionKey(entities) {
    if (!entities) {
        throw new StorageErrors_1.NullArgumentError("entities");
    }
    var entityGroups = [];
    entities.forEach(function (entity, index) {
        var group = _.find(entityGroups, function (value) {
            return value.partitionKey._ === entity.PartitionKey._;
        });
        if (group) {
            group.entityIndexes.push(index);
        }
        else {
            entityGroups.push({
                partitionKey: entity.PartitionKey,
                entityIndexes: [index]
            });
        }
    });
    return entityGroups;
}
function executeBatchOperation(connectionString, tableName, entities, operation) {
    // Azure Storage services has a limit in the number of operations
    // that can be executed in batch.
    var batchOperationLimit = 100;
    return getTableService(connectionString, "executeBatchOperation", true, StorageManagerHelper_1.RetryDurations.Medium)
        .then(function (tableService) {
        var entityGroups = divideEntitiesBasedOnPartitionKey(entities);
        var promises = [];
        entityGroups.forEach(function (entityGroup) {
            var i = 0;
            var indexes = entityGroup.entityIndexes;
            // Divide the entities by the batch operation limit and
            // and execute them separately
            var entitiesIndexes = indexes.slice(i, i + batchOperationLimit);
            while (entitiesIndexes && entitiesIndexes.length) {
                var entitiesSlice = entitiesIndexes.map(function (index) { return entities[index]; });
                promises.push(executeBatchOperationCore(tableService, tableName, entitiesSlice, operation));
                i += batchOperationLimit;
                entitiesIndexes = indexes.slice(i, i + batchOperationLimit);
            }
        });
        return Q.all(promises);
    });
}
function executeBatchOperationCore(tableService, tableName, entities, operation) {
    return Q.Promise(function (resolve, reject) {
        var tableBatch = new AzureStorage.TableBatch();
        entities.forEach(function (entity) {
            operation(tableBatch, entity);
        });
        tableService.executeBatch(tableName, tableBatch, function (err, result, response) {
            if (err) {
                reject(err);
            }
            else {
                resolve(null);
            }
        });
    });
}

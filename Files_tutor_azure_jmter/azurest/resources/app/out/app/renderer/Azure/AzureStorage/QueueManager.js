"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var azureStorage = require("azure-storage");
var Q = require("q");
var _string = require("underscore.string");
var Constants = require("../../../Constants");
var StorageManagerHelper_1 = require("./StorageManagerHelper");
var StorageEmulatorHelper = require("./StorageEmulatorHelper");
var StorageErrors = require("./StorageErrors");
var StorageManagerHelper = require("./StorageManagerHelper");
var Utilities = require("../../../Utilities");
var ConnectionString_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var host = global.host;
function getQueueService(connectionString, callerName, retryDuration) {
    if (retryDuration === void 0) { retryDuration = StorageManagerHelper_1.RetryDurations.Short; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        function prepareQueueService(service) {
            StorageManagerHelper.setRequestEventHandler(service);
            // We are not dependent on azure client library to encode the message. Instead we encode/decode the message by ourselves
            // in the front-end(if user choose to. if not then we keep it as a raw string)
            var retryPolicy = StorageManagerHelper.createStorageRetryPolicy(callerName, retryDuration);
            return service.withFilter(retryPolicy);
        }
        var storageApiVersion, deferred, localStorage, queueService;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!!host) return [3 /*break*/, 2];
                    return [4 /*yield*/, host.executeOperation("StorageApiSettingManager.getStorageApiSetting", {})];
                case 1:
                    storageApiVersion = _a.sent();
                    azureStorage.Constants.HeaderConstants.TARGET_STORAGE_VERSION = storageApiVersion;
                    _a.label = 2;
                case 2:
                    deferred = Q.defer();
                    localStorage = StorageManagerHelper.isDevelopment(connectionString);
                    if (localStorage) {
                        if (StorageManagerHelper.isStorageEmulatorSupported()) {
                            StorageEmulatorHelper.startStorageEmulator().then(function () {
                                var devStoreCreds = azureStorage.generateDevelopmentStorageCredentials();
                                var queueService = azureStorage.createQueueService(devStoreCreds, null, null);
                                deferred.resolve(prepareQueueService(queueService));
                            }, function (error) {
                                deferred.reject(error);
                            });
                        }
                        else {
                            deferred.reject(new StorageEmulatorHelper.StorageEmulatorNotSupportedError());
                        }
                    }
                    else {
                        queueService = azureStorage.createQueueService(connectionString, null, null);
                        deferred.resolve(prepareQueueService(queueService));
                    }
                    return [2 /*return*/, deferred.promise];
            }
        });
    });
}
/**
 * Create a message queue
 */
function createQueue(connectionString, queueName) {
    return getQueueService(connectionString, "createQueue").then(function (queueService) {
        var deferred = Q.defer();
        queueService.createQueue(queueName, null, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                // https://msdn.microsoft.com/en-us/library/azure/dd179342.aspx
                // When a queue with the specified name already exists, the Queue service checks the
                // metadata associated with the existing queue. If the existing metadata is identical
                // to the metadata specified on the Create Queue request, status code 204 (No Content)
                // is returned.
                // If the existing metadata does not match the metadata provided with the Create Queue request,
                // the operation fails and status code 409 (Conflict) is returned, which should have been
                // rejected as an error before.
                if (response.statusCode === Constants.StatusCode.noContent) {
                    deferred.reject(new StorageErrors.QueueAlreadyExistsError(response.headers["x-ms-request-id"], response.headers["date"]));
                }
                else {
                    deferred.resolve(result);
                }
            }
        });
        return deferred.promise;
    });
}
exports.createQueue = createQueue;
/**
 * Get a queue.
 */
function getQueue(connectionString, queueName) {
    return getQueueService(connectionString, "getQueue").then(function (queueService) {
        // TODO: find out how to get queue url.
        var queueAttributes = [
            {
                name: "url",
                value: queueService.getUrl(queueName)
            }
        ];
        var results = { name: queueName, attributes: queueAttributes };
        return Q.resolve(results);
    });
}
exports.getQueue = getQueue;
/**
 * Delete a message queue.
 */
function deleteQueue(connectionString, queueName) {
    return getQueueService(connectionString, "deleteQueue").then(function (queueService) {
        var deferred = Q.defer();
        queueService.deleteQueue(queueName, null, function (error, response) {
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
exports.deleteQueue = deleteQueue;
/**
 * List all Queues in a storage account.
 */
function listQueuesSegmented(connectionString, currentToken, searchQuery, numResults) {
    return getQueueService(connectionString, "listQueuesSegmented").then(function (queueService) {
        var deferred = Q.defer();
        var options = { maxResults: numResults };
        queueService.listQueuesSegmentedWithPrefix(searchQuery, currentToken, options, function (error, result, response) {
            if (error) {
                error = StorageManagerHelper.processError(error);
                deferred.reject(error);
            }
            else {
                var entries = result.entries || [];
                var azureStorageResources = [];
                entries.forEach(function (queueResult) {
                    azureStorageResources.push(createAzureStorageResource(queueService, queueResult));
                });
                deferred.resolve({
                    storageResources: azureStorageResources,
                    continuationToken: result.continuationToken
                });
            }
        });
        return deferred.promise;
    });
}
exports.listQueuesSegmented = listQueuesSegmented;
function listSingleQueueByName(connectionString, queueName) {
    return getQueueService(connectionString, "listSingleQueueByName").then(function (queueService) {
        return Q.Promise(function (resolve, reject) {
            queueService.getQueueMetadata(queueName, function (error, result, response) {
                if (error) {
                    error = StorageManagerHelper.processError(error);
                    reject(error);
                }
                else {
                    var azureStorageResources = [createAzureStorageResource(queueService, result)];
                    resolve({
                        storageResources: azureStorageResources,
                        continuationToken: null
                    });
                }
            });
        });
    });
}
exports.listSingleQueueByName = listSingleQueueByName;
function createAzureStorageResource(queueService, queueResult) {
    return {
        name: queueResult.name,
        attributes: [
            {
                name: "url",
                value: queueService.getUrl(queueResult.name)
            }
        ]
    };
}
function getSASQueues(queues, searchQuery) {
    var promises = [];
    queues.forEach(function (queue) {
        promises.push(getSASQueue(queue.connectionString, searchQuery, queue.name));
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
exports.getSASQueues = getSASQueues;
/**
 * List (peek) messages in a queue.
 */
function peekQueueMessages(queueReference, numOfMessages) {
    var connectionString = queueReference.connectionString;
    return getQueueService(connectionString, "peekQueueMessages").then(function (queueService) {
        var deferred = Q.defer();
        var safeNumOfMessages = numOfMessages > Constants.MaxNumOfMessagesToPeek ? Constants.MaxNumOfMessagesToPeek : numOfMessages;
        var peekMessagesOption = { numOfMessages: safeNumOfMessages };
        queueService.peekMessages(queueReference.queueName, peekMessagesOption, function (error, result) {
            if (error) {
                deferred.reject(StorageManagerHelper.processError(error));
            }
            else {
                var messages = result || [];
                messages = messages.map(function (value) {
                    var isBase64Encoded = Utilities.isBase64Encoded(value.messageText);
                    return {
                        MessageId: value.messageId,
                        Base64Encode: isBase64Encoded,
                        MessageText: isBase64Encoded ?
                            Buffer.from(value.messageText, "base64").toString("utf-8") : value.messageText,
                        InsertionTime: value.insertionTime,
                        ExpirationTime: value.expirationTime,
                        DequeueCount: value.dequeueCount,
                        EncodeSize: value.messageText.length
                    };
                });
                deferred.resolve({
                    messages: messages
                });
            }
        });
        return deferred.promise;
    });
}
exports.peekQueueMessages = peekQueueMessages;
/**
 * Adds a new message to the back of the message queue.
 */
function addMessage(queueReference, messageBody) {
    return getQueueService(queueReference.connectionString, "listQueuesSegmented").then(function (queueService) {
        var deferred = Q.defer();
        queueService.createMessage(queueReference.queueName, messageBody.Base64Encode === false ? messageBody.MessageText : Buffer.from(messageBody.MessageText, "utf-8").toString("base64"), {
            messageTimeToLive: messageBody.TimeToLive
        }, function (error, ignoredResponse) {
            if (error) {
                deferred.reject(StorageManagerHelper.processError(error));
            }
            else {
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    });
}
exports.addMessage = addMessage;
/**
 * Generate Shared Access Signature for blob container or blob.
 */
function generateSharedAccessSignature(connectionString, queueName, expiry, // Expiry is mandatory
    start, permissions) {
    if (start === void 0) { start = null; }
    if (permissions === void 0) { permissions = null; }
    return getQueueService(connectionString, "generateSharedAccessSignature").then(function (queueService) {
        var deferred = Q.defer();
        try {
            var sharedAccessPolicy = {
                Id: null,
                AccessPolicy: {
                    Expiry: expiry,
                    Start: start ? start : undefined,
                    Permissions: permissions ? permissions : undefined
                }
            };
            var sasToken = queueService.generateSharedAccessSignature(queueName, sharedAccessPolicy);
            var sasUrl = queueService.getUrl(queueName, sasToken);
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
 * Generate Shared Access Signature with policy ID for queue.
 */
function generateSharedAccessSignatureWithPolicy(connectionString, queueName, accessPolicyId, blobName, usePrimaryEndpoint) {
    if (blobName === void 0) { blobName = ""; }
    if (usePrimaryEndpoint === void 0) { usePrimaryEndpoint = true; }
    return getQueueService(connectionString, "generateSharedAccessSignatureWithPolicy").then(function (queueService) {
        var deferred = Q.defer();
        try {
            var sharedAccessPolicy = {
                Id: accessPolicyId,
                AccessPolicy: null
            };
            var sasToken = queueService.generateSharedAccessSignature(queueName, sharedAccessPolicy);
            var sasUrl = queueService.getUrl(queueName, sasToken);
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
function getAccessControlList(connectionString, queueName) {
    return getQueueService(connectionString, "getAccessControlList")
        .then(function (queueService) {
        var deferred = Q.defer();
        try {
            queueService.getQueueAcl(queueName, function (error, result, response) {
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
 * Set queue access control lists.
 */
function setAccessControlList(connectionString, queueName, sharedAccessPolicies) {
    return getQueueService(connectionString, "setAccessControlList")
        .then(function (queueService) {
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
                    Expiry: new Date(policy.AccessPolicy.Expiry),
                    Start: policy.AccessPolicy.Start ? new Date(policy.AccessPolicy.Start) : undefined,
                    Permissions: policy.AccessPolicy.Permissions ? policy.AccessPolicy.Permissions : undefined
                };
            });
            queueService.setQueueAcl(queueName, azurePolicies, /*options*/ null, function (error, result, ignoredResponse) {
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
/**
 * Dequeue the first message from the queue
 *  1) Retrieves a message from the queue and makes it invisible to other consumers
 *  2) Delete the message
 *
 *  @return       true          if it dequeus the message successfully
 *                false         if ID doesn't match
 *                error         if error occurs during any of the operation
 */
function dequeueMessage(queueReference, messageId) {
    return getQueueService(queueReference.connectionString, "dequeueMessage").then(function (queueService) {
        var deferred = Q.defer();
        // Verify the top message on the queue is the one passed in by comparing IDs with the
        // current top message.  Doing get on a message will increase the message's
        // dequeue count, so to reduce the chance that we get a message other than the intended
        // one, and therefore increase it's dequeue count, first do a peek, then a get, checking the
        // ID both times.
        queueService.peekMessages(queueReference.queueName, function (peekError, peekResult) {
            if (peekError) {
                deferred.reject(StorageManagerHelper.processError(peekError));
            }
            else {
                if (peekResult.length && peekResult[0].messageId === messageId) {
                    var numOfMessagesToDequeue = 1;
                    queueService.getMessages(queueReference.queueName, {
                        numOfMessages: numOfMessagesToDequeue
                    }, function (getError, getResult) {
                        if (getError) {
                            deferred.reject(StorageManagerHelper.processError(getError));
                        }
                        else {
                            if (getResult.length && getResult[0].messageId === messageId) {
                                queueService.deleteMessage(queueReference.queueName, getResult[0].messageId, getResult[0].popReceipt, function (deleteError, deleteResult) {
                                    if (!deleteError) {
                                        deferred.resolve(true);
                                    }
                                    else {
                                        deferred.reject(StorageManagerHelper.processError(deleteError));
                                    }
                                });
                            }
                            else {
                                deferred.resolve(false);
                            }
                        }
                    });
                }
                else {
                    deferred.resolve(false);
                }
            }
        });
        return deferred.promise;
    });
}
exports.dequeueMessage = dequeueMessage;
/**
 * Clear all message from the queue
 */
function clearQueue(queueReference) {
    return getQueueService(queueReference.connectionString, "clearQueue").then(function (queueService) {
        var deferred = Q.defer();
        queueService.clearMessages(queueReference.queueName, function (error, result) {
            if (error) {
                deferred.reject(StorageManagerHelper.processError(error));
            }
            else {
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    });
}
exports.clearQueue = clearQueue;
/**
 * Retrieve  approximate number of messages in the queue.
 * This number is not lower than the actual number of messages in the queue, but could be higher.
 */
function retrieveApproximateMessageCount(queueReference) {
    return getQueueService(queueReference.connectionString, "retrieveApproximateMessageCount").then(function (queueService) {
        var deferred = Q.defer();
        queueService.getQueueMetadata(queueReference.queueName, function (error, result) {
            if (error) {
                deferred.reject(StorageManagerHelper.processError(error));
            }
            else {
                var approximateMessageCount = result.approximateMessageCount;
                deferred.resolve(approximateMessageCount);
            }
        });
        return deferred.promise;
    });
}
exports.retrieveApproximateMessageCount = retrieveApproximateMessageCount;
/**
 * Get CORS Rules
 */
function getCorsRules(connectionString) {
    return getQueueService(connectionString, "getServiceProperties").then(function (queueService) {
        var deferred = Q.defer();
        queueService.getServiceProperties(function (error, result, response) {
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
function setCorsRules(connectionString, corsRule) {
    return getQueueService(connectionString, "setServiceProperties").then(function (queueService) {
        var deferred = Q.defer();
        var serviceProperties;
        serviceProperties = {
            Cors: {
                CorsRule: corsRule
            }
        };
        try {
            queueService.setServiceProperties(serviceProperties, function (error, response) {
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
function getSASQueue(connectionString, searchQuery, queueName) {
    // Prefix search for UX consistency since other search is prefix at the moment
    if (searchQuery && !_string.startsWith(queueName, searchQuery)) {
        // Table name doesn't satisfy search query.
        return Q.resolve({
            storageResources: [],
            continuationToken: null
        });
    }
    return getQueueService(connectionString, "getSASQueue")
        .then(function (queueService) {
        var parsedConnectionString = new ConnectionString_1.default(connectionString);
        if (!parsedConnectionString.queueEndpoint) {
            // QueueEndpoint not available so can't get the queue name.
            return Q.resolve({
                storageResources: [],
                continuationToken: null
            });
        }
        var azureStorageResources = [];
        var attrValSharedAccessSignature = parsedConnectionString.sharedAccessSignature || "";
        azureStorageResources.push({
            name: queueName,
            attributes: [
                {
                    name: "connectionString",
                    value: connectionString
                },
                {
                    name: "url",
                    value: queueService.getUrl(queueName)
                },
                {
                    name: "sharedAccessSignature",
                    value: attrValSharedAccessSignature
                }
            ]
        });
        return {
            storageResources: azureStorageResources,
            continuationToken: null
        };
    });
}
exports.getSASQueue = getSASQueue;

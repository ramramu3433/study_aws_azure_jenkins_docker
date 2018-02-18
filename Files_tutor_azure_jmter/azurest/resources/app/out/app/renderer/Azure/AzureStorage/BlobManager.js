"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var azureStorage = require("azure-storage");
var Q = require("q");
var _string = require("underscore.string");
var BlobUtilities_1 = require("./Blobs/BlobUtilities");
var BlobQueryOperations = require("./Blobs/BlobQueryOperations");
var StorageManagerHelper_1 = require("./StorageManagerHelper");
var storageErrors = require("./StorageErrors");
var storageManagerHelper = require("./StorageManagerHelper");
var utilities = require("../../../Utilities");
var ListBlobsInclude_1 = require("../../StorageExplorer/ListBlobsInclude");
/**
 * Creates a blob container.
 */
function createBlobContainer(connectionString, containerName, accessLevel, metadata) {
    return BlobUtilities_1.getBlobService(connectionString, "createBlobContainer")
        .then(function (blobService) {
        var deferred = Q.defer();
        var options = {};
        if (accessLevel === "container" || accessLevel === "blob") {
            options.publicAccessLevel = accessLevel;
        }
        if (!!metadata) {
            options.metadata = metadata;
        }
        blobService.createContainer(containerName, options, function (error, result, response) {
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
exports.createBlobContainer = createBlobContainer;
/**
 * Creates an empty copy of a blob container.
 *
 * Shared access policies are not copied, because `sourceConnectionString` is usually
 * a SAS connection string which lacks the necessary permissions to access that data.
 *
 * The Azure client lib has a bug wherein the `publicAccessLevel` property isn't retrieved correctly.
 * It's always returned as `null`, even if the provides container or blob access.
 */
function createBlobContainerFromExisting(sourceConnectionString, sourceContainerName, targetConnectionString, targetContainerName) {
    return getContainerProperties(sourceConnectionString, sourceContainerName)
        .then(function (props) { return createBlobContainer(targetConnectionString, targetContainerName, props.publicAccessLevel, props.metadata); });
}
exports.createBlobContainerFromExisting = createBlobContainerFromExisting;
function doesBlobContainerExist(connectionString, containerName) {
    return BlobUtilities_1.getBlobService(connectionString, "doesBlobContainerExist").then(function (blobService) {
        return Q.Promise(function (resolve, reject) {
            blobService.doesContainerExist(containerName, function (error, result, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result.exists);
                }
            });
        });
    });
}
exports.doesBlobContainerExist = doesBlobContainerExist;
/**
 * Get a blob container.
 */
function getBlobContainer(connectionString, containerName) {
    return BlobUtilities_1.getBlobService(connectionString, "getBlobContainer").then(function (blobService) {
        var deferred = Q.defer();
        blobService.getContainerProperties(containerName, function (error, propertiesResult, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                var portalAttributes = [
                    {
                        name: "url",
                        value: blobService.getUrl(containerName, null, null, true)
                    },
                    {
                        name: "lastModified",
                        value: propertiesResult.lastModified
                    },
                    {
                        name: "leaseState",
                        value: propertiesResult.lease.state
                    },
                    {
                        name: "leaseStatus",
                        value: propertiesResult.lease.status
                    }
                ];
                var results = { name: containerName, attributes: portalAttributes };
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    });
}
exports.getBlobContainer = getBlobContainer;
function setContainerPublicAccessLevel(connectionString, containerName, accessLevel) {
    return BlobUtilities_1.getBlobService(connectionString, "setContainerPublicAccessLevel").then(function (blobService) {
        var deferred = Q.defer();
        if (accessLevel === "container" || accessLevel === "blob") {
            var options = { publicAccessLevel: accessLevel };
        }
        else {
            options = null;
        }
        blobService.setContainerAcl(containerName, null /*signedIdentifiers*/, options, function (error, result, response) {
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
exports.setContainerPublicAccessLevel = setContainerPublicAccessLevel;
/**
 * Delete a blob container.
 */
function deleteBlobContainer(connectionString, containerName) {
    return BlobUtilities_1.getBlobService(connectionString, "deleteBlobContainer").then(function (blobService) {
        var deferred = Q.defer();
        blobService.deleteContainer(containerName, null, function (error, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(response.isSuccessful);
            }
        });
        return deferred.promise;
    });
}
exports.deleteBlobContainer = deleteBlobContainer;
/**
 * Generate Shared Access Signature for blob container or blob.
 */
function generateSharedAccessSignature(connectionString, containerName, expiry, // Expiry is mandatory
    blobName, start, permissions, usePrimaryEndpoint) {
    if (blobName === void 0) { blobName = ""; }
    if (start === void 0) { start = null; }
    if (permissions === void 0) { permissions = null; }
    if (usePrimaryEndpoint === void 0) { usePrimaryEndpoint = true; }
    return BlobUtilities_1.getBlobService(connectionString, "generateSharedAccessSignature").then(function (blobService) {
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
            var sasToken = blobService.generateSharedAccessSignature(containerName, blobName, sharedAccessPolicy, null);
            var sasUrl = blobService.getUrl(containerName, blobName, sasToken, usePrimaryEndpoint);
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
 * Generate Shared Access Signature with policy ID for blob container or blob.
 */
function generateSharedAccessSignatureWithPolicy(connectionString, containerName, accessPolicyId, blobName, usePrimaryEndpoint) {
    if (blobName === void 0) { blobName = ""; }
    if (usePrimaryEndpoint === void 0) { usePrimaryEndpoint = true; }
    return BlobUtilities_1.getBlobService(connectionString, "generateSharedAccessSignatureWithPolicy").then(function (blobService) {
        var deferred = Q.defer();
        try {
            var sharedAccessPolicy = {
                Id: accessPolicyId,
                AccessPolicy: null
            }, sasToken = blobService.generateSharedAccessSignature(containerName, blobName, sharedAccessPolicy, null), sasUrl = blobService.getUrl(containerName, blobName, sasToken, usePrimaryEndpoint), results = {
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
function getContainerAccessControlList(connectionString, containerName) {
    return BlobUtilities_1.getBlobService(connectionString, "getContainerAccessControlList").then(function (blobService) {
        var deferred = Q.defer();
        try {
            blobService.getContainerAcl(containerName, function (error, result, ignoredResponse) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(storageManagerHelper.AccessPoliciesFromSignedIdentifierMap(result.signedIdentifiers));
                }
            });
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    });
}
exports.getContainerAccessControlList = getContainerAccessControlList;
/**
 * Set container access control lists.
 */
function setContainerAccessControlList(connectionString, containerName, sharedAccessPolicies) {
    return BlobUtilities_1.getBlobService(connectionString, "setContainerAccessControlList").then(function (blobService) {
        var deferred = Q.defer();
        try {
            var azurePolicies = {};
            sharedAccessPolicies.forEach(function (policy) {
                var policyId = policy.Id;
                if (!policyId) {
                    throw storageErrors.NullOrEmptyArgumentError.getHostErrorInstance("policy.Id");
                }
                if (azurePolicies[policyId]) {
                    throw storageErrors.PolicyAlreadyExistsError.getHostErrorInstance("policy.Id", policyId);
                }
                azurePolicies[policyId] = {
                    Expiry: new Date(policy.AccessPolicy.Expiry.toString()),
                    Start: policy.AccessPolicy.Start ? new Date(policy.AccessPolicy.Start.toString()) : undefined,
                    Permissions: policy.AccessPolicy.Permissions ? policy.AccessPolicy.Permissions : undefined
                };
            });
            blobService.setContainerAcl(containerName, azurePolicies, /*options*/ null, function (error, result, ignoredResponse) {
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
exports.setContainerAccessControlList = setContainerAccessControlList;
function getSASBlobContainer(connectionString, searchQuery, containerName) {
    // Prefix search for UX consistency since other search is prefix at the moment
    if (searchQuery && !_string.startsWith(containerName, searchQuery)) {
        // Container name doesn't satisfy search query.
        return Q.resolve({
            storageResources: [],
            continuationToken: null
        });
    }
    return BlobUtilities_1.getBlobService(connectionString, "getSASBlobContainer").then(function (blobService) {
        var azureStorageResources = [];
        azureStorageResources.push({
            name: containerName,
            attributes: [
                {
                    name: "connectionString",
                    value: connectionString
                },
                {
                    name: "url",
                    value: blobService.getUrl(containerName)
                }
            ]
        });
        return {
            storageResources: azureStorageResources,
            continuationToken: null
        };
    });
}
exports.getSASBlobContainer = getSASBlobContainer;
function getSASBlobContainers(blobContainers, searchQuery) {
    var promises = [];
    blobContainers.forEach(function (container) {
        promises.push(getSASBlobContainer(container.connectionString, searchQuery, container.name));
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
exports.getSASBlobContainers = getSASBlobContainers;
/**
 * List all blob containers belonging to a storage account.
 */
function listBlobContainersSegmented(connectionString, currentToken, searchQuery, numResults) {
    return BlobUtilities_1.getBlobService(connectionString, "listBlobContainersSegmented").then(function (blobService) {
        var deferred = Q.defer();
        var options = { maxResults: numResults };
        blobService.listContainersSegmentedWithPrefix(searchQuery, currentToken, options, function (error, result, response) {
            if (error) {
                error = storageManagerHelper.processError(error);
                deferred.reject(error);
            }
            else {
                var entries = result.entries || [];
                var azureStorageResources = [];
                var accessPromises = [];
                // Only add $logs blob container for the first time fetching blob containers.
                if (!currentToken) {
                    var logsName = "$logs";
                    var logsAccessPromise = doesContainerExist(blobService, logsName).then(function (result) {
                        if (result.exists) {
                            var logsContainerResource = createAzureStorageResource(blobService, logsName, result);
                            return getContainerPublicAccessLevel(connectionString, logsName)
                                .then(function (accessLevel) {
                                logsContainerResource.attributes.push({ name: "publicReadAccess", value: accessLevel });
                                azureStorageResources.push(logsContainerResource);
                            }).catch(function (error) {
                                // If the error status code is 404 and error code is "ContainerNotFound", then it means logs isn't enabled
                                // for this account. In this case, we'll not show the $logs container.
                                if (error.statusCode !== 404 || error.code !== "ContainerNotFound") {
                                    azureStorageResources.push(logsContainerResource);
                                }
                            });
                        }
                    });
                    accessPromises.push(logsAccessPromise);
                }
                entries.forEach(function (blobResult) {
                    var containerName = blobResult.name; // Should be .container in azure-storage v0.10+
                    var containerResource = createAzureStorageResource(blobService, containerName, blobResult);
                    var accessPromise = getContainerPublicAccessLevel(connectionString, containerName)
                        .then(function (accessLevel) {
                        containerResource.attributes.push({ name: "publicReadAccess", value: accessLevel });
                        azureStorageResources.push(containerResource);
                    })
                        .catch(function (error) {
                        // The only thing we do with the access level property is display it in Cloud Explorer.
                        // If we can't retrieve it for any reaosn (inadequate permissions or network problems),
                        // we should still list the container.
                        azureStorageResources.push(containerResource);
                    });
                    accessPromises.push(accessPromise);
                });
                Q.allSettled(accessPromises).then(function () {
                    deferred.resolve({
                        storageResources: azureStorageResources,
                        continuationToken: result.continuationToken
                    });
                });
            }
        });
        return deferred.promise;
    });
}
exports.listBlobContainersSegmented = listBlobContainersSegmented;
/**
 * List all blob containers belonging to a storage account.
 */
function listSingleBlobContainerByName(connectionString, containerName) {
    return BlobUtilities_1.getBlobService(connectionString, "listSingleBlobContainer").then(function (blobService) {
        return Q.Promise(function (resolve, reject) {
            blobService.getContainerProperties(containerName, function (error, propertiesResult, response) {
                if (error) {
                    error = storageManagerHelper.processError(error);
                    reject(error);
                }
                else {
                    var containerName = propertiesResult.name; // Should be .container in azure-storage v0.10+
                    var containerResource = createAzureStorageResource(blobService, containerName, propertiesResult);
                    getContainerPublicAccessLevel(connectionString, containerName)
                        .then(function (accessLevel) {
                        containerResource.attributes.push({ name: "publicReadAccess", value: accessLevel });
                        resolve({
                            storageResources: [containerResource],
                            continuationToken: null
                        });
                    })
                        .catch(function (error) {
                        // The only thing we do with the access level property is display it in Cloud Explorer.
                        // If we can't retrieve it for any reaosn (inadequate permissions or network problems),
                        // we should still list the container.
                        resolve({
                            storageResources: [containerResource],
                            continuationToken: null
                        });
                    });
                }
            });
        });
    });
}
exports.listSingleBlobContainerByName = listSingleBlobContainerByName;
function createAzureStorageResource(blobService, containerName, containerProperties) {
    var containerResource = {
        name: containerName,
        attributes: [
            { name: "lastModified", value: containerProperties.lastModified },
            { name: "url", value: blobService.getUrl(containerName, null, null /*sasToken*/, true /*primary*/) }
        ]
    };
    return containerResource;
}
function doesContainerExist(blobService, containerName) {
    var deferred = Q.defer();
    blobService.doesContainerExist(containerName, function (error, result, response) {
        if (error) {
            deferred.reject(error);
        }
        else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
}
function doesBlobExist(containerReference, blobName) {
    return BlobUtilities_1.getBlobService(containerReference.connectionString, "doesBlobExist").then(function (blobService) {
        return Q.Promise(function (resolve, reject) {
            blobService.doesBlobExist(containerReference.containerName, blobName, function (error, result, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result.exists);
                }
            });
        });
    });
}
exports.doesBlobExist = doesBlobExist;
function doesBlobFolderExist(containerReference, folderName) {
    var prefix = utilities.appendSlash(folderName);
    var check = function (continuationToken) {
        return BlobQueryOperations.listBlobsSegmented(containerReference, prefix, null, // currentToken
        1, // numResults
        "doesBlobFolderExist", // callerName
        ListBlobsInclude_1.default.FlatList // flatListOfBlobs
        ).then(function (result) {
            if (result.Results.length) {
                return Q.resolve(true);
            }
            else if (result.ContinuationToken) {
                return check(result.ContinuationToken);
            }
            else {
                return Q.resolve(false);
            }
        });
    };
    return check(null);
}
exports.doesBlobFolderExist = doesBlobFolderExist;
/**
 * Get container public access level.
 */
function getContainerPublicAccessLevel(connectionString, container) {
    return BlobUtilities_1.getBlobService(connectionString, "getContainerPublicAccessLevel").then(function (blobService) {
        var deferred = Q.defer();
        blobService.getContainerAcl(container, null, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                var accessLevel = !response.headers["x-ms-blob-public-access"] ? "Off" : utilities.capitalizeFirstLetter(response.headers["x-ms-blob-public-access"]);
                deferred.resolve(accessLevel);
            }
        });
        return deferred.promise;
    });
}
exports.getContainerPublicAccessLevel = getContainerPublicAccessLevel;
/**
 * Returns the primary and secondary URLs for a storage blob or blob container
 */
function getPrimaryStorageUri(blobOrContainer) {
    return BlobUtilities_1.getBlobService(blobOrContainer.connectionString, "getPrimaryStorageUri").then(function (blobService) {
        var uri = blobService.getUrl(blobOrContainer.containerName, blobOrContainer.blobName, null, null);
        return Q.resolve(uri);
    });
}
exports.getPrimaryStorageUri = getPrimaryStorageUri;
/**
 * Get the properties of a blob.
 */
function getBlob(containerReference, blobName, snapshot) {
    return BlobUtilities_1.getBlobService(containerReference.connectionString, "getBlob").then(function (blobService) {
        var deferred = Q.defer();
        var options = {};
        if (snapshot) {
            options.snapshotId = snapshot;
        }
        blobService.getBlobProperties(containerReference.containerName, blobName, options, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                var uri = blobService.getUrl(containerReference.containerName, blobName, null /*sasToken*/, true /*primary*/);
                if (snapshot) {
                    uri += "?snapshot=" + snapshot;
                }
                var blob = {
                    FileName: utilities.getNameFromStoragePath(result.name),
                    FullName: result.name,
                    ContentType: (result.contentSettings ? result.contentSettings.contentType : ""),
                    LastModified: result.lastModified,
                    Size: result.contentLength,
                    Uri: uri,
                    Blob: {
                        Snapshot: snapshot,
                        BlobType: result.blobType,
                        LeaseState: result.lease && result.lease.state,
                        LeaseStatus: result.lease && result.lease.status,
                        LeaseDuration: result.lease && result.lease.duration,
                        metadata: {
                            microsoftazurecompute_diskname: result.metadata["microsoftazurecompute_diskname"],
                            microsoftazurecompute_disktype: result.metadata["microsoftazurecompute_disktype"],
                            microsoftazurecompute_resourcegroupname: result.metadata["microsoftazurecompute_resourcegroupname"],
                            microsoftazurecompute_vmname: result.metadata["microsoftazurecompute_vmname"]
                        }
                    }
                };
                deferred.resolve(blob);
            }
        });
        return deferred.promise;
    });
}
exports.getBlob = getBlob;
/**
 * Get the properties and metadata of a blob.
 */
function getBlobProperties(connectionString, containerName, blobName, snapshotId) {
    return BlobUtilities_1.getBlobService(connectionString, "getBlobProperties")
        .then(function (blobService) {
        var deferred = Q.defer();
        var options = {};
        if (snapshotId) {
            options.snapshotId = snapshotId;
        }
        blobService.getBlobProperties(containerName, blobName, options, function (error, result, response) {
            if (error) {
                deferred.reject(storageManagerHelper.processError(error));
            }
            else {
                var uri = blobService.getUrl(containerName, blobName, null /*sasToken*/, true /*primary*/);
                blobService.getBlobMetadata(containerName, blobName, options, function (error, metadataResult, metadataResponse) {
                    if (error) {
                        deferred.reject(error);
                    }
                    else {
                        var properties = {
                            name: result.name,
                            container: result.container,
                            etag: result.etag,
                            lastModified: result.lastModified,
                            size: result.contentLength,
                            blobType: result.blobType,
                            sequenceNumber: result.sequenceNumber,
                            appendOffset: result.appendOffset,
                            cacheControl: result.contentSettings && result.contentSettings.cacheControl,
                            committedBlockCount: result.committedBlockCount,
                            copyId: result.copy && result.copy.id,
                            copyCompletionTime: result.copy && result.copy.completionTime,
                            copyProgress: result.copy && result.copy.progress,
                            copySource: result.copy && result.copy.source,
                            copyStatus: result.copy && result.copy.status,
                            contentType: result.contentSettings && result.contentSettings.contentType,
                            contentMD5: result.contentSettings && result.contentSettings.contentMD5,
                            contentEncoding: result.contentSettings && result.contentSettings.contentEncoding,
                            contentDisposition: result.contentSettings && result.contentSettings.contentDisposition,
                            contentLanguage: result.contentSettings && result.contentSettings.contentLanguage,
                            incrementalCopy: result.appendOffset,
                            leaseState: result.lease && result.lease.state,
                            leaseStatus: result.lease && result.lease.status,
                            leaseDuration: result.lease && result.lease.duration,
                            leaseId: result.lease && result.lease.id,
                            MetaData: metadataResult,
                            serverEncrypted: result.serverEncrypted,
                            uri: uri
                        };
                        deferred.resolve(properties);
                    }
                });
            }
        });
        return deferred.promise;
    });
}
exports.getBlobProperties = getBlobProperties;
/**
 * Sets the properties of a blob. Currently, you can set only content settings properties.
 */
function setBlobProperties(connectionString, containerName, blobName, properties) {
    return BlobUtilities_1.getBlobService(connectionString, "setBlobProperties")
        .then(function (blobService) {
        var deferred = Q.defer();
        blobService.setBlobProperties(containerName, blobName, properties, function (error, result, response) {
            utilities.resolveOrReject(deferred, error, result);
        });
        return deferred.promise;
    });
}
exports.setBlobProperties = setBlobProperties;
/**
 * Sets the metadata of a blob.
 */
function setBlobMetadata(connectionString, containerName, blobName, metadata) {
    return BlobUtilities_1.getBlobService(connectionString, "setBlobMetadata")
        .then(function (blobService) {
        var deferred = Q.defer();
        blobService.setBlobMetadata(containerName, blobName, metadata, function (error, result, response) {
            utilities.resolveOrReject(deferred, error, result);
        });
        return deferred.promise;
    });
}
exports.setBlobMetadata = setBlobMetadata;
function getContainerProperties(connectionString, containerName) {
    return BlobUtilities_1.getBlobService(connectionString, "getContainerProperties")
        .then(function (blobService) {
        var deferred = Q.defer();
        blobService.getContainerProperties(containerName, function (error, result, response) {
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
exports.getContainerProperties = getContainerProperties;
/**
 * Get CORS Rules
 */
function getCorsRules(connectionString) {
    return BlobUtilities_1.getBlobService(connectionString, "getServiceProperties").then(function (blobService) {
        var deferred = Q.defer();
        blobService.getServiceProperties(function (error, result, response) {
            if (error) {
                deferred.reject(storageManagerHelper.processError(error));
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
    return BlobUtilities_1.getBlobService(connectionString, "setServiceProperties").then(function (blobService) {
        var deferred = Q.defer();
        var serviceProperties;
        serviceProperties = {
            Cors: {
                CorsRule: corsRule
            }
        };
        try {
            blobService.setServiceProperties(serviceProperties, function (error, response) {
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
/**
 * Delete a blob.
 */
function deleteBlob(connectionString, containerName, blob, snapshot) {
    return BlobUtilities_1.getBlobService(connectionString, "deleteBlob").then(function (blobService) {
        var deferred = Q.defer();
        var options = {};
        if (snapshot) {
            options.snapshotId = snapshot;
        }
        blobService.deleteBlob(containerName, blob, options, function (error, response) {
            if (error) {
                deferred.reject(storageManagerHelper.processError(error));
            }
            else {
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    });
}
exports.deleteBlob = deleteBlob;
/**
 * Attempt to acquire a new lease on a blob or container (if blob not specified)
 */
function acquireLease(connectionString, containerName, blobName) {
    return BlobUtilities_1.getBlobService(connectionString, "acquireLease")
        .then(function (blobService) {
        return Q.Promise(function (resolve, reject) {
            blobService.acquireLease(containerName, blobName, function (error, result, response) {
                if (error) {
                    if (error.code === "LeaseAlreadyPresent") {
                        // Already has a lease - ignore
                    }
                    else {
                        reject(error);
                    }
                }
                resolve(null);
            });
        });
    });
}
exports.acquireLease = acquireLease;
/**
 * Attempt to acquire a new lease on a blob or container (if blob not specified)
 */
function breakLease(connectionString, containerName, blobName) {
    return BlobUtilities_1.getBlobService(connectionString, "breakLease")
        .then(function (blobService) {
        return Q.Promise(function (resolve, reject) {
            blobService.breakLease(containerName, blobName, function (error, result, response) {
                if (error) {
                    if (error.code === "LeaseNotPresentWithLeaseOperation") {
                        // Blob doesn't have a lease - ignore
                        // (We seem to get this for page blobs but no error for block blobs)
                    }
                    else {
                        reject(error);
                    }
                }
                resolve(null);
            });
        });
    });
}
exports.breakLease = breakLease;
function makeSnapshot(connectionString, containerName, blobName) {
    return BlobUtilities_1.getBlobService(connectionString, "makeSnapshot")
        .then(function (blobService) {
        return Q.Promise(function (resolve, reject) {
            blobService.createBlobSnapshot(containerName, blobName, function (error, result, response) {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });
    });
}
exports.makeSnapshot = makeSnapshot;
/**
 * Registers a blob to be copied from one location to another
 */
function startCopyStorageBlob(sourceUriWithSas, sourceSnapshot, destination, overwriteIfExists) {
    return BlobUtilities_1.getBlobService(destination.connectionString, "startCopyStorageBlob").then(function (blobService) {
        var deferred = Q.defer();
        var options = {};
        if (!overwriteIfExists) {
            // Force an error if the destination already exists
            options.accessConditions = azureStorage.AccessCondition.generateIfNotExistsCondition();
        }
        ;
        if (sourceSnapshot && sourceSnapshot.length > 0) {
            options.snapshotId = sourceSnapshot;
        }
        blobService.startCopyBlob(sourceUriWithSas, destination.containerName, destination.blobName, options, function (error, result, response) {
            if (error) {
                deferred.reject(storageManagerHelper.processError(error));
            }
            else {
                console.assert(!!result.copy);
                var returnValue = {
                    copyId: result.copy && result.copy.id,
                    status: result.copy && result.copy.status,
                    statusDescription: result.copy && result.copy.statusDescription,
                    progress: result.copy && result.copy.progress
                };
                deferred.resolve(returnValue);
            }
        });
        return deferred.promise;
    });
}
exports.startCopyStorageBlob = startCopyStorageBlob;
/**
 * Aborts an existing blob copy
 */
function abortCopyStorageBlob(destination, copyId) {
    return BlobUtilities_1.getBlobService(destination.connectionString, "abortCopyStorageBlob", StorageManagerHelper_1.RetryDurations.Medium)
        .then(function (blobService) {
        var deferred = Q.defer();
        blobService.abortCopyBlob(destination.containerName, destination.blobName, copyId, null, function (error, response) {
            if (error) {
                deferred.reject(storageManagerHelper.processError(error));
            }
            else {
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    });
}
exports.abortCopyStorageBlob = abortCopyStorageBlob;
/**
 * Gets the progress of a registered blob copy
 */
function getCopyBlobProgress(destination) {
    return BlobUtilities_1.getBlobService(destination.connectionString, "getCopyBlobProgress", StorageManagerHelper_1.RetryDurations.None).then(function (blobService) {
        var deferred = Q.defer();
        blobService.getBlobProperties(destination.containerName, destination.blobName, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                var returnValue = {
                    copyId: result.copy && result.copy.id,
                    status: result.copy && result.copy.status,
                    statusDescription: result.copy && result.copy.statusDescription,
                    progress: result.copy && result.copy.progress
                };
                deferred.resolve(returnValue);
            }
        });
        return deferred.promise;
    });
}
exports.getCopyBlobProgress = getCopyBlobProgress;

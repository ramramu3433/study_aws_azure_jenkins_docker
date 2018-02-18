"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var Q = require("q");
var _string = require("underscore.string");
var FileUtilities = require("./Files/FileUtilities");
var flobManager = require("./FlobManager");
var StorageManagerHelper_1 = require("./StorageManagerHelper");
var StorageErrors = require("./StorageErrors");
var StorageManagerHelper = require("./StorageManagerHelper");
var Utilities = require("../../../Utilities");
// CONSIDER: Make all these consistent in taking a path, not a directory+path separately
/**
 * List all file shares belonging to an storage account.
 */
function listFileSharesSegmented(connectionString, currentToken, searchQuery, numResults) {
    return FileUtilities.getFileService(connectionString, "listFileSharesSegmented").then(function (fileService) {
        var deferred = Q.defer();
        var options = { maxResults: numResults };
        fileService.listSharesSegmentedWithPrefix(searchQuery, currentToken, options, function (error, result, response) {
            if (error) {
                error = StorageManagerHelper.processError(error);
                deferred.reject(error);
            }
            else {
                var entries = result.entries || [];
                var azureStorageResources = [];
                entries.forEach(function (shareResult) {
                    var shareName = shareResult.name;
                    azureStorageResources.push(createAzureStorageResource(shareName, fileService, shareResult));
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
exports.listFileSharesSegmented = listFileSharesSegmented;
function listSingleFileShareByName(connectionString, fileShareName) {
    return FileUtilities.getFileService(connectionString, "listFileSharesSegmented").then(function (fileService) {
        return Q.Promise(function (resolve, reject) {
            fileService.getShareProperties(fileShareName, function (error, result, response) {
                if (error) {
                    error = StorageManagerHelper.processError(error);
                    reject(error);
                }
                else {
                    resolve({
                        storageResources: [createAzureStorageResource(fileShareName, fileService, result)],
                        continuationToken: null
                    });
                }
            });
        });
    });
}
exports.listSingleFileShareByName = listSingleFileShareByName;
function createAzureStorageResource(shareName, fileService, shareResult) {
    return {
        name: shareName,
        attributes: [
            {
                name: "lastModified",
                value: shareResult.lastModified
            },
            {
                name: "url",
                value: fileService.getUrl(shareName, /* root directory */ "", /* file*/ null, /*sasToken*/ null, /*primary*/ true)
            },
            {
                name: "quota",
                value: shareResult.quota
            }
        ]
    };
}
function getSASFileShares(fileShares, searchQuery) {
    var promises = [];
    fileShares.forEach(function (share) {
        promises.push(getSASFileShare(share.connectionString, searchQuery, share.name));
    });
    return Q.all(promises)
        .then(function (promiseResults) {
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
exports.getSASFileShares = getSASFileShares;
/**
 * Gets a SAS file share from Azure.
 */
function getSASFileShare(connectionString, searchQuery, shareName) {
    // Prefix search for UX consistency since other search is prefix at the moment
    if (searchQuery && !_string.startsWith(shareName, searchQuery)) {
        // Share name doesn't satisfy search query.
        return Q.resolve({
            storageResources: [],
            continuationToken: null
        });
    }
    return FileUtilities.getFileService(connectionString, "getSASFileShare")
        .then(function (fileService) {
        var azureStorageResources = [];
        azureStorageResources.push({
            name: shareName,
            attributes: [
                { name: "connectionString", value: connectionString },
                { name: "url", value: fileService.getUrl(shareName, "") }
            ]
        });
        return {
            storageResources: azureStorageResources,
            continuationToken: null
        };
    });
}
exports.getSASFileShare = getSASFileShare;
/**
 * Gets the share statistics for a share
 */
function getShareStats(connectionString, shareName) {
    return FileUtilities.getFileService(connectionString, "getShareStats").then(function (fileService) {
        return Q.Promise(function (resolve, reject) {
            fileService.getShareStats(shareName, null, function (error, result, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    });
}
/**
 * Get a file share.
 */
function getFileShare(connectionString, shareName) {
    return FileUtilities.getFileService(connectionString, "getFileShare").then(function (fileService) {
        var deferred = Q.defer();
        var portalAttributes = [
            {
                name: "url",
                value: fileService.getUrl(shareName, /* root directory */ "", /* file*/ null, /*sasToken*/ null, /*primary*/ true)
            }
        ];
        var shareUsage;
        var statsPromise = getShareStats(connectionString, shareName).then(function (statsResult) {
            shareUsage = statsResult.shareStats.shareUsage;
        });
        var properties;
        var propertiesPromise = Q.Promise(function (resolve, reject) {
            fileService.getShareProperties(shareName, function (error, result, response) {
                if (error) {
                    reject(error);
                }
                else {
                    properties = result;
                    resolve(properties);
                }
            });
        });
        Q.all([propertiesPromise, statsPromise]).then(function () {
            portalAttributes = portalAttributes.concat([
                {
                    name: "lastModified",
                    value: properties.lastModified
                },
                {
                    name: "quota",
                    value: properties.quota
                },
                {
                    name: "usage",
                    value: shareUsage + " GB"
                }
            ]);
            var results = {
                name: shareName,
                attributes: portalAttributes
            };
            deferred.resolve(results);
        });
        return deferred.promise;
    });
}
exports.getFileShare = getFileShare;
function doesFileShareExist(connectionString, shareName) {
    return FileUtilities.getFileService(connectionString, "doesFileShareExist").then(function (fileService) {
        return Q.Promise(function (resolve, reject) {
            fileService.doesShareExist(shareName, null, function (error, result, response) {
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
exports.doesFileShareExist = doesFileShareExist;
/**
 * CONSIDER: Move to FileQueryOperations.
 */
function doesFileExist(connectionString, shareName, directory, fileName) {
    return FileUtilities.getFileService(connectionString, "doesFileExist").then(function (fileService) {
        return Q.Promise(function (resolve, reject) {
            fileService.doesFileExist(shareName, directory, fileName, function (error, result, response) {
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
exports.doesFileExist = doesFileExist;
/**
 * CONSIDER: Move to FileQueryOperations.
 */
function doesDirectoryExist(connectionString, shareName, directory) {
    return FileUtilities.getFileService(connectionString, "doesDirectoryExist").then(function (fileService) {
        return Q.Promise(function (resolve, reject) {
            fileService.doesDirectoryExist(shareName, directory, function (error, result, response) {
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
exports.doesDirectoryExist = doesDirectoryExist;
/**
 * Create a file share.
 */
function createFileShare(connectionString, shareName, quota, metadata) {
    return FileUtilities.getFileService(connectionString, "createFileShare")
        .then(function (fileService) {
        var deferred = Q.defer();
        var options = {};
        if (!!quota) {
            options.quota = quota;
        }
        if (!!metadata) {
            options.metadata = metadata;
        }
        fileService.createShare(shareName, options, function (error, result, response) {
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
exports.createFileShare = createFileShare;
/**
 * Creates an empty copy of a file share.
 *
 * Shared access policies are not copied, because `sourceConnectionString` is usually
 * a SAS connection string which lacks the necessary permissions to access that data.
 *
 * The Azure client lib has a bug wherein the `publicAccessLevel` property isn't retrieved correctly.
 * It's always returned as `null`, even if the provides container or blob access.
 */
function createFileShareFromExisting(sourceConnectionString, sourceShareName, targetConnectionString, targetShareName) {
    return getFileShareProperties(sourceConnectionString, sourceShareName)
        .then(function (properties) {
        var quota = parseInt(properties.quota, 10);
        return createFileShare(targetConnectionString, targetShareName, quota, properties.metadata);
    });
}
exports.createFileShareFromExisting = createFileShareFromExisting;
/**
 * Delete a file share.
 */
function deleteFileShare(connectionString, shareName) {
    return FileUtilities.getFileService(connectionString, "deleteFileShare").then(function (fileService) {
        var deferred = Q.defer();
        fileService.deleteShare(shareName, function (error, response) {
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
exports.deleteFileShare = deleteFileShare;
/**
 * Creates a directory in a file share.
 */
function createDirectory(shareReference, newDirectoryPath, createParentDirectories, metadata) {
    newDirectoryPath = Utilities.removeTrailingSlash(Utilities.replaceBackslashWithSlash(newDirectoryPath));
    var parentDirectoryPath = Path.posix.dirname(newDirectoryPath);
    parentDirectoryPath = parentDirectoryPath === "." ? "" : parentDirectoryPath;
    // Don't retry if the client doesn't want to or if we've already reached the share root.
    var recursivelyCreateParents = !!createParentDirectories && !!parentDirectoryPath ?
        function () { return createDirectory(shareReference, parentDirectoryPath, true); } :
        null;
    return createDirectoryCore(shareReference, newDirectoryPath, metadata, recursivelyCreateParents);
}
exports.createDirectory = createDirectory;
/**
 * Creates a new directory with the same properties and metadata of an existing directory.
 * @returns A promise that resolves to true if the directory was created or false if the directory already exists.
 */
function createDirectoryFromExisting(sourceShare, sourcePath, targetShare, targetPath) {
    sourcePath = Utilities.removeTrailingSlash(Utilities.replaceBackslashWithSlash(sourcePath));
    targetPath = Utilities.removeTrailingSlash(Utilities.replaceBackslashWithSlash(targetPath));
    return doesDirectoryExist(targetShare.connectionString, targetShare.shareName, targetPath)
        .then(function (result) {
        if (result) {
            // If the directory already exists, nothing else to do.
            return false;
        }
        var sourceName = Path.posix.basename(sourcePath);
        var sourcePathParent = Path.posix.dirname(sourcePath);
        var targetPathParent = Path.posix.dirname(targetPath);
        sourcePathParent = sourcePathParent === "." ? "" : sourcePathParent;
        targetPathParent = targetPathParent === "." ? "" : targetPathParent;
        // Don't retry if we've reached the root in either file share.
        var recursivelyCreateParents = !!sourcePathParent && !!targetPathParent ?
            function () { return createDirectoryFromExisting(sourceShare, sourcePathParent, targetShare, targetPathParent); } :
            null;
        return getDirectoryPropertiesCore(sourceShare.connectionString, sourceShare.shareName, sourcePathParent, sourceName)
            .then(function (props) { return createDirectoryCore(targetShare, targetPath, props ? props.metadata : null, recursivelyCreateParents); });
    });
}
exports.createDirectoryFromExisting = createDirectoryFromExisting;
/**
 * Get the properties of a directory.
 */
function getDirectory(shareReference, directory) {
    return FileUtilities.getFileService(shareReference.connectionString, "getDirectory").then(function (fileService) {
        var deferred = Q.defer();
        fileService.getDirectoryProperties(shareReference.shareName, directory, null, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                var uri = fileService.getUrl(shareReference.shareName, result.name, null, null /*sasToken*/, true /*primary*/);
                var fileName = Utilities.getNameFromStoragePath(result.name);
                var newDirectory = {
                    FileName: fileName,
                    FullName: result.name,
                    ContentType: "Folder",
                    LastModified: result.lastModified,
                    Uri: uri,
                    Blob: {
                        Snapshot: "",
                        BlobType: "",
                        LeaseDuration: "",
                        LeaseState: "",
                        LeaseStatus: "",
                        metadata: {
                            microsoftazurecompute_diskname: null,
                            microsoftazurecompute_disktype: null,
                            microsoftazurecompute_resourcegroupname: null,
                            microsoftazurecompute_vmname: null
                        }
                    },
                    Size: undefined
                };
                deferred.resolve(newDirectory);
            }
        });
        return deferred.promise;
    });
}
exports.getDirectory = getDirectory;
/**
 * Get the properties of a file.
 */
function getFile(shareReference, directory, fileName) {
    return FileUtilities.getFileService(shareReference.connectionString, "getFile").then(function (fileService) {
        var deferred = Q.defer();
        fileService.getFileProperties(shareReference.shareName, directory, fileName, null, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                var uri = fileService.getUrl(shareReference.shareName, result.directory, result.name, null /*sasToken*/, true /*primary*/);
                var file = {
                    FileName: result.name,
                    FullName: Path.posix.join(result.directory, result.name),
                    ContentType: (result.contentSettings ? result.contentSettings.contentType : ""),
                    LastModified: result.lastModified,
                    Size: result.contentLength,
                    Uri: uri,
                    Blob: {
                        Snapshot: "",
                        BlobType: "",
                        LeaseDuration: "",
                        LeaseState: "",
                        LeaseStatus: "",
                        metadata: {
                            microsoftazurecompute_diskname: null,
                            microsoftazurecompute_disktype: null,
                            microsoftazurecompute_resourcegroupname: null,
                            microsoftazurecompute_vmname: null
                        }
                    }
                };
                deferred.resolve(file);
            }
        });
        return deferred.promise;
    });
}
exports.getFile = getFile;
/**
 * Get CORS Rules
 */
function getCorsRules(connectionString) {
    return FileUtilities.getFileService(connectionString, "getServiceProperties").then(function (fileService) {
        var deferred = Q.defer();
        fileService.getServiceProperties(function (error, result, response) {
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
    return FileUtilities.getFileService(connectionString, "setServiceProperties").then(function (fileService) {
        var deferred = Q.defer();
        var serviceProperties;
        serviceProperties = {
            Cors: {
                CorsRule: corsRule
            }
        };
        try {
            fileService.setServiceProperties(serviceProperties, function (error, response) {
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
 * Delete an Azure file
 */
function deleteFile(connectionString, shareName, directory, file) {
    return FileUtilities.getFileService(connectionString, "deleteFile").then(function (service) {
        var deferred = Q.defer();
        service.deleteFile(shareName, directory, file, null, function (error, response) {
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
exports.deleteFile = deleteFile;
/**
 * Delete an Azure directory (has to be empty first)
 */
function deleteDirectory(connectionString, shareName, directory) {
    return FileUtilities.getFileService(connectionString, "deleteDirectory").then(function (service) {
        var deferred = Q.defer();
        service.deleteDirectoryIfExists(shareName, directory, null, function (error, response) {
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
exports.deleteDirectory = deleteDirectory;
function abortFileUpload(progressId) {
    return flobManager.abortFlobTransfer(progressId, "Internal error: The specified file upload is not currently active."); // Localize
}
exports.abortFileUpload = abortFileUpload;
function abortFileDownload(progressId) {
    return flobManager.abortFlobTransfer(progressId, "Internal error: The specified file download is not currently active."); // Localize
}
exports.abortFileDownload = abortFileDownload;
/**
 * Gets the progress of a file upload, or null if not tracked
 */
function getFileUploadProgress(progressId) {
    return flobManager.getFlobTransferProgress(progressId);
}
exports.getFileUploadProgress = getFileUploadProgress;
/**
 * Gets the progress of a file download, or null if not tracked
 */
function getFileDownloadProgress(progressId) {
    return flobManager.getFlobTransferProgress(progressId);
}
exports.getFileDownloadProgress = getFileDownloadProgress;
/**
 * Releases the cache of progress and other information for a file upload, to free up
 * memory usage.
 */
function releaseFileUpload(progressId) {
    return flobManager.releaseFlobTransfer(progressId);
}
exports.releaseFileUpload = releaseFileUpload;
/**
 * Releases the cache of progress and other information for a file download, to free up
 * memory usage.
 */
function releaseFileDownload(progressId) {
    return flobManager.releaseFlobTransfer(progressId);
}
exports.releaseFileDownload = releaseFileDownload;
/**
 * Uploads a local file to an Azure file.  The progress ID that is passed in can be used to abort.
 */
function uploadFile(shareReference, destDirectory, destFileName, sourceFilePath, fileSize, progressId, overwriteIfExists) {
    var fileSize = fileSize;
    var retryDuration = flobManager.getRetryDurationFromFlobSize(fileSize);
    console.assert(flobManager.cancelFilterPromises[progressId] === undefined, "Non-unique progressId?");
    // We provide this immediately because it's possible for someone to call cancel before we have a cancel filter.
    var cancelFilterDeferred = flobManager.createFilterProviderWithDeferred(progressId);
    return FileUtilities.getFileService(shareReference.connectionString, "uploadFile", retryDuration)
        .then(function (fileService) {
        var deferred = Q.defer();
        var options = {};
        var cancelFilter = fileService.cancelFilter;
        // Now that we have a cancel filter, resolve it in the provider
        cancelFilterDeferred.resolve(cancelFilter);
        // File APIs don't currently support condition headers, so we can't support overwriteIfExists - will always overwrite
        console.assert(overwriteIfExists, "File APIs don't currently support condition headers, so overwriteIfExists must always be true");
        // if (!overwriteIfExists) {
        //     // Force an error if the destination already exists
        //     options.accessConditions = {
        //         EtagNonMatch: "*"
        //     }
        // };
        var speedSummary = fileService.createFileFromLocalFile(shareReference.shareName, destDirectory, destFileName, sourceFilePath, options, function (error, result, response) {
            if (error) {
                deferred.reject(StorageManagerHelper.processError(error));
            }
            else {
                deferred.resolve(undefined);
            }
        });
        flobManager.patchSpeedSummary(speedSummary, function (error) { return deferred.reject(error); });
        console.assert(!!flobManager.cancelFilterPromises[progressId]);
        flobManager.cachedSpeedSummaries[progressId] = speedSummary;
        return deferred.promise;
    });
}
exports.uploadFile = uploadFile;
/**
 * Downloads an Azure file to a local file.
 * The progress ID that is passed in can be used to abort.
 *
 * Note: The destination will be overwritten without asking
 */
function downloadFile(shareReference, sourceDirectory, sourceFileName, localFilePath, progressId, fileLength) {
    var retryDuration = flobManager.getRetryDurationFromFlobSize(fileLength);
    console.assert(flobManager.cancelFilterPromises[progressId] === undefined, "Non-unique progressId?");
    // We provide this immediately because it's possible for someone to call cancel before we have a cancel filter.
    var cancelFilterDeferred = flobManager.createFilterProviderWithDeferred(progressId);
    return FileUtilities.getFileService(shareReference.connectionString, "downloadFile", retryDuration)
        .then(function (fileService) {
        var deferred = Q.defer();
        var cancelFilter = fileService.cancelFilter;
        // Now that we have a cancel filter, resolve it in the provider
        cancelFilterDeferred.resolve(cancelFilter);
        var speedSummary = fileService.getFileToLocalFile(shareReference.shareName, sourceDirectory, sourceFileName, localFilePath, null, function (error, result, response) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(null);
            }
        });
        flobManager.cachedSpeedSummaries[progressId] = speedSummary;
        console.assert(!!flobManager.cancelFilterPromises[progressId]);
        return deferred.promise;
    });
}
exports.downloadFile = downloadFile;
/**
 * Generate Shared Access Signature for file share or file.
 */
function generateSharedAccessSignature(connectionString, shareName, expiry, // Expiry is mandatory
    filePath, start, permissions, usePrimaryEndpoint) {
    if (filePath === void 0) { filePath = ""; }
    if (start === void 0) { start = null; }
    if (permissions === void 0) { permissions = null; }
    if (usePrimaryEndpoint === void 0) { usePrimaryEndpoint = true; }
    var sharedAccessPolicy = {
        Id: null,
        AccessPolicy: {
            Expiry: expiry,
            Start: start ? start : undefined,
            Permissions: permissions ? permissions : undefined
        }
    };
    return generateSharedAccessSignatureCore(connectionString, shareName, sharedAccessPolicy, filePath, usePrimaryEndpoint);
}
exports.generateSharedAccessSignature = generateSharedAccessSignature;
/**
 * Generate Shared Access Signature with policy ID for file share or file.
 */
function generateSharedAccessSignatureWithPolicy(connectionString, shareName, accessPolicyId, filePath, usePrimaryEndpoint) {
    if (filePath === void 0) { filePath = ""; }
    if (usePrimaryEndpoint === void 0) { usePrimaryEndpoint = true; }
    var sharedAccessPolicy = {
        Id: accessPolicyId,
        AccessPolicy: null
    };
    return generateSharedAccessSignatureCore(connectionString, shareName, sharedAccessPolicy, filePath, usePrimaryEndpoint);
}
exports.generateSharedAccessSignatureWithPolicy = generateSharedAccessSignatureWithPolicy;
/**
 * Returns the primary and secondary URLs for a storage file or file share
 */
function getPrimaryStorageUri(fileOrShare) {
    return FileUtilities.getFileService(fileOrShare.connectionString, "getPrimaryStorageUri").then(function (fileService) {
        var uri = fileService.getUrl(fileOrShare.shareName, tryGetFolderFromAnyPath(fileOrShare.filePath), tryGetFolderFromAnyPath(fileOrShare.filePath), null, null);
        return Q.resolve(uri);
    });
}
exports.getPrimaryStorageUri = getPrimaryStorageUri;
/**
 * Registers a file to be copied from one location to another
 */
function startCopyStorageFile(sourceReference, sourceSasUri, targetReference, overwriteIfExists) {
    return FileUtilities.getFileService(targetReference.connectionString, "startCopyStorageFile")
        .then(function (fileService) {
        var sourceDirectory = tryGetFolderFromAnyPath(sourceReference.filePath);
        var targetDirectory = tryGetFolderFromAnyPath(targetReference.filePath);
        var targetFileName = tryGetNameFromAnyPath(targetReference.filePath);
        // File APIs don't currently support condition headers, so we can't support overwriteIfExists - will always overwrite
        console.assert(overwriteIfExists, "File APIs don't currently support condition headers, so overwriteIfExists must always be true");
        // if (!overwriteIfExists) {
        //     // Force an error if the destination already exists
        //     options.accessConditions = {
        //         EtagNonMatch: "*"   // "if-none-match": "*"
        //     }
        // };
        // Make sure the directory exists first (unless at root) or we'll get an error
        var ensureDirectoryPromise = targetDirectory ?
            createDirectoryFromExisting(sourceReference, sourceDirectory, targetReference, targetDirectory) :
            Q.resolve(false);
        return ensureDirectoryPromise.then(function () { return Q.Promise(function (resolve, reject) {
            fileService.startCopyFile(sourceSasUri, targetReference.shareName, targetDirectory, targetFileName, null, function (error, result, response) {
                if (error) {
                    reject(StorageManagerHelper.processError(error));
                }
                else {
                    console.assert(!!result.copy);
                    var returnValue = {
                        copyId: result.copy && result.copy.id,
                        status: result.copy && result.copy.status,
                        statusDescription: result.copy && result.copy.statusDescription,
                        progress: result.copy && result.copy.progress
                    };
                    resolve(returnValue);
                }
            });
        }); });
    });
}
exports.startCopyStorageFile = startCopyStorageFile;
/**
 * Aborts an existing file copy
 */
function abortCopyStorageFile(destination, copyId) {
    return FileUtilities.getFileService(destination.connectionString, "abortCopyStorageFile", StorageManagerHelper_1.RetryDurations.Medium)
        .then(function (fileService) {
        var deferred = Q.defer();
        fileService.abortCopyFile(destination.shareName, tryGetFolderFromAnyPath(destination.filePath), tryGetNameFromAnyPath(destination.filePath), copyId, null, function (error, response) {
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
exports.abortCopyStorageFile = abortCopyStorageFile;
/**
 * Gets the progress of a registered file copy
 */
function getCopyFileProgress(destination) {
    return FileUtilities.getFileService(destination.connectionString, "getCopyFileProgress", StorageManagerHelper_1.RetryDurations.None).then(function (fileService) {
        var deferred = Q.defer();
        fileService.getFileProperties(destination.shareName, tryGetFolderFromAnyPath(destination.filePath), tryGetNameFromAnyPath(destination.filePath), null, function (error, result, response) {
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
exports.getCopyFileProgress = getCopyFileProgress;
function getUrl(connectionString, shareName, directory, fileName, sasToken, primary) {
    return FileUtilities.getFileService(connectionString, "getUrl").then(function (fileService) {
        return Q.Promise(function (resolve, reject) {
            var url;
            try {
                url = fileService.getUrl(shareName, directory, fileName, sasToken, primary);
                resolve(url || "");
            }
            catch (error) {
                reject(error);
            }
        });
    });
}
exports.getUrl = getUrl;
/**
 * Gets the access control list for a file share.
 */
function getAccessControlList(connectionString, shareName) {
    return FileUtilities.getFileService(connectionString, "getAccessControlList")
        .then(function (fileService) { return Q.Promise(function (resolve, reject) {
        try {
            fileService.getShareAcl(shareName, /*options*/ null, function (error, result, ignoredResponse) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(StorageManagerHelper.AccessPoliciesFromSignedIdentifierMap(result.signedIdentifiers));
                }
            });
        }
        catch (error) {
            reject(error);
        }
    }); });
}
exports.getAccessControlList = getAccessControlList;
/**
 * Sets the access control list for a file share.
 */
function setAccessControlList(connectionString, shareName, sharedAccessPolicies) {
    return FileUtilities.getFileService(connectionString, "setAccessControlList")
        .then(function (fileService) { return Q.Promise(function (resolve, reject) {
        try {
            var azurePolicies = {};
            sharedAccessPolicies.forEach(function (policy) {
                if (!policy.Id) {
                    throw StorageErrors.NullOrEmptyArgumentError.getHostErrorInstance("policy.Id");
                }
                if (azurePolicies[policy.Id]) {
                    throw StorageErrors.PolicyAlreadyExistsError.getHostErrorInstance("policy.Id", policy.Id);
                }
                azurePolicies[policy.Id] = {
                    Expiry: new Date(policy.AccessPolicy.Expiry.toString()),
                    Start: policy.AccessPolicy.Start ? new Date(policy.AccessPolicy.Start.toString()) : undefined,
                    Permissions: policy.AccessPolicy.Permissions ? policy.AccessPolicy.Permissions : undefined
                };
            });
            fileService.setShareAcl(shareName, azurePolicies, /*options*/ null, function (error, result, ignoredResponse) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        }
        catch (error) {
            reject(error);
        }
    }); });
}
exports.setAccessControlList = setAccessControlList;
function tryGetNameFromAnyPath(path) {
    return path ? Utilities.getNameFromAnyPath(path) : "";
}
function tryGetFolderFromAnyPath(path) {
    return path ? Utilities.getFolderFromAnyPath(path) : "";
}
function generateSharedAccessSignatureCore(connectionString, shareName, sharedAccessPolicy, filePath, usePrimaryEndpoint) {
    if (filePath === void 0) { filePath = ""; }
    if (usePrimaryEndpoint === void 0) { usePrimaryEndpoint = true; }
    return FileUtilities.getFileService(connectionString, "generateSharedAccessSignature")
        .then(function (fileService) { return Q.Promise(function (resolve, reject) {
        try {
            var directory = tryGetFolderFromAnyPath(filePath);
            var fileName = tryGetNameFromAnyPath(filePath);
            var sasToken = fileService.generateSharedAccessSignature(shareName, directory, fileName, sharedAccessPolicy, null);
            var sasUrl = fileService.getUrl(shareName, directory, fileName, sasToken, usePrimaryEndpoint);
            var results = { sasToken: sasToken, sasUrl: sasUrl };
            resolve(results);
        }
        catch (error) {
            reject(error);
        }
    }); });
}
/**
 * Get the properties and metadata of a file or directory.
 */
function getItemProperties(connectionString, contentType, shareName, directory, itemName) {
    return FileUtilities.getFileService(connectionString, "getItemProperties")
        .then(function (fileService) {
        var deferred = Q.defer();
        if (contentType === "Folder") {
            return getDirectoryPropertiesCore(connectionString, shareName, directory, itemName)
                .then(function (directoryResult) {
                var uri = fileService.getUrl(shareName, directory, itemName, null /*sasToken*/, true /*primary*/);
                var directoryProperties = {
                    name: directoryResult.name,
                    lastModified: directoryResult.lastModified,
                    etag: directoryResult.etag,
                    MetaData: directoryResult,
                    uri: uri
                };
                return directoryProperties;
            });
        }
        else {
            fileService.getFileProperties(shareName, directory, itemName, null, function (error, fileResult, response) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    var uri = fileService.getUrl(shareName, directory, itemName, null /*sasToken*/, true /*primary*/);
                    var fileProperties = {
                        name: fileResult.name,
                        share: fileResult.share,
                        directory: fileResult.directory,
                        size: fileResult.contentLength,
                        created: fileResult.created,
                        lastModified: fileResult.lastModified,
                        etag: fileResult.etag,
                        MetaData: fileResult,
                        uri: uri,
                        cacheControl: fileResult.contentSettings && fileResult.contentSettings.cacheControl,
                        contentType: fileResult.contentSettings && fileResult.contentSettings.contentType,
                        contentMD5: fileResult.contentSettings && fileResult.contentSettings.contentMD5,
                        contentEncoding: fileResult.contentSettings && fileResult.contentSettings.contentEncoding,
                        contentDisposition: fileResult.contentSettings && fileResult.contentSettings.contentDisposition,
                        contentLanguage: fileResult.contentSettings && fileResult.contentSettings.contentLanguage
                    };
                    deferred.resolve(fileProperties);
                }
            });
        }
        return deferred.promise;
    });
}
exports.getItemProperties = getItemProperties;
/**
 * Gets the properties and metadata of a file share.
 */
function getFileShareProperties(connectionString, shareName) {
    return FileUtilities.getFileService(connectionString, "getFileShareProperties")
        .then(function (fileService) {
        var deferred = Q.defer();
        fileService.getShareProperties(shareName, null, function (error, result, response) {
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
exports.getFileShareProperties = getFileShareProperties;
/**
 * Sets the properties of a file. Currently, you can set only content settings properties.
 */
function setItemProperties(connectionString, contentType, shareName, directory, itemName, properties) {
    return FileUtilities.getFileService(connectionString, "setItemProperties")
        .then(function (fileService) {
        var deferred = Q.defer();
        if (contentType === "") {
            fileService.setFileProperties(shareName, directory, itemName, properties, function (error, result, response) {
                Utilities.resolveOrReject(deferred, error, result);
            });
        }
        return deferred.promise;
    });
}
exports.setItemProperties = setItemProperties;
/**
 * Set the metadata of a file or directory.
 */
function setItemMetadata(connectionString, contentType, shareName, directory, itemName, metadata) {
    return FileUtilities.getFileService(connectionString, "setItemMetadata")
        .then(function (fileService) {
        var deferred = Q.defer();
        if (contentType === "Folder") {
            fileService.setDirectoryMetadata(shareName, Path.posix.join(directory, itemName), metadata, null, function (error, directoryResult, response) {
                Utilities.resolveOrReject(deferred, error, directoryResult);
            });
        }
        else {
            fileService.setFileMetadata(shareName, directory, itemName, metadata, null, function (error, fileResult, response) {
                Utilities.resolveOrReject(deferred, error, fileResult);
            });
        }
        return deferred.promise;
    });
}
exports.setItemMetadata = setItemMetadata;
/**
 * Creates a directory in an Azure file share.
 *
 * @param createParents
 * A function for creating the specified directory's parent recursively. If the
 * inital creation failed because the parent directory wasn't found, this
 * function will be called, and the initial creation will be retried. Otherwise,
 * the initial error is thrown.
 */
function createDirectoryCore(shareReference, path, metadata, createParents) {
    if (createParents === void 0) { createParents = null; }
    return FileUtilities.getFileService(shareReference.connectionString, "createDirectoryCore")
        .then(function (fileService) { return Q.Promise(function (resolve, reject) {
        var options = { metadata: metadata };
        fileService.createDirectory(shareReference.shareName, path, options, function (error, result) {
            if (!error) {
                resolve(true);
            }
            else if (error.code === "InvalidResourceName") {
                reject(new StorageErrors.InvalidResourceNameError());
            }
            else if (error.code === "ResourceAlreadyExists") {
                resolve(false);
            }
            else if (error.code === "ParentNotFound" && createParents) {
                createParents()
                    .then(function () { return createDirectoryCore(shareReference, path, metadata); })
                    .then(function () { return resolve(true); })
                    .catch(function (err) { return reject(StorageManagerHelper.processError(err)); });
            }
            else {
                reject(StorageManagerHelper.processError(error));
            }
        });
    }); });
}
function getDirectoryPropertiesCore(connectionString, shareName, directory, itemName) {
    var path = Path.posix.join(directory, itemName);
    return FileUtilities.getFileService(connectionString, "getDirectoryPropertiesCore")
        .then(function (fileService) {
        var deferred = Q.defer();
        fileService.getDirectoryProperties(shareName, path, null, function (error, result, response) {
            Utilities.resolveOrReject(deferred, error, result);
        });
        return deferred.promise;
    });
}

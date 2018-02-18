"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Q = require("q");
var BlobUtilities = require("./BlobUtilities");
var ListBlobsInclude_1 = require("../../../StorageExplorer/ListBlobsInclude");
var storageManagerHelper = require("../StorageManagerHelper");
var Utilities = require("../../../../Utilities");
/**
 * Gets a list of all blobs in a container matching the specified criteria.
 * @param flatListOfBlobs If true, all blobs with the given `prefix` will be returned, including blobs in nested folders,
 * with '/' in the name specifying a blob in a folder. No folder objects will be returned.
 * Otherwise, blobs and folders in only a single folder (specified by prefix) will be returned (nothing from nested folders).
 */
function listBlobsSegmented(containerReference, prefix, currentToken, numResults, callerName, includeOption) {
    if (prefix === void 0) { prefix = ""; }
    if (callerName === void 0) { callerName = "listBlobsSegmented"; }
    if (includeOption === void 0) { includeOption = ListBlobsInclude_1.default.Directory; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var connectionString, blobService, include, options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connectionString = containerReference.connectionString;
                    return [4 /*yield*/, BlobUtilities.getBlobService(connectionString, callerName)];
                case 1:
                    blobService = _a.sent();
                    include = [];
                    if (includeOption === ListBlobsInclude_1.default.NoFoldersAndSnapshots || includeOption === ListBlobsInclude_1.default.NoFoldersAndSnapshotsAndMetaData) {
                        include.push("snapshots");
                    }
                    if (includeOption === ListBlobsInclude_1.default.NoFoldersAndMetadata || includeOption === ListBlobsInclude_1.default.NoFoldersAndSnapshotsAndMetaData) {
                        include.push("metadata");
                    }
                    options = {
                        maxResults: numResults,
                        delimiter: includeOption === ListBlobsInclude_1.default.FlatList ? "" : "/",
                        include: include.join(",")
                        // TODO: [???] pass numResults as option.
                    };
                    return [2 /*return*/, Q.Promise(function (resolve, reject) {
                            blobService.listBlobDirectoriesSegmentedWithPrefix(containerReference.containerName, prefix, currentToken, options, function (error, result, response) {
                                if (error) {
                                    reject(storageManagerHelper.processError(error));
                                }
                                else {
                                    var entries = result.entries || [];
                                    var blobs = [];
                                    entries.forEach(function (blob) {
                                        // No network calls here
                                        var uri = blobService.getUrl(containerReference.containerName, blob.name, null /*sasToken*/, true /*primary*/);
                                        if (blob.snapshot) {
                                            uri += "?snapshot=" + blob.snapshot;
                                        }
                                        var fullName = blob.name;
                                        var name = Utilities.getNameFromStoragePath(fullName);
                                        if (!blob.properties) {
                                            // Folder
                                            blobs.push({
                                                FileName: name,
                                                FullName: fullName,
                                                ContentType: "Folder",
                                                Uri: uri,
                                                LastModified: "",
                                                Size: "",
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
                                            });
                                        }
                                        else {
                                            blobs.push({
                                                FileName: name,
                                                FullName: fullName,
                                                ContentType: blob.properties["content-type"],
                                                LastModified: blob.properties["last-modified"],
                                                Size: blob.properties["content-length"],
                                                Uri: uri,
                                                Blob: {
                                                    Snapshot: blob.snapshot,
                                                    BlobType: blob.properties.blobtype,
                                                    LeaseState: blob.properties.leasestate,
                                                    LeaseStatus: blob.properties.leasestatus,
                                                    LeaseDuration: blob.properties.leaseduration,
                                                    metadata: blob.metadata
                                                }
                                            });
                                        }
                                    });
                                    resolve({
                                        Results: blobs,
                                        ContinuationToken: result.continuationToken
                                    });
                                }
                            });
                        })];
            }
        });
    });
}
exports.listBlobsSegmented = listBlobsSegmented;
/**
 * Get the metadata of a blob.
 */
function getBlobMetadata(connectionString, containerName, blobName) {
    return BlobUtilities.getBlobService(connectionString, "getBlobMetadata")
        .then(function (blobService) {
        var deferred = Q.defer();
        var options = {};
        blobService.getBlobMetadata(containerName, blobName, options, function (error, metadataResult, metadataResponse) {
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(metadataResult);
            }
        });
        return deferred.promise;
    });
}
exports.getBlobMetadata = getBlobMetadata;

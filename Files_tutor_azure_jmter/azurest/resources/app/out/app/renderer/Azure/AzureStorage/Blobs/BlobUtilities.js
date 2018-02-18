"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var azureStorage = require("azure-storage");
var Q = require("q");
var FlobManager = require("../FlobManager");
var StorageManagerHelper = require("../StorageManagerHelper");
var StorageCancelFilter_1 = require("../StorageCancelFilter");
var StorageEmulatorHelper = require("../StorageEmulatorHelper");
var host = global.host;
function prepareBlobService(service, callerName, retryDuration) {
    StorageManagerHelper.setRequestEventHandler(service);
    service.parallelOperationThreadCount = FlobManager.DefaultParallelOperationThreadCount;
    // Add retry (at the individual Azure operations level, e.g. upload/download of individual blocks)
    var retryPolicy = StorageManagerHelper.createStorageRetryPolicy(callerName, retryDuration);
    service = service.withFilter(retryPolicy);
    // Expose cancel
    var cancelFilter = new StorageCancelFilter_1.default(callerName);
    var cancelableService = service.withFilter(cancelFilter);
    cancelableService.cancelFilter = cancelFilter;
    return cancelableService;
}
/**
 * Lists both blobs and directories from a containers.
 *
 * Overrides the `listBlobDirectoriesSegmentedWithPrefix` function in `azure-storage`.
 * The orginal implementation either returns blobs or directories, but
 * not both. We need both in one call.
 */
function listBlobDirectoriesSegmentedWithPrefix(container, prefix, currentToken, optionsOrCallback, callback) {
    /* tslint:disable: no-string-literal */
    var options = optionsOrCallback;
    var webResource = new azureStorage.WebResource();
    webResource["path"] = container;
    webResource["method"] = "GET";
    webResource.queryString["restype"] = "container";
    webResource.queryString["comp"] = "list";
    webResource.queryString["maxresults"] = options.maxResults;
    // include with delimeter isn't supported
    if (options.include) {
        webResource.queryString["include"] = options.include;
    }
    else {
        webResource.queryString["delimiter"] = options.delimiter;
    }
    if (currentToken) {
        webResource.queryString["marker"] = currentToken["nextMarker"];
    }
    if (prefix) {
        webResource.queryString["prefix"] = prefix;
    }
    options.requestLocationMode = getNextListingLocationMode(currentToken);
    function processResponseCallback(responseObject, next) {
        responseObject.listBlobsResult = null;
        if (!responseObject.error) {
            responseObject.listBlobsResult = {
                entries: null,
                continuationToken: null
            };
            responseObject.listBlobsResult.entries = [];
            var results = [];
            if (responseObject.response.body.EnumerationResults.Blobs.BlobPrefix) {
                results = results.concat(responseObject.response.body.EnumerationResults.Blobs.BlobPrefix);
            }
            if (responseObject.response.body.EnumerationResults.Blobs.Blob) {
                results = results.concat(responseObject.response.body.EnumerationResults.Blobs.Blob);
            }
            results.forEach(function (currentBlob) {
                var blobResult = parseXmlBlob(currentBlob);
                responseObject.listBlobsResult.entries.push(blobResult);
            });
            if (responseObject.response.body.EnumerationResults.NextMarker) {
                responseObject.listBlobsResult.continuationToken = {
                    nextMarker: null,
                    targetLocation: null
                };
                responseObject.listBlobsResult.continuationToken.nextMarker = responseObject.response.body.EnumerationResults.NextMarker;
                responseObject.listBlobsResult.continuationToken.targetLocation = responseObject.targetLocation;
            }
        }
        var finalCallback = function (returnObject) {
            callback(returnObject.error, returnObject.listBlobsResult, returnObject.response);
        };
        next(responseObject, finalCallback);
    }
    ;
    this.performRequest(webResource, null, options, processResponseCallback);
    /* tslint:enable */
}
;
azureStorage.BlobService.prototype.listBlobDirectoriesSegmentedWithPrefix = listBlobDirectoriesSegmentedWithPrefix;
function getNextListingLocationMode(token) {
    var RequestLocationMode = {
        PRIMARY_ONLY: 0,
        SECONDARY_ONLY: 1,
        PRIMARY_OR_SECONDARY: 2
    };
    var StorageLocation = {
        PRIMARY: 0,
        SECONDARY: 1
    };
    if (token === undefined || token === null) {
        return RequestLocationMode.PRIMARY_OR_SECONDARY;
    }
    else {
        switch (token.targetLocation) {
            case StorageLocation.PRIMARY:
                return RequestLocationMode.PRIMARY_ONLY;
            case StorageLocation.SECONDARY:
                return RequestLocationMode.SECONDARY_ONLY;
            default:
                throw new Error("Invalid token");
        }
    }
}
function parseXmlBlob(blobXml) {
    var blobResult = {};
    for (var propertyName in blobXml) {
        if (propertyName === "Properties" || propertyName === "Metadata") {
            blobResult[propertyName.toLowerCase()] = {};
            for (var subPropertyName in blobXml[propertyName]) {
                if (blobXml[propertyName].hasOwnProperty(subPropertyName)) {
                    blobResult[propertyName.toLowerCase()][subPropertyName.toLowerCase()] = blobXml[propertyName][subPropertyName];
                }
            }
        }
        else {
            blobResult[propertyName.toLowerCase()] = blobXml[propertyName];
        }
    }
    return blobResult;
}
/**
 * Creates a cancelable blob service.
 *
 * @param callerName Identifies the caller for the use of telemetry. In most cases, you should just pass the name of the calling function.
 */
function getBlobService(connectionString, callerName, retryDuration) {
    if (retryDuration === void 0) { retryDuration = StorageManagerHelper.RetryDurations.Short; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var storageApiVersion;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!!host) return [3 /*break*/, 2];
                    return [4 /*yield*/, host.executeOperation("StorageApiSettingManager.getStorageApiSetting", {})];
                case 1:
                    storageApiVersion = _a.sent();
                    azureStorage.Constants.HeaderConstants.TARGET_STORAGE_VERSION = storageApiVersion;
                    _a.label = 2;
                case 2: return [2 /*return*/, Q.Promise(function (resolve, reject) {
                        var localStorage = StorageManagerHelper.isDevelopment(connectionString);
                        if (localStorage) {
                            if (StorageManagerHelper.isStorageEmulatorSupported()) {
                                StorageEmulatorHelper.startStorageEmulator()
                                    .then(function () {
                                    var devStoreCreds = azureStorage.generateDevelopmentStorageCredentials();
                                    var blobService = azureStorage.createBlobService(devStoreCreds);
                                    resolve(prepareBlobService(blobService, callerName, retryDuration));
                                }, function (error) {
                                    reject(error);
                                });
                            }
                            else {
                                reject(new StorageEmulatorHelper.StorageEmulatorNotSupportedError());
                            }
                        }
                        else {
                            var blobService = new azureStorage.BlobService(connectionString);
                            resolve(prepareBlobService(blobService, callerName, retryDuration));
                        }
                        ;
                    })];
            }
        });
    });
}
exports.getBlobService = getBlobService;

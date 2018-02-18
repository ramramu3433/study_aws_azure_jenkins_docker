"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var azureStorage = require("azure-storage");
var _string = require("underscore.string");
var storageErrors = require("./StorageErrors");
var utilities = require("../../../Utilities");
var telemetryManager = require("../../telemetry/TelemetryManager");
// Defined here: https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
exports.StorageConstants = {
    LocalAccountName: "devstoreaccount1",
    LocalAccountKey: "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==",
    LocalBlobEndpoint: "http://127.0.0.1:10000/devstoreaccount1",
    LocalQueueEndpoint: "http://127.0.0.1:10001/devstoreaccount1",
    LocalTableEndpoint: "http://127.0.0.1:10002/devstoreaccount1"
};
exports.RetryDurations = {
    // In milliseconds
    None: 0,
    Short: 10 * 1000,
    Medium: 60 * 1000,
    Long: 10 * 60 * 1000 // 10 minutes (use for long-running tasks, like uploading/downloading a very large blob)
};
function isDevelopment(connectionString) {
    // see like below for connection strings for Azure Storage.
    /* https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string
     * /#connect-to-the-emulator-account-using-the-well-known-account-name-and-key */
    var kvs = utilities.parseConnectionStringKeyValues(connectionString);
    return (
    // Using shortcut for dev/emulator connection string.
    (kvs["UseDevelopmentStorage"] === "true") ||
        // The account name and key are the predefined dev/emulator ones.
        (kvs["AccountName"] === exports.StorageConstants.LocalAccountName && kvs["AccountKey"] === exports.StorageConstants.LocalAccountKey) ||
        // The endpoints defined are for dev/emulator.
        _string.startsWith(kvs["BlobEndpoint"], exports.StorageConstants.LocalBlobEndpoint) ||
        _string.startsWith(kvs["TableEndpoint"], exports.StorageConstants.LocalTableEndpoint) ||
        _string.startsWith(kvs["QueueEndpoint"], exports.StorageConstants.LocalQueueEndpoint));
}
exports.isDevelopment = isDevelopment;
function isStorageEmulatorSupported() {
    return utilities.isWin();
}
exports.isStorageEmulatorSupported = isStorageEmulatorSupported;
function processError(error, additionalInfo) {
    if (error) {
        if (error.code === 4123 || error.code === "BlobAlreadyExists") {
            error = new storageErrors.DestinationExistsError();
        }
        else if ((error.syscall === "getaddrinfo") && (error.code === "ENOENT" || error.errno === "ENOENT")) {
            var host = error.host || error.hostname || "";
            error = new storageErrors.HostNotFoundError(host);
        }
        else if (error.statusCode === 403 && error.code === "AuthenticationFailed") {
            error = new storageErrors.AuthenticationFailedError(error.authenticationerrordetail);
        }
        else if (error.statusCode === 404 && (error.code === "NotFound" || error.code === "ResourceNotFound")) {
            error = new storageErrors.NotFoundError();
        }
        else if (error.code === "InvalidInput" && additionalInfo && additionalInfo.tableQuery) {
            error = storageErrors.TableQuerySyntaxError.getHostErrorInstance(additionalInfo.tableQuery);
        }
        else if ((error.statusCode === 501 && error.code === "NotImplemented") && additionalInfo && additionalInfo.tableQuery && additionalInfo.tableQuery.filter) {
            error = storageErrors.TableQuerySemanticError.getHostErrorInstance(additionalInfo.tableQuery);
        }
        else if (error.code === storageErrors.errorNames.VersionNotSupportedByEmulator) {
            error = new storageErrors.VersionNotSupportedByEmulatorError(error.message);
        }
        else if (error.code === storageErrors.errorNames.AuthorizationServiceMismatchError) {
            error = new storageErrors.AuthorizationServiceMismatchError(error.message);
        }
        else if (isTransientNetworkError(error)) {
            error = new storageErrors.NetworkTimeoutError(error);
        }
        else if (error.code === "ParentNotFound") {
            error = storageErrors.ParentNotFoundError.getHostErrorInstance(error.message);
        }
    }
    return error;
}
exports.processError = processError;
function isTransientNetworkError(error) {
    switch (error.code) {
        case "ECONNRESET":
        case "ETIMEDOUT":
        case "ESOCKETTIMEDOUT":
        case "ECONNREFUSED":
        case "ENETDOWN":
            return true;
        default:
            return false;
    }
}
exports.isTransientNetworkError = isTransientNetworkError;
function createTimeLimitedRetryPolicy(caller, maximumElapsedTimeInMs) {
    // "caller" is used for telemetry purposes only
    var filter = new azureStorage.ExponentialRetryPolicyFilter(1000 /*Large retryCount - don't limit by number of retries*/, 1000 /*retryInterval*/, 1000, /*minRetryInterval*/ maximumElapsedTimeInMs /*maxRetryInterval*/);
    var start = Date.now();
    var end = start + maximumElapsedTimeInMs;
    var originalShouldRetryFunction = filter.shouldRetry;
    filter.shouldRetry = function (statusCode, requestOptions) {
        var retryInfo = originalShouldRetryFunction.call(this, statusCode, requestOptions);
        if (retryInfo.error) {
            var eventName;
            // console.log("Retry filter: inspecting " + retryInfo.error); // No need to localize
            var isRetryableError = isTransientNetworkError(retryInfo.error);
            var now = Date.now();
            var isWithinRetryTimeLimit = (now < end);
            if (!retryInfo.retryCount && maximumElapsedTimeInMs) {
                // Unless retries are turned off (maximumElapsedTimeInSeconds == 0), then let's retry
                // at least once, regardless of time remaining.
                isWithinRetryTimeLimit = true;
            }
            if (isRetryableError) {
                if (isWithinRetryTimeLimit) {
                    // console.log("Retrying");
                    eventName = "StorageExplorer.RetryFilter.Retrying";
                }
                else if (maximumElapsedTimeInMs) {
                    // console.log("Hit max retry time");
                    eventName = "StorageExplorer.RetryFilter.RetryTimeLimitReached";
                }
                else {
                    // console.log("No retries specified for this action");
                    eventName = "StorageExplorer.RetryFilter.NoRetriesSpecified";
                }
            }
            else {
                // TODO,stephwe: Make these debug-only somehow
                // console.error("Not a retryable error");
                eventName = "StorageExplorer.RetryFilter.NotRetryableError";
            }
            if (eventName) {
                telemetryManager.sendEvent(eventName, {
                    Caller: caller,
                    Retryable: retryInfo.retryable,
                    StatusCode: statusCode.toString(),
                    ErrorCode: requestOptions
                        && requestOptions.retryContext
                        && requestOptions.retryContext.error
                        && requestOptions.retryContext.error.code,
                    RetryCount: retryInfo.retryCount,
                    RetryInterval: retryInfo.retryInterval,
                    MaximumElapsedTimeInSeconds: (maximumElapsedTimeInMs / 60).toString(),
                    CurrentElapsedTime: (now - start).toString()
                });
            }
        }
        return retryInfo;
    };
    return filter;
}
exports.createTimeLimitedRetryPolicy = createTimeLimitedRetryPolicy;
// Gets a retry policy for use with any of the storage services
// retryDurationInSeconds: Maximum amount of time allowed for the entire set of retries
function createStorageRetryPolicy(caller, retryDurationInMs) {
    // caller used for telemetry purposes only
    return createTimeLimitedRetryPolicy(caller, retryDurationInMs);
}
exports.createStorageRetryPolicy = createStorageRetryPolicy;
function AccessPoliciesFromSignedIdentifierMap(signedIdentifierMap) {
    var sharedAccessPolicies = [];
    for (var id in signedIdentifierMap) {
        var accessPolicy = signedIdentifierMap[id];
        var sharedAccessPolicy = {
            Id: id,
            AccessPolicy: accessPolicy
        };
        sharedAccessPolicies.push(sharedAccessPolicy);
    }
    return sharedAccessPolicies;
}
exports.AccessPoliciesFromSignedIdentifierMap = AccessPoliciesFromSignedIdentifierMap;
/**
 * Set sending request event handler to add Storage Explorer product information
 * so that client library team know which requests come from Storage Explorer.
 */
function setRequestEventHandler(azureService) {
    var productName = utilities.getProductName();
    var productVersion = utilities.getVersion();
    var platform = utilities.getPlatform();
    var userAgentHeader = azureStorage.Constants.HeaderConstants.USER_AGENT;
    function sendingRequestHandler(webresource) {
        var currentAgentString = String(webresource.headers[userAgentHeader]);
        if (!currentAgentString || currentAgentString.indexOf(productName) < 0) {
            var productInformation = productName + ", " + productVersion + ", " + platform + ", " + currentAgentString;
            webresource.withHeader(userAgentHeader, productInformation);
        }
    }
    azureService.on("sendingRequestEvent", sendingRequestHandler);
}
exports.setRequestEventHandler = setRequestEventHandler;

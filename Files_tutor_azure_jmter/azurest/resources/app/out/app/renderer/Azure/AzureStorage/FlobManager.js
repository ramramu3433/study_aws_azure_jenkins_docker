"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var StorageManagerHelper_1 = require("./StorageManagerHelper");
// We esssentially do our own parallelization by running simultaneous activities, so we
// need to be careful how many threads the client library uses, otherwise memory and CPU usage can blow up
// (default for client library is currently 5).
exports.DefaultParallelOperationThreadCount = 25; // TODO: refine value
// Speed summaries for upload/download by progressId
exports.cachedSpeedSummaries = {};
// Cancel filters for upload/download by progressId
exports.cancelFilterPromises = {};
function getRetryDurationFromFlobSize(flobSize) {
    var MB = 1000000;
    var retryDuration = (flobSize < 32 * MB) ? StorageManagerHelper_1.RetryDurations.Short
        : (flobSize < 100 * MB) ? StorageManagerHelper_1.RetryDurations.Medium
            : StorageManagerHelper_1.RetryDurations.Long;
    return retryDuration;
}
exports.getRetryDurationFromFlobSize = getRetryDurationFromFlobSize;
function createFilterProviderWithDeferred(progressId) {
    var cancelFilterDeferred = Q.defer();
    exports.cancelFilterPromises[progressId] = cancelFilterDeferred.promise;
    return cancelFilterDeferred;
}
exports.createFilterProviderWithDeferred = createFilterProviderWithDeferred;
function abortFlobTransfer(progressId, notFoundMessage) {
    var cancelFilterPromise = exports.cancelFilterPromises[progressId];
    if (cancelFilterPromise) {
        return cancelFilterPromise.then(function (filter) {
            return filter.Cancel();
        });
    }
    else {
        // Either not registered, or already released
        return Q.reject(notFoundMessage);
    }
}
exports.abortFlobTransfer = abortFlobTransfer;
function patchSpeedSummary(speedSummary, onError) {
    // Work around a bug in azure client lib where exceptions thrown in SpeedSummary cannot be caught
    // Bug logged: https://github.com/Azure/azure-storage-node/issues/143
    var getAutoIncrementFunction = speedSummary.getAutoIncrementFunction;
    speedSummary.getAutoIncrementFunction = function (size) {
        var f = getAutoIncrementFunction.call(speedSummary, size);
        return function (error, retValue) {
            try {
                return f(error, retValue);
            }
            catch (error) {
                onError(error);
            }
        };
    };
}
exports.patchSpeedSummary = patchSpeedSummary;
/**
 * Gets the progress of a blob upload or download, or null if not tracked
 */
function getFlobTransferProgress(progressId) {
    var progress = null;
    var summary = exports.cachedSpeedSummaries[progressId];
    if (summary != null) {
        var digitsAfterPercentDecimal = 20; // (max)
        progress = {
            friendlyCompleted: summary.getCompleteSize(true /*humanReadable*/),
            friendlyAverageSpeed: summary.getAverageSpeed(true /*humanReadable*/),
            friendlySpeed: summary.getSpeed(true /*humanReadable*/),
            totalSize: summary.totalSize,
            friendlyTotalSize: summary.getTotalSize(true /*humanReadable*/),
            progressPercentage: summary.getCompletePercent(digitsAfterPercentDecimal) / 100
        };
    }
    return Q.resolve(progress);
}
exports.getFlobTransferProgress = getFlobTransferProgress;
/**
 * Releases the cache of progress and other information for a blob upload or download, to free up
 * memory usage.
 */
function releaseFlobTransfer(progressId) {
    delete exports.cachedSpeedSummaries[progressId];
    delete exports.cancelFilterPromises[progressId];
    return Q.resolve(null);
}
exports.releaseFlobTransfer = releaseFlobTransfer;

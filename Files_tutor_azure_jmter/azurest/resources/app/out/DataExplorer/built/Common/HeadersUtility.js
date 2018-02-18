define(["require", "exports", "./Constants"], function (require, exports, Constants) {
    "use strict";
    var HeadersUtility = (function () {
        function HeadersUtility() {
        }
        HeadersUtility.getActivityId = function (responseHeaders) {
            return (responseHeaders && responseHeaders[Constants.HttpHeaders.activityId])
                ? responseHeaders[Constants.HttpHeaders.activityId]
                : null;
        };
        HeadersUtility.getContinuationToken = function (responseHeaders) {
            return (responseHeaders && responseHeaders[Constants.HttpHeaders.continuation])
                ? responseHeaders[Constants.HttpHeaders.continuation]
                : null;
        };
        HeadersUtility.getRequestCharge = function (responseHeaders) {
            return (responseHeaders && responseHeaders[Constants.HttpHeaders.requestCharge])
                ? parseFloat(responseHeaders && responseHeaders[Constants.HttpHeaders.requestCharge] || "0")
                : 0.0;
        };
        HeadersUtility.getRetryAfterMs = function (responseHeaders) {
            return (responseHeaders && responseHeaders[Constants.HttpHeaders.retryAfterMs])
                ? responseHeaders[Constants.HttpHeaders.retryAfterMs]
                : 0;
        };
        HeadersUtility.getRetryAfterInSecond = function (responseHeaders) {
            return Math.ceil(HeadersUtility.getRetryAfterMs(responseHeaders) / 1000);
        };
        // x-ms-resource-usage: databases = 2; collections = 0; users = 0; permissions = 0;
        HeadersUtility.getUsageQuota = function (responseHeaders) {
            return (responseHeaders && responseHeaders[Constants.HttpHeaders.resourceUsage])
                ? this.parseStringIntoObject(responseHeaders[Constants.HttpHeaders.resourceUsage])
                : null;
        };
        // x-ms-resource-quota: databases = 100; collections = 5000; users = 500000; permissions = 2000000;
        HeadersUtility.getQuota = function (responseHeaders) {
            return (responseHeaders && responseHeaders[Constants.HttpHeaders.resourceQuota])
                ? this.parseStringIntoObject(responseHeaders[Constants.HttpHeaders.resourceQuota])
                : null;
        };
        HeadersUtility.getCollectionIndexTransformationProgress = function (responseHeaders) {
            return responseHeaders && responseHeaders[Constants.HttpHeaders.collectionIndexTransformationProgress];
        };
        HeadersUtility.getLocation = function (jqXHR) {
            return jqXHR && jqXHR.getResponseHeader(Constants.HttpHeaders.location);
        };
        HeadersUtility.getCorrelationRequestId = function (jqXHR) {
            return jqXHR && jqXHR.getResponseHeader(Constants.HttpHeaders.correlationRequestId);
        };
        HeadersUtility.parseStringIntoObject = function (resourceString) {
            var entityObject = {};
            if (resourceString) {
                var entitiesArray = resourceString.split(";");
                for (var i = 0; i < entitiesArray.length; i++) {
                    var entity = entitiesArray[i].split("=");
                    entityObject[entity[0]] = entity[1];
                }
            }
            return entityObject;
        };
        return HeadersUtility;
    }());
    return HeadersUtility;
});

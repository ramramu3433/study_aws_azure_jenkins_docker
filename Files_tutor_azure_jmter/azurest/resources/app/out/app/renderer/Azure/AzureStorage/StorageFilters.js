"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A base implementation of IFilter to help with the difficult parts of writing a storage client filter.
 */
var StorageFilter = (function () {
    function StorageFilter(callerName) {
        this._callerName = callerName;
    }
    StorageFilter.prototype.handle = function (requestOptions, next) {
        var _this = this;
        var postProcessWrapper = function (returnObject, finalCallback, nextPostCallback) {
            try {
                returnObject = _this.postProcess(returnObject);
            }
            catch (error) {
                // Clone the object (shallow is good enough) before modifying it
                returnObject = Object.create(returnObject);
                returnObject.error = error;
                // Call final callback only
                if (finalCallback) {
                    finalCallback(returnObject);
                }
                return;
            }
            // Call next post-processing handler
            if (nextPostCallback) {
                nextPostCallback(returnObject);
            }
            else if (finalCallback) {
                finalCallback(returnObject);
            }
        };
        // Pre-process
        requestOptions = this.preProcess(requestOptions);
        // Call next pre-processing handler
        if (next) {
            next(requestOptions, postProcessWrapper);
        }
    };
    StorageFilter.prototype.preProcess = function (requestOptions) {
        // Can modify requestOptions (best to clone it first if you do)
        return requestOptions;
    };
    StorageFilter.prototype.postProcess = function (returnObject) {
        // Can modify info (best to clone it first if you do)
        return returnObject;
    };
    return StorageFilter;
}());
exports.StorageFilter = StorageFilter;

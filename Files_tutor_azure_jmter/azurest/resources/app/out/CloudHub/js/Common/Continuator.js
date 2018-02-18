/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise"], function (require, exports, es6_promise_1) {
    "use strict";
    /**
     * Runs a function repeatedly until a continuation token no longer has a value.
     * NOTE: It avoids creating a long chain of promises, which would have the effect of
     *   holding on to a forever-increasing set of promises, listeners and closures.
     *
     * @param getChunk The function to call repeatedly
     * @param onChunk If provided, will be called on each result returned from getChunk
     */
    function runAllContinuations(getChunk, // Must return the next continuation token
        cancelToken) {
        return new es6_promise_1.Promise(function (resolve, reject) {
            var currentContinuationToken = null;
            var doChunk = function () {
                try {
                    if (cancelToken) {
                        cancelToken.throwIfCanceled();
                    }
                    getChunk(currentContinuationToken).then(function (nextContinuationToken) {
                        currentContinuationToken = nextContinuationToken;
                        if (currentContinuationToken) {
                            setTimeout(function () { return doChunk(); }, 0);
                        }
                        else {
                            resolve();
                        }
                    }).catch(function (error) {
                        reject(error);
                    });
                }
                catch (error) {
                    reject(error);
                }
            };
            doChunk();
        });
    }
    exports.runAllContinuations = runAllContinuations;
});

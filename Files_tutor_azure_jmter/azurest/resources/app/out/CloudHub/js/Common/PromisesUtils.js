/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise"], function (require, exports, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains utilities related to handling promises.
     */
    var PromisesUtils;
    (function (PromisesUtils) {
        /**
         * Waits for all the given promises and returned the rejected and resolved results.
         */
        PromisesUtils.waitForAll = function (promises) {
            return new Promise(function (resolve, reject) {
                var result = [];
                // Check parameters
                if (!promises || !promises.length) {
                    resolve(result);
                    return;
                }
                var promisesCount = promises.length;
                // Wait for every promise and store their result
                promises.forEach(function (p, index) {
                    p.then(function (promiseResult) {
                        result[index] = {
                            resolvedValue: promiseResult
                        };
                        if (!--promisesCount) {
                            resolve(result);
                        }
                    }, function (err) {
                        result[index] = {
                            rejectedValue: err
                        };
                        if (!--promisesCount) {
                            resolve(result);
                        }
                    });
                });
            });
        };
    })(PromisesUtils || (PromisesUtils = {}));
    return PromisesUtils;
});

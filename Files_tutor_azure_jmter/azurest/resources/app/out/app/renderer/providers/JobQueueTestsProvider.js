"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var Q = require("q");
var JobQueueTestsProvider = {
    "JobQueueTestsProvider.processIterator": function (args) {
        if (args.iterator.properties.testName === "Simple Iterator" || args.iterator.properties.testName === "Un Pause Iterator") {
            var job = {
                type: "Job",
                properties: args.iterator.properties.testProperty
            };
            return { jobs: [job], newIterator: null };
        }
        else if (args.iterator.properties.testName === "Iterator That Gives 10 Things") {
            var count = args.iterator.properties.count;
            var jobs = null;
            if (count > 0) {
                jobs = [];
                jobs.push({
                    type: "Job",
                    properties: count
                });
                args.iterator.properties.count--;
            }
            return { jobs: jobs, newIterator: count > 0 ? args.iterator : null };
        }
        else if (args.iterator.properties.testName === "Iterator With No Things") {
            return { jobs: null, newIterator: null };
        }
        else if (args.iterator.properties.testName === "Job Ordering") {
            var long = args.iterator.properties.long;
            var delay;
            if (long) {
                delay = 3 * 1000;
            }
            else {
                delay = 0;
            }
            return Q.Promise(function (resolve, reject, notify) {
                setTimeout(function () {
                    var job = {
                        type: "Job",
                        properties: {
                            long: long,
                            time: Date.now()
                        }
                    };
                    resolve({ jobs: [job], newIterator: null });
                }, delay);
            });
        }
    }
};
module.exports = JobQueueTestsProvider;

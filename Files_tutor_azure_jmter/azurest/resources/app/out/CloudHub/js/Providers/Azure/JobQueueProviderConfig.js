/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var JobQueueProviderConfig = (function () {
        function JobQueueProviderConfig() {
            this.namespace = "JobQueueProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/JobQueueProvider",
                useChildProcess: true
            };
            this.exports = [
                "JobQueueManager.addJob",
                "JobQueueManager.deleteJob",
                "JobQueueManager.updateJob",
                "JobQueueManager.registerJobQueuer",
                "JobQueueManager.addIterator",
                "JobQueueManager.registerJobIteratorProcessor",
                "JobQueueManager.getQueueStats",
                "JobQueueManager.renewJobLease",
                "JobQueueManager.releaseJobLease",
                "JobQueueManager.nextJobLease",
                "JobQueueManager.clearQueue"
            ];
        }
        return JobQueueProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = JobQueueProviderConfig;
});

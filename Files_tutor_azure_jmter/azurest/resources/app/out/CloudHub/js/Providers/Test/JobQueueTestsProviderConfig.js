/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var JobQueueTestsProviderConfig = (function () {
        function JobQueueTestsProviderConfig() {
            this.namespace = "JobQueueTestsProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/JobQueueTestsProvider",
                useChildProcess: false
            };
            this.exports = [
                "JobQueueTestsProvider.processIterator"
            ];
        }
        return JobQueueTestsProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = JobQueueTestsProviderConfig;
});

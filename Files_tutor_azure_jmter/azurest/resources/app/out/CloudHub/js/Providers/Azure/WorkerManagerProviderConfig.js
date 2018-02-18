/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var WorkerManagerProviderConfig = (function () {
        function WorkerManagerProviderConfig() {
            this.namespace = "WorkerManagerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/WorkerManagerProvider",
                useChildProcess: false
            };
            this.exports = [
                "WorkerManager.processQueue",
                "ActivityManager.onExecuteActionEvent",
                "JobQueueManager.onJobAddedEvent"
            ];
        }
        return WorkerManagerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = WorkerManagerProviderConfig;
});

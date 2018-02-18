/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/ActivityLogManager", "StorageExplorer/Common/StorageExplorerHostProxy", "Common/TelemetryActions", "Common/Utilities"], function (require, exports, ActivityLogManager, StorageExplorerHostProxy_1, TelemetryActions, Utilities) {
    "use strict";
    /**
     * Storage explorer action context
     */
    var ExplorerContext = (function () {
        function ExplorerContext() {
            this.hostProxy = new StorageExplorerHostProxy_1.default();
            this.telemetry = new TelemetryActions(this.hostProxy);
            this.activityLogManager = new ActivityLogManager(this.hostProxy, this.telemetry);
            this.pluginParameters = Utilities.getPluginParameters();
        }
        return ExplorerContext;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ExplorerContext;
});

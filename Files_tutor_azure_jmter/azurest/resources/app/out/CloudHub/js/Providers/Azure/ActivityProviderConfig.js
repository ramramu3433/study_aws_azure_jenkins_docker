/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var ActivityProviderConfig = (function () {
        function ActivityProviderConfig() {
            this.namespace = "ActivityProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/ActivityProvider",
                useChildProcess: true
            };
            this.exports = [
                "ActivityManager.add",
                "ActivityManager.update",
                "ActivityManager.delete",
                "ActivityManager.get",
                "ActivityManager.getChildren",
                "ActivityManager.executeAction"
            ];
        }
        return ActivityProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ActivityProviderConfig;
});

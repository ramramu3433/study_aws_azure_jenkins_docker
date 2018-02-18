/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var ActivityUIWrapperProviderConfig = (function () {
        function ActivityUIWrapperProviderConfig() {
            this.namespace = "ActivityUIWrapperProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/ActivityUIWrapperProvider",
                useChildProcess: false
            };
            this.exports = [
                "ActivityManager.onAddEvent",
                "ActivityManager.onUpdateEvent",
                "ActivityManager.onDeleteEvent"
            ];
        }
        return ActivityUIWrapperProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ActivityUIWrapperProviderConfig;
});

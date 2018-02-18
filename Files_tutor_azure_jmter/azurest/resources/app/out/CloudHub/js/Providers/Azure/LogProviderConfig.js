/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for downloading blobs in a separate process
     */
    var LogProviderConfig = (function () {
        function LogProviderConfig() {
            this.namespace = "LogProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/LogProvider",
                useChildProcess: false
            };
            this.exports = [
                "Log.log",
                "Log.warn",
                "Log.error",
                "Log.logWithDelay"
            ];
        }
        return LogProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = LogProviderConfig;
});

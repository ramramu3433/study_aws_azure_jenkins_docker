/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for general blob operations
     */
    var ClipboardProviderConfig = (function () {
        function ClipboardProviderConfig() {
            this.namespace = "Environment.Clipboard";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/ClipboardProvider",
                useChildProcess: false
            };
            this.exports = [
                "Environment.Clipboard.getClipboardData",
                "Environment.Clipboard.setClipboardData"
            ];
        }
        return ClipboardProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ClipboardProviderConfig;
});

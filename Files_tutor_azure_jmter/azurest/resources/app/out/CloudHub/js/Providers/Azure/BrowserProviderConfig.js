/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * A provider for general blob operations
     */
    var BrowserProviderConfig = (function () {
        function BrowserProviderConfig() {
            this.namespace = "Environment.Browser";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BrowserProvider",
                useChildProcess: false
            };
            this.exports = [
                "Environment.Browser.openUrl"
            ];
        }
        return BrowserProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BrowserProviderConfig;
});

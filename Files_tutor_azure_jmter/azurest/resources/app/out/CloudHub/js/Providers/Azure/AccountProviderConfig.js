/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for general blob operations
     */
    var AccounyProviderConfig = (function () {
        function AccounyProviderConfig() {
            this.namespace = "Azure.Storage.AccountProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/AccountProvider",
                useChildProcess: false
            };
            this.exports = [
                "Azure.Storage.Account.generateSharedAccessSignature"
            ];
        }
        return AccounyProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AccounyProviderConfig;
});

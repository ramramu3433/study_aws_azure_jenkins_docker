/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var RequestProviderConfig = (function () {
        function RequestProviderConfig() {
            this.namespace = "Request";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/RequestProvider",
                // this should always run in process so it can use imported SSL certificates
                useChildProcess: false
            };
            this.exports = [
                "Request.get"
            ];
        }
        return RequestProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RequestProviderConfig;
});

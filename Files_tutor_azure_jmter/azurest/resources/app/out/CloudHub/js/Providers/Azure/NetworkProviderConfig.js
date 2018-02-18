/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var NetworkProviderConfig = (function () {
        function NetworkProviderConfig() {
            this.namespace = "Environment.Network";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/NetworkProvider",
                useChildProcess: false
            };
            this.exports = [
                "Environment.Network.isConnected"
            ];
        }
        return NetworkProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = NetworkProviderConfig;
});

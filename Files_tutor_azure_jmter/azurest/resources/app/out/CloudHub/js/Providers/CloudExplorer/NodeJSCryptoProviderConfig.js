/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var CryptoProviderConfig = (function () {
        function CryptoProviderConfig() {
            this.namespace = "CloudExplorer.Crypto";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/CryptoProvider" // (path relative to app\renderer)
            };
            this.exports = [
                "CloudExplorer.Actions.Crypto.EncryptText",
                "CloudExplorer.Actions.Crypto.DecryptText",
                "CloudExplorer.Actions.Crypto.GetEncryptionKey"
            ];
        }
        return CryptoProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CryptoProviderConfig;
});

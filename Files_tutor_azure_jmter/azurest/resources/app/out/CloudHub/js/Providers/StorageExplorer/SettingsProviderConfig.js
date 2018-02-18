/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var ProxySettingsProvider = (function () {
        function ProxySettingsProvider() {
            this.namespace = "Environment.Settings";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/SettingsProvider",
                useChildProcess: false
            };
            this.exports = [
                "Environment.Settings.Proxy.getProxySettings",
                "Environment.Settings.Proxy.setProxySettings"
            ];
        }
        return ProxySettingsProvider;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ProxySettingsProvider;
});

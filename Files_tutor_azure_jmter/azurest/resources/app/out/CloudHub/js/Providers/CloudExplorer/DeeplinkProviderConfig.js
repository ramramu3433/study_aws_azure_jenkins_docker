/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var DeeplinkProviderConfig = (function () {
        function DeeplinkProviderConfig() {
            this.namespace = "CloudExplorer.Deeplink";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/DeeplinkProvider" // (path relative to app\renderer)
            };
            this.exports = [
                "CloudExplorer.Actions.Deeplink.Open"
            ];
        }
        return DeeplinkProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DeeplinkProviderConfig;
});

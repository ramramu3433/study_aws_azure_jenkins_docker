/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var SessionManagerProviderConfig = (function () {
        function SessionManagerProviderConfig() {
            this.namespace = "SessionManager";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/SessionManagerProvider" // (path relative to app\renderer)
            };
            this.exports = [
                "SessionManager.getCurrentSessionFolder"
            ];
        }
        return SessionManagerProviderConfig;
    }());
    return SessionManagerProviderConfig;
});

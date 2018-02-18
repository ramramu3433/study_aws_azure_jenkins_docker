/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var NotificationBarProvider = (function () {
        function NotificationBarProvider() {
            this.namespace = "NotificationBarProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/NotificationBarProvider",
                useChildProcess: false
            };
            this.exports = [
                "StorageExplorer.NotificationBar.ShowMultiLink",
                "StorageExplorer.NotificationBar.updateMessage",
                "StorageExplorer.NotificationBar.showNotificationBar"
            ];
        }
        return NotificationBarProvider;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = NotificationBarProvider;
});

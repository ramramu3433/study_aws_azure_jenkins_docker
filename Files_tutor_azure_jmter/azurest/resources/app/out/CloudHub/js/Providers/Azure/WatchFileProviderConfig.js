/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var WatchFileProvider = (function () {
        function WatchFileProvider() {
            this.namespace = "WatchFileProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/WatchFileProvider",
                useChildProcess: false
            };
            this.exports = [
                "StorageExplorer.Blob.Files.WatchFileChange",
                "StorageExplorer.Blob.Files.UnWatchFile"
            ];
        }
        return WatchFileProvider;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = WatchFileProvider;
});

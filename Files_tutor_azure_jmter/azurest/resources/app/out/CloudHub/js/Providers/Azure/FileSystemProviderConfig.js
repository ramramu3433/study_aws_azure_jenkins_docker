/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var FileSystemProviderConfig = (function () {
        function FileSystemProviderConfig() {
            this.namespace = "FileSystemProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/FileSystemProvider",
                useChildProcess: false
            };
            this.exports = [
                "FileSystemProvider.showItemInFolder",
                "FileSystemProvider.getAppDir",
                "FileSystemProvider.tryOpenFileSafely"
            ];
        }
        return FileSystemProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileSystemProviderConfig;
});

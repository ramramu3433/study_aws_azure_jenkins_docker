/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for general file operations
     */
    var FileProviderConfig = (function () {
        function FileProviderConfig() {
            this.namespace = "Azure.Storage.FileProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/FileProvider",
                useChildProcess: false
            };
            this.exports = [
                "Azure.Storage.File.getContainerAccessControlList",
                "Azure.Storage.File.setContainerAccessControlList",
                "Azure.Storage.File.generateSharedAccessSignature",
                "Azure.Storage.File.generateSharedAccessSignatureWithPolicy"
            ];
        }
        return FileProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileProviderConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var BlobUpdateProvider = (function () {
        function BlobUpdateProvider() {
            this.namespace = "BlobUpdateProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobUpdateProvider",
                useChildProcess: false
            };
            this.exports = [
                "StorageExplorer.Blob.BlobUpdate",
                "StorageExplorer.Blob.checkBlobTimeStamp"
            ];
        }
        return BlobUpdateProvider;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobUpdateProvider;
});

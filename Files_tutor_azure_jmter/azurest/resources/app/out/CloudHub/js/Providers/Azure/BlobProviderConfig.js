/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for general blob operations
     */
    var BlobProviderConfig = (function () {
        function BlobProviderConfig() {
            this.namespace = "Azure.Storage.BlobProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobProvider",
                useChildProcess: false
            };
            this.exports = [
                "Azure.Storage.Blob.getContainerAccessControlList",
                "Azure.Storage.Blob.setContainerAccessControlList",
                "Azure.Storage.Blob.generateSharedAccessSignature",
                "Azure.Storage.Blob.generateSharedAccessSignatureWithPolicy"
            ];
        }
        return BlobProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobProviderConfig;
});

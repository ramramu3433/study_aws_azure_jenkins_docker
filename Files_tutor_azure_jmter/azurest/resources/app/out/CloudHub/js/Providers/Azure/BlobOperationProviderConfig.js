/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for downloading blobs in a separate process
     */
    var BlobOperationProviderConfig = (function () {
        function BlobOperationProviderConfig() {
            this.namespace = "Azure.Storage.BlobOperationProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobOperationProvider",
                useChildProcess: true
            };
            this.exports = [
                "Azure.Storage.Blobs.delete",
                "Azure.Storage.Blobs.open",
                "ActivityManager.onExecuteActionEvent"
            ];
        }
        return BlobOperationProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobOperationProviderConfig;
});

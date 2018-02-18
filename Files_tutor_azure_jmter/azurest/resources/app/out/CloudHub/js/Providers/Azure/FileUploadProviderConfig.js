/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for uploading Azure files in a separate process
     */
    var FileUploadProviderConfig = (function () {
        function FileUploadProviderConfig() {
            this.namespace = "Azure.Storage.FileUploadProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/FileUploadProvider",
                useChildProcess: true
            };
            this.exports = [
                "Azure.Storage.Files.uploadFile",
                "Azure.Storage.Files.getFileUploadProgress",
                "Azure.Storage.Files.releaseFileUpload",
                "Azure.Storage.Files.abortFileUpload"
            ];
        }
        return FileUploadProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileUploadProviderConfig;
});

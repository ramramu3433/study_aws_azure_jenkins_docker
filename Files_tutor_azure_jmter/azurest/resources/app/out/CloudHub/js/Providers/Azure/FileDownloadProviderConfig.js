/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for downloading Azure files in a separate process
     */
    var FileDownloadProviderConfig = (function () {
        function FileDownloadProviderConfig() {
            this.namespace = "Azure.Storage.FileDownloadProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/FileDownloadProvider",
                useChildProcess: true
            };
            this.exports = [
                "Azure.Storage.Files.downloadFile",
                "Azure.Storage.Files.getFileDownloadProgress",
                "Azure.Storage.Files.releaseFileDownload",
                "Azure.Storage.Files.abortFileDownload",
                "Azure.Storage.Files.newDownloadFile",
                "ActivityManager.onExecuteActionEvent"
            ];
        }
        return FileDownloadProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileDownloadProviderConfig;
});

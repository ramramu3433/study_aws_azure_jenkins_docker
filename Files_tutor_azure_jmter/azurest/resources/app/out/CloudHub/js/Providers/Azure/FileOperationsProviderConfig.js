/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for deleting Azure files in a separate process
     */
    var FileOperationsProviderConfig = (function () {
        function FileOperationsProviderConfig() {
            this.namespace = "Azure.Storage.FileOperationsProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/FileOperationsProvider",
                useChildProcess: true
            };
            this.exports = [
                "Azure.Storage.Files.deleteFile",
                "ActivityManager.onExecuteActionEvent"
            ];
        }
        return FileOperationsProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileOperationsProviderConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * A provider for running file/directory listing operations in a separate process.
     */
    var FileQueryProviderConfig = (function () {
        function FileQueryProviderConfig() {
            this.namespace = "Azure.Storage.FileQueryProvider";
            this.nodeJSProviderConfig = {
                /** Path relative to app/renderer(?) */
                nodeJSRequirePath: "../providers/FileQueryProvider",
                useChildProcess: true
            };
            this.exports = [
                "Azure.Storage.Files.listFilesAndDirectoriesSegmented"
            ];
        }
        return FileQueryProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileQueryProviderConfig;
});

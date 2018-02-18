/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var BlobDownloadIteratorProcessorConfig = (function () {
        function BlobDownloadIteratorProcessorConfig() {
            this.namespace = "BlobDownloadIteratorProcessorProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobDownloadProviders/BlobDownloadIteratorProcessorProvider",
                useChildProcess: false
            };
            this.exports = [
                "BlobDownloadIteratorProcessor.processIterator"
            ];
        }
        return BlobDownloadIteratorProcessorConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobDownloadIteratorProcessorConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var BlobUploadIteratorProcessorConfig = (function () {
        function BlobUploadIteratorProcessorConfig() {
            this.namespace = "BlobUploadIteratorProcessorProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobUploadProviders/BlobUploadIteratorProcessorProvider",
                useChildProcess: false
            };
            this.exports = [
                "BlobUploadIteratorProcessor.processIterator"
            ];
        }
        return BlobUploadIteratorProcessorConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobUploadIteratorProcessorConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var BlobDownloadJobQueuerProviderConfig = (function () {
        function BlobDownloadJobQueuerProviderConfig() {
            this.namespace = "BlobDownloadJobQueuerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobDownloadProviders/BlobDownloadJobQueuerProvider",
                useChildProcess: false
            };
            this.exports = [
                "BlobDownloadJobQueuer.preProcess"
            ];
        }
        return BlobDownloadJobQueuerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobDownloadJobQueuerProviderConfig;
});

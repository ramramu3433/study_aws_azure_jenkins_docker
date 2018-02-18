/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var BlobUploadJobQueuerProviderConfig = (function () {
        function BlobUploadJobQueuerProviderConfig() {
            this.namespace = "BlobUploadJobQueuerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobUploadProviders/BlobUploadJobQueuerProvider",
                useChildProcess: false
            };
            this.exports = [
                "BlobUploadJobQueuer.preProcess"
            ];
        }
        return BlobUploadJobQueuerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobUploadJobQueuerProviderConfig;
});

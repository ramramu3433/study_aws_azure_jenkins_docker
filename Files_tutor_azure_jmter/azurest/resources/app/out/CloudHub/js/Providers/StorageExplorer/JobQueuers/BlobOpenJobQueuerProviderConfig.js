/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var BlobOpenJobQueuerProviderConfig = (function () {
        function BlobOpenJobQueuerProviderConfig() {
            this.namespace = "BlobOpenJobQueuerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobOpenProviders/BlobOpenJobQueuerProvider",
                useChildProcess: false
            };
            this.exports = [
                "BlobOpenJobQueuer.preProcess"
            ];
        }
        return BlobOpenJobQueuerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobOpenJobQueuerProviderConfig;
});

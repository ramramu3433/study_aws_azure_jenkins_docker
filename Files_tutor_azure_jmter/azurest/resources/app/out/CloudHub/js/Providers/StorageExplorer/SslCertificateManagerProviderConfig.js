/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var SslCertificateManagerProviderConfig = (function () {
        function SslCertificateManagerProviderConfig() {
            this.namespace = "SslCertificateManagerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/SslCertificateManagerProvider",
                useChildProcess: false // can not run in a child process
            };
            this.exports = [
                "SslCertificateManager.getCertsDir"
            ];
        }
        return SslCertificateManagerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SslCertificateManagerProviderConfig;
});

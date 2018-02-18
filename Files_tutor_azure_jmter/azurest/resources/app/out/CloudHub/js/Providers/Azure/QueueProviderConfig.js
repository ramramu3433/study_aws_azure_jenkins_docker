/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for general queue operations
     */
    var QueueProviderConfig = (function () {
        function QueueProviderConfig() {
            this.namespace = "Azure.Storage.QueueProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/QueueProvider",
                useChildProcess: false
            };
            this.exports = [
                "Azure.Storage.Queue.getAccessControlList",
                "Azure.Storage.Queue.setAccessControlList",
                "Azure.Storage.Queue.generateSharedAccessSignature",
                "Azure.Storage.Queue.generateSharedAccessSignatureWithPolicy"
            ];
        }
        return QueueProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueueProviderConfig;
});

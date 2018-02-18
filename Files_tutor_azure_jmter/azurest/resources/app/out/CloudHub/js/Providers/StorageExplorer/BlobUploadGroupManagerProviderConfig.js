/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var BlobUploadGroupManagerProviderConfig = (function () {
        function BlobUploadGroupManagerProviderConfig() {
            this.namespace = "BlobUploadGroupManagerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobUploadProviders/BlobUploadGroupManagerProvider",
                useChildProcess: false
            };
            this.exports = [
                "BlobUploadGroupManager.initGroup",
                "BlobUploadGroupManager.cancelGroup",
                "BlobUploadGroupManager.addJob",
                "BlobUploadGroupManager.addJobs",
                "BlobUploadGroupManager.setJobActivityRef",
                "BlobUploadGroupManager.retryAll",
                "BlobUploadGroupManager.updateState",
                "BlobUploadGroupManager.isCanceled",
                "BlobUploadGroupManager.markIteratorComplete",
                "BlobUploadGroupManager.markIteratorPaused",
                "BlobUploadGroupManager.markIteratorResumed",
                "BlobUploadGroupManager.markIteratorResuming",
                "BlobUploadGroupManager.iteratorStatus",
                "BlobUploadGroupManager.handleConflict",
                "BlobUploadGroupManager.getPolicy",
                "BlobUploadGroupManager.reportIssue"
            ];
        }
        return BlobUploadGroupManagerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobUploadGroupManagerProviderConfig;
});

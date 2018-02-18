/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var BlobDownloadGroupManagerProviderConfig = (function () {
        function BlobDownloadGroupManagerProviderConfig() {
            this.namespace = "BlobDownloadGroupManagerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/BlobDownloadProviders/BlobDownloadGroupManagerProvider",
                useChildProcess: false
            };
            this.exports = [
                "BlobDownloadGroupManager.initGroup",
                "BlobDownloadGroupManager.cancelGroup",
                "BlobDownloadGroupManager.addJob",
                "BlobDownloadGroupManager.addJobs",
                "BlobDownloadGroupManager.setJobActivityRef",
                "BlobDownloadGroupManager.retryAll",
                "BlobDownloadGroupManager.updateState",
                "BlobDownloadGroupManager.isCanceled",
                "BlobDownloadGroupManager.markIteratorComplete",
                "BlobDownloadGroupManager.markIteratorPaused",
                "BlobDownloadGroupManager.markIteratorResumed",
                "BlobDownloadGroupManager.markIteratorResuming",
                "BlobDownloadGroupManager.iteratorStatus",
                "BlobDownloadGroupManager.handleConflict",
                "BlobDownloadGroupManager.getPolicy",
                "BlobDownloadGroupManager.reportIssue"
            ];
        }
        return BlobDownloadGroupManagerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobDownloadGroupManagerProviderConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var WebsiteProviderConfig = (function () {
        function WebsiteProviderConfig() {
            this.namespace = "Azure.CloudExplorer.Website";
            this.requirePath = "Providers/Azure/WebsiteProvider";
            this.exports = [
                "Azure.Attributes.Website.GetAttributes",
                "Azure.Attributes.Website.GetPublishCredentialAttributes",
                "Azure.Attributes.Website.GetConfigAttributes",
                "Azure.Attributes.Website.GetState",
                "Azure.Attributes.Website.GetAzureStackRemoteDebuggerProfilerAttributes",
                "Azure.Attributes.Website.GetDeleteFileAttributes",
                "Azure.Attributes.Website.GetAttachSnapshotDebuggerNamespace",
                "Azure.Attributes.Webjob.GetStatus",
                "Azure.Attributes.Webjob.canContinuousWebJobAttachRemoteDebugger",
                "Azure.Attributes.Webjob.canContinuousWebJobAttachRemoteProfiler",
                "Azure.Attributes.Webjob.isContinuousWebJobRunningRemoteProfiling",
                "Azure.Attributes.Webjob.GetAzureStackRemoteDebuggerProfilerAttributes",
                "Azure.Producers.Website.GetFileSystemObjects",
                "Azure.Producers.Website.GetGroupNodes",
                "Azure.Producers.Website.GetSlots",
                "Azure.Producers.Website.GetWebJobs"
            ];
        }
        return WebsiteProviderConfig;
    }());
    return WebsiteProviderConfig;
});

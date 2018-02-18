/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var WebsiteMarshalerProviderConfig = (function () {
        function WebsiteMarshalerProviderConfig() {
            this.namespace = "Azure.CSharp.Website";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.Azure.WebsiteProvider"
            };
            this.exports = [
                // Website
                "Azure.Actions.Website.attachDebugger",
                "Azure.Actions.Website.downloadPublishSettings",
                "Azure.Actions.Website.getState",
                "Azure.Actions.Website.startProfiler",
                "Azure.Actions.Website.stopProfiler",
                "Azure.Actions.Website.startStreamingLogs",
                "Azure.Actions.Website.stopStreamingLogs",
                "Azure.Actions.Website.swapSlot",
                "Azure.Actions.Website.canDeepSearch",
                "Azure.Actions.Website.isDeleteFileEnabled",
                "Azure.Actions.Website.CreateNewAppService",
                // Website files
                "Azure.Actions.Website.getWebsiteFileSystemObjects",
                "Azure.Actions.Website.openFile",
                "Azure.Actions.Website.uploadFile",
                "Azure.Actions.Website.deleteFile",
                "Azure.Actions.Website.downloadFilesAsZip",
                // Web jobs
                "Azure.Actions.Website.getWebJobStatus",
                "Azure.Actions.WebJob.runTriggeredWebJob",
                "Azure.Actions.WebJob.startContinuousWebJob",
                "Azure.Actions.WebJob.stopContinuousWebJob",
                "Azure.Actions.WebJob.startContinuousWebJobRemoteDebugSession",
                "Azure.Actions.WebJob.canContinuousWebJobAttachDebugger",
                "Azure.Actions.WebJob.canContinuousWebJobAttachRemoteProfiler",
                "Azure.Actions.WebJob.isContinuousWebJobRunningRemoteProfiling",
                "Azure.Actions.WebJob.startContinuousWebJobRemoteProfilingSession",
                "Azure.Actions.WebJob.stopContinuousWebJobRemoteProfilingSession"
            ];
        }
        return WebsiteMarshalerProviderConfig;
    }());
    return WebsiteMarshalerProviderConfig;
});

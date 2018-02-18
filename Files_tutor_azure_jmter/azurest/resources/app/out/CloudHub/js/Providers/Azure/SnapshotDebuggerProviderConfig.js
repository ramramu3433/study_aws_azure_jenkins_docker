/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var SnapshotDebuggerProviderConfig = (function () {
        function SnapshotDebuggerProviderConfig() {
            this.namespace = "Azure.SnapshotDebugger";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.Azure.SnapshotDebuggerProvider"
            };
            this.exports = [
                "Azure.Actions.Website.attachSnapshotDebugger",
                "Azure.Actions.Website.canAttachSnapshotDebugger"
            ];
        }
        return SnapshotDebuggerProviderConfig;
    }());
    return SnapshotDebuggerProviderConfig;
});

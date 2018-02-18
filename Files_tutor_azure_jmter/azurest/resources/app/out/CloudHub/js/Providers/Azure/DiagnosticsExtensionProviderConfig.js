/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var DiagnosticsExtensionProviderConfig = (function () {
        function DiagnosticsExtensionProviderConfig() {
            this.namespace = "Azure.DiagnosticsExtension";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.Azure.DiagnosticsExtensionProvider"
            };
            this.exports = [
                "Azure.Actions.DiagnosticsExtension.viewDiagnostics",
                "Azure.Actions.DiagnosticsExtension.getInitialDiagnosticsConfig",
                "Azure.Actions.DiagnosticsExtension.updateDiagnosticsConfig"
            ];
        }
        return DiagnosticsExtensionProviderConfig;
    }());
    return DiagnosticsExtensionProviderConfig;
});

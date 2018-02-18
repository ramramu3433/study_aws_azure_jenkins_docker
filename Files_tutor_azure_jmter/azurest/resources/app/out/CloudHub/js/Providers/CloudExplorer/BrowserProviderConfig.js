/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var BrowserProviderConfig = (function () {
        function BrowserProviderConfig() {
            this.namespace = "Environment.Browser";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.CloudExplorer.BrowserProvider"
            };
            this.exports = [
                "Environment.Browser.openUrl"
            ];
        }
        return BrowserProviderConfig;
    }());
    return BrowserProviderConfig;
});

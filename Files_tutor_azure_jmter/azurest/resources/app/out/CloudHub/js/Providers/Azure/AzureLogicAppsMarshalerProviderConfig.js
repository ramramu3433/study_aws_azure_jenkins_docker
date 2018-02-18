/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var AzureLogicAppsMarshalerProviderConfig = (function () {
        function AzureLogicAppsMarshalerProviderConfig() {
            this.namespace = "Azure.CSharp.LogicApp";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.Azure.AzureLogicAppsProvider"
            };
            this.exports = [
                "Azure.Actions.LogicApps.openRunHistory",
                "Azure.Actions.LogicApps.openEditor",
                "Azure.Loaders.LogicApps.isLogicAppExtensionEnabled"
            ];
        }
        return AzureLogicAppsMarshalerProviderConfig;
    }());
    return AzureLogicAppsMarshalerProviderConfig;
});

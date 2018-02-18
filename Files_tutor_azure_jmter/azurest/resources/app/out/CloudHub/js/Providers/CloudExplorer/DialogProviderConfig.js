/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var DialogProviderConfig = (function () {
        function DialogProviderConfig() {
            this.namespace = "CloudExplorer.Dialog";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.CloudExplorer.DialogProvider"
            };
            this.exports = [
                "CloudExplorer.Actions.Dialog.promptYesNo",
                "CloudExplorer.Actions.Dialog.promptConfirmAction"
            ];
        }
        return DialogProviderConfig;
    }());
    return DialogProviderConfig;
});

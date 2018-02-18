/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var NodeJSDialogProviderConfig = (function () {
        function NodeJSDialogProviderConfig() {
            this.namespace = "NodeJS.CloudExplorer.Dialog";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/DialogProvider" // (path relative to app\renderer)
            };
            this.exports = [
                "CloudExplorer.Actions.Dialog.promptYesNo",
                "CloudExplorer.Actions.Dialog.promptOK"
            ];
        }
        return NodeJSDialogProviderConfig;
    }());
    return NodeJSDialogProviderConfig;
});

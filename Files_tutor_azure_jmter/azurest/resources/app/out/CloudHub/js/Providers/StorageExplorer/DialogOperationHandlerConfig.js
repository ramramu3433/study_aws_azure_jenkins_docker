/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for downloading blobs in a separate process
     */
    var DialogOperationHandlerConfig = (function () {
        function DialogOperationHandlerConfig() {
            this.namespace = "Environment.Dialogs";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/DialogOperationHandler",
                useChildProcess: false
            };
            this.exports = [
                "Environment.Dialogs.getDialogResult",
                "Environment.Dialogs.getSaveFileDialogResult",
                "Environment.Dialogs.getOpenFileDialogResult",
                "Environment.Dialogs.showMessageBox",
                "Environment.Theming.onThemeChanged",
                "Environment.Zoom.onZoomChanged"
            ];
        }
        return DialogOperationHandlerConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DialogOperationHandlerConfig;
});

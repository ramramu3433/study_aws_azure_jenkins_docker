/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var EditorProviderConfig = (function () {
        function EditorProviderConfig() {
            this.namespace = "Environment.Editors";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/EditorProvider",
                useChildProcess: false
            };
            this.exports = [
                "Environment.Editors.openEditor",
                "Environment.Editors.closeEditor",
                "Environment.Theming.onThemeChanged",
                "Environment.Zoom.onZoomChanged"
            ];
        }
        return EditorProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = EditorProviderConfig;
});

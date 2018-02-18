/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var ThemeProvider = (function () {
        function ThemeProvider() {
            this.namespace = "Environment.ThemingProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/ThemeProvider",
                useChildProcess: false
            };
            this.exports = [
                "Environment.Theming.getTheme",
                "Environment.Theming.setTheme"
            ];
        }
        return ThemeProvider;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ThemeProvider;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ThemeUtility = (function () {
        function ThemeUtility() {
        }
        ThemeUtility.getMonacoTheme = function (theme) {
            switch (theme) {
                case "default":
                case "hc-white":
                    return "vs";
                case "dark":
                    return "vs-dark";
                case "hc-black":
                    return "hc-black";
                default:
                    return "vs";
            }
        };
        return ThemeUtility;
    }());
    exports.default = ThemeUtility;
});

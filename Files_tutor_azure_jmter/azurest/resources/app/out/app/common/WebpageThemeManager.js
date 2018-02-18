"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var WebpageThemeManager = (function () {
    function WebpageThemeManager() {
    }
    /**
     * Sets the specified theme for the current webpage.
     *
     * Theme tokens are defined in JSON files named after their respective themes.
     * The theme for a webpage is set by reading these tokens and setting
     * corresponding CSS custom properties with their values. The CSS styling rules
     * will automatically pick up the values and change the appearance of elements
     * to match the new values.
     */
    WebpageThemeManager.prototype.setTheme = function (theme) {
        var tokens = require("../renderer/theme/" + theme + ".json");
        for (var token in tokens) {
            document.documentElement.style.setProperty("--" + token, tokens[token]);
        }
    };
    return WebpageThemeManager;
}());
exports.default = new WebpageThemeManager();

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ShellViewModel_1 = require("./ShellViewModel");
var KnownSystemThemes_1 = require("./KnownSystemThemes");
var Utilities = require("../../Utilities");
var q = require("q");
var electron_1 = require("electron");
var host = global.host;
var SystemPreferences = electron_1.remote.systemPreferences;
/**
 * Manages the app's dynamic theming.
 */
var ThemeManager = (function () {
    function ThemeManager() {
        this._theme = localStorage.getItem("theme") || "default";
        this._osThemeChangeEventHandlers();
    }
    ThemeManager.prototype._osThemeChangeEventHandlers = function () {
        var _this = this;
        if (Utilities.isWin()) {
            SystemPreferences.on("inverted-color-scheme-changed", function (event, invertedColorScheme) {
                // electron does not recognize Windows' high contrast white theme as "inverted"
                if (invertedColorScheme) {
                    _this.setTheme("hc-black");
                }
                else {
                    _this.highContrastThemingEnabled()
                        .then(function (hcThemeIsEnabled) {
                        if (hcThemeIsEnabled) {
                            _this.setTheme("default");
                        }
                    });
                }
            });
            SystemPreferences.on("color-changed", function (event) {
                if (SystemPreferences.isInvertedColorScheme()) {
                    // let the inverted color scheme handler handle this
                    return;
                }
                var matchingThemeFound = false;
                for (var themeName in KnownSystemThemes_1.KnownWindowsThemes) {
                    var theme = KnownSystemThemes_1.KnownWindowsThemes[themeName];
                    if ((matchingThemeFound = _this._currWindowsThemeMatchesTheme(theme))) {
                        _this.setTheme(KnownSystemThemes_1.KnownWindowsThemes[themeName].stgExpThemeToUse);
                        break;
                    }
                }
                if (!matchingThemeFound) {
                    _this.highContrastThemingEnabled()
                        .then(function (hcThemeIsEnabled) {
                        if (hcThemeIsEnabled) {
                            _this.setTheme("default");
                        }
                    });
                }
            });
        }
    };
    ThemeManager.prototype._currWindowsThemeMatchesTheme = function (theme) {
        var elementColors = theme.elementColors;
        for (var elementName in elementColors) {
            if (SystemPreferences.getColor(elementName) !== elementColors[elementName]) {
                return false;
            }
        }
        return true;
    };
    Object.defineProperty(ThemeManager.prototype, "theme", {
        get: function () {
            return this._theme;
        },
        set: function (newTheme) {
            this._theme = newTheme;
            localStorage.setItem("theme", newTheme);
            ShellViewModel_1.default.onThemeChanged(this._theme);
            host.raiseEvent("Environment.Theming.onThemeChanged", { newTheme: newTheme });
        },
        enumerable: true,
        configurable: true
    });
    ThemeManager.prototype.getTheme = function () {
        return q.resolve(this._theme);
    };
    ThemeManager.prototype.setTheme = function (newTheme) {
        this.theme = newTheme;
        return q.resolve(undefined);
    };
    ThemeManager.prototype.highContrastThemingEnabled = function () {
        return this.getTheme()
            .then(function (theme) {
            return theme !== "default" && theme !== "dark";
        });
    };
    return ThemeManager;
}());
var instance = new ThemeManager();
exports.default = instance;

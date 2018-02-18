"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ThemeManager_1 = require("../ThemeManager");
var ko = require("knockout");
/**
 * Provides a view model for a Daytona plug-in which can then be data-bound inside HTML using the "daytona:" knockout binding.
 * @example
 * ```
 * <div class="content" data-bind="daytona: myPluginViewModel"></div>
 * ```
 */
var DaytonaPluginViewModel = (function () {
    function DaytonaPluginViewModel(manifestPath, parameters, marshalers) {
        this.isClosing = ko.observable(false);
        this.manifestPath = ko.observable();
        this.marshalers = ko.observable();
        this.parameters = ko.observable();
        this.isFocusable = ko.observable();
        this.daytonaHost = null;
        this.manifestPath(manifestPath);
        this.marshalers(marshalers);
        this.parameters(parameters);
    }
    DaytonaPluginViewModel.prototype.initialize = function () {
        this.setTheme(ThemeManager_1.default.theme);
    };
    DaytonaPluginViewModel.prototype.setTheme = function (newTheme) {
        this.daytonaHost.updateTheme(newTheme);
    };
    DaytonaPluginViewModel.prototype.close = function () {
        this.isClosing(true);
    };
    return DaytonaPluginViewModel;
}());
exports.default = DaytonaPluginViewModel;

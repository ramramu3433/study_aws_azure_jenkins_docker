"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TabViewModel_1 = require("./TabViewModel");
var DaytonaPluginViewModel_1 = require("../Common/DaytonaPluginViewModel");
var DaytonaTabViewModel = (function (_super) {
    tslib_1.__extends(DaytonaTabViewModel, _super);
    function DaytonaTabViewModel(displayName, fullName, options) {
        var _this = _super.call(this, displayName, fullName, options) || this;
        _this.plugin = new DaytonaPluginViewModel_1.default(options.source, options.parameters, options.marshalers);
        return _this;
    }
    DaytonaTabViewModel.prototype.initialize = function () {
        this.plugin.initialize();
    };
    DaytonaTabViewModel.prototype.setTheme = function (newTheme) {
        this.plugin.setTheme(newTheme);
    };
    DaytonaTabViewModel.prototype.sendIsActiveEvent = function () {
        if (!!this.plugin.marshalers()["DaytonaTabMessenger"]) {
            var tabMessagingMarshaler = this.plugin.marshalers()["DaytonaTabMessenger"];
            tabMessagingMarshaler.sendEvent("tab-active");
        }
    };
    return DaytonaTabViewModel;
}(TabViewModel_1.default));
exports.default = DaytonaTabViewModel;

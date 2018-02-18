"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ShellViewModel_1 = require("../UI/ShellViewModel");
module.exports = {
    "Environment.Theming.onThemeChanged": function (args) {
        ShellViewModel_1.default.editorPanelViewModel.onThemeChanged(args.newTheme);
        ShellViewModel_1.default.activityPanelViewModel.onThemeChanged(args.newTheme);
    },
    "Environment.Zoom.onZoomChanged": function (args) {
        ShellViewModel_1.default.editorPanelViewModel.onZoomChanged(args.zoomFactor);
    }
};

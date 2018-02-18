"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ThemeManager_1 = require("../UI/ThemeManager");
module.exports = {
    "Environment.Theming.getTheme": function (args) {
        return ThemeManager_1.default.getTheme();
    },
    "Environment.Theming.setTheme": function (args) {
        return ThemeManager_1.default.setTheme(args.newTheme);
    }
};

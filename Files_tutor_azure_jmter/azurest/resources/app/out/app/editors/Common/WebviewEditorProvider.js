"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var WebpageThemeManager_1 = require("../../common/WebpageThemeManager");
module.exports = {
    "Environment.Theming.onThemeChanged": function (args) {
        return WebpageThemeManager_1.default.setTheme(args.newTheme);
    }
};

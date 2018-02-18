"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var StartupManager_1 = require("../startup/StartupManager");
var deeplinkProvider = {
    "CloudExplorer.Actions.Deeplink.Open": function (args) {
        var deeplink = args;
        if (StartupManager_1.default.validateDeeplink(deeplink)) {
            StartupManager_1.default.navigateToResource();
        }
    }
};
module.exports = deeplinkProvider;

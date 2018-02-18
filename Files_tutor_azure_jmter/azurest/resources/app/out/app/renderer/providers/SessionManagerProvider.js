"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var SessionManager_1 = require("../SessionManagement/SessionManager");
var sessionManagerProvider = {
    "SessionManager.getCurrentSessionFolder": function (args) { return SessionManager_1.default.currentSessionFolder(); }
};
module.exports = sessionManagerProvider;

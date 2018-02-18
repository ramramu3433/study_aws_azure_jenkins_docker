"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ProviderBasedTestManager_1 = require("../Components/TestManager/ProviderBasedTestManager/ProviderBasedTestManager");
var ActivityManager_1 = require("../Components/Activities/ActivityManager");
var host = global.host;
var remoteActivityManager = new ActivityManager_1.Remote(host);
var testManager = new ProviderBasedTestManager_1.default(remoteActivityManager);
var TestManager = {
    "TestManager.getTestGroups": function () { return testManager.getTestGroups(); },
    "TestManager.runAll": function () { return testManager.runAll(); },
    "TestManager.executeTest": function (args) { return testManager.executeTest(args); },
    "TestManager.executeTestGroup": function (args) { return testManager.executeTestGroup(args); },
    "ActivityManager.onExecuteActionEvent": function (args) { return remoteActivityManager.onExecuteActionEvent(args); }
};
module.exports = TestManager;

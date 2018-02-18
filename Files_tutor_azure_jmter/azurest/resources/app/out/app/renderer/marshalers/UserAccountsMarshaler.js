"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var UserAccountsManager_1 = require("../UserAccountsManager");
var empty = function () { return; };
var userAccountsManager = UserAccountsManager_1.default.getInstance();
module.exports = {
    addAccount: userAccountsManager.addAccount,
    clearAccountFilter: empty,
    getUserAccounts: userAccountsManager.getUserAccounts,
    promptUserAuthentication: userAccountsManager.promptUserAuthentication
};

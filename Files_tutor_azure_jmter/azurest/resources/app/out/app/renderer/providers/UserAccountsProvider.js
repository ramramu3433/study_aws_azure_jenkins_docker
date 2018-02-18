"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var UserAccountsManager_1 = require("../UserAccountsManager");
var userAccountsManager = UserAccountsManager_1.default.getInstance();
var userAccountsProvider = {
    "Azure.UserAccounts.addAccount": function (args) {
        return userAccountsManager.addAccount(args.environment);
    },
    "Azure.UserAccounts.clearAccountFilter": function (args) { return; },
    "Azure.UserAccounts.promptUserAuthentication": function (args) {
        return userAccountsManager.promptUserAuthentication(args.accountId);
    },
    "Azure.UserAccounts.getUserAccounts": function (args) {
        return userAccountsManager.getUserAccounts();
    },
    "Azure.UserAccounts.getTenantId": function (args) { return; },
    "Azure.UserAccounts.removeAccount": function (args) {
        return userAccountsManager.removeAccount(args.account);
    },
    "Azure.UserAccounts.reloadUserAccountManager": function (args) {
        return userAccountsManager.reload();
    },
    "Azure.UserAccounts.getAadProviders": function (args) {
        return userAccountsManager.getAadProviders();
    },
    "Azure.UserAccounts.getCustomAadProviders": function (args) {
        return userAccountsManager.getCustomAadProviders();
    },
    "Azure.UserAccounts.removeCustomAadProvider": function (args) {
        return userAccountsManager.removeCustomAadProvider(args.environment);
    },
    "Azure.UserAccounts.addCustomAadProvider": function (args) {
        return userAccountsManager.addCustomAadProvider(args.environment, args.provider);
    },
    "Azure.UserAccounts.promptIfAnyAccountNeedReauth": function (args) {
        return userAccountsManager.promptIfAnyAccountNeedReauth();
    }
};
module.exports = userAccountsProvider;

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var NodeJSUserAccountsProviderConfig = (function () {
        function NodeJSUserAccountsProviderConfig() {
            this.namespace = "Azure.UserAccounts";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/UserAccountsProvider" // (path relative to app\renderer)
            };
            this.exports = [
                "Azure.UserAccounts.addAccount",
                "Azure.UserAccounts.clearAccountFilter",
                "Azure.UserAccounts.promptUserAuthentication",
                "Azure.UserAccounts.getUserAccounts",
                "Azure.UserAccounts.getTenantId",
                "Azure.UserAccounts.removeAccount",
                "Azure.UserAccounts.reloadUserAccountManager",
                "Azure.UserAccounts.getAadProviders",
                "Azure.UserAccounts.getCustomAadProviders",
                "Azure.UserAccounts.removeCustomAadProvider",
                "Azure.UserAccounts.addCustomAadProvider",
                "Azure.UserAccounts.promptIfAnyAccountNeedReauth"
            ];
        }
        return NodeJSUserAccountsProviderConfig;
    }());
    return NodeJSUserAccountsProviderConfig;
});

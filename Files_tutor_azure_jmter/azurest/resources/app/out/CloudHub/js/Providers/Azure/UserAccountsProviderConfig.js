/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var UserAccountsProviderConfig = (function () {
        function UserAccountsProviderConfig() {
            this.namespace = "Azure.UserAccounts";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.Azure.UserAccountsProvider"
            };
            this.exports = [
                "Azure.UserAccounts.launchAccountSettings",
                "Azure.UserAccounts.addAccount",
                "Azure.UserAccounts.clearAccountFilter",
                "Azure.UserAccounts.promptUserAuthentication",
                "Azure.UserAccounts.getUserAccounts",
                "Azure.UserAccounts.getTenantId",
                "Azure.UserAccounts.removeAccount",
                "Azure.UserAccounts.getAccountUniqueId",
                "Azure.UserAccounts.getAccountProviderId",
                "Azure.UserAccounts.getVsoId"
            ];
        }
        return UserAccountsProviderConfig;
    }());
    return UserAccountsProviderConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var AzureSubscriptionProviderConfig = (function () {
        function AzureSubscriptionProviderConfig() {
            this.namespace = "Azure.Subscriptions";
            this.requirePath = "Providers/Azure/AzureSubscriptionProvider";
            this.exports = [
                "Azure.getSelectedAccount",
                "Azure.setSelectedAccount",
                "Azure.areAllSubscriptionsSelected",
                "Azure.getSelectedSubscriptions",
                "Azure.setSelectedSubscriptions",
                "Azure.openAccountRegisterAzureUrl",
                "Azure.UserAccounts.AccountsChanged"
            ];
        }
        return AzureSubscriptionProviderConfig;
    }());
    return AzureSubscriptionProviderConfig;
});

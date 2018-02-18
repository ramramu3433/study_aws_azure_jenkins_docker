/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureAccountsManager", "Providers/Common/BaseProvider"], function (require, exports, AzureAccountsManager, BaseProvider) {
    "use strict";
    var AzureSubscriptionProvider = (function (_super) {
        __extends(AzureSubscriptionProvider, _super);
        function AzureSubscriptionProvider() {
            var _this = _super.call(this, "Azure.Subscriptions") || this;
            var azureAccountsManager = new AzureAccountsManager(_this.host);
            _this.addFunctionBinding("Azure.getSelectedSubscriptions", azureAccountsManager.getSelectedSubscriptions);
            _this.addFunctionBinding("Azure.setSelectedSubscriptions", azureAccountsManager.setSelectedSubscriptions);
            _this.addFunctionBinding("Azure.openAccountRegisterAzureUrl", azureAccountsManager.openAccountRegisterAzureUrl);
            _this.addFunctionBinding("Azure.UserAccounts.AccountsChanged", azureAccountsManager.accountsChanged);
            return _this;
        }
        return AzureSubscriptionProvider;
    }(BaseProvider));
    return AzureSubscriptionProvider;
});

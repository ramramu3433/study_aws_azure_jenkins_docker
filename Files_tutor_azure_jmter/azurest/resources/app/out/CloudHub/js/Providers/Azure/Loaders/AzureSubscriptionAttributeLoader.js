/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "Common/UserAccountsManager", "Common/TelemetryActions", "Providers/Azure/Resources/AzureResources"], function (require, exports, underscore, UserAccountsManager_1, TelemetryActions, AzureResources) {
    "use strict";
    var AzureSubscriptionAttributeLoader = (function () {
        function AzureSubscriptionAttributeLoader(host) {
            var _this = this;
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureSubscriptionAttributeLoader.getAllAttributesNamespace, _this.getAttributes);
            };
            this.getAttributes = function (args) {
                if (args === void 0) { args = null; }
                var subscription = JSON.parse(args.subscription);
                return _this._userAccountsManager.getUserAccounts().then(function (accounts) {
                    var account = underscore.find(accounts, function (account) {
                        return subscription.accountId === account.id;
                    });
                    var attributes = [
                        {
                            name: "email",
                            value: account.email
                        },
                        {
                            name: "endpoint",
                            value: _this.azureEnvironmentNames[account.endpoint] || account.endpoint
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._userAccountsManager = new UserAccountsManager_1.default(host, new TelemetryActions(host));
            host.resolveResources(AzureResources.commonNamespace, ["Properties.Subscription.Environment.Azure", "Properties.Subscription.Environment.Mooncake",
                "Properties.Subscription.Environment.BlackForest", "Properties.Subscription.Environment.Fairfax"])
                .then(function (values) {
                _this.azureEnvironmentNames = {
                    "azure": values["Properties.Subscription.Environment.Azure"],
                    "mooncake": values["Properties.Subscription.Environment.Mooncake"],
                    "blackforest": values["Properties.Subscription.Environment.BlackForest"],
                    "fairfax": values["Properties.Subscription.Environment.Fairfax"]
                };
            });
        }
        return AzureSubscriptionAttributeLoader;
    }());
    AzureSubscriptionAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.Subscriptions.GetAttributes";
    return AzureSubscriptionAttributeLoader;
});

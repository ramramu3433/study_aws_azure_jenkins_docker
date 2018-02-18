/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "underscore", "CloudExplorer/UI/AccountViewModel", "CloudExplorer/UI/BasePanelViewModel", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/TelemetryActions", "Common/UserAccountsManager", "Common/Utilities"], function (require, exports, ko, underscore, AccountViewModel, BasePanelViewModel, CloudExplorerResources, TelemetryActions, UserAccountsManager_1, Utilities) {
    "use strict";
    var AzureFilterPanelViewModel = (function (_super) {
        __extends(AzureFilterPanelViewModel, _super);
        function AzureFilterPanelViewModel(panel, hostViewModel) {
            var _this = _super.call(this, panel, hostViewModel) || this;
            _this.accounts = ko.observableArray();
            _this.noUserAccountsText = ko.observable();
            _this.addAccountText = ko.observable();
            _this.manageAccountsText = ko.observable();
            _this.applyText = ko.observable();
            _this.cancelText = ko.observable();
            _this.showSubscriptionsMessage = ko.observable();
            _this.setInitialFocus = function () {
                $("a[id='addAccountLink']").focus();
                return Promise.resolve(undefined);
            };
            _this.initialize = function (addedAccounts) {
                // Dismiss actionable errors before transitioning to Settings Panel.
                _this._hostViewModel().host.errorsManager.dismissActionableErrors();
                return _this._hostViewModel().host.executeProviderOperation("Azure.getSelectedSubscriptions")
                    .then(function (selectedSubscriptions) {
                    // get what subscriptions are supposed to be selcted if we haven't already done so
                    if (!_this._currentSelectedSubscriptions) {
                        _this._currentSelectedSubscriptions = selectedSubscriptions;
                    }
                })
                    .then(function () {
                    // get currently signed in accounts
                    return _this._userAccountsManager.getUserAccounts();
                })
                    .then(function (value) {
                    // Order accounts by name and email
                    var sortedAccounts = underscore.sortBy(value, function (account) {
                        return account.providerDisplayName + "\0" + account.email;
                    });
                    // Create an account view model for each account we got back from the user accounts manager
                    var accounts = underscore.map(sortedAccounts, function (account) {
                        var selectAllSubscriptions = false;
                        if (addedAccounts) {
                            selectAllSubscriptions = addedAccounts.some(function (addedAccount) {
                                return account.id === addedAccount.id;
                            });
                        }
                        return new AccountViewModel(account, _this._hostViewModel(), _this, selectAllSubscriptions);
                    });
                    _this.accounts(accounts);
                });
            };
            _this.addAccount = function () {
                if (Utilities.isRunningOnElectron()) {
                    _this._userAccountsManager.launchConnectDialog();
                }
            };
            _this.launchAccountSettings = function () {
                if (!Utilities.isRunningOnElectron()) {
                    _this._userAccountsManager.launchAccountSettings();
                }
            };
            _this.disableApply = ko.pureComputed(function () {
                return false;
            });
            _this.apply = function () {
                _this.saveSelectedSubscriptions().then(function () {
                    _this._hostViewModel().showTreeViews();
                });
            };
            _this.cancel = function () {
                _this._hostViewModel().host.executeProviderOperation("Azure.getSelectedSubscriptions")
                    .then(function (subscriptions) {
                    // Makes sure the subscriptions from removed accounts are no longer saved.
                    subscriptions = _this.removeOrphanSubscriptions(subscriptions);
                    return _this._hostViewModel().host.executeProviderOperation("Azure.setSelectedSubscriptions", { subscriptions: subscriptions });
                })
                    .then(function () { return _this._hostViewModel().showTreeViews(); });
            };
            _this.onAccountsChanged = function (evnt) {
                // TODO: We don't have a mechanism to detach from the account and subscriptions
                // selected events, nor a mechanism to get notified when a panel is being changed
                // for another one. So for now, we just check if we are showing the expected panel
                // to refresh the list of accounts.
                if (!_this.isActive()) {
                    return;
                }
                // If any account was added, load the account picker again and select the account added by default.
                if (!!evnt.added && evnt.added.length) {
                    _this.initialize(evnt.added);
                }
                // If any account was removed, unselected the subscriptions associated with the removed account.
                if (!!evnt.removed && evnt.removed.length) {
                    evnt.removed.forEach(function (account) { return _this._currentSelectedSubscriptions = _this._currentSelectedSubscriptions.filter(function (s) { return s.accountId !== account.id; }); });
                    _this.initialize();
                }
                // If an account was modified
                // just update it.
                evnt.modified.forEach(function (am) {
                    _this._reauthOccured = _this._reauthOccured || (am.before.needsReauthentication === true && am.after.needsReauthentication === false);
                    var accountViewModel = underscore.find(_this.accounts(), function (vm) {
                        return vm.model.id === am.before.id;
                    });
                    if (!!accountViewModel) {
                        accountViewModel.initializeModel(am.after);
                    }
                });
            };
            _this._userAccountsManager = new UserAccountsManager_1.default(hostViewModel.host, new TelemetryActions(hostViewModel.host));
            _this.addFunctionBinding("Azure.UserAccounts.AccountsChanged", _this.onAccountsChanged);
            var resourcesToResolve = [
                "View.AccountPicker.AddAccount",
                "View.Accounts.Filter.Apply",
                "View.Accounts.Filter.Cancel",
                "View.Accounts.NoUserAccounts",
                "View.Accounts.ShowSubscriptionsMessage",
                "View.Accounts.ManageAccounts"
            ];
            hostViewModel.host.resolveResources(CloudExplorerResources.namespace, resourcesToResolve)
                .then(function (values) {
                _this.applyText(values["View.Accounts.Filter.Apply"]);
                _this.cancelText(values["View.Accounts.Filter.Cancel"]);
                _this.addAccountText(values["View.AccountPicker.AddAccount"]);
                _this.noUserAccountsText(values["View.Accounts.NoUserAccounts"]);
                _this.showSubscriptionsMessage(values["View.Accounts.ShowSubscriptionsMessage"]);
                _this.manageAccountsText(values["View.Accounts.ManageAccounts"]);
            });
            return _this;
        }
        AzureFilterPanelViewModel.prototype.saveSelectedSubscriptions = function () {
            var _this = this;
            var subscriptionCount = 0;
            var selectedAccounts = 0;
            var selectedSubscriptions = [];
            this.accounts().forEach(function (avm) {
                subscriptionCount = subscriptionCount + avm.subscriptions().length;
                var accountUsed = false;
                avm.subscriptions().forEach(function (svm) {
                    if (svm.selected()) {
                        selectedSubscriptions.push(svm.model);
                        accountUsed = true;
                    }
                });
                if (accountUsed) {
                    selectedAccounts = selectedAccounts + 1;
                }
            });
            this._currentSelectedSubscriptions = this.removeOrphanSubscriptions(selectedSubscriptions);
            // Select the subscriptions before going back to the previous panel
            return this._hostViewModel().host.executeProviderOperation("Azure.setSelectedSubscriptions", {
                subscriptions: selectedSubscriptions,
                reauthOccured: this._reauthOccured
            }).then(function () {
                _this._hostViewModel().host.telemetry.sendEvent("Azure.selectedSubscriptions", {
                    totalAccounts: _this.accounts().length.toString(),
                    accountsSelected: selectedAccounts.toString(),
                    totalSubscriptions: subscriptionCount.toString(),
                    subscriptionsSelected: selectedSubscriptions.length.toString()
                });
            });
        };
        AzureFilterPanelViewModel.prototype.selectSubscriptionViewModel = function (subscriptionViewModel) {
            if (!this._currentSelectedSubscriptions.some(function (s) { return s.accountId === subscriptionViewModel.model.accountId && s.id === subscriptionViewModel.model.id; })) {
                this._currentSelectedSubscriptions.push(subscriptionViewModel.model);
            }
        };
        AzureFilterPanelViewModel.prototype.getCurrentSelectedSubscriptions = function () {
            return this._currentSelectedSubscriptions;
        };
        AzureFilterPanelViewModel.prototype.removeOrphanSubscriptions = function (subscriptions) {
            var _this = this;
            return subscriptions.filter(function (s) { return _this.accounts().some(function (a) { return a.model.id === s.accountId; }); });
        };
        return AzureFilterPanelViewModel;
    }(BasePanelViewModel));
    return AzureFilterPanelViewModel;
});

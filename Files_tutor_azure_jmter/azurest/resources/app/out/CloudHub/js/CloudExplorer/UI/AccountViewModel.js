/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore", "underscore.string", "Providers/Common/AzureConstants", "CloudExplorer/CloudExplorerConstants", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Errors", "CloudExplorer/UI/SubscriptionViewModel", "Common/TelemetryActions", "Common/UserAccountsManager"], function (require, exports, ko, underscore, _string, AzureConstants, CloudExplorerConstants, CloudExplorerResources, Errors, SubscriptionViewModel, TelemetryActions, UserAccountsManager_1) {
    "use strict";
    var AccountViewModel = (function () {
        function AccountViewModel(model, hostViewModel, azureFilterPanelViewModel, selectAllSubscriptions) {
            var _this = this;
            this.logo = ko.observable();
            this.name = ko.observable();
            this.loadedSubscriptions = ko.observable(false);
            this.scopedTenantName = ko.observable();
            this.subscriptions = ko.observableArray();
            this.email = ko.observable();
            this.needsReauthentication = ko.observable(false);
            this.subscriptionLoadFailed = ko.observable(false);
            this.errorMessage = ko.observable();
            this.allSubscriptionsText = ko.observable();
            this.loadingText = ko.observable();
            this.noUserSubscriptionsText = ko.observable();
            this.signUpForSubscriptionText = ko.observable();
            this.reenterCredentialsText = ko.observable();
            this.removeAccountText = ko.observable();
            this.userInformation = ko.pureComputed(function () {
                var returnedValue = _this.email();
                if (_this.isScoped()) {
                    returnedValue = "[" + _this.scopedTenantName() + "] " + returnedValue;
                }
                return returnedValue;
            });
            this.allSubscriptionScreenReaderText = ko.pureComputed(function () {
                return _string.sprintf("Select all subscriptions for %0s", _this.userInformation()); // Localize
            });
            this.isScoped = ko.pureComputed(function () {
                return !!_this.scopedTenantName();
            });
            this.removeAccount = function () {
                return _this._userAccountsManager.removeAccount(_this.model);
            };
            this.openRegisterAzureUrl = function () {
                _this._hostViewModel.host.executeProviderOperation("Azure.openAccountRegisterAzureUrl", { accountId: _this.model.id });
            };
            this.ensureSubscriptions = function (selectAllSubscriptions) {
                if (_this.loadedSubscriptions()) {
                    return;
                }
                _this._hostViewModel.host.azureConnection.getSubscriptions(_this.model)
                    .then(function (subscriptions) {
                    // If the user changed the panel already, don't do anything.
                    var selectedPanel = _this._hostViewModel.selectedPanel();
                    if (selectedPanel && selectedPanel.panelNamespace !==
                        AzureConstants.panelInfos.settingsPanel.panelNamespace) {
                        return;
                    }
                    var viewModels = subscriptions
                        .sort(function (a, b) {
                        var aName = !!a.name ? a.name.toLocaleLowerCase() : "";
                        var bName = !!b.name ? b.name.toLocaleLowerCase() : "";
                        if (aName < bName) {
                            return -1;
                        }
                        else if (aName > bName) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    })
                        .map(function (s) { return new SubscriptionViewModel(s); });
                    _this.subscriptions(viewModels);
                    // If the "all subscription option" is not set
                    // we have to select only the subscriptions that
                    // still exist
                    if (selectAllSubscriptions) {
                        _this.allSelected(true);
                        _this.subscriptions().forEach(function (svm) {
                            _this._azureFilterPanelViewModel.selectSubscriptionViewModel(svm);
                        });
                    }
                    else {
                        var existingSubscriptions = underscore.select(_this._azureFilterPanelViewModel.getCurrentSelectedSubscriptions(), function (s1) {
                            return underscore.any(subscriptions, function (s2) {
                                return s1.id === s2.id && s1.accountId === s2.accountId;
                            });
                        });
                        // Update the view model with the selected subscriptions
                        _this.subscriptions().forEach(function (svm) {
                            // Find if the subscription corresponding with the view model
                            // is part of the current existing and selected ones.
                            var selectedSubscription = underscore.findWhere(existingSubscriptions, { id: svm.model.id });
                            svm.selected(!!selectedSubscription);
                            if (svm.selected()) {
                                _this._azureFilterPanelViewModel.selectSubscriptionViewModel(svm);
                            }
                        });
                    }
                }).then(function () {
                    _this.subscriptionLoadFailed(false);
                }, function (err) {
                    var message = "Unable to retrieve subscriptions. Try refreshing.";
                    if (err && err.name === Errors.errorNames.ActionableError) {
                        if (err.innerError.name === Errors.errorNames.AuthenticationNeededError) {
                            message = "We need to refresh the credentials for this account.";
                        }
                    }
                    else {
                        var telemetryError = {
                            name: "AccountViewModel.LoadSubscriptions",
                            error: err
                        };
                        _this._hostViewModel.host.telemetry.sendError(telemetryError);
                    }
                    _this.errorMessage(message);
                    _this.subscriptionLoadFailed(true);
                }).then(function () { _this.loadedSubscriptions(true); });
            };
            this.allSelected = ko.pureComputed({
                read: function () {
                    return _this.subscriptions().every(function (vm) { return vm.selected(); });
                },
                write: function (value) {
                    _this.subscriptions().forEach(function (vm) { return vm.selected(value); });
                }
            });
            this.initializeModel = function (model, selectAllSubscriptions) {
                _this.model = model;
                if (!model.providerLogo) {
                    _this.logo(CloudExplorerConstants.imagePaths.UserInformationDefaultImage);
                }
                else {
                    _this.logo(CloudExplorerConstants.imagePaths.Base64EncodedPngHeader + model.providerLogo);
                }
                _this.name(model.providerDisplayName);
                _this.email(model.email);
                _this.scopedTenantName(model.scopedTenantName);
                var needsReauthenticationBefore = _this.needsReauthentication();
                _this.needsReauthentication(model.needsReauthentication);
                if (needsReauthenticationBefore !== model.needsReauthentication) {
                    _this.refreshSubscriptions();
                }
                else {
                    _this.ensureSubscriptions(selectAllSubscriptions);
                }
            };
            this.refreshSubscriptions = function () {
                _this.loadedSubscriptions(false);
                _this.ensureSubscriptions();
            };
            this.reenterCredentials = function () {
                var args = {
                    accountId: _this.model.id
                };
                _this._userAccountsManager.promptUserAuthentication(args)
                    .then(function (result) {
                    if (!!result.account) {
                        _this.loadedSubscriptions(false);
                        _this.initializeModel(result.account);
                    }
                });
            };
            // TODO: We are accessing the host actions through the hostViewModel,
            // we should pass the dependencies independently.
            this._hostViewModel = hostViewModel;
            this.initializeModel(model, selectAllSubscriptions);
            this._azureFilterPanelViewModel = azureFilterPanelViewModel;
            this.isScoped.subscribe(this.refreshSubscriptions);
            this._userAccountsManager = new UserAccountsManager_1.default(hostViewModel.host, new TelemetryActions(hostViewModel.host));
            hostViewModel.host.resolveResources(CloudExplorerResources.namespace, [
                "View.Accounts.Loading", "View.Accounts.NoUserSubscriptions",
                "View.Accounts.SignUpForSubscription", "View.AccountPicker.ReenterCredentials",
                "View.Accounts.RemoveAccount", "View.Accounts.AllSubscriptions"
            ])
                .then(function (values) {
                _this.loadingText(values["View.Accounts.Loading"]);
                _this.noUserSubscriptionsText(values["View.Accounts.NoUserSubscriptions"]);
                _this.signUpForSubscriptionText(values["View.Accounts.SignUpForSubscription"]);
                _this.reenterCredentialsText(values["View.AccountPicker.ReenterCredentials"]);
                _this.removeAccountText(values["View.Accounts.RemoveAccount"]);
                _this.allSubscriptionsText(values["View.Accounts.AllSubscriptions"]);
            });
        }
        return AccountViewModel;
    }());
    return AccountViewModel;
});

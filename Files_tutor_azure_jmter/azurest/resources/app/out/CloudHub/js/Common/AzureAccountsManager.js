/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "es6-promise", "Providers/Common/AzureConnection", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Common/ErrorsManager", "Common/TelemetryActions", "Common/UserAccountsManager"], function (require, exports, underscore, rsvp, AzureConnection, CloudExplorerActions, ErrorsManager, TelemetryActions, UserAccountsManager_1) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Manages the Azure Accounts registered in the host.
     * This class eventually will be in the Azure plugin code,
     * putting it with the host code for now until Azure Subscriptions
     * filter panel is moved to the Azure plugin code too.
     */
    var AzureAccountsManager = (function () {
        function AzureAccountsManager(host) {
            var _this = this;
            this._loadSettings = true;
            /**
             * Returns true if the account with the given id is a MSDN Premium account.
             */
            this.isMSDNPremiumAccount = function (accountId) {
                return _this._host.executeOperation(AzureAccountsManager.isMSDNPremiumAccountNamespace, [accountId]);
            };
            /**
             * Gets the selected subscriptions saved in the persistent storage.
             */
            this.getSelectedSubscriptions = function () {
                return _this.ensureSettingsAreLoaded().then(function () { return _this._selectedSubscriptions; });
            };
            /**
             * Opens the website to register the account with the given name
             * to Azure.
             */
            this.openAccountRegisterAzureUrl = function (args) {
                var accountId = args.accountId;
                return _this.isMSDNPremiumAccount(accountId)
                    .then(function (isMSDNPremium) {
                    var url = isMSDNPremium
                        ? AzureAccountsManager._registerAzureMsdnPremiumUrl
                        : AzureAccountsManager._registerAzureTrialUrl;
                    _this._host.executeOperation(CloudExplorerActions.openUrlNamespace, [{ url: url }]);
                });
            };
            this.showAccountInfobarMessage = function (message, link) {
                _this.isShowingInfobarMessage = true;
                return _this._host.executeOperation(CloudExplorerActions.showInfobarMessageNamespace, [{ message: message, link: link }])
                    .then(function (linkClicked) {
                    _this.isShowingInfobarMessage = false;
                    return Promise.resolve(linkClicked);
                });
            };
            /**
             * Sets the Selected Subscriptions and raise the
             * proper event.
             * Returns a promise that gets resolved when all listeners of changes on selected Azure Account
             * are notified and finished their update.
             */
            this.setSelectedSubscriptions = function (args) {
                return _this._setSelectedSubscriptions(args.subscriptions, args.reauthOccured);
            };
            this._setSelectedSubscriptions = function (subscriptions, reauthOccured) {
                // If there is no difference between the selected collection of subscriptions
                // and the given one, don't do anything.
                if (!reauthOccured && !_this.differentSubscriptions(_this._selectedSubscriptions, subscriptions)) {
                    return Promise.resolve();
                }
                // Assign the new Subscriptions.
                _this._selectedSubscriptions = subscriptions;
                // Notify all registered callbacks
                var promises = [];
                _this._onSelectedSubscriptionsChanged(subscriptions);
                return Promise.all(promises)
                    .then(function () {
                    // Show an Azure sign up message when the account doesn't have subscriptions.
                    return _this.saveAccountSettings();
                });
            };
            /**
             * Handles Account Changed event raised by the host.
             */
            this.accountsChanged = function (eventInfo) {
                // Check if we got an event at all.
                if (!eventInfo) {
                    return Promise.resolve();
                }
                // If we were showing an infobar message related to accounts,
                // close it at this point.
                if (_this.isShowingInfobarMessage) {
                    _this._host.executeOperation(CloudExplorerActions.closeInfoBarNamespace);
                }
                var accountsWereAdded = !!eventInfo.added && eventInfo.added.length;
                var accountsWereRemoved = !!eventInfo.removed && eventInfo.removed.length;
                // If no account was added or removed,
                // we don't need to update anything.
                if (!accountsWereAdded && !accountsWereRemoved) {
                    return Promise.resolve();
                }
                // Get all registered accounts to figure out what to do next
                // We return the promise so during testing time we know when it has finished.
                return _this._userAccountsManager.getUserAccounts()
                    .then(function (accounts) {
                    return Promise.resolve();
                });
            };
            /**
             * Return true if there is a difference between the two given collections of subscriptions,
             * false otherwise;
             */
            this.differentSubscriptions = function (collection1, collection2) {
                // If both collections are undefined, there is no difference.
                if (!collection1 && !collection2) {
                    return false;
                }
                // If only one of the collection is undefined,
                // then there is a difference.
                if ((!collection1 && !!collection2) ||
                    (!!collection1 && !collection2)) {
                    return true;
                }
                // Find if there is any element in collection1 that is not in collection 2.
                var difference = !underscore.all(collection1, function (s1) {
                    return underscore.any(collection2, function (s2) {
                        return s1.id === s2.id && s1.accountId === s2.accountId;
                    });
                });
                if (difference) {
                    return true;
                }
                // Find if there is any element in collection2 that is not in collection 1.
                difference = !underscore.all(collection2, function (s2) {
                    return underscore.any(collection1, function (s1) {
                        return s2.id === s1.id && s2.accountId === s1.accountId;
                    });
                });
                return difference;
            };
            /**
             * Initializes the selected account and subscriptions
             * based on saved settings.
             */
            this.loadSavedSettings = function () {
                var accounts;
                // Get the accounts registered in the host
                return _this._userAccountsManager.getUserAccounts()
                    .then(function (response) {
                    accounts = response;
                    // Get stored account settings
                    return _this._host.executeOperation(CloudExplorerActions.getSettingsNamespace, [{ namespace: AzureAccountsManager.accountSettingsNamespace }]);
                }).then(function (settings) {
                    // Check if we have any settings saved
                    if (!!settings && !!settings.selectedSubscriptions) {
                        _this.ensureDefaultValues(settings);
                        var selectedSubscriptionForAccounts = settings.selectedSubscriptions.filter(function (subscription) {
                            var matchingAccount = underscore.findWhere(accounts, {
                                id: subscription.accountId
                            });
                            return !!matchingAccount;
                        });
                        if (!!selectedSubscriptionForAccounts) {
                            // Select saved account
                            return _this._setSelectedSubscriptions(selectedSubscriptionForAccounts, false);
                        }
                    }
                }, function (err) {
                    _this._telemetryActions.sendError({
                        name: "AzureAccountsManager.LoadAccountSettings",
                        error: err
                    });
                });
            };
            /**
             * Loads the saved settings if they haven't been loaded yet.
             */
            this.ensureSettingsAreLoaded = function () {
                var promise = Promise.resolve(null);
                if (_this._loadSettings) {
                    var callback = function () { _this._loadSettings = false; };
                    promise = _this.loadSavedSettings().then(callback, callback);
                }
                return promise;
            };
            /**
             * Save the current state of selected account and subscriptions
             * in the host persistent storage.
             */
            this.saveAccountSettings = function () {
                return _this._host.executeOperation(CloudExplorerActions.setSettingsNamespace, [{
                        settings: {
                            namespace: AzureAccountsManager.accountSettingsNamespace,
                            properties: {
                                selectedSubscriptions: _this._selectedSubscriptions
                            }
                        }
                    }]).then(null, function (err) {
                    return _this._telemetryActions.sendError({
                        name: "AzureAccountsManager.SaveAccountSettings",
                        error: err
                    });
                });
            };
            /**
             * Ensure loaded settings provide default values. This fix-up is usually needed due contract changes.
             * Note that this only fixes the in-memory version of the settings.
             */
            this.ensureDefaultValues = function (settings) {
                if (settings && settings.selectedSubscriptions) {
                    settings.selectedSubscriptions.forEach(function (subscription) {
                        if (!subscription.managementEndpoint) {
                            subscription.managementEndpoint = "https://management.azure.com";
                            subscription.isIsolatedCloud = false;
                        }
                        else if (subscription.isIsolatedCloud === undefined) {
                            subscription.isIsolatedCloud = !(/management\.azure\.com/i.test(subscription.managementEndpoint));
                        }
                        if (subscription.isAzureStackSubscription === undefined) {
                            subscription.isAzureStackSubscription = false;
                        }
                        if (!subscription.portalEndpoint) {
                            subscription.portalEndpoint = "https://portal.azure.com";
                        }
                        if (!subscription.cloudName) {
                            subscription.cloudName = "management.azure.com";
                        }
                    });
                }
            };
            this._onSelectedSubscriptionsChanged = function (subscriptions) {
                // Telemetry: Subscriptions count
                var telemetryName = "Count";
                var telemetryProperties = {};
                telemetryProperties[telemetryName] = subscriptions ? subscriptions.length.toString() : "0";
                _this._telemetryActions.sendEvent("Azure.subscription", telemetryProperties);
                return Promise.all([
                    _this._host.executeProviderOperation("CloudExplorer.Actions.resetPanel", { name: "Resource Group" }),
                    _this._host.executeProviderOperation("CloudExplorer.Actions.resetPanel", { name: "Resource Type" })
                ]).then(function () {
                    return _this._host.executeProviderOperation("CloudExplorer.Actions.refreshPanel");
                });
            };
            this._host = host;
            this._azureConnection = new AzureConnection(host);
            this._telemetryActions = new TelemetryActions(host);
            this._userAccountsManager = new UserAccountsManager_1.default(host, this._telemetryActions);
            this._errorsManager = new ErrorsManager(host);
        }
        return AzureAccountsManager;
    }());
    AzureAccountsManager.accountSettingsNamespace = "accountSettings";
    AzureAccountsManager.isMSDNPremiumAccountNamespace = "Azure.isMSDNPremiumAccount";
    AzureAccountsManager._registerAzureMsdnPremiumUrl = "https://go.microsoft.com/fwlink/?LinkID=391024";
    AzureAccountsManager._registerAzureTrialUrl = "https://go.microsoft.com/fwlink/?LinkID=391025";
    return AzureAccountsManager;
});

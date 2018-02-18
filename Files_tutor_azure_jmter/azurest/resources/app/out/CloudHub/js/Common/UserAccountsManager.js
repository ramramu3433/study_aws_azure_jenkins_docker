/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Utilities", "../Providers/Common/AzureConstants"], function (require, exports, CloudExplorerActions, CloudExplorerResource, Utilities, AzureConstants) {
    "use strict";
    /**
     * Manages the User Accounts registered in the host.
     */
    var UserAccountsManager = (function () {
        function UserAccountsManager(host, telemetryActions) {
            var _this = this;
            /**
             * Adds a new user Account.
             */
            this.addAccount = function () {
                return _this._host.executeOperation(UserAccountsManager.addAccountNamespace, []);
            };
            /**
             * Launches the account settings page. Only applicable to VS.
             */
            this.launchAccountSettings = function () {
                if (!Utilities.isRunningOnElectron()) {
                    return _this._host.executeOperation(UserAccountsManager.launchAccountSettingsNamespace, []);
                }
                else {
                    return Promise.reject("Invalid operation: ‘launchAccountSettings’ should only be called when Cloud Explorer is hosted in Visual Studio");
                }
            };
            /**
             * Launches the connect dialog.
             */
            this.launchConnectDialog = function (startPage, args) {
                if (startPage === void 0) { startPage = "default-panel"; }
                return _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                    id: AzureConstants.registeredDialogs.connect,
                    parameters: {
                        startPage: startPage,
                        args: args
                    }
                }).then(function (result) {
                    if (!!result.error) {
                        _this._host.executeOperation(CloudExplorerActions.showInfobarMessageNamespace, [{ message: "Unable to sign in: " + result.error }]);
                    }
                    return Promise.resolve(result);
                });
            };
            /**
             * Removes a user account.
             */
            this.removeAccount = function (account) {
                return _this._host.resolveResource(CloudExplorerResource.namespace, "View.Accounts.RemoveAccount.Confirm")
                    .then(function (resource) { return _this.confirmDelete(resource); })
                    .then(function (result) {
                    if (result) {
                        _this._telemetryActions.sendEvent("Azure.Accounts.RemoveUserAccount");
                        return _this._host.executeOperation(UserAccountsManager.removeAccountNamespace, [{ account: account }]);
                    }
                });
            };
            /**
             * Verify the user wants to delete account.
             */
            this.confirmDelete = function (prompt) {
                return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: prompt, iconType: "critical" }]);
            };
            /**
             * Clear account filter.
             */
            this.clearAccountFilter = function (account) {
                return _this._host.executeOperation(UserAccountsManager.clearAccountFilterNamespace, [{ account: account }]);
            };
            /**
             * Gets the User Accounts regsitered in the host.
             */
            this.getUserAccounts = function () {
                return _this._host.executeOperation(UserAccountsManager.getUserAccountsNamespace, [])
                    .then(function (accounts) {
                    // Telemetry: Accounts count
                    _this._telemetryActions.sendMetric("Azure.Accounts", accounts.length, null);
                    return accounts;
                });
            };
            /**
             * Opens the dialog for authenticate the user with the given id.
             */
            this.promptUserAuthentication = function (args) {
                var accountId = args.accountId;
                if (!Utilities.isRunningOnElectron()) {
                    return _this._host.executeOperation(UserAccountsManager.promptUserAuthenticationNamespace, [{ accountId: accountId }]);
                }
                else {
                    return _this.launchConnectDialog("await-auth-panel", { accountId: accountId })
                        .then(function (result) {
                        return Promise.resolve(result);
                    });
                }
            };
            this._host = host;
            this._telemetryActions = telemetryActions;
        }
        return UserAccountsManager;
    }());
    /**
     * launchAccountSettings action namespace.
     * Keep in sync with its function name.
     */
    UserAccountsManager.launchAccountSettingsNamespace = "Azure.UserAccounts.launchAccountSettings";
    /**
     * addAccount action namespace.
     * Keep in sync with its function name.
     */
    UserAccountsManager.addAccountNamespace = "Azure.UserAccounts.addAccount";
    /**
     * clearAccountFilter action namespace.
     * Keep in sync with its function name.
     */
    UserAccountsManager.clearAccountFilterNamespace = "Azure.UserAccounts.clearAccountFilter";
    /**
     * getUserAccounts action namespace.
     * Keep in sync with its function name.
     */
    UserAccountsManager.getUserAccountsNamespace = "Azure.UserAccounts.getUserAccounts";
    /**
     * promptUserAuthentication action namespace.
     * Keep in sync with its function name.
     */
    UserAccountsManager.promptUserAuthenticationNamespace = "Azure.UserAccounts.promptUserAuthentication";
    /**
     * accountChanged event namespace.
     * Keep in sync with its function name.
     */
    UserAccountsManager.accountChangedNamespace = "UserAccounts.userAccountsChanged";
    /**
     * removeAccount action namespace
     * Keep in sync with its function name.
     */
    UserAccountsManager.removeAccountNamespace = "Azure.UserAccounts.removeAccount";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = UserAccountsManager;
});

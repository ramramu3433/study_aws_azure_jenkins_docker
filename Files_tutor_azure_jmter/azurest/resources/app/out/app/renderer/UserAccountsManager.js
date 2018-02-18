"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var msint_identity_aad_electron_1 = require("msint-identity-aad-electron");
var electronUtilities = require("../ElectronUtilities");
var identity = require("msint-identity");
var identity_aad = require("msint-identity-aad");
var _ = require("underscore");
var Q = require("q");
var AzureEnvironmentsManager_1 = require("./AzureEnvironmentsManager");
var AccountsDataMigrator_1 = require("./AccountsDataMigrator");
var telemetryManager = require("./telemetry/TelemetryManager");
var NotificationBarManager = require("./NotificationBarManager");
var constants = require("../Constants");
var host = global.host;
var UserAccountsManager = (function () {
    function UserAccountsManager() {
        this._azureCLIClientId = "04b07795-8ddb-461a-bbee-02f9e1bf7b46";
        this._vsClientId = "872cd9fa-d31f-45e0-9eab-6e460a02d1f1";
        this._externalAccountsFile = ".extaccounts";
        this._devAccountsFile = ".devaccounts";
        this._accountManager = null;
        if (!!UserAccountsManager._singleton) {
            throw new Error("Only UserAccountsManager.ts should call this constructor.");
        }
        this._environmentsManager = new AzureEnvironmentsManager_1.default(this._azureCLIClientId);
        this._accountManager = null;
        this._accountStore = null;
        this._aadProviders = {};
        this._externalAccountStore = null;
        this._tokenCache = null;
        this._createAadProviders();
        this._runDataMigration();
        this._createAccountManager();
        this._createExternalAccountStore();
        this._sendPostInitTelemetry();
    }
    UserAccountsManager.getInstance = function () {
        if (!UserAccountsManager._singleton) {
            UserAccountsManager._singleton = new UserAccountsManager();
        }
        return UserAccountsManager._singleton;
    };
    UserAccountsManager.prototype.reload = function () {
        this._environmentsManager.reloadProviderSettings();
        this._createAadProviders();
        this._createAccountManager();
        this._sendPostInitTelemetry();
    };
    UserAccountsManager.prototype._runDataMigration = function () {
        var dataMigrator = new AccountsDataMigrator_1.default(this);
        dataMigrator.cleanClientId(this._vsClientId, this._azureCLIClientId);
        dataMigrator.fixOldProviderIdsInAccountsFiles();
    };
    UserAccountsManager.prototype.devAccountsFile = function () {
        return this._devAccountsFile;
    };
    UserAccountsManager.prototype.extAccountsFile = function () {
        return this._externalAccountsFile;
    };
    UserAccountsManager.prototype.removeAccount = function (userAccount) {
        var account = this.convertUserAccountToIdentityAccount(userAccount);
        return this._accountManager.remove(account);
    };
    UserAccountsManager.prototype.getTenantToken = function (userAccountId, tenantId, resourceId) {
        var _this = this;
        var key = identity_aad.stringToAccountKey(userAccountId);
        return this._queryAccountStore(key).then(function (account) {
            if (!account) {
                return Q.resolve(null);
            }
            var aadProvider = _this._aadProviders[_this.determineAzureEnvironment(account)];
            return aadProvider.getSettings().then(function (settings) {
                resourceId = resourceId || settings.armResource.id;
                return aadProvider.tryAcquireToken(account, tenantId, resourceId)
                    .catch(function () {
                    // Assume autentication failed and that the user needs to reenter their credentials.
                    var authenticationError = new Error();
                    authenticationError.innerError = {
                        name: "AuthenticationNeededError"
                    };
                    authenticationError.message = "One or more accounts requires reauthentication.";
                    authenticationError.link = "Manage Accounts";
                    // We return an ActionableError so an infobar can be shown with the option to reenter credentials.
                    // TODO: [cralvord] Cloud Explorer should not hand these kinds of errors to the infobar.
                    // The host should handle these errors.
                    authenticationError.name = "ActionableError";
                    authenticationError.actionNamespace = "CloudExplorer.Actions.openPanel";
                    authenticationError.args = {
                        panelInfo: {
                            displayName: {
                                value: "Settings"
                            },
                            name: "Settings",
                            panelNamespace: "azureFilterPanel",
                            providerNamespace: "Azure.FilterPanel"
                        }
                    };
                    throw authenticationError;
                });
            });
        });
    };
    UserAccountsManager.prototype.getUserAccounts = function () {
        var _this = this;
        return this._accountManager.store.query().then(function (accounts) {
            return accounts.map(function (account) {
                return _this.convertIdentityAccountToUserAccount(account);
            });
        });
    };
    UserAccountsManager.prototype.promptIfAnyAccountNeedReauth = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var userAccounts, getTenantsPromises, authCheck, i, results, clicked;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserAccounts()];
                    case 1:
                        userAccounts = _a.sent();
                        getTenantsPromises = [];
                        authCheck = function (account) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var error_1;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.getUserAccountTenants(account.id)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, true];
                                    case 2:
                                        error_1 = _a.sent();
                                        return [2 /*return*/, false];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        for (i = 0; i < userAccounts.length; i++) {
                            getTenantsPromises.push(authCheck(userAccounts[i]));
                        }
                        return [4 /*yield*/, Promise.all(getTenantsPromises)];
                    case 2:
                        results = _a.sent();
                        if (!!results.every(function (result) { return result; })) return [3 /*break*/, 4];
                        return [4 /*yield*/, NotificationBarManager.showSingleLink("One or more accounts requires reauthentication.", "Manage Accounts", constants.InfoBarTypes.reauthentication)];
                    case 3:
                        clicked = _a.sent();
                        if (clicked) {
                            host.executeOperation("CloudExplorer.Actions.openPanel", {
                                panelInfo: {
                                    displayName: {
                                        value: "Settings"
                                    },
                                    name: "Settings",
                                    panelNamespace: "azureFilterPanel",
                                    providerNamespace: "Azure.FilterPanel"
                                }
                            });
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserAccountsManager.prototype.getUserAccountTenants = function (userAccountId) {
        var _this = this;
        var key = identity_aad.stringToAccountKey(userAccountId);
        return this._queryAccountStore(key).then(function (account) {
            if (!account) {
                return Q.resolve(null);
            }
            return _this._aadProviders[_this.determineAzureEnvironment(account)].getAllTenants(account).then(function (tenants) {
                return Q.all(tenants.map(function (tenant) {
                    return _this.getTenantToken(userAccountId, tenant.id).then(function (token) {
                        return { id: tenant.id, token: token };
                    });
                }));
            });
        });
    };
    UserAccountsManager.prototype.getArmEndpoint = function (account) {
        var _this = this;
        var key = identity_aad.stringToAccountKey(account.id);
        return this._queryAccountStore(key).then(function (account) {
            if (!account) {
                return Q.resolve(null);
            }
            return _this._aadProviders[_this.determineAzureEnvironment(account)].getSettings()
                .then(function (settings) { return settings.armResource.endpoint; });
        });
    };
    UserAccountsManager.prototype.promptUserAuthentication = function (userAccountId) {
        var _this = this;
        var key = identity_aad.stringToAccountKey(userAccountId);
        return this._queryAccountStore(key).then(function (account) {
            if (!account) {
                return Q.resolve(null);
            }
            return _this._accountManager.refresh(account)
                .then(function (account) {
                return Q.resolve({ account: _this.convertIdentityAccountToUserAccount(account), error: null });
            })
                .catch(function (onRejected) {
                return Q.resolve({ account: null, error: onRejected.message });
            })
                .finally(function () { electronUtilities.clearCookieJar(); }); // Clears the cookie jar after all tokens of the new account have been retrieved. (271343)
        });
    };
    UserAccountsManager.prototype.addExtAccount = function (account) {
        return this._externalAccountStore.addOrUpdate(account);
    };
    UserAccountsManager.prototype.getExtAccount = function (key) {
        return this._externalAccountStore.query(key).then(function (accounts) {
            if (accounts.length !== 1) {
                return Q.resolve(null);
            }
            return Q.resolve(accounts[0].properties);
        });
    };
    UserAccountsManager.prototype.removeExtAccount = function (key) {
        return this._externalAccountStore.remove(key);
    };
    UserAccountsManager.prototype.getAadProviders = function () {
        return this._environmentsManager.getAadProviderSettings();
    };
    UserAccountsManager.prototype.getCustomAadProviders = function () {
        return this._environmentsManager.getCustomAadProviderSettings();
    };
    UserAccountsManager.prototype.addCustomAadProvider = function (environment, provider) {
        this._environmentsManager.addCustomAadProvider(environment, provider);
        this.reload();
    };
    UserAccountsManager.prototype.removeCustomAadProvider = function (environment) {
        var _this = this;
        return this._accountManager.store.query().then(function (accounts) {
            for (var i = 0; i < accounts.length; i++) {
                var account = accounts[i];
                if (_this.determineAzureEnvironment(account) === environment) {
                    _this._accountManager.remove(account);
                }
            }
            _this._environmentsManager.removeCustomAadProvider(environment);
            _this.reload();
        });
    };
    UserAccountsManager.prototype.compareAadProviderArgs = function (argsA, argsB) {
        var isMatch = true;
        if (Object.keys(argsA).length > Object.keys(argsB).length) {
            // If you provide an incomplete configuration to the identity library, then it will fill in the
            // configuration for you. So, the args object that the library creates may have more fields/keys set.
            // For that reason, we make settingsA the settings object with the fewer fields to avoid a false negative.
            var temp = argsA;
            argsA = argsB;
            argsB = temp;
        }
        for (var key in argsA) {
            if (argsA[key] !== argsB[key]) {
                isMatch = false;
                break;
            }
        }
        return isMatch;
    };
    UserAccountsManager.prototype.convertIdentityAccountToUserAccount = function (account) {
        var accountAzureEnvironment = this.determineAzureEnvironment(account);
        var accountAadProvider = this._aadProviders[accountAzureEnvironment];
        var environmentSettings = this._environmentsManager.getAadProviderSettings()[accountAzureEnvironment];
        var portalEndpoint;
        if (!!environmentSettings) {
            portalEndpoint = environmentSettings.portalEndpoint;
        }
        else {
            portalEndpoint = accountAadProvider.settings.portalEndpoint || "https://portal.azure.com";
        }
        return {
            id: identity_aad.accountKeyToString(account.key),
            providerLogo: account.displayInfo.contextualLogo,
            providerDisplayName: account.displayInfo.contextualDisplayName,
            email: account.name,
            displayName: account.displayInfo.displayName,
            needsReauthentication: account.stale,
            endpoint: accountAzureEnvironment,
            coreEndpoint: accountAadProvider.settings.signInResourceId,
            portalEndpoint: portalEndpoint
        };
    };
    UserAccountsManager.prototype.convertUserAccountToIdentityAccount = function (userAccount) {
        var identityAccount = {
            key: identity_aad.stringToAccountKey(userAccount.id),
            name: userAccount.email,
            displayInfo: this.getAccountDisplayInfo(userAccount.providerDisplayName, userAccount.displayName),
            stale: userAccount.needsReauthentication,
            properties: {}
        };
        identityAccount.key.providerId = this.determineAzureEnvironment(identityAccount);
        return identityAccount;
    };
    UserAccountsManager.prototype.getAccountDisplayInfo = function (providerDisplayName, displayName) {
        return {
            contextualDisplayName: providerDisplayName,
            displayName: displayName
        };
    };
    /**
     * Given an account, find out which one of the given AAD providers it most likely came from.
     */
    UserAccountsManager.prototype.determineAzureEnvironment = function (account) {
        if (!!this._aadProviders[account.key.providerId]) {
            return account.key.providerId;
        }
        // try to figure the environment out on our own
        var accountAadProviderArgs = account.key.providerArgs;
        var matchingAadProviders = [];
        for (var environment in this._aadProviders) {
            if (this.compareAadProviderArgs(accountAadProviderArgs, this._aadProviders[environment].args)) {
                matchingAadProviders.push(environment);
            }
        }
        // return the first match
        return matchingAadProviders[0];
    };
    UserAccountsManager.prototype.addAccount = function (environment) {
        var _this = this;
        var aadProvider = !!environment && this._aadProviders[environment] ? this._aadProviders[environment] : this._defaultAadProvider();
        return this._accountManager.add(aadProvider.id, aadProvider.args)
            .then(function (account) {
            return Q.resolve({ account: _this.convertIdentityAccountToUserAccount(account), error: null });
        })
            .catch(function (onRejected) {
            _this._sendAddAccountErrorTelemetry(onRejected.message, environment);
            return Q.resolve({ account: null, error: onRejected.message });
        })
            .finally(function () {
            electronUtilities.clearCookieJar();
        }); // Clears the cookie jar after all tokens of the new account have been retrieved. (271343)
    };
    UserAccountsManager.prototype._sendAddAccountErrorTelemetry = function (errorMessage, azureEnvironment) {
        if (errorMessage !== "Operation was canceled.") {
            var environmentTelemetryKey = "environment";
            var errorMessageTelemetryKey = "errorMessage";
            var addAccountErrorTelemetryProperties = {};
            addAccountErrorTelemetryProperties[environmentTelemetryKey] = this._environmentsManager.environmentIsNormalCloud(azureEnvironment) ? azureEnvironment : "custom";
            addAccountErrorTelemetryProperties[errorMessageTelemetryKey] = errorMessage;
            telemetryManager.sendEvent("StorageExplorer.AddAccountOnRejected", addAccountErrorTelemetryProperties);
        }
    };
    UserAccountsManager.prototype._createAadProviders = function () {
        try {
            this._tokenCache = identity_aad.createJsonFileWithNativeTokenCache();
            for (var azureEnvrionment in this._environmentsManager.getAadProviderSettings()) {
                this._aadProviders[azureEnvrionment] = identity_aad.createAuthorizationCodeGrantFlowProvider(msint_identity_aad_electron_1.getAuthorizationCode, this._environmentsManager.getAadProviderSettings()[azureEnvrionment], this._tokenCache);
                this._aadProviders[azureEnvrionment].id = azureEnvrionment;
            }
        }
        catch (error) {
            console.error(error);
            this._aadProviders["local"] = identity_aad.createAuthorizationCodeGrantFlowProvider(msint_identity_aad_electron_1.getAuthorizationCode, null); // fallback to in-memory store
        }
    };
    UserAccountsManager.prototype._createAccountManager = function () {
        var _this = this;
        try {
            this._accountStore = identity.createJsonFileAccountStore(null, this._devAccountsFile);
            this._accountManager = identity.createAccountManager(_.values(this._aadProviders), this._accountStore);
            this._accountManager.store.on("change", function (changes) { return _this._handleAccountsChanged(changes); });
        }
        catch (error) {
            console.error(error);
            this._accountManager = identity.createAccountManager(_.values(this._aadProviders)); // fallback to in-memory store
            this._accountManager.store.on("change", function (changes) { return _this._handleAccountsChanged(changes); });
        }
    };
    UserAccountsManager.prototype._createExternalAccountStore = function () {
        try {
            this._externalAccountStore = identity.createJsonFileAccountStore(null, this._externalAccountsFile);
        }
        catch (error) {
            console.error(error);
            this._externalAccountStore = identity.createInMemoryAccountStore();
        }
    };
    UserAccountsManager.prototype._queryAccountStore = function (accountKey) {
        var _this = this;
        return this._accountManager.store.query(accountKey).then(function (accounts) {
            if (accounts.length !== 1) {
                return Q.resolve(null);
            }
            else {
                accounts[0].key.providerId = _this.determineAzureEnvironment(accounts[0]);
                return Q.resolve(accounts[0]);
            }
        });
    };
    UserAccountsManager.prototype._sendPostInitTelemetry = function () {
        var _this = this;
        var customEnvironmentCount = _.keys(this._environmentsManager.getCustomAadProviderSettings()).length;
        var userAccountsPerCloud = {};
        this.getUserAccounts()
            .then(function (accounts) {
            // init a map of all of our normal environments, plus one for custom
            var normalEnvironmentKeys = _.keys(_this._environmentsManager.getNormalAadProviderSetings());
            for (var i = 0; i < normalEnvironmentKeys.length; i++) {
                userAccountsPerCloud[normalEnvironmentKeys[i]] = 0;
            }
            userAccountsPerCloud["custom"] = 0;
            for (i = 0; i < accounts.length; i++) {
                if (_this._environmentsManager.environmentIsNormalCloud(accounts[i].endpoint)) {
                    userAccountsPerCloud[accounts[i].endpoint] += 1;
                }
                else {
                    userAccountsPerCloud["custom"] += 1;
                }
            }
            var customEnvironmentCountTelemetryKey = "customEnvironmentCount";
            var userAccountsPerCloudTelemetryKey = "userAccountsPerCloud";
            var telemetryProperties = {};
            var logEnvironmentTelemetryName = "StorageExplorer.AzureEnvironmentStats";
            telemetryProperties[customEnvironmentCountTelemetryKey] = customEnvironmentCount.toString();
            telemetryProperties[userAccountsPerCloudTelemetryKey] = JSON.stringify(userAccountsPerCloud);
            telemetryManager.sendEvent(logEnvironmentTelemetryName, telemetryProperties);
        });
    };
    UserAccountsManager.prototype._handleAccountsChanged = function (changes) {
        var _this = this;
        host.raiseEvent("Azure.UserAccounts.AccountsChanged", {
            added: changes.added.map(function (account) {
                return _this.convertIdentityAccountToUserAccount(account);
            }),
            modified: changes.modified.map(function (item) {
                return {
                    before: _this.convertIdentityAccountToUserAccount(item.before),
                    after: _this.convertIdentityAccountToUserAccount(item.after)
                };
            }),
            removed: changes.removed.map(function (account) {
                return _this.convertIdentityAccountToUserAccount(account);
            })
        });
    };
    UserAccountsManager.prototype._defaultAadProvider = function () {
        return this._aadProviders["azure"] || this._aadProviders["local"];
    };
    return UserAccountsManager;
}());
// enforce a singleton pattern so we only have one UserAccountsManager
UserAccountsManager._singleton = null;
exports.default = UserAccountsManager;

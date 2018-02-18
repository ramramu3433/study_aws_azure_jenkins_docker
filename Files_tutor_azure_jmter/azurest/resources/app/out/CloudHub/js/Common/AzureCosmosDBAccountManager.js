/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Debug"], function (require, exports, Debug) {
    "use strict";
    var AzureCosmosDBAccountManager = (function () {
        function AzureCosmosDBAccountManager() {
        }
        return AzureCosmosDBAccountManager;
    }());
    AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts = "StorageExplorer_AddExternalCosmosDBAccount_SessionKey_v1";
    AzureCosmosDBAccountManager.saveCosmosDBAccount = function (host, account) {
        if (!AzureCosmosDBAccountManager._isStorageSupported()) {
            return Promise.resolve();
        }
        if (AzureCosmosDBAccountManager.wasAccountStored(account)) {
            return Promise.resolve();
        }
        var newAccountData = {
            accountName: account.accountName,
            accountEndpoint: account.accountEndpoint,
            defaultExperience: account.defaultExperience
        };
        // Save account part to localStorage
        var storedAccountData = AzureCosmosDBAccountManager._loadStoredAccountData(AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts).concat(newAccountData);
        localStorage.setItem(AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts, JSON.stringify(storedAccountData));
        var confidentialDataKey = AzureCosmosDBAccountManager._constructConfidentialDataKey(AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts, newAccountData);
        var confidential = account.accountKey;
        // Save account key to user account manager
        return host.executeOperation("Environment.saveConfidentialData", [confidentialDataKey, confidential]);
    };
    AzureCosmosDBAccountManager.deleteCosmosDBAccount = function (host, accountToDelete) {
        if (!AzureCosmosDBAccountManager._isStorageSupported()) {
            return;
        }
        var storedAccounts = AzureCosmosDBAccountManager._loadStoredAccountData(AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts);
        if (!storedAccounts) {
            return;
        }
        var targetAccount = null;
        var filteredAccounts = storedAccounts.filter(function (data) {
            var toRemove = AzureCosmosDBAccountManager._isSameAccountData(data, accountToDelete);
            if (toRemove) {
                targetAccount = data;
            }
            return !toRemove;
        });
        if (targetAccount) {
            // delete the account name from localStorage
            localStorage.setItem(AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts, JSON.stringify(filteredAccounts));
            // Delete the account key from user account manager
            var confidentialDataKey = AzureCosmosDBAccountManager._constructConfidentialDataKey(AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts, targetAccount);
            if (confidentialDataKey) {
                host.executeOperation("Environment.deleteConfidentialData", [confidentialDataKey]);
            }
        }
    };
    AzureCosmosDBAccountManager.loadStorageAccounts = function (host) {
        var key = AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts;
        var storedData = AzureCosmosDBAccountManager._loadStoredAccountData(key);
        var promises = [];
        if (storedData) {
            storedData.map(function (data) {
                return AzureCosmosDBAccountManager._constructConfidentialDataKey(key, data);
            }).forEach(function (key, index) {
                var confidentialDataPromise = host.executeOperation("Environment.getConfidentialData", [key])
                    .then(function (confidentialData) {
                    if (confidentialData) {
                        // Use the data we have to resolve the promise
                        return Promise.resolve(confidentialData);
                    }
                    else {
                        // Can't get the confidential data
                        return Promise.resolve(null);
                    }
                });
                promises.push(confidentialDataPromise);
            });
        }
        return Promise.all(promises).then(function (accountsConfidential) {
            var storageAccounts = accountsConfidential.map(function (confidentialData, index) {
                var account = {
                    accountName: storedData[index].accountName,
                    accountEndpoint: storedData[index].accountEndpoint,
                    defaultExperience: storedData[index].defaultExperience
                };
                account.accountKey = confidentialData;
                return account;
            });
            return storageAccounts;
        });
    };
    AzureCosmosDBAccountManager.wasAccountStored = function (account) {
        if (!AzureCosmosDBAccountManager._isStorageSupported()) {
            return false;
        }
        var storedData = AzureCosmosDBAccountManager._loadStoredAccountData(AzureCosmosDBAccountManager._sessionKeyOfCosmosDBAccounts);
        var accountSavedBefore = storedData &&
            storedData.some(function (data) {
                return AzureCosmosDBAccountManager._isSameAccountData(data, account);
            });
        return accountSavedBefore;
    };
    AzureCosmosDBAccountManager._isStorageSupported = function () {
        return (typeof (Storage) !== "undefined");
    };
    AzureCosmosDBAccountManager._loadStoredData = function (key) {
        var storedData = [];
        var jsonStoredKeys = null;
        if (AzureCosmosDBAccountManager._isStorageSupported()) {
            jsonStoredKeys = localStorage.getItem(key);
            try {
                storedData = JSON.parse(jsonStoredKeys);
            }
            catch (err) {
                Debug.error("AzureCosmosDBAccountManager. Error parsing storage account data.", err);
                storedData = [];
            }
        }
        return storedData || [];
    };
    AzureCosmosDBAccountManager._loadStoredAccountData = function (key) {
        var storedAccountData = AzureCosmosDBAccountManager._loadStoredData(key);
        return storedAccountData;
    };
    AzureCosmosDBAccountManager._isSameAccountData = function (a, b) {
        var accountNameA = a.accountName || "";
        var accountEndpointA = a.accountEndpoint || "";
        var defaultExperienceA = a.defaultExperience || "";
        var accountNameB = b.accountName || "";
        var accountEndpointB = b.accountEndpoint || "";
        var defaultExperienceB = b.defaultExperience || "";
        return accountNameA.toLowerCase() === accountNameB.toLowerCase() &&
            accountEndpointA.toLowerCase() === accountEndpointB.toLowerCase() &&
            defaultExperienceA === defaultExperienceB;
    };
    AzureCosmosDBAccountManager._constructConfidentialDataKey = function (service, accountData) {
        if (!accountData) {
            return null;
        }
        var accountStoreKey = accountData.accountName + accountData.accountEndpoint + accountData.defaultExperience;
        return { service: service, account: accountStoreKey };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AzureCosmosDBAccountManager;
});

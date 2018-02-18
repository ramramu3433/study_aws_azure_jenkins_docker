"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fileHelpers = require("./common/FileOperationHelper");
var telemetryManager = require("./telemetry/TelemetryManager");
var utilities = require("../Utilities");
var AccountsDataMigrator = (function () {
    function AccountsDataMigrator(userAccountsManager) {
        this._userAccountsManager = userAccountsManager;
    }
    AccountsDataMigrator.prototype.getHomeDirectory = function () {
        // Get the HOME directory where the account information is supposed to be stored.
        var dir;
        if (process.env.HOME !== undefined) {
            dir = process.env.HOME;
        }
        else if (process.env.HOMEDRIVE && process.env.HOMEPATH) {
            dir = process.env.HOMEDRIVE + process.env.HOMEPATH;
        }
        if (!dir) {
            telemetryManager.sendError("StorageExplorer.UserAccountsManager.noHomeDirectory", "The home directory is not specified.");
            return null;
        }
        if (!fileHelpers.pathExistsSync(dir)) {
            // Send error to telemetry system to track the issue
            telemetryManager.sendError("StorageExplorer.UserAccountsManager.noHomeDirectory", "The home directory doesn't exist.");
            return null;
        }
        return dir;
    };
    AccountsDataMigrator.prototype.fixOldProviderIdsInAccountsFiles = function () {
        // Get the HOME directory where the account information is supposed to be stored.
        var homeDir = this.getHomeDirectory();
        if (!homeDir) {
            return;
        }
        var adalCacheFilePath = path.join(homeDir, ".adalcache");
        var devAccountsFilePath = path.join(homeDir, this._userAccountsManager.devAccountsFile());
        var externalAccountsFilePath = path.join(homeDir, this._userAccountsManager.extAccountsFile());
        try {
            var deleteAdalCacheFile = false;
            // replace the providerIds ids in devaccounts
            var devAccounts = fileHelpers.readJsonFileSync(devAccountsFilePath);
            if (!!devAccounts) {
                var fixedDevAccounts = this.migrateAccountProviderIds(devAccounts);
                if (!!fixedDevAccounts) {
                    deleteAdalCacheFile = true;
                    fileHelpers.writeToFileSync(devAccountsFilePath, fixedDevAccounts);
                }
            }
            // replace the providerIds ids in extaccounts
            var extAccounts = fileHelpers.readJsonFileSync(externalAccountsFilePath);
            if (!!extAccounts) {
                var fixedExtAccounts = this.migrateAccountProviderIds(extAccounts);
                if (!!fixedExtAccounts) {
                    deleteAdalCacheFile = true;
                    fileHelpers.writeToFileSync(externalAccountsFilePath, fixedExtAccounts);
                }
            }
            if (deleteAdalCacheFile) {
                // delete the adal cache
                fileHelpers.deleteFileIfExistsSync(adalCacheFilePath);
            }
        }
        catch (err) {
            // Send error to telemetry system to track the issue
            telemetryManager.sendError("StorageExplorer.UserAccountsManager.fixProviderIds", err);
            console.log(err);
            // Something went wrong, last desperate solution, delete all files containing the account info.
            fileHelpers.deleteFileIfExistsSync(adalCacheFilePath);
            fileHelpers.deleteFileIfExistsSync(devAccountsFilePath);
            fileHelpers.deleteFileIfExistsSync(externalAccountsFilePath);
        }
    };
    AccountsDataMigrator.prototype.migrateAccountProviderIds = function (accounts) {
        var needToWriteFix = false;
        for (var i = 0; i < accounts.length; i++) {
            var account = accounts[i];
            var currAcountProviderId = account.key.providerId;
            var correctAcountProviderId = this._userAccountsManager.determineAzureEnvironment(account);
            needToWriteFix = needToWriteFix || (currAcountProviderId !== correctAcountProviderId);
            account.key.providerId = correctAcountProviderId;
        }
        if (needToWriteFix) {
            return JSON.stringify(accounts);
        }
        else {
            return null;
        }
    };
    AccountsDataMigrator.prototype.cleanClientId = function (oldClientId, newClientId) {
        // We replaced the Application Client Id, so we need to clean the accounts information
        // from the old value. This only needs to happen once.
        var accountIdReplacedSettingsKey = "Standalone_ClientIdReplaced_v1";
        var accountsReplacedAlready = utilities.loadSettings(accountIdReplacedSettingsKey);
        if (accountsReplacedAlready) {
            // we already ran this
            return;
        }
        // Get the HOME directory where the account information is supposed to be stored.
        var homeDir = this.getHomeDirectory();
        if (!homeDir) {
            return;
        }
        var adalCacheFilePath = path.join(homeDir, ".adalcache");
        var devAccountsFilePath = path.join(homeDir, this._userAccountsManager.devAccountsFile());
        var externalAccountsFilePath = path.join(homeDir, this._userAccountsManager.extAccountsFile());
        try {
            // Replace the client ids and delete the adal cache to ensure a proper accounts state.
            fileHelpers.replaceAllStringsInFileSync(devAccountsFilePath, new RegExp(oldClientId, "g"), newClientId);
            fileHelpers.replaceAllStringsInFileSync(externalAccountsFilePath, new RegExp(oldClientId, "g"), newClientId);
            fileHelpers.deleteFileIfExistsSync(adalCacheFilePath);
            utilities.saveSettings(accountIdReplacedSettingsKey, true);
        }
        catch (err) {
            // Send error to telemetry system to track the issue
            telemetryManager.sendError("StorageExplorer.UserAccountsManager.replaceClientIdError", err);
            // Something went wrong, last desperate solution, delete all files containing the account info.
            fileHelpers.deleteFileIfExistsSync(adalCacheFilePath);
            fileHelpers.deleteFileIfExistsSync(devAccountsFilePath);
            fileHelpers.deleteFileIfExistsSync(externalAccountsFilePath);
            telemetryManager.sendError("StorageExplorer.UserAccountsManager.cleanClientIdError", err);
        }
    };
    return AccountsDataMigrator;
}());
exports.default = AccountsDataMigrator;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionString_1 = require("../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var ConnectionStringKey_1 = require("../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionStringKey");
var EndpointDomains_1 = require("../renderer/Components/AzureStorage/EndpointDomains");
var SasToken_1 = require("../renderer/Components/AzureStorage/Sas/Parsers/SasToken");
var Errors = require("../common/Errors");
var q = require("q");
var _string = require("underscore.string");
var AttachedStorage = (function () {
    function AttachedStorage() {
    }
    /**
     * A helper method for generating raw data for a storage account.
     * @param resourceType
     * @param displayName
     * @param extraAttributes
     */
    AttachedStorage.wrapStorageAccountRawData = function (resourceType, displayName, extraAttributes) {
        var attributes = [];
        if (!extraAttributes || !extraAttributes.some(function (attribute) { return attribute.name === "supportsBlobs"; })) {
            attributes.push({ name: "supportsBlobs", value: true });
        }
        if (!extraAttributes || !extraAttributes.some(function (attribute) { return attribute.name === "supportsFiles"; })) {
            attributes.push({ name: "supportsFiles", value: true });
        }
        if (!extraAttributes || !extraAttributes.some(function (attribute) { return attribute.name === "supportsQueues"; })) {
            attributes.push({ name: "supportsQueues", value: true });
        }
        if (!extraAttributes || !extraAttributes.some(function (attribute) { return attribute.name === "supportsTables"; })) {
            attributes.push({ name: "supportsTables", value: true });
        }
        if (!extraAttributes || !extraAttributes.some(function (attribute) { return attribute.name === "highlightLocations"; })) {
            attributes.push({ name: "highlightLocations", value: null });
        }
        if (!extraAttributes || !extraAttributes.some(function (attribute) { return attribute.name === "searchQuery"; })) {
            attributes.push({ name: "searchQuery", value: null });
        }
        if (!extraAttributes || !extraAttributes.some(function (attribute) { return attribute.name === "shouldPreExpandNodes"; })) {
            attributes.push({ name: "shouldPreExpandNodes", value: false });
        }
        attributes = !!extraAttributes ? attributes.concat(extraAttributes) : attributes;
        return {
            name: displayName,
            type: resourceType,
            attributes: attributes
        };
    };
    /**
     * A cross browser detection if storage is supported.
     */
    AttachedStorage._isStorageSupported = function () {
        return (typeof (Storage) !== "undefined");
    };
    /**
     * Determine whether two storage accounts are the same.
     * Two storage accounts are the same only when they have same account name in the same domain.
     * @param a
     * @param b
     */
    AttachedStorage._isSameAccountData = function (a, b) {
        var accountNameA = a.accountName || "";
        var endPointsDomainA = a.endpointsDomain || "";
        var connectionTypeA = a.connectionType || 3 /* key */;
        var accountNameB = b.accountName || "";
        var endPointsDomainB = b.endpointsDomain || "";
        var connectionTypeB = b.connectionType || 3 /* key */;
        return accountNameA.toLowerCase() === accountNameB.toLowerCase() &&
            endPointsDomainA.toLowerCase() === endPointsDomainB.toLowerCase() &&
            connectionTypeA === connectionTypeB;
    };
    /**
     * Check if a storage account has already been saved before.
     */
    AttachedStorage.wasAccountStored = function (account) {
        if (!AttachedStorage._isStorageSupported()) {
            return false;
        }
        var storedData = AttachedStorage._loadStoredAccountData(AttachedStorage.sessionKeyOfStorageAccounts);
        var accountSavedBefore = storedData &&
            storedData.some(function (data) {
                return AttachedStorage._isSameAccountData(data, account);
            });
        return accountSavedBefore;
    };
    /**
     * Load storage accounts from localStorage
     * @param key
     */
    AttachedStorage._loadStoredAccountData = function (key) {
        var storedAccountData = AttachedStorage._loadStoredData(key);
        storedAccountData.forEach(function (account) {
            if (!account.endpointsDomain) {
                account.endpointsDomain = EndpointDomains_1.default.default;
            }
        });
        return storedAccountData;
    };
    /**
     * Load storage data from localStorage
     * @param key
     */
    AttachedStorage._loadStoredData = function (key) {
        var storedData = [];
        var jsonStoredKeys = null;
        if (AttachedStorage._isStorageSupported()) {
            jsonStoredKeys = localStorage.getItem(key);
            try {
                storedData = JSON.parse(jsonStoredKeys);
            }
            catch (err) {
                // Debug.error("AzureStorageUtilities. Error parsing storage account data.", err); wat
                storedData = [];
            }
        }
        return storedData || [];
    };
    /**
     * Save the attached external storage account:
     * Cache account data using HTML5 localStorage
     * Store account key using msint-identity module
     * @param environmentActions
     * @param account
     */
    AttachedStorage.saveStorageAccount = function (host, account, customApiVersion) {
        if (!AttachedStorage._isStorageSupported()) {
            return q.resolve(undefined);
        }
        if (AttachedStorage.wasAccountStored(account)) {
            return q.resolve(undefined);
        }
        var newAccountData = {
            accountName: account.accountName,
            endpointsDomain: account.endpointsDomain,
            connectionType: account.connectionType,
            useHttp: account.useHttp
        };
        // Save account part to localStorage
        var storedAccountData = AttachedStorage._loadStoredAccountData(AttachedStorage.sessionKeyOfStorageAccounts).concat(newAccountData);
        localStorage.setItem(AttachedStorage.sessionKeyOfStorageAccounts, JSON.stringify(storedAccountData));
        var confidentialDataKey = AttachedStorage._constructConfidentialDataKey(AttachedStorage.sessionKeyOfStorageAccounts, newAccountData);
        var confidential;
        switch (account.connectionType) {
            case 1 /* sasAttachedAccount */:
                confidential = account.connectionString;
                break;
            case 3 /* key */:
                confidential = account.accountKey;
                break;
            // For backward compatibility reasons if the connection type is not set
            // we assume it is a key
            default:
                confidential = account.accountKey;
        }
        // Save account key to user account manager
        return host.executeOperation("Environment.saveConfidentialData", [confidentialDataKey, confidential]);
    };
    /**
     * Load the stored storage accounts:
     * Get account data from localStorage
     * Combine session key and account data as user account manager key to get account key stored there.
     * @param host
     * @param key
     */
    AttachedStorage.loadStorageAccounts = function (host, key) {
        if (key === void 0) { key = AttachedStorage.sessionKeyOfStorageAccounts; }
        var storedData = AttachedStorage._loadStoredAccountData(key);
        var promises = [];
        if (storedData) {
            storedData.map(function (data) {
                return AttachedStorage._constructConfidentialDataKey(AttachedStorage.sessionKeyOfStorageAccounts, data);
            }).forEach(function (key, index) {
                var confidentialDataPromise = host.executeOperation("Environment.getConfidentialData", [key])
                    .then(function (confidentialData) {
                    if (confidentialData) {
                        // Use the data we have to resolve the promise
                        return Promise.resolve(confidentialData);
                    }
                    else if (storedData[index].endpointsDomain === EndpointDomains_1.default.default) {
                        // Failed to get confidentialData before, if the endpoint is the default one,
                        // try with key that doesn't have endpointsDomain
                        var newKey = { service: AttachedStorage.sessionKeyOfStorageAccounts, account: storedData[index].accountName };
                        return host.executeOperation("Environment.getConfidentialData", [newKey]);
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
                    endpointsDomain: storedData[index].endpointsDomain,
                    connectionType: storedData[index].connectionType,
                    useHttp: storedData[index].useHttp
                };
                switch (account.connectionType) {
                    case 1 /* sasAttachedAccount */:
                        account.connectionString = confidentialData;
                        break;
                    case 3 /* key */:
                        account.accountKey = confidentialData;
                        break;
                    default:
                        // For backward compatibility reasons if the connection type is not set
                        // we assume it is a key
                        account.accountKey = confidentialData;
                }
                return account;
            });
            return storageAccounts;
        });
    };
    /**
     * Delete the specific storage account:
     * Clear the cached account data from localStorage if it exists there.
     * Delete the stored account key in user account manager.
     * @param environmentActions
     * @param accountToDelete
     */
    AttachedStorage.deleteStoredAccount = function (host, accountToDelete) {
        if (!AttachedStorage._isStorageSupported()) {
            return;
        }
        var storedAccounts = AttachedStorage._loadStoredAccountData(AttachedStorage.sessionKeyOfStorageAccounts);
        if (!storedAccounts) {
            return;
        }
        var targetAccount = null;
        var filteredAccounts = storedAccounts.filter(function (data) {
            var toRemove = AttachedStorage._isSameAccountData(data, accountToDelete);
            if (toRemove) {
                targetAccount = data;
            }
            return !toRemove;
        });
        if (targetAccount) {
            // delete the account name from localStorage
            localStorage.setItem(AttachedStorage.sessionKeyOfStorageAccounts, JSON.stringify(filteredAccounts));
            // Delete the account key from user account manager
            var confidentialDataKey = AttachedStorage._constructConfidentialDataKey(AttachedStorage.sessionKeyOfStorageAccounts, targetAccount);
            if (confidentialDataKey) {
                host.executeOperation("Environment.deleteConfidentialData", [confidentialDataKey]).then(function (deleteSuccess) {
                    // Failed to delete with the targetAccount having the default endpoint.
                    // This could be because when the account was first saved, endpointsDomain was not part of the key.
                    if (!deleteSuccess && targetAccount.endpointsDomain === EndpointDomains_1.default.default) {
                        // try deleting with original key
                        host.executeOperation("Environment.deleteConfidentialData", [{ service: AttachedStorage.sessionKeyOfStorageAccounts, account: targetAccount.accountName }]);
                    }
                });
            }
        }
    };
    /**
     * Construct a unique key for user account manager.
     * @param service
     * @param accountData
     */
    AttachedStorage._constructConfidentialDataKey = function (service, accountData) {
        if (!accountData) {
            return null;
        }
        var accountStoreKey = accountData.accountName +
            ((accountData.endpointsDomain) ? accountData.endpointsDomain : EndpointDomains_1.default.default) +
            ((accountData.connectionType) ? accountData.connectionType : "");
        return { service: service, account: accountStoreKey };
    };
    /**
     * Construct status for an attached external storage account (this shows up in parentheses after the name)
     * @param accountData
     */
    AttachedStorage.getExternalStorageAccountStatus = function (accountData) {
        var status;
        if (AttachedStorage.isSasAttachedAccount(accountData)) {
            status = "SAS";
        }
        else {
            // Localize
            status = "External";
            if (accountData.endpointsDomain === EndpointDomains_1.default.chinaAzure) {
                status += ", China";
            }
            else if (accountData.endpointsDomain !== EndpointDomains_1.default.default) {
                status += ", Other";
            }
        }
        return status;
    };
    /**
     * Returns true if the storage account is attached via SAS
     */
    AttachedStorage.isSasAttachedAccount = function (accountData) {
        return accountData.connectionType === 1 /* sasAttachedAccount */;
    };
    /**
     * Returns true if the storage account is externally attached
     */
    AttachedStorage.isExternallyAttachedAccount = function (accountData) {
        return accountData.connectionType !== 1 /* sasAttachedAccount */;
    };
    /**
     * Constructs a string from an attached external storage account's permission set.
     */
    AttachedStorage.getExternalStorageAccountPermissions = function (accountData) {
        if (accountData.connectionType === 1 /* sasAttachedAccount */) {
            var connectionString = new ConnectionString_1.default(accountData.connectionString);
            var sasToken = new SasToken_1.default(connectionString.getSAS());
            return sasToken.displayPermission || "(none)"; // Localize
        }
        return "Full"; // Localize
    };
    /**
     * Helper private static _to determine if the connection string has the account name
     * and account key fields set.
     */
    AttachedStorage.connectionStringContainsAccountNameKey = function (connectionString) {
        var connectionKvs = AttachedStorage.parseConnectionStringKeyValues(connectionString);
        return !!connectionKvs[ConnectionStringKey_1.default.accountName] &&
            !!connectionKvs[ConnectionStringKey_1.default.accountKey];
    };
    /**
     * Helper private static _to determine if the connection string contains a SAS (shared access signature)
     */
    AttachedStorage.connectionStringContainsSharedAccessSignature = function (connectionString) {
        var connectionKvs = AttachedStorage.parseConnectionStringKeyValues(connectionString);
        return !!connectionKvs[ConnectionStringKey_1.default.sharedAccessSignature];
    };
    /**
     * Helper private static _to determine if the connection string has the SAS signature
     * key field set.
     */
    AttachedStorage.getSASSignature = function (connectionString) {
        var connectionKvs = AttachedStorage.parseConnectionStringKeyValues(connectionString);
        return connectionKvs[ConnectionStringKey_1.default.sharedAccessSignature];
    };
    /**
     * Parse the connection string to get key/value pairs
     * see https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
     * for possible key names.
     * @param connectionString
     */
    AttachedStorage.parseConnectionStringKeyValues = function (connectionString) {
        var keyValuePairs = {};
        if (connectionString) {
            // split string to get key value pairs
            connectionString.split(";").forEach(function (segment) {
                var separator = segment.indexOf("=");
                if (separator !== -1) {
                    // found the separator in the string
                    var key = segment.substring(0, separator);
                    var value = segment.substring(separator + 1);
                    keyValuePairs[key] = value;
                }
            });
        }
        return keyValuePairs;
    };
    /**
     * Gets a account name from the passed connection string
     */
    AttachedStorage.getAccountNameFromConnectionString = function (connectionString) {
        var connectionStringValues = AttachedStorage.parseConnectionStringKeyValues(connectionString);
        return connectionStringValues[ConnectionStringKey_1.default.accountName];
    };
    /**
     * Gets a account key from the passed connection string
     */
    AttachedStorage.getAccountKeyFromConnectionString = function (connectionString) {
        var connectionStringValues = AttachedStorage.parseConnectionStringKeyValues(connectionString);
        return connectionStringValues[ConnectionStringKey_1.default.accountKey];
    };
    /**
     * Process errors.
     * @param error
     */
    AttachedStorage.processError = function (error) {
        if (error.message === Errors.errorNames.DestinationExistsError) {
            error = new Errors.DestinationExistsError("A blob with the given name already exists.", error); // Localize
        }
        else if (error.message === Errors.errorNames.PageBlobInvalidSize) {
            error = new Errors.DisplayableError("Page blobs must have a size that is a multiple of 512 bytes", error); // Localize
        }
        return error;
    };
    /**
     * Removes the container name from a container's URI to create an account-only URI.
     * Examples:
     * http://127.0.0.1:10001/devstoreaccount1/blobcontainername -> http://127.0.0.1:10001/devstoreaccount1
     * https://mlstg2.blob.core.windows.net/blobcontainername -> https://mlstg2.blob.core.windows.net
     */
    AttachedStorage.accountUriFromContainerUri = function (containerUri, resourceName) {
        var accountUri = containerUri;
        var resourceNameAndSlash = "/" + resourceName;
        if (_string.endsWith(accountUri, resourceNameAndSlash)) {
            accountUri = accountUri.substr(0, accountUri.length - resourceNameAndSlash.length);
        }
        return accountUri;
    };
    /**
     * Load the stored SAS storage resources:
     * Get resourceName and hostUri from localStorage
     * Combine session key and resourceName as user account manager key to get sasToken stored there.
     */
    AttachedStorage.loadStorageServiceSASResources = function (host, sasResourceType) {
        var storedData = AttachedStorage._loadStoredData(sasResourceType.localStorageKey);
        var promises = [];
        if (storedData) {
            storedData.map(function (data) {
                return {
                    service: sasResourceType.localStorageKey,
                    account: data.resourceName
                };
            }).forEach(function (key) {
                promises.push(host.executeOperation("Environment.getConfidentialData", [key]));
            });
        }
        return Promise.all(promises).then(function (sasTokens) {
            var resources = sasTokens.map(function (sasToken, index) {
                var data = storedData[index];
                var sasResource = {
                    resourceName: data.resourceName,
                    accountUri: data.accountUri,
                    sasToken: sasToken
                };
                if (!sasResource.accountUri) {
                    // Determine accountUri from previous version of storage by removing the resource name from the
                    // stored hostUri.
                    var hostUri = data.hostUri;
                    sasResource.accountUri = AttachedStorage.accountUriFromContainerUri(hostUri, sasResource.resourceName);
                }
                return sasResource;
            });
            return resources;
        });
    };
    /**
     * Save the service SAS token.
     * Store sasToken using msint-identity module.
     */
    AttachedStorage.saveStorageSASToken = function (host, sasResourceType, resourceName, accountUri, sasToken) {
        if (!AttachedStorage._isStorageSupported()) {
            return;
        }
        if (!AttachedStorage.sasResourceWithNameExists(sasResourceType, resourceName)) {
            var newData = {
                resourceName: resourceName,
                accountUri: accountUri
            };
            // Save the resource name to localStoragesave
            var storedData = AttachedStorage._loadStoredData(sasResourceType.localStorageKey).concat(newData);
            localStorage.setItem(sasResourceType.localStorageKey, JSON.stringify(storedData));
            // Save the sas token to user account manager
            return host.executeOperation("Environment.saveConfidentialData", [{ service: sasResourceType.localStorageKey, account: resourceName }, sasToken]);
        }
    };
    AttachedStorage.deleteStorageSASToken = function (host, sasResourceType, resourceName) {
        if (!AttachedStorage._isStorageSupported()) {
            return null;
        }
        var storedData = AttachedStorage._loadStoredData(sasResourceType.localStorageKey);
        if (!storedData) {
            return null;
        }
        var targetResource;
        var filteredAccounts = storedData.filter(function (data) {
            if (data.resourceName === resourceName) {
                targetResource = data;
                // Don't include this resource (since we want to remove it)
                return false;
            }
            // keep the resource.
            return true;
        });
        // delete the resource from localStorage
        localStorage.setItem(sasResourceType.localStorageKey, JSON.stringify(filteredAccounts));
        // delete the sas token from user account manager
        host.executeOperation("Environment.deleteConfidentialData", [{ service: sasResourceType.localStorageKey, account: targetResource.resourceName }]);
    };
    // TODO: Move these and related functions to another file
    /**
     * Returns true if the resourceName and hostUri has already been stored in storage; false otherwise.
     */
    AttachedStorage.sasResourceWithNameExists = function (sasResourceType, resourceName) {
        if (!AttachedStorage._isStorageSupported()) {
            return false;
        }
        var storedData = AttachedStorage._loadStoredData(sasResourceType.localStorageKey);
        var resourceSavedBefore = storedData &&
            storedData.some(function (data) {
                return data.resourceName === resourceName;
            });
        return resourceSavedBefore;
    };
    AttachedStorage.accountNameExists = function (accountName) {
        var storedAccounts = AttachedStorage._loadStoredAccountData(AttachedStorage.sessionKeyOfStorageAccounts);
        return storedAccounts.some(function (data) { return data.accountName === accountName; });
    };
    /**
     * Generates Cloud Explorer attributes needed for an external storage account node.
     *
     * Here, an  "external" storage accounts refers only to an account attached via:
     * - An account name and key.
     * - A SAS connection string.
     *
     * This private static _should not be used for other external account nodes.
     */
    AttachedStorage.getExternalAccountAttributes = function (account) {
        // We differentiate between an account added from its connection string and one added from its keys.
        // If the account is added using its keys we assume the service endpoints are available.
        // Otherwise we rely on the information provided by the connection string.
        var isConnectionStringBased = !!account.connectionString;
        var connectionType = account.connectionType || 3 /* key */;
        var connectionString = isConnectionStringBased ?
            account.connectionString :
            ConnectionString_1.default.createFromStorageAccount(account);
        var parsedConnectionString = new ConnectionString_1.default(connectionString);
        var hasBlobEndpoint = !!parsedConnectionString.hasConnectionStringKey(ConnectionStringKey_1.default.blobEndpoint);
        var hasFileEndpoint = !!parsedConnectionString.hasConnectionStringKey(ConnectionStringKey_1.default.fileEndpoint);
        var hasQueueEndpoint = !!parsedConnectionString.hasConnectionStringKey(ConnectionStringKey_1.default.queueEndpoint);
        var hasTableEndpoint = !!parsedConnectionString.hasConnectionStringKey(ConnectionStringKey_1.default.tableEndpoint);
        // creating a new attribute which will be used for the node uid
        var nodeUid = account.accountName + "-" + account.endpointsDomain;
        // this will append SAS and External to the uid's of accounts under (Local and Attached), that way they
        // don't conflict with each other (since you can have the same account attached twice via both attaching both ways)
        if (AttachedStorage.isSasAttachedAccount(account)) {
            nodeUid += "-SAS";
        }
        else {
            nodeUid += "-External";
        }
        return [
            // isAttachedAccount indicates that the node itself is an attached account node. This property is
            // not propagated to children.
            { name: "isAttachedAccount", value: true },
            { name: "nodeUid", value: nodeUid },
            { name: "name", value: account.accountName },
            { name: "primaryKey", value: account.accountKey },
            { name: "connectionString", value: connectionString },
            { name: "status", value: AttachedStorage.getExternalStorageAccountStatus(account) },
            { name: "permissions", value: AttachedStorage.getExternalStorageAccountPermissions(account) },
            { name: "endpointsDomain", value: account.endpointsDomain },
            { name: "connectionType", value: connectionType },
            { name: "supportsBlobs", value: !isConnectionStringBased || hasBlobEndpoint },
            { name: "supportsFiles", value: !isConnectionStringBased || hasFileEndpoint },
            { name: "supportsQueues", value: !isConnectionStringBased || hasQueueEndpoint },
            { name: "supportsTables", value: !isConnectionStringBased || hasTableEndpoint }
        ];
    };
    return AttachedStorage;
}());
/**
 * Storage key for storage accounts.
 */
AttachedStorage.sessionKeyOfStorageAccounts = "StorageExplorer_AddExternalStorageAccount_SessionKey_v1";
/**
 * Storage key for storage accounts' custom api versions.
 */
AttachedStorage.sessionKeyOfStorageAccountsCustomApiVersion = "StorageExplorer_AddExternalStorageAccount_CustomApiVersionKey_v1";
exports.default = AttachedStorage;

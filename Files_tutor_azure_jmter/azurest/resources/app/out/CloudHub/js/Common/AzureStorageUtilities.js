define(["require", "exports", "Providers/Common/AzureStorageConstants", "Common/SASToken", "Common/ConnectionString", "Common/Errors", "underscore.string", "Common/Debug"], function (require, exports, AzureStorageConstants, SASToken_1, ConnectionString_1, Errors, _string, Debug) {
    "use strict";
    // TODO: This belongs somewhere else, like StorageExplorerUtilities
    exports.FlobTypes = {
        // These words are not enums because these values are used in telemetry strings (not localized)
        Blob: "Blob",
        File: "File"
    };
    /**
     * A helper method for generating raw data for a storage account.
     * @param resourceType
     * @param displayName
     * @param extraAttributes
     */
    function wrapStorageAccountRawData(resourceType, displayName, extraAttributes) {
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
    }
    exports.wrapStorageAccountRawData = wrapStorageAccountRawData;
    /**
     * A cross browser detection if storage is supported.
     */
    function isStorageSupported() {
        return (typeof (Storage) !== "undefined");
    }
    /**
     * Storage key for storage accounts.
     */
    exports.sessionKeyOfStorageAccounts = "StorageExplorer_AddExternalStorageAccount_SessionKey_v1";
    /**
     * Storage key for storage accounts' custom api versions.
     */
    exports.sessionKeyOfStorageAccountsCustomApiVersion = "StorageExplorer_AddExternalStorageAccount_CustomApiVersionKey_v1";
    /**
     * Determine whether two storage accounts are the same.
     * Two storage accounts are the same only when they have same account name in the same domain.
     * @param a
     * @param b
     */
    function isSameAccountData(a, b) {
        var accountNameA = a.accountName || "";
        var endPointsDomainA = a.endpointsDomain || "";
        var connectionTypeA = a.connectionType || 3 /* key */;
        var accountNameB = b.accountName || "";
        var endPointsDomainB = b.endpointsDomain || "";
        var connectionTypeB = b.connectionType || 3 /* key */;
        return accountNameA.toLowerCase() === accountNameB.toLowerCase() &&
            endPointsDomainA.toLowerCase() === endPointsDomainB.toLowerCase() &&
            connectionTypeA === connectionTypeB;
    }
    /**
     * Check if a storage account has already been saved before.
     */
    function wasAccountStored(account) {
        if (!isStorageSupported()) {
            return false;
        }
        var storedData = loadStoredAccountData(exports.sessionKeyOfStorageAccounts);
        var accountSavedBefore = storedData &&
            storedData.some(function (data) {
                return isSameAccountData(data, account);
            });
        return accountSavedBefore;
    }
    exports.wasAccountStored = wasAccountStored;
    /**
     * Load storage accounts from localStorage
     * @param key
     */
    function loadStoredAccountData(key) {
        var storedAccountData = loadStoredData(key);
        storedAccountData.forEach(function (account) {
            if (!account.endpointsDomain) {
                account.endpointsDomain = AzureStorageConstants.endpointsDomain.default;
            }
        });
        return storedAccountData;
    }
    /**
     * Load storage data from localStorage
     * @param key
     */
    function loadStoredData(key) {
        var storedData = [];
        var jsonStoredKeys = null;
        if (isStorageSupported()) {
            jsonStoredKeys = localStorage.getItem(key);
            try {
                storedData = JSON.parse(jsonStoredKeys);
            }
            catch (err) {
                Debug.error("AzureStorageUtilities. Error parsing storage account data.", err);
                storedData = [];
            }
        }
        return storedData || [];
    }
    /**
     * Save the attached external storage account:
     * Cache account data using HTML5 localStorage
     * Store account key using msint-identity module
     * @param environmentActions
     * @param account
     */
    function saveStorageAccount(host, account, customApiVersion) {
        if (!isStorageSupported()) {
            return Promise.resolve();
        }
        if (wasAccountStored(account)) {
            return Promise.resolve();
        }
        var newAccountData = {
            accountName: account.accountName,
            endpointsDomain: account.endpointsDomain,
            connectionType: account.connectionType,
            useHttp: account.useHttp
        };
        // Save account part to localStorage
        var storedAccountData = loadStoredAccountData(exports.sessionKeyOfStorageAccounts).concat(newAccountData);
        localStorage.setItem(exports.sessionKeyOfStorageAccounts, JSON.stringify(storedAccountData));
        var confidentialDataKey = constructConfidentialDataKey(exports.sessionKeyOfStorageAccounts, newAccountData);
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
    }
    exports.saveStorageAccount = saveStorageAccount;
    /**
     * Load the stored storage accounts:
     * Get account data from localStorage
     * Combine session key and account data as user account manager key to get account key stored there.
     * @param host
     * @param key
     */
    function loadStorageAccounts(host, key) {
        if (key === void 0) { key = exports.sessionKeyOfStorageAccounts; }
        var storedData = loadStoredAccountData(key);
        var promises = [];
        if (storedData) {
            storedData.map(function (data) {
                return constructConfidentialDataKey(exports.sessionKeyOfStorageAccounts, data);
            }).forEach(function (key, index) {
                var confidentialDataPromise = host.executeOperation("Environment.getConfidentialData", [key])
                    .then(function (confidentialData) {
                    if (confidentialData) {
                        // Use the data we have to resolve the promise
                        return Promise.resolve(confidentialData);
                    }
                    else if (storedData[index].endpointsDomain === AzureStorageConstants.endpointsDomain.default) {
                        // Failed to get confidentialData before, if the endpoint is the default one,
                        // try with key that doesn't have endpointsDomain
                        var newKey = { service: exports.sessionKeyOfStorageAccounts, account: storedData[index].accountName };
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
    }
    exports.loadStorageAccounts = loadStorageAccounts;
    /**
     * Delete the specific storage account:
     * Clear the cached account data from localStorage if it exists there.
     * Delete the stored account key in user account manager.
     * @param environmentActions
     * @param accountToDelete
     */
    function deleteStoredAccount(host, accountToDelete) {
        if (!isStorageSupported()) {
            return;
        }
        var storedAccounts = loadStoredAccountData(exports.sessionKeyOfStorageAccounts);
        if (!storedAccounts) {
            return;
        }
        var targetAccount = null;
        var filteredAccounts = storedAccounts.filter(function (data) {
            var toRemove = isSameAccountData(data, accountToDelete);
            if (toRemove) {
                targetAccount = data;
            }
            return !toRemove;
        });
        if (targetAccount) {
            // delete the account name from localStorage
            localStorage.setItem(exports.sessionKeyOfStorageAccounts, JSON.stringify(filteredAccounts));
            // Delete the account key from user account manager
            var confidentialDataKey = constructConfidentialDataKey(exports.sessionKeyOfStorageAccounts, targetAccount);
            if (confidentialDataKey) {
                host.executeOperation("Environment.deleteConfidentialData", [confidentialDataKey]).then(function (deleteSuccess) {
                    // Failed to delete with the targetAccount having the default endpoint.
                    // This could be because when the account was first saved, endpointsDomain was not part of the key.
                    if (!deleteSuccess && targetAccount.endpointsDomain === AzureStorageConstants.endpointsDomain.default) {
                        // try deleting with original key
                        host.executeOperation("Environment.deleteConfidentialData", [{ service: exports.sessionKeyOfStorageAccounts, account: targetAccount.accountName }]);
                    }
                });
            }
            if (targetAccount.connectionType === 3 /* key */) {
                // go ahead and attempt to delete any custom api versions we may have saved for the account
                host.executeOperation("Environment.deleteConfidentialData", [{ service: exports.sessionKeyOfStorageAccountsCustomApiVersion, account: targetAccount.accountName }]);
            }
        }
    }
    exports.deleteStoredAccount = deleteStoredAccount;
    /**
     * Construct a unique key for user account manager.
     * @param service
     * @param accountData
     */
    function constructConfidentialDataKey(service, accountData) {
        if (!accountData) {
            return null;
        }
        var accountStoreKey = accountData.accountName +
            ((accountData.endpointsDomain) ? accountData.endpointsDomain : AzureStorageConstants.endpointsDomain.default) +
            ((accountData.connectionType) ? accountData.connectionType : "");
        return { service: service, account: accountStoreKey };
    }
    /**
     * Construct status for an attached external storage account (this shows up in parentheses after the name)
     * @param accountData
     */
    function getExternalStorageAccountStatus(accountData) {
        var status;
        if (isSasAttachedAccount(accountData)) {
            status = "SAS";
        }
        else {
            // Localize
            status = "External";
            if (accountData.endpointsDomain === AzureStorageConstants.endpointsDomain.chinaAzure) {
                status += ", China";
            }
            else if (accountData.endpointsDomain !== AzureStorageConstants.endpointsDomain.default) {
                status += ", Other";
            }
        }
        return status;
    }
    exports.getExternalStorageAccountStatus = getExternalStorageAccountStatus;
    /**
     * Returns true if the storage account is attached via SAS
     */
    function isSasAttachedAccount(accountData) {
        return accountData.connectionType === 1 /* sasAttachedAccount */;
    }
    exports.isSasAttachedAccount = isSasAttachedAccount;
    /**
     * Returns true if the storage account is externally attached
     */
    function isExternallyAttachedAccount(accountData) {
        return accountData.connectionType !== 1 /* sasAttachedAccount */;
    }
    exports.isExternallyAttachedAccount = isExternallyAttachedAccount;
    /**
     * Constructs a string from an attached external storage account's permission set.
     */
    function getExternalStorageAccountPermissions(accountData) {
        if (accountData.connectionType === 1 /* sasAttachedAccount */) {
            var connectionString = new ConnectionString_1.default(accountData.connectionString);
            var sasToken = new SASToken_1.default(connectionString.getSAS());
            return sasToken.displayPermission || "(none)"; // Localize
        }
        return "Full"; // Localize
    }
    exports.getExternalStorageAccountPermissions = getExternalStorageAccountPermissions;
    /**
     * Helper function to determine if the connection string has the account name
     * and account key fields set.
     */
    function connectionStringContainsAccountNameKey(connectionString) {
        var connectionKvs = parseConnectionStringKeyValues(connectionString);
        return !!connectionKvs[AzureStorageConstants.connectionStringKeys.accountName] &&
            !!connectionKvs[AzureStorageConstants.connectionStringKeys.accountKey];
    }
    exports.connectionStringContainsAccountNameKey = connectionStringContainsAccountNameKey;
    /**
     * Helper function to determine if the connection string contains a SAS (shared access signature)
     */
    function connectionStringContainsSharedAccessSignature(connectionString) {
        var connectionKvs = parseConnectionStringKeyValues(connectionString);
        return !!connectionKvs[AzureStorageConstants.connectionStringKeys.sharedAccessSignature];
    }
    exports.connectionStringContainsSharedAccessSignature = connectionStringContainsSharedAccessSignature;
    /**
     * Helper function to determine if the connection string has the SAS signature
     * key field set.
     */
    function getSASSignature(connectionString) {
        var connectionKvs = parseConnectionStringKeyValues(connectionString);
        return connectionKvs[AzureStorageConstants.connectionStringKeys.sharedAccessSignature];
    }
    exports.getSASSignature = getSASSignature;
    /**
     * Parse the connection string to get key/value pairs
     * see https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
     * for possible key names.
     * @param connectionString
     */
    function parseConnectionStringKeyValues(connectionString) {
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
    }
    exports.parseConnectionStringKeyValues = parseConnectionStringKeyValues;
    /**
     * Gets a account name from the passed connection string
     */
    function getAccountNameFromConnectionString(connectionString) {
        var connectionStringValues = parseConnectionStringKeyValues(connectionString);
        return connectionStringValues[AzureStorageConstants.connectionStringKeys.accountName];
    }
    exports.getAccountNameFromConnectionString = getAccountNameFromConnectionString;
    /**
     * Gets a account key from the passed connection string
     */
    function getAccountKeyFromConnectionString(connectionString) {
        var connectionStringValues = parseConnectionStringKeyValues(connectionString);
        return connectionStringValues[AzureStorageConstants.connectionStringKeys.accountKey];
    }
    exports.getAccountKeyFromConnectionString = getAccountKeyFromConnectionString;
    /**
     * Extract the endpoint domain from an endpoint uri string.
     * @param endpoint
     * @param storageEndpointType
     */
    function extractEndpointsDomain(endpoint, storageEndpointType) {
        var domain = null;
        if (endpoint && storageEndpointType) {
            var lastIndex = endpoint.lastIndexOf(storageEndpointType);
            if (lastIndex !== -1) {
                domain = endpoint.substring(lastIndex + storageEndpointType.length);
            }
        }
        return domain;
    }
    /**
     * Parse the endpoints domain from a connection string.
     * If there is no specified domain, return the default domain.
     * @param connectionString
     */
    function parseConnectionStringEndpointsDomain(connectionString) {
        var keyValuePairs = parseConnectionStringKeyValues(connectionString);
        var endpointsDomain = null;
        if (keyValuePairs[AzureStorageConstants.connectionStringKeys.blobEndpoint]) {
            endpointsDomain = extractEndpointsDomain(keyValuePairs[AzureStorageConstants.connectionStringKeys.blobEndpoint], AzureStorageConstants.storageEndpointTypes.blob);
        }
        else if (keyValuePairs[AzureStorageConstants.connectionStringKeys.tableEndpoint]) {
            endpointsDomain = extractEndpointsDomain(keyValuePairs[AzureStorageConstants.connectionStringKeys.tableEndpoint], AzureStorageConstants.storageEndpointTypes.table);
        }
        else if (keyValuePairs[AzureStorageConstants.connectionStringKeys.queueEndpoint]) {
            endpointsDomain = extractEndpointsDomain(keyValuePairs[AzureStorageConstants.connectionStringKeys.queueEndpoint], AzureStorageConstants.storageEndpointTypes.queue);
        }
        return endpointsDomain || AzureStorageConstants.endpointsDomain.default;
    }
    exports.parseConnectionStringEndpointsDomain = parseConnectionStringEndpointsDomain;
    /**
     * Process errors.
     * @param error
     */
    function processError(error) {
        if (error.message === Errors.errorNames.DestinationExistsError) {
            error = new Errors.DestinationExistsError("A blob with the given name already exists.", error); // Localize
        }
        else if (error.message === Errors.errorNames.PageBlobInvalidSize) {
            error = new Errors.DisplayableError("Page blobs must have a size that is a multiple of 512 bytes", error); // Localize
        }
        return error;
    }
    exports.processError = processError;
    /**
     * Removes the container name from a container's URI to create an account-only URI.
     * Examples:
     * http://127.0.0.1:10001/devstoreaccount1/blobcontainername -> http://127.0.0.1:10001/devstoreaccount1
     * https://mlstg2.blob.core.windows.net/blobcontainername -> https://mlstg2.blob.core.windows.net
     */
    function accountUriFromContainerUri(containerUri, resourceName) {
        var accountUri = containerUri;
        var resourceNameAndSlash = "/" + resourceName;
        if (_string.endsWith(accountUri, resourceNameAndSlash)) {
            accountUri = accountUri.substr(0, accountUri.length - resourceNameAndSlash.length);
        }
        return accountUri;
    }
    exports.accountUriFromContainerUri = accountUriFromContainerUri;
    /**
     * Load the stored SAS storage resources:
     * Get resourceName and hostUri from localStorage
     * Combine session key and resourceName as user account manager key to get sasToken stored there.
     */
    function loadStorageServiceSASResources(host, sasResourceType) {
        var storedData = loadStoredData(sasResourceType.localStorageKey);
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
                    sasResource.accountUri = accountUriFromContainerUri(hostUri, sasResource.resourceName);
                }
                return sasResource;
            });
            return resources;
        });
    }
    exports.loadStorageServiceSASResources = loadStorageServiceSASResources;
    /**
     * Save the service SAS token.
     * Store sasToken using msint-identity module.
     */
    function saveStorageSASToken(host, sasResourceType, resourceName, accountUri, sasToken) {
        if (!isStorageSupported()) {
            return;
        }
        if (!sasResourceWithNameExists(sasResourceType, resourceName)) {
            var newData = {
                resourceName: resourceName,
                accountUri: accountUri
            };
            // Save the resource name to localStoragesave
            var storedData = loadStoredData(sasResourceType.localStorageKey).concat(newData);
            localStorage.setItem(sasResourceType.localStorageKey, JSON.stringify(storedData));
            // Save the sas token to user account manager
            return host.executeOperation("Environment.saveConfidentialData", [{ service: sasResourceType.localStorageKey, account: resourceName }, sasToken]);
        }
    }
    exports.saveStorageSASToken = saveStorageSASToken;
    function deleteStorageSASToken(host, sasResourceType, resourceName) {
        if (!isStorageSupported()) {
            return null;
        }
        var storedData = loadStoredData(sasResourceType.localStorageKey);
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
    }
    exports.deleteStorageSASToken = deleteStorageSASToken;
    // TODO: Move these and related functions to another file
    /**
     * Returns true if the resourceName and hostUri has already been stored in storage; false otherwise.
     */
    function sasResourceWithNameExists(sasResourceType, resourceName) {
        if (!isStorageSupported()) {
            return false;
        }
        var storedData = loadStoredData(sasResourceType.localStorageKey);
        var resourceSavedBefore = storedData &&
            storedData.some(function (data) {
                return data.resourceName === resourceName;
            });
        return resourceSavedBefore;
    }
    exports.sasResourceWithNameExists = sasResourceWithNameExists;
    function accountNameExists(accountName) {
        var storedAccounts = loadStoredAccountData(exports.sessionKeyOfStorageAccounts);
        return storedAccounts.some(function (data) { return data.accountName === accountName; });
    }
    exports.accountNameExists = accountNameExists;
    /**
     * Generates Cloud Explorer attributes needed for an external storage account node.
     *
     * Here, an  "external" storage accounts refers only to an account attached via:
     * - An account name and key.
     * - A SAS connection string.
     *
     * This function should not be used for other external account nodes.
     */
    function getExternalAccountAttributes(account) {
        // We differentiate between an account added from its connection string and one added from its keys.
        // If the account is added using its keys we assume the service endpoints are available.
        // Otherwise we rely on the information provided by the connection string.
        var isConnectionStringBased = !!account.connectionString;
        var connectionType = account.connectionType || 3 /* key */;
        var connectionString = isConnectionStringBased ?
            account.connectionString :
            ConnectionString_1.default.createFromStorageAccount(account);
        var parsedConnectionString = new ConnectionString_1.default(connectionString);
        var hasBlobEndpoint = !!parsedConnectionString.values[AzureStorageConstants.connectionStringKeys.blobEndpoint];
        var hasFileEndpoint = !!parsedConnectionString.values[AzureStorageConstants.connectionStringKeys.fileEndpoint];
        var hasQueueEndpoint = !!parsedConnectionString.values[AzureStorageConstants.connectionStringKeys.queueEndpoint];
        var hasTableEndpoint = !!parsedConnectionString.values[AzureStorageConstants.connectionStringKeys.tableEndpoint];
        // creating a new attribute which will be used for the node uid
        var nodeUid = account.accountName + "-" + account.endpointsDomain;
        // this will append SAS and External to the uid's of accounts under (Local and Attached), that way they
        // don't conflict with each other (since you can have the same account attached twice via both attaching both ways)
        if (isSasAttachedAccount(account)) {
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
            { name: "status", value: getExternalStorageAccountStatus(account) },
            { name: "permissions", value: getExternalStorageAccountPermissions(account) },
            { name: "endpointsDomain", value: account.endpointsDomain },
            { name: "connectionType", value: connectionType },
            { name: "supportsBlobs", value: !isConnectionStringBased || hasBlobEndpoint },
            { name: "supportsFiles", value: !isConnectionStringBased || hasFileEndpoint },
            { name: "supportsQueues", value: !isConnectionStringBased || hasQueueEndpoint },
            { name: "supportsTables", value: !isConnectionStringBased || hasTableEndpoint }
        ];
    }
    exports.getExternalAccountAttributes = getExternalAccountAttributes;
});

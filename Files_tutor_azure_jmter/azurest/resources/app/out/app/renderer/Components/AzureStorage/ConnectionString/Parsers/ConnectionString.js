"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionStringKey_1 = require("./ConnectionStringKey");
var EndpointDomains_1 = require("../../EndpointDomains");
var SasResourceEndpoints_1 = require("../../SasResourceEndpoints");
var SasToken_1 = require("../../Sas/Parsers/SasToken");
var SasUri_1 = require("../../Sas/Parsers/SasUri");
var StorageEndpointTypes_1 = require("../../StorageEndpointTypes");
var _string = require("underscore.string");
var url = require("url");
var ConnectionString = (function () {
    function ConnectionString(cString) {
        this.inputString = cString;
        this._values = this._parseConnectionStringKeyValues(cString);
    }
    Object.defineProperty(ConnectionString.prototype, "useDevelopmentStorage", {
        get: function () { return this._values[ConnectionStringKey_1.default.useDevelopmentStorage]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "defaultEndpointsProtocol", {
        get: function () { return this._values[ConnectionStringKey_1.default.defaultEndpointsProtocol]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "endpointSuffix", {
        get: function () { return this._values[ConnectionStringKey_1.default.endpointSuffix]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "blobEndpoint", {
        get: function () { return this._values[ConnectionStringKey_1.default.blobEndpoint]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "fileEndpoint", {
        get: function () { return this._values[ConnectionStringKey_1.default.fileEndpoint]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "queueEndpoint", {
        get: function () { return this._values[ConnectionStringKey_1.default.queueEndpoint]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "tableEndpoint", {
        get: function () { return this._values[ConnectionStringKey_1.default.tableEndpoint]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "accountName", {
        get: function () { return this._values[ConnectionStringKey_1.default.accountName]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "accountKey", {
        get: function () { return this._values[ConnectionStringKey_1.default.accountKey]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "sharedAccessSignature", {
        get: function () { return this._values[ConnectionStringKey_1.default.sharedAccessSignature]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionString.prototype, "token", {
        get: function () { return new SasToken_1.default(this._values[ConnectionStringKey_1.default.sharedAccessSignature]); },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a connection string from a SAS URI.
     *
     * If the URI's SAS token grants permission to multiple service endpoints,
     * and the URI uses one of Azure's default endpoint domains, the other
     * endpoints are automatically inferred from the URI.
     *
     * @example
     * Input:
     * ```txt
     * https://myaccount.blob.core.windows.net/blobcontainer?sr=c...
     * ```
     *
     * Output:
     * ```txt
     * SharedAccessSignature=?sr=c...;
     * BlobEndpoint=https://myaccount.blob.core.windows.net
     * ```
     *
     * @example
     * Input:
     * ```txt
     * https://myaccount.blob.core.windows.net/?ss=bfq...
     * ```
     *
     * Output:
     * ```txt
     * SharedAccessSignature=?ss=bfq...;
     * BlobEndpoint=https://myaccount.blob.core.windows.net;
     * FileEndpoint=https://myaccount.file.core.windows.net;
     * QueueEndpoint=https://myaccount.queue.core.windows.net
     * ```
     *
     * @example
     * Input:
     * ```txt
     * https://my.custom.service.endpoint/?ss=bfq...
     * ```
     *
     * Output:
     * ```txt
     * SharedAccessSignature=?ss=bfq...
     * ```
     */
    ConnectionString.createFromSASUri = function (sasUri) {
        var parsedURI = new SasUri_1.default(sasUri);
        var result = ConnectionStringKey_1.default.sharedAccessSignature + "=" + parsedURI.sasToken.inputString;
        if (parsedURI.sasToken.isAccountToken() && !!parsedURI.accountName) {
            // If we can get the account name from the URI, the URI uses default endpoints.
            // So we infer all endpoints from the URI.
            var blobEndpoint = parsedURI.sasToken.hasServiceAccess("b") ?
                SasUri_1.default.getInferredDefaultEndpoint(parsedURI, ConnectionString.sasResourceTypes.blob).accountUri :
                null;
            var fileEndpoint = parsedURI.sasToken.hasServiceAccess("f") ?
                SasUri_1.default.getInferredDefaultEndpoint(parsedURI, ConnectionString.sasResourceTypes.file).accountUri :
                null;
            var queueEndpoint = parsedURI.sasToken.hasServiceAccess("q") ?
                SasUri_1.default.getInferredDefaultEndpoint(parsedURI, ConnectionString.sasResourceTypes.queue).accountUri :
                null;
            var tableEndpoint = parsedURI.sasToken.hasServiceAccess("t") ?
                SasUri_1.default.getInferredDefaultEndpoint(parsedURI, ConnectionString.sasResourceTypes.table).accountUri :
                null;
            result += !!blobEndpoint ? ";" + ConnectionStringKey_1.default.blobEndpoint + "=" + blobEndpoint : "";
            result += !!fileEndpoint ? ";" + ConnectionStringKey_1.default.fileEndpoint + "=" + fileEndpoint : "";
            result += !!queueEndpoint ? ";" + ConnectionStringKey_1.default.queueEndpoint + "=" + queueEndpoint : "";
            result += !!tableEndpoint ? ";" + ConnectionStringKey_1.default.tableEndpoint + "=" + tableEndpoint : "";
        }
        else if (!!parsedURI.resourceType) {
            // Try to get the SAS resource type straight from the URI.
            // If successful, the URI is a service SAS URI.
            var sasResource = {
                resourceName: parsedURI.resourceName,
                accountUri: parsedURI.accountUri,
                sasToken: parsedURI.sasToken && parsedURI.sasToken.inputString
            };
            result = ConnectionString.createFromSAS(SasResourceEndpoints_1.default.fromString(parsedURI.resourceType), sasResource);
        }
        return result;
    };
    /**
     * Create a connection string using the correct endpoint key, host URI and the SAS token.
     */
    ConnectionString.createFromSAS = function (sasResourceType, resource) {
        console.assert(function () { return !_string.endsWith(resource.accountUri, "/" + resource.resourceName); }, "Account URI should not contain the resource name");
        var sas = ConnectionStringKey_1.default.sharedAccessSignature;
        var endpoint = sasResourceType ? sasResourceType.connectionStringEndpoint + "=" + resource.accountUri + ";" : "";
        return "" + endpoint + sas + "=" + resource.sasToken;
    };
    /**
     * Construct connection string based on a storage account.
     * @param account
     */
    ConnectionString.createFromStorageAccount = function (account) {
        var transportProtocol = account.useHttp ? ConnectionString.transportProtocol.http : ConnectionString.transportProtocol.https;
        var connectionAccount = {
            accountName: account.accountName,
            accountKey: account.accountKey,
            endpointsDomain: account.endpointsDomain,
            transportProtocol: transportProtocol
        };
        return account.endpointsDomain === EndpointDomains_1.default.default ?
            _string.sprintf(ConnectionString.connectionStringTemplate.defaultEndpoint, connectionAccount) :
            _string.sprintf(ConnectionString.connectionStringTemplate.customEndpoint, connectionAccount);
    };
    ConnectionString.createFromValues = function (keyValuePairs) {
        var connectionString = new ConnectionString("");
        connectionString._values = {};
        for (var key in keyValuePairs) {
            if (!!keyValuePairs[key]) {
                connectionString._values[key] = keyValuePairs[key];
            }
        }
        return connectionString.toString();
    };
    ConnectionString.prototype.getValues = function () {
        var values = {};
        for (var labelKey in this._values) {
            values[labelKey] = this._values[labelKey];
        }
        return values;
    };
    ConnectionString.prototype.hasConnectionStringKey = function (connectionStringKey) {
        return !!this._values[connectionStringKey];
    };
    /**
     * Gets an account name from the passed connection string, if any.
     */
    ConnectionString.prototype.getAccountName = function () {
        var accountName = this.accountName;
        if (!accountName) {
            var blobEndpoint = this._values[ConnectionStringKey_1.default.blobEndpoint];
            var fileEndpoint = this._values[ConnectionStringKey_1.default.fileEndpoint];
            var queueEndpoint = this._values[ConnectionStringKey_1.default.queueEndpoint];
            var tableEndpoint = this._values[ConnectionStringKey_1.default.tableEndpoint];
            if (blobEndpoint) {
                accountName = this._extractAccountNameFromEndpoint(blobEndpoint, StorageEndpointTypes_1.default.blob);
            }
            else if (fileEndpoint) {
                accountName = this._extractAccountNameFromEndpoint(fileEndpoint, StorageEndpointTypes_1.default.file);
            }
            else if (queueEndpoint) {
                accountName = this._extractAccountNameFromEndpoint(queueEndpoint, StorageEndpointTypes_1.default.queue);
            }
            else if (tableEndpoint) {
                accountName = this._extractAccountNameFromEndpoint(tableEndpoint, StorageEndpointTypes_1.default.table);
            }
        }
        return accountName;
    };
    /**
     * Gets a user-displayble string for the account name, including the cases where we don't know the account name (SAS/emulator).
     */
    ConnectionString.prototype.getFriendlyAccountName = function () {
        var accountName = this.getAccountName();
        if (accountName) {
            return accountName;
        }
        else if (this.containsServiceSAS()) {
            return "(Service SAS)"; // Localize
        }
        else if (this.isEmulator()) {
            return "(Development)"; // Localize
        }
        else {
            console.assert("Unexpected case");
            return "(Unknown)"; // Localize
        }
    };
    /**
     * Gets the endpoints domain of this connection string.
     * If there is no specified domain, return the default domain.
     */
    ConnectionString.prototype.getEndpointsDomain = function () {
        var endpointsDomain = null;
        if (this.blobEndpoint) {
            endpointsDomain = this._extractEndpointsDomain(this.blobEndpoint, StorageEndpointTypes_1.default.blob);
        }
        else if (this._values.fileEndpoint) {
            endpointsDomain = this._extractEndpointsDomain(this.fileEndpoint, StorageEndpointTypes_1.default.file);
        }
        else if (this._values.tableEndpoint) {
            endpointsDomain = this._extractEndpointsDomain(this.tableEndpoint, StorageEndpointTypes_1.default.table);
        }
        else if (this._values.queueEndpoint) {
            endpointsDomain = this._extractEndpointsDomain(this.queueEndpoint, StorageEndpointTypes_1.default.queue);
        }
        return endpointsDomain || EndpointDomains_1.default.default;
    };
    /**
     * Gets the protocol used for default endpoints if specified.
     */
    ConnectionString.prototype.getDefaultEndpointsProtocol = function () {
        return this._values[ConnectionStringKey_1.default.defaultEndpointsProtocol];
    };
    /**
     * Extracts SAS signature from the connection string, if any.
     */
    ConnectionString.prototype.getSAS = function () {
        return this._values[ConnectionStringKey_1.default.sharedAccessSignature];
    };
    /**
     * Determines if the connection string has a SAS.
     */
    ConnectionString.prototype.containsSAS = function () {
        return !!this.getSAS();
    };
    /**
     * Determines if the connection string has an account SAS.
     */
    ConnectionString.prototype.containsAccountSAS = function () {
        var sas = this.getSAS();
        // Look for the SignedServices parameter in the SAS token (at beginning of the token or immediately
        //   after an ampersand)
        return !!sas && !!sas.match(/^(ss=)|.*&ss=/);
    };
    /**
     * Determines if the connection string has a service-level SAS.
     */
    ConnectionString.prototype.containsServiceSAS = function () {
        return this.containsSAS() && !this.containsAccountSAS();
    };
    ConnectionString.prototype.isEmulator = function () {
        var useDevelopmentStorage = this._values[ConnectionStringKey_1.default.useDevelopmentStorage];
        return String(useDevelopmentStorage).toLowerCase() === "true";
    };
    /**
     * Determines if the connection string has an account name and key.
     *
     * If includeEmulator, will return true also for the local development storage
     * account, which technically contains a name and key when resolved, and thus would
     * allow working with any operations, such as blob copy, which require account name/key.
     */
    ConnectionString.prototype.containsKeyAndName = function (includeEmulator) {
        if (includeEmulator) {
            if (this.isEmulator()) {
                return true;
            }
        }
        return !!this._values[ConnectionStringKey_1.default.accountName] &&
            !!this._values[ConnectionStringKey_1.default.accountKey];
    };
    /**
     * Returns a value indicating whether the connection string specifies any
     * service endpoints.
     */
    ConnectionString.prototype.hasEndpoint = function () {
        return !!this._values[ConnectionStringKey_1.default.blobEndpoint] ||
            !!this._values[ConnectionStringKey_1.default.fileEndpoint] ||
            !!this._values[ConnectionStringKey_1.default.queueEndpoint] ||
            !!this._values[ConnectionStringKey_1.default.tableEndpoint];
    };
    ConnectionString.prototype.toString = function () {
        var result = "";
        for (var key in this._values) {
            if (!!this._values[key]) {
                result += key + "=" + this._values[key] + ";";
            }
            else {
                console.warn("Unexpected undefined key value pair in connection string. Key: " + key + ", Value: " + this._values[key]);
            }
        }
        return result;
    };
    ConnectionString.prototype._extractAccountNameFromEndpoint = function (endpoint, type) {
        var defaultSuffix = type + EndpointDomains_1.default.default;
        var chinaSuffix = type + EndpointDomains_1.default.chinaAzure;
        var host = url.parse(endpoint).hostname;
        if (_string.endsWith(host, EndpointDomains_1.default.default)) {
            return host.substring(0, host.indexOf(defaultSuffix));
        }
        else if (_string.endsWith(host, EndpointDomains_1.default.chinaAzure)) {
            return host.substring(0, host.indexOf(chinaSuffix));
        }
        return null;
    };
    /**
     * Extract the endpoint domain from an endpoint uri string.
     * @param endpoint
     * @param storageEndpointType
     */
    ConnectionString.prototype._extractEndpointsDomain = function (endpoint, storageEndpointType) {
        var domain = null;
        if (endpoint && storageEndpointType) {
            var lastIndex = endpoint.lastIndexOf(storageEndpointType);
            if (lastIndex !== -1) {
                domain = endpoint.substring(lastIndex + storageEndpointType.length);
            }
        }
        return domain;
    };
    /**
     * Parse the connection string to get key/value pairs
     * see https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
     * for possible key names.
     * @param connectionString
     */
    ConnectionString.prototype._parseConnectionStringKeyValues = function (connectionString) {
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
    return ConnectionString;
}());
ConnectionString.sasResourceTypes = {
    account: "account",
    blob: "blob",
    file: "file",
    table: "table",
    queue: "queue"
};
ConnectionString.connectionStringTemplate = {
    defaultEndpoint: "DefaultEndpointsProtocol=%(transportProtocol)s;AccountName=%(accountName)s;AccountKey=%(accountKey)s",
    customEndpoint: "BlobEndpoint=%(transportProtocol)s://%(accountName)s.blob.%(endpointsDomain)s;" +
        "FileEndpoint=%(transportProtocol)s://%(accountName)s.file.%(endpointsDomain)s;" +
        "QueueEndpoint=%(transportProtocol)s://%(accountName)s.queue.%(endpointsDomain)s;" +
        "TableEndpoint=%(transportProtocol)s://%(accountName)s.table.%(endpointsDomain)s;" +
        "AccountName=%(accountName)s;AccountKey=%(accountKey)s;DefaultEndpointsProtocol=%(transportProtocol)s"
};
ConnectionString.transportProtocol = {
    http: "http",
    https: "https"
};
exports.default = ConnectionString;

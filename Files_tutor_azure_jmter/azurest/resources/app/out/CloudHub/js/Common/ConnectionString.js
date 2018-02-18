/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore.string", "URIjs/URI", "Providers/Common/AzureStorageConstants", "Common/Debug", "Common/SASUri", "Common/SASResourceType"], function (require, exports, _string, URI, AzureStorageConstants, Debug, SASUri_1, SASResourceType_1) {
    "use strict";
    var ConnectionString = (function () {
        function ConnectionString(cString) {
            this.values = this._parseConnectionStringKeyValues(cString);
        }
        /**
         * Creates a connection string from a SAS URI.
         *
         * If the URI's SAS token grants permission to multiple service endpoints,
         * and the URI uses one of Azure's default endpoint domains, the other
         * endpoints are automatically inferred from the URI.
         *
         * @example
         * Input:
         * `https://myaccount.blob.core.windows.net/blobcontainer?sr=c...`
         *
         * Output:
         * `SharedAccessSignature=?sr=c...;
         * BlobEndpoint=https://myaccount.blob.core.windows.net`
         *
         * @example
         * Input:
         * `https://myaccount.blob.core.windows.net/?ss=bfq...`
         *
         * Output:
         * `SharedAccessSignature=?ss=bfq...;
         * BlobEndpoint=https://myaccount.blob.core.windows.net;
         * FileEndpoint=https://myaccount.file.core.windows.net;
         * QueueEndpoint=https://myaccount.queue.core.windows.net`
         *
         * @example
         * Input:
         * `https://my.custom.service.endpoint/?ss=bfq...`
         *
         * Output:
         * `SharedAccessSignature=?ss=bfq...`
         */
        ConnectionString.createFromSASUri = function (sasUri) {
            var parsedURI = new SASUri_1.default(sasUri);
            var result = AzureStorageConstants.connectionStringKeys.sharedAccessSignature + "=" + parsedURI.sasToken.token;
            if (parsedURI.sasToken.isAccountResource() && !!parsedURI.accountName) {
                // If we can get the account name from the URI, the URI uses default endpoints.
                // So we infer all endpoints from the URI.
                var blobEndpoint = _string.contains(parsedURI.sasToken.signedServices, "b") ?
                    SASUri_1.default.getInferredDefaultEndpoint(parsedURI, AzureStorageConstants.sasResourceTypes.blob).accountUri :
                    null;
                var fileEndpoint = _string.contains(parsedURI.sasToken.signedServices, "f") ?
                    SASUri_1.default.getInferredDefaultEndpoint(parsedURI, AzureStorageConstants.sasResourceTypes.file).accountUri :
                    null;
                var queueEndpoint = _string.contains(parsedURI.sasToken.signedServices, "q") ?
                    SASUri_1.default.getInferredDefaultEndpoint(parsedURI, AzureStorageConstants.sasResourceTypes.queue).accountUri :
                    null;
                var tableEndpoint = _string.contains(parsedURI.sasToken.signedServices, "t") ?
                    SASUri_1.default.getInferredDefaultEndpoint(parsedURI, AzureStorageConstants.sasResourceTypes.table).accountUri :
                    null;
                result += !!blobEndpoint ? ";" + AzureStorageConstants.connectionStringKeys.blobEndpoint + "=" + blobEndpoint : "";
                result += !!fileEndpoint ? ";" + AzureStorageConstants.connectionStringKeys.fileEndpoint + "=" + fileEndpoint : "";
                result += !!queueEndpoint ? ";" + AzureStorageConstants.connectionStringKeys.queueEndpoint + "=" + queueEndpoint : "";
                result += !!tableEndpoint ? ";" + AzureStorageConstants.connectionStringKeys.tableEndpoint + "=" + tableEndpoint : "";
            }
            else if (!!parsedURI.resourceType) {
                // Try to get the SAS resource type straight from the URI.
                // If successful, the URI is a service SAS URI.
                var sasResource = {
                    resourceName: parsedURI.resourceName,
                    accountUri: parsedURI.accountUri,
                    sasToken: parsedURI.sasToken && parsedURI.sasToken.token
                };
                result = ConnectionString.createFromSAS(SASResourceType_1.default.fromString(parsedURI.resourceType), sasResource);
            }
            return result;
        };
        /**
         * Create a connection string using the correct endpoint key, host URI and the SAS token.
         */
        ConnectionString.createFromSAS = function (sasResourceType, resource) {
            Debug.assert(function () { return !_string.endsWith(resource.accountUri, "/" + resource.resourceName); }, "Account URI should not contain the resource name");
            var sas = AzureStorageConstants.connectionStringKeys.sharedAccessSignature;
            var endpoint = sasResourceType ? sasResourceType.connectionStringEndpoint + "=" + resource.accountUri + ";" : "";
            return "" + endpoint + sas + "=" + resource.sasToken;
        };
        /**
         * Construct connection string based on a storage account.
         * @param account
         */
        ConnectionString.createFromStorageAccount = function (account) {
            var transportProtocol = account.useHttp ? AzureStorageConstants.transportProtocol.http : AzureStorageConstants.transportProtocol.https;
            var connectionAccount = {
                accountName: account.accountName,
                accountKey: account.accountKey,
                endpointsDomain: account.endpointsDomain,
                transportProtocol: transportProtocol
            };
            return account.endpointsDomain === AzureStorageConstants.endpointsDomain.default ?
                _string.sprintf(AzureStorageConstants.connectionStringTemplate.defaultEndpoint, connectionAccount) :
                _string.sprintf(AzureStorageConstants.connectionStringTemplate.customEndpoint, connectionAccount);
        };
        /**
         * Gets an account name from the passed connection string, if any.
         */
        ConnectionString.prototype.getAccountName = function () {
            var accountName = this.values[AzureStorageConstants.connectionStringKeys.accountName];
            if (!accountName) {
                var blobEndpoint = this.values[AzureStorageConstants.connectionStringKeys.blobEndpoint];
                var fileEndpoint = this.values[AzureStorageConstants.connectionStringKeys.fileEndpoint];
                var queueEndpoint = this.values[AzureStorageConstants.connectionStringKeys.queueEndpoint];
                var tableEndpoint = this.values[AzureStorageConstants.connectionStringKeys.tableEndpoint];
                if (blobEndpoint) {
                    accountName = this._extractAccountNameFromEndpoint(blobEndpoint, AzureStorageConstants.storageEndpointTypes.blob);
                }
                else if (fileEndpoint) {
                    accountName = this._extractAccountNameFromEndpoint(fileEndpoint, AzureStorageConstants.storageEndpointTypes.file);
                }
                else if (queueEndpoint) {
                    accountName = this._extractAccountNameFromEndpoint(queueEndpoint, AzureStorageConstants.storageEndpointTypes.queue);
                }
                else if (tableEndpoint) {
                    accountName = this._extractAccountNameFromEndpoint(tableEndpoint, AzureStorageConstants.storageEndpointTypes.table);
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
                Debug.fail("Unexpected case");
                return "(Unknown)"; // Localize
            }
        };
        /**
         * Gets the endpoints domain of this connection string.
         * If there is no specified domain, return the default domain.
         */
        ConnectionString.prototype.getEndpointsDomain = function () {
            var endpointsDomain = null;
            if (this.values[AzureStorageConstants.connectionStringKeys.blobEndpoint]) {
                endpointsDomain = this._extractEndpointsDomain(this.values[AzureStorageConstants.connectionStringKeys.blobEndpoint], AzureStorageConstants.storageEndpointTypes.blob);
            }
            else if (this.values[AzureStorageConstants.connectionStringKeys.tableEndpoint]) {
                endpointsDomain = this._extractEndpointsDomain(this.values[AzureStorageConstants.connectionStringKeys.tableEndpoint], AzureStorageConstants.storageEndpointTypes.table);
            }
            else if (this.values[AzureStorageConstants.connectionStringKeys.queueEndpoint]) {
                endpointsDomain = this._extractEndpointsDomain(this.values[AzureStorageConstants.connectionStringKeys.queueEndpoint], AzureStorageConstants.storageEndpointTypes.queue);
            }
            return endpointsDomain || AzureStorageConstants.endpointsDomain.default;
        };
        /**
         * Gets the protocol used for default endpoints if specified.
         */
        ConnectionString.prototype.getDefaultEndpointsProtocol = function () {
            return this.values[AzureStorageConstants.connectionStringKeys.defaultEndpointsProtocol];
        };
        /**
         * Extracts SAS signature from the connection string, if any.
         */
        ConnectionString.prototype.getSAS = function () {
            return this.values[AzureStorageConstants.connectionStringKeys.sharedAccessSignature];
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
            var useDevelopmentStorage = this.values[AzureStorageConstants.connectionStringKeys.useDevelopmentStorage];
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
            return !!this.values[AzureStorageConstants.connectionStringKeys.accountName] &&
                !!this.values[AzureStorageConstants.connectionStringKeys.accountKey];
        };
        /**
         * Returns a value indicating whether the connection string specifies any
         * service endpoints.
         */
        ConnectionString.prototype.hasEndpoint = function () {
            return !!this.values[AzureStorageConstants.connectionStringKeys.blobEndpoint] ||
                !!this.values[AzureStorageConstants.connectionStringKeys.fileEndpoint] ||
                !!this.values[AzureStorageConstants.connectionStringKeys.queueEndpoint] ||
                !!this.values[AzureStorageConstants.connectionStringKeys.tableEndpoint];
        };
        ConnectionString.prototype.toString = function () {
            var result = "";
            for (var key in this.values) {
                result += key + "=" + this.values[key] + ";";
            }
            return result;
        };
        ConnectionString.prototype._extractAccountNameFromEndpoint = function (endpoint, type) {
            var defaultSuffix = type + AzureStorageConstants.endpointsDomain.default;
            var chinaSuffix = type + AzureStorageConstants.endpointsDomain.chinaAzure;
            var host = URI(endpoint).host();
            // Remove port
            host = host.replace(/:[0-9]+$/, "");
            if (_string.endsWith(host, AzureStorageConstants.endpointsDomain.default)) {
                return host.substring(0, host.indexOf(defaultSuffix));
            }
            else if (_string.endsWith(host, AzureStorageConstants.endpointsDomain.chinaAzure)) {
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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ConnectionString;
});

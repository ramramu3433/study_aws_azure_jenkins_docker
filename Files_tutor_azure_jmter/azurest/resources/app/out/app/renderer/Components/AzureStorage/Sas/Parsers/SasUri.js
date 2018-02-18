"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var EndpointDomains_1 = require("../../EndpointDomains");
var SasToken_1 = require("./SasToken");
var StorageEndpointTypes_1 = require("../../StorageEndpointTypes");
var _string = require("underscore.string");
var url = require("url");
// Reference: https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
var SasUri = (function () {
    function SasUri(sasUri) {
        if (sasUri === void 0) { sasUri = ""; }
        this.sasUri = sasUri;
        this._parseSasUri();
    }
    /**
     * Gets a SAS URI to the specified endpoint type using the same account
     * name and SAS token from an existing URI.
     *
     * Useful for inferring other valid endpoints when a SAS URI uses an Azure
     * default endpoint domain.
     *
     * If the endpoint is a custom domain, a copy of the specified URI is
     * returned.
     */
    SasUri.getInferredDefaultEndpoint = function (uri, endpointType, hostOnly) {
        if (hostOnly === void 0) { hostOnly = false; }
        var uriCopy = url.parse(uri.toString());
        if (!!uri.accountName) {
            // Swap out the provided URI's endpoint type with the requested type.
            // The endpoint type can be found in the URI's hostname.
            // Example:
            //   Input: https://myaccount.blob.core.windows.net:80/, table endpoint wanted
            //   Output: https://myaccount.table.core.windows.net:80/
            var hostnameParts = uriCopy.hostname.split(".");
            if (hostnameParts.length >= 2) {
                hostnameParts[1] = endpointType;
                uriCopy.host = "";
                uriCopy.hostname = hostnameParts.join(".");
                if (hostOnly) {
                    uriCopy.path = null;
                    uriCopy.pathname = null;
                    uriCopy.query = null;
                    uriCopy.search = null;
                }
            }
        }
        return new SasUri(url.format(uriCopy));
    };
    /**
     * Returns a value indicating whether the SAS URI domain is one of Azure's
     * default endpoint domains.
     */
    SasUri.prototype.isDefaultEndpoint = function () {
        return this._isDefaultDomain();
    };
    /**
     * Returns a value indicating whether the SAS URI domain is one of Azure's
     * default blob endpoint domains.
     */
    SasUri.prototype.isDefaultBlobEndpoint = function () {
        return this._isDefaultDomain(StorageEndpointTypes_1.default.blob);
    };
    /**
     * Returns a value indicating whether the SAS URI domain is one of Azure's
     * default file endpoint domains.
     */
    SasUri.prototype.isDefaultFileEndpoint = function () {
        return this._isDefaultDomain(StorageEndpointTypes_1.default.file);
    };
    /**
     * Returns a value indicating whether the SAS URI domain is one of Azure's
     * default queue endpoint domains.
     */
    SasUri.prototype.isDefaultQueueEndpoint = function () {
        return this._isDefaultDomain(StorageEndpointTypes_1.default.queue);
    };
    /**
     * Returns a value indicating whether the SAS URI domain is one of Azure's
     * default table endpoint domains.
     */
    SasUri.prototype.isDefaultTableEndpoint = function () {
        return this._isDefaultDomain(StorageEndpointTypes_1.default.table);
    };
    SasUri.prototype.toString = function () {
        return this.sasUri;
    };
    SasUri.prototype._parseAccountName = function () {
        if (this.isDefaultEndpoint()) {
            this.accountName = this.hostname.split(".")[0];
        }
        else {
            this.accountName = null;
        }
    };
    SasUri.prototype._isDefaultDomain = function (serviceType) {
        if (serviceType === void 0) { serviceType = ""; }
        return _string.endsWith(this.hostname, serviceType + EndpointDomains_1.default.default) ||
            _string.endsWith(this.hostname, serviceType + EndpointDomains_1.default.chinaAzure) ||
            _string.endsWith(this.hostname, serviceType + EndpointDomains_1.default.germanyAzure) ||
            _string.endsWith(this.hostname, serviceType + EndpointDomains_1.default.usAzure);
    };
    SasUri.prototype._parseResourceType = function () {
        this.resourceType = this.sasToken.accessType;
    };
    SasUri.prototype._parseSasUri = function () {
        var parsedUri = url.parse(this.sasUri);
        this.protocol = parsedUri.protocol;
        this.hostname = parsedUri.hostname;
        this.port = parsedUri.port;
        this.path = parsedUri.pathname;
        this.resourceName = this.path && this.path.substring(1);
        this.sasToken = new SasToken_1.default(parsedUri.query);
        console.log(parsedUri.query);
        console.log(this.sasToken);
        if (this.hostname && this.protocol) {
            // The host URI should be the URI that points to the account. It should not contain the
            // resource name (but it might contain a path if an emulator URI).
            //
            // Examples:
            //   http://127.0.0.1:10001/devstoreaccount1
            //   https://mlstg2.blob.core.windows.net
            var sasToken = this.sasToken;
            var hostPath = this.path;
            // If it's a container-level...
            // (Currently assuming it can't be an object-level SAS)
            if (!sasToken.isAccountToken()) {
                // Remove the last segment of the path, since it should be the container name.
                // In most cases, except for emulator, this will end up with a blank path.
                // CONSIDER: [cralvord] Is this really necessary?
                hostPath = hostPath.replace(/\/[^/]*$/, "");
            }
            this.accountUri = url.format({
                protocol: this.protocol,
                host: this.hostname,
                port: this.port,
                pathname: hostPath
            });
            this.resourceUri = url.format({
                protocol: this.protocol,
                host: this.hostname,
                port: this.port,
                pathname: this.path
            });
        }
        this._parseAccountName();
        this._parseResourceType();
    };
    return SasUri;
}());
exports.default = SasUri;

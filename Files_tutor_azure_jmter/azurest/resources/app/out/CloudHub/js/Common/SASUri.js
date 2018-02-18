/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore.string", "URIjs/URI", "Providers/Common/AzureStorageConstants", "Common/AzureStorageUtilities", "Common/SASToken", "Common/SASResourceType"], function (require, exports, _string, URI, AzureStorageConstants, AzureStorageUtilities, SASToken_1, SASResourceType_1) {
    "use strict";
    var endpointTypes = AzureStorageConstants.storageEndpointTypes;
    var defaultDomains = AzureStorageConstants.endpointsDomain;
    // Reference: https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
    var SASDialogValidationResult;
    (function (SASDialogValidationResult) {
        SASDialogValidationResult[SASDialogValidationResult["OK"] = 0] = "OK";
        SASDialogValidationResult[SASDialogValidationResult["NO_SAS_URI"] = 1] = "NO_SAS_URI";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_NO_PROTOCOL"] = 2] = "ERROR_NO_PROTOCOL";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_NO_HOSTNAME"] = 3] = "ERROR_NO_HOSTNAME";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_INVALID_PATH"] = 4] = "ERROR_INVALID_PATH";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_NO_RESOURCE_NAME"] = 5] = "ERROR_NO_RESOURCE_NAME";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_MISSING_PARAMS"] = 6] = "ERROR_MISSING_PARAMS";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_INADEQUATE_BLOB_PERMISSIONS"] = 7] = "ERROR_INADEQUATE_BLOB_PERMISSIONS";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_INADEQUATE_FILE_PERMISSIONS"] = 8] = "ERROR_INADEQUATE_FILE_PERMISSIONS";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_INADEQUATE_QUEUE_PERMISSIONS"] = 9] = "ERROR_INADEQUATE_QUEUE_PERMISSIONS";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_INADEQUATE_TABLE_PERMISSIONS"] = 10] = "ERROR_INADEQUATE_TABLE_PERMISSIONS";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_RESOURCE_NAME_EXISTS"] = 11] = "ERROR_RESOURCE_NAME_EXISTS";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_BLOB_ATTACH"] = 12] = "ERROR_BLOB_ATTACH";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_FILE_ATTACH"] = 13] = "ERROR_FILE_ATTACH";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_UNSUPPORTED_TYPE"] = 14] = "ERROR_UNSUPPORTED_TYPE";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_DEVELOPMENT_UNSUPPORTED"] = 15] = "ERROR_DEVELOPMENT_UNSUPPORTED";
        SASDialogValidationResult[SASDialogValidationResult["ERROR_SAS_EXPIRED"] = 16] = "ERROR_SAS_EXPIRED";
    })(SASDialogValidationResult = exports.SASDialogValidationResult || (exports.SASDialogValidationResult = {}));
    ;
    var SASUri = (function () {
        function SASUri(sasUri) {
            this._sasUri = sasUri;
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
        SASUri.getInferredDefaultEndpoint = function (uri, endpointType) {
            var uriCopy = URI(uri.toString());
            if (!!uri.accountName) {
                // Swap out the provided URI's endpoint type with the requested type.
                // The endpoint type can be found in the URI's hostname.
                // Example:
                //   Input: https://myaccount.blob.core.windows.net:80/, table endpoint wanted
                //   Output: https://myaccount.table.core.windows.net:80/
                var hostnameParts = uriCopy.hostname().split(".");
                if (hostnameParts.length >= 2) {
                    hostnameParts[1] = endpointType;
                    uriCopy = uriCopy.hostname(hostnameParts.join("."));
                }
            }
            return new SASUri(uriCopy.toString());
        };
        SASUri.prototype.isAttachable = function () {
            return this.validate() === SASDialogValidationResult.OK;
        };
        SASUri.prototype.isSASUri = function () {
            var validationResult = this.validate();
            return validationResult !== SASDialogValidationResult.NO_SAS_URI &&
                validationResult !== SASDialogValidationResult.ERROR_NO_HOSTNAME &&
                validationResult !== SASDialogValidationResult.ERROR_NO_PROTOCOL;
        };
        /**
         * Returns a value indicating whether the SAS URI domain is one of Azure's
         * default endpoint domains.
         */
        SASUri.prototype.isDefaultEndpint = function () {
            return _string.endsWith(this._hostname, defaultDomains.default) ||
                _string.endsWith(this._hostname, defaultDomains.chinaAzure);
        };
        /**
         * Returns a value indicating whether the SAS URI domain is one of Azure's
         * default blob endpoint domains.
         */
        SASUri.prototype.isDefaultBlobEndpoint = function () {
            var defaultEndpoint = endpointTypes.blob + defaultDomains.default;
            var defaultChinaEndpoint = endpointTypes.blob + defaultDomains.chinaAzure;
            return _string.endsWith(this._hostname, defaultEndpoint) ||
                _string.endsWith(this._hostname, defaultChinaEndpoint);
        };
        /**
         * Returns a value indicating whether the SAS URI domain is one of Azure's
         * default file endpoint domains.
         */
        SASUri.prototype.isDefaultFileEndpoint = function () {
            var defaultEndpoint = endpointTypes.file + defaultDomains.default;
            var defaultChinaEndpoint = endpointTypes.file + defaultDomains.chinaAzure;
            return _string.endsWith(this._hostname, defaultEndpoint) ||
                _string.endsWith(this._hostname, defaultChinaEndpoint);
        };
        /**
         * Returns a value indicating whether the SAS URI domain is one of Azure's
         * default queue endpoint domains.
         */
        SASUri.prototype.isDefaultQueueEndpoint = function () {
            var defaultEndpoint = endpointTypes.queue + defaultDomains.default;
            var defaultChinaEndpoint = endpointTypes.queue + defaultDomains.chinaAzure;
            return _string.endsWith(this._hostname, defaultEndpoint) ||
                _string.endsWith(this._hostname, defaultChinaEndpoint);
        };
        /**
         * Returns a value indicating whether the SAS URI domain is one of Azure's
         * default table endpoint domains.
         */
        SASUri.prototype.isDefaultTableEndpoint = function () {
            var defaultEndpoint = endpointTypes.table + defaultDomains.default;
            var defaultChinaEndpoint = endpointTypes.table + defaultDomains.chinaAzure;
            return _string.endsWith(this._hostname, defaultEndpoint) ||
                _string.endsWith(this._hostname, defaultChinaEndpoint);
        };
        SASUri.prototype.validate = function () {
            if (!this._sasUri) {
                return SASDialogValidationResult.NO_SAS_URI;
            }
            if (!this._protocol) {
                return SASDialogValidationResult.ERROR_NO_PROTOCOL;
            }
            if (!this._hostname) {
                return SASDialogValidationResult.ERROR_NO_HOSTNAME;
            }
            // Path contains the resource name. Paths must not end with forward slashes ("/").
            if (_string.endsWith(this._path, "/")) {
                return SASDialogValidationResult.ERROR_INVALID_PATH;
            }
            // Path should contain the resource name.
            if (!this._path || !this._path.substring(1)) {
                return SASDialogValidationResult.ERROR_NO_RESOURCE_NAME;
            }
            if (!this.sasToken.signature || !this.sasToken.version) {
                return SASDialogValidationResult.ERROR_MISSING_PARAMS;
            }
            switch (this.resourceType) {
                case AzureStorageConstants.sasResourceTypes.blob:
                    // We only support attaching containters.
                    if (!this.sasToken.isContainerResource()) {
                        return SASDialogValidationResult.ERROR_BLOB_ATTACH;
                    }
                    // We need at least "list" permissions to show a blob container in Storage Explorer.
                    if (!this.sasToken.hasPermission("l")) {
                        return SASDialogValidationResult.ERROR_INADEQUATE_BLOB_PERMISSIONS;
                    }
                    break;
                case AzureStorageConstants.sasResourceTypes.file:
                    // We only support attaching shares.
                    if (!this.sasToken.isShareResource()) {
                        return SASDialogValidationResult.ERROR_FILE_ATTACH;
                    }
                    // We need at least "list" permissions to show a file share in Storage Explorer.
                    if (!this.sasToken.hasPermission("l")) {
                        return SASDialogValidationResult.ERROR_INADEQUATE_FILE_PERMISSIONS;
                    }
                    break;
                case AzureStorageConstants.sasResourceTypes.queue:
                    // We need at least "read" permissions to show a queue in Storage Explorer.
                    if (!this.sasToken.hasPermission("r")) {
                        return SASDialogValidationResult.ERROR_INADEQUATE_QUEUE_PERMISSIONS;
                    }
                    break;
                case AzureStorageConstants.sasResourceTypes.table:
                    // We need at least "read" permissions to show a table in Storage Explorer.
                    if (!this.sasToken.hasPermission("r")) {
                        return SASDialogValidationResult.ERROR_INADEQUATE_TABLE_PERMISSIONS;
                    }
                    break;
                default:
                    return SASDialogValidationResult.ERROR_UNSUPPORTED_TYPE;
            }
            if (_string.startsWith(this.resourceUri, AzureStorageConstants.localEndpoints.LocalBlobEndpoint) ||
                _string.startsWith(this.resourceUri, AzureStorageConstants.localEndpoints.LocalQueueEndpoint) ||
                _string.startsWith(this.resourceUri, AzureStorageConstants.localEndpoints.LocalTableEndpoint)) {
                return SASDialogValidationResult.ERROR_DEVELOPMENT_UNSUPPORTED;
            }
            if (AzureStorageUtilities.sasResourceWithNameExists(SASResourceType_1.default.fromString(this.resourceType), this.resourceName)) {
                return SASDialogValidationResult.ERROR_RESOURCE_NAME_EXISTS;
            }
            if (this.sasToken.isExpired()) {
                return SASDialogValidationResult.ERROR_SAS_EXPIRED;
            }
            return SASDialogValidationResult.OK;
        };
        SASUri.prototype.toString = function () {
            return this._sasUri;
        };
        SASUri.prototype._parseAccountName = function () {
            if (this.isDefaultEndpint()) {
                this.accountName = this._hostname.split(".")[0];
            }
            else {
                this.accountName = null;
            }
        };
        SASUri.prototype._parseResourceType = function () {
            if (this.sasToken.isContainerResource() || this.sasToken.isBlobResource() || this.isDefaultBlobEndpoint()) {
                this.resourceType = AzureStorageConstants.sasResourceTypes.blob;
            }
            else if (this.sasToken.isShareResource() || this.sasToken.isFileResource() || this.isDefaultFileEndpoint()) {
                this.resourceType = AzureStorageConstants.sasResourceTypes.file;
            }
            else if (this.sasToken.isTableResource() || this.isDefaultTableEndpoint()) {
                this.resourceType = AzureStorageConstants.sasResourceTypes.table;
            }
            else if (!this.sasToken.isAccountResource() || this.isDefaultQueueEndpoint()) {
                // TODO: storage client doesn't support specifying a resoure type for queue SAS.
                // but there are ways to determine whether it's a SAS for blob container, table or file/share
                // So this should work well for now.
                this.resourceType = AzureStorageConstants.sasResourceTypes.queue;
            }
            else {
                this.resourceType = "";
            }
        };
        ;
        SASUri.prototype._parseSasUri = function () {
            if (!this._sasUri) {
                return;
            }
            var parsedURI = URI(this._sasUri);
            this._protocol = parsedURI.protocol();
            this._hostname = parsedURI.hostname();
            this._port = parsedURI.port();
            this._path = parsedURI.path();
            this.resourceName = this._path && this._path.substring(1);
            this.sasToken = new SASToken_1.default(parsedURI.query());
            if (this._hostname && this._protocol) {
                // The host URI should be the URI that points to the account. It should not contain the
                // resource name (but it might contain a path if an emulator URI).
                //
                // Examples:
                //   http://127.0.0.1:10001/devstoreaccount1
                //   https://mlstg2.blob.core.windows.net
                var sasToken = this.sasToken;
                var hostPath = this._path;
                // If it's a container-level...
                // (Currently assuming it can't be an object-level SAS)
                if (!sasToken.isAccountResource()) {
                    // Remove the last segment of the path, since it should be the container name.
                    // In most cases, except for emulator, this will end up with a blank path.
                    // CONSIDER: [cralvord] Is this really necessary?
                    hostPath = hostPath.replace(/\/[^/]*$/, "");
                }
                this.accountUri = URI({
                    protocol: this._protocol,
                    hostname: this._hostname,
                    port: this._port,
                    path: hostPath
                }).toString();
                this.resourceUri = URI({
                    protocol: this._protocol,
                    hostname: this._hostname,
                    port: this._port,
                    path: this._path
                }).toString();
            }
            this._parseAccountName();
            this._parseResourceType();
        };
        return SASUri;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SASUri;
});

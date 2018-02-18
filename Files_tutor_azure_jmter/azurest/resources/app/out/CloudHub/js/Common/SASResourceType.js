/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureStorageConstants"], function (require, exports, AzureStorageConstants) {
    "use strict";
    /**
     * Enum-type class for the resource types for SAS.
     */
    var SASResourceType = (function () {
        function SASResourceType(connectionStringEndpoint, localStorageKeySuffix) {
            this._connectionStringEndpoint = connectionStringEndpoint;
            this._localStorageKeySuffix = localStorageKeySuffix;
        }
        Object.defineProperty(SASResourceType.prototype, "connectionStringEndpoint", {
            get: function () {
                return this._connectionStringEndpoint;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SASResourceType.prototype, "localStorageKey", {
            /** The local storage key for this SAS resource type */
            get: function () {
                return SASResourceType.localStorageKeyStorageSASTokens + this._localStorageKeySuffix;
            },
            enumerable: true,
            configurable: true
        });
        SASResourceType.fromString = function (sasResourceType) {
            switch (sasResourceType) {
                case AzureStorageConstants.sasResourceTypes.account:
                    return SASResourceType.account;
                case AzureStorageConstants.sasResourceTypes.blob:
                    return SASResourceType.blob;
                case AzureStorageConstants.sasResourceTypes.file:
                    return SASResourceType.file;
                case AzureStorageConstants.sasResourceTypes.queue:
                    return SASResourceType.queue;
                case AzureStorageConstants.sasResourceTypes.table:
                    return SASResourceType.table;
                default:
                    throw new TypeError("\"" + sasResourceType + "\" is not a known SAS resource type.");
            }
        };
        return SASResourceType;
    }());
    SASResourceType.localStorageKeyStorageSASTokens = "StorageExplorer_AddStorageServiceSAS_v1_";
    // SAS Accounts don't have endpoints.
    SASResourceType.account = new SASResourceType("", "account");
    SASResourceType.blob = new SASResourceType(AzureStorageConstants.connectionStringKeys.blobEndpoint, "blob");
    SASResourceType.file = new SASResourceType(AzureStorageConstants.connectionStringKeys.fileEndpoint, "file");
    SASResourceType.table = new SASResourceType(AzureStorageConstants.connectionStringKeys.tableEndpoint, "table");
    SASResourceType.queue = new SASResourceType(AzureStorageConstants.connectionStringKeys.queueEndpoint, "queue");
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SASResourceType;
});

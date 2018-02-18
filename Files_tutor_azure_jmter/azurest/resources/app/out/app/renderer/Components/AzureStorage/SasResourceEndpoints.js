"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionStringKey_1 = require("./ConnectionString/Parsers/ConnectionStringKey");
var SasResourceType_1 = require("./SasResourceType");
/**
 * Enum-type class for the resource types for SAS.
 */
var SasResourceEndpoints = (function () {
    function SasResourceEndpoints(connectionStringEndpoint, localStorageKeySuffix) {
        this._connectionStringEndpoint = connectionStringEndpoint;
        this._localStorageKeySuffix = localStorageKeySuffix;
    }
    Object.defineProperty(SasResourceEndpoints.prototype, "connectionStringEndpoint", {
        get: function () {
            return this._connectionStringEndpoint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasResourceEndpoints.prototype, "localStorageKey", {
        /** The local storage key for this SAS resource type */
        get: function () {
            return SasResourceEndpoints.localStorageKeyStorageSASTokens + this._localStorageKeySuffix;
        },
        enumerable: true,
        configurable: true
    });
    SasResourceEndpoints.fromString = function (sasResourceType) {
        switch (sasResourceType) {
            case SasResourceType_1.default.account:
                return SasResourceEndpoints.account;
            case SasResourceType_1.default.blob:
                return SasResourceEndpoints.blob;
            case SasResourceType_1.default.file:
                return SasResourceEndpoints.file;
            case SasResourceType_1.default.queue:
                return SasResourceEndpoints.queue;
            case SasResourceType_1.default.table:
                return SasResourceEndpoints.table;
            default:
                throw new TypeError("\"" + sasResourceType + "\" is not a known SAS resource type.");
        }
    };
    return SasResourceEndpoints;
}());
SasResourceEndpoints.localStorageKeyStorageSASTokens = "StorageExplorer_AddStorageServiceSAS_v1_";
// SAS Accounts don't have endpoints.
SasResourceEndpoints.account = new SasResourceEndpoints("", "account");
SasResourceEndpoints.blob = new SasResourceEndpoints(ConnectionStringKey_1.default.blobEndpoint, "blob");
SasResourceEndpoints.file = new SasResourceEndpoints(ConnectionStringKey_1.default.fileEndpoint, "file");
SasResourceEndpoints.table = new SasResourceEndpoints(ConnectionStringKey_1.default.tableEndpoint, "table");
SasResourceEndpoints.queue = new SasResourceEndpoints(ConnectionStringKey_1.default.queueEndpoint, "queue");
exports.default = SasResourceEndpoints;

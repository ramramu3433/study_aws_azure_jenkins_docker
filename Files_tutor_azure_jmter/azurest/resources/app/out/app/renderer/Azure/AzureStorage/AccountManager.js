"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionString_1 = require("../../../renderer/Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var SasToken_1 = require("../../../renderer/Components/AzureStorage/Sas/Parsers/SasToken");
var AzureStorage = require("azure-storage");
var Q = require("q");
function generateSharedAccessSignature(connectionString, services, resourceTypes, permissions, expiry, start) {
    var accessPolicy = {
        AccessPolicy: {
            Services: services,
            ResourceTypes: resourceTypes,
            Permissions: permissions,
            Expiry: expiry,
            Start: start || undefined
        }
    };
    var sasToken = AzureStorage.generateAccountSharedAccessSignature(connectionString, null, accessPolicy);
    var result = { sasToken: sasToken, connectionString: "" };
    var resultConnectionString = {};
    resultConnectionString[AzureStorage.Constants.ConnectionStringKeys.SHARED_ACCESS_SIGNATURE_NAME] = sasToken;
    var parsedSasToken = new SasToken_1.default(sasToken);
    var parsedConnectionString = new ConnectionString_1.default(connectionString);
    if (parsedSasToken.hasServiceAccess("b") && !!parsedConnectionString.blobEndpoint) {
        resultConnectionString[AzureStorage.Constants.ConnectionStringKeys.BLOB_ENDPOINT_NAME] = result.blobSasUrl = parsedConnectionString.blobEndpoint;
    }
    if (parsedSasToken.hasServiceAccess("f") && !!parsedConnectionString.fileEndpoint) {
        resultConnectionString[AzureStorage.Constants.ConnectionStringKeys.FILE_ENDPOINT_NAME] = result.fileSasUrl = parsedConnectionString.fileEndpoint;
    }
    if (parsedSasToken.hasServiceAccess("q") && !!parsedConnectionString.queueEndpoint) {
        resultConnectionString[AzureStorage.Constants.ConnectionStringKeys.QUEUE_ENDPOINT_NAME] = result.queueSasUrl = parsedConnectionString.queueEndpoint;
    }
    if (parsedSasToken.hasServiceAccess("t") && !!parsedConnectionString.tableEndpoint) {
        resultConnectionString[AzureStorage.Constants.ConnectionStringKeys.TABLE_ENDPOINT_NAME] = result.tableSasUrl = parsedConnectionString.tableEndpoint;
    }
    result.connectionString = ConnectionString_1.default.createFromValues(resultConnectionString);
    return Q.resolve(result);
}
exports.generateSharedAccessSignature = generateSharedAccessSignature;

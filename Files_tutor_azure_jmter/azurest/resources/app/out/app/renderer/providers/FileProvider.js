"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var FileManager = require("../Azure/AzureStorage/FileManager");
module.exports = {
    "Azure.Storage.File.getContainerAccessControlList": function (args) {
        return FileManager.getAccessControlList(args.connectionString, args.shareName);
    },
    "Azure.Storage.File.setContainerAccessControlList": function (args) {
        return FileManager.setAccessControlList(args.connectionString, args.shareName, args.sharedAccessPolicies);
    },
    "Azure.Storage.File.generateSharedAccessSignature": function (args) {
        return FileManager.generateSharedAccessSignature(args.connectionString, args.shareName, args.expiry, args.filePath, args.start, args.permissions, args.usePrimaryEndpoint);
    },
    "Azure.Storage.File.generateSharedAccessSignatureWithPolicy": function (args) {
        return FileManager.generateSharedAccessSignatureWithPolicy(args.connectionString, args.shareName, args.accessPolicyId, args.filePath, args.usePrimaryEndpoint);
    }
};

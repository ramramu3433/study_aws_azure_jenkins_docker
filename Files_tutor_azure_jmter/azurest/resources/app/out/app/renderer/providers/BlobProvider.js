"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var BlobManager = require("../Azure/AzureStorage/BlobManager");
module.exports = {
    "Azure.Storage.Blob.getContainerAccessControlList": function (args) {
        return BlobManager.getContainerAccessControlList(args.connectionString, args.containerName);
    },
    "Azure.Storage.Blob.setContainerAccessControlList": function (args) {
        return BlobManager.setContainerAccessControlList(args.connectionString, args.containerName, args.sharedAccessPolicies);
    },
    "Azure.Storage.Blob.generateSharedAccessSignature": function (args) {
        return BlobManager.generateSharedAccessSignature(args.connectionString, args.containerName, args.expiry, args.blobName, args.start, args.permissions, args.usePrimaryEndpoint);
    },
    "Azure.Storage.Blob.generateSharedAccessSignatureWithPolicy": function (args) {
        return BlobManager.generateSharedAccessSignatureWithPolicy(args.connectionString, args.containerName, args.accessPolicyId, args.blobname, args.usePrimaryEndpoint);
    }
};

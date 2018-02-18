"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var QueueManager = require("../Azure/AzureStorage/QueueManager");
module.exports = {
    "Azure.Storage.Queue.getAccessControlList": function (args) {
        return QueueManager.getAccessControlList(args.connectionString, args.queueName);
    },
    "Azure.Storage.Queue.setAccessControlList": function (args) {
        return QueueManager.setAccessControlList(args.connectionString, args.queueName, args.sharedAccessPolicies);
    },
    "Azure.Storage.Queue.generateSharedAccessSignature": function (args) {
        return QueueManager.generateSharedAccessSignature(args.connectionString, args.queueName, args.expiry, args.start, args.permissions);
    },
    "Azure.Storage.Queue.generateSharedAccessSignatureWithPolicy": function (args) {
        return QueueManager.generateSharedAccessSignatureWithPolicy(args.connectionString, args.queueName, args.accessPolicyId, args.blobname, args.usePrimaryEndpoint);
    }
};

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var BlobQueryOperations = require("../Azure/AzureStorage/Blobs/BlobQueryOperations");
module.exports = {
    "Azure.Storage.Blobs.listBlobsSegmented": function (args) {
        return BlobQueryOperations.listBlobsSegmented(args.containerReference, args.prefix, args.currentToken, args.numResults, args.callerName, args.include);
    },
    "Azure.Storage.Blobs.getMetadata": function (args) {
        return BlobQueryOperations.getBlobMetadata(args.connectionString, args.containerName, args.blobName);
    }
};

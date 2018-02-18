"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var BlobUploadIteratorProcessor_1 = require("../../JobHandlers/Blob/Upload/BlobUploadIteratorProcessor");
var RemoteBlobUploadGroupManager_1 = require("../../JobHandlers/Blob/Upload/RemoteBlobUploadGroupManager");
var host = global.host;
var blobUploadGroup = new RemoteBlobUploadGroupManager_1.default(host);
var blobUploadIteratorProcess = new BlobUploadIteratorProcessor_1.default(blobUploadGroup, host);
var BlobUploadIteratorProcessorProvider = {
    "BlobUploadIteratorProcessor.processIterator": function (args) {
        return blobUploadIteratorProcess.process(args.iterator);
    }
};
module.exports = BlobUploadIteratorProcessorProvider;

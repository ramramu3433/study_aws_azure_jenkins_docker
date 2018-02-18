"use strict";
var blobUploadTimeMap = {};
var BlobUpdateProvider = {
    "StorageExplorer.Blob.BlobUpdate": function (args) {
        blobUploadTimeMap[args.blobContainerRef.name] = Date.now();
    },
    "StorageExplorer.Blob.checkBlobTimeStamp": function (args) {
        return blobUploadTimeMap[args.blobContainerRef.containerName];
    }
};
module.exports = BlobUpdateProvider;

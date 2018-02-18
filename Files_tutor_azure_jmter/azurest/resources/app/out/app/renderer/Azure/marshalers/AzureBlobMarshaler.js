"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var blobManager = require("../AzureStorage/BlobManager");
module.exports = {
    doesBlobContainerExist: blobManager.doesBlobContainerExist,
    doesBlobExist: blobManager.doesBlobExist,
    doesBlobFolderExist: blobManager.doesBlobFolderExist,
    getContainerPublicAccessLevel: blobManager.getContainerPublicAccessLevel,
    setContainerPublicAccessLevel: blobManager.setContainerPublicAccessLevel,
    getBlob: blobManager.getBlob,
    getBlobProperties: blobManager.getBlobProperties,
    getCorsRule: blobManager.getCorsRules,
    setCorsRule: blobManager.setCorsRules,
    setBlobMetadata: blobManager.setBlobMetadata,
    setBlobProperties: blobManager.setBlobProperties,
    deleteBlob: blobManager.deleteBlob,
    generateSharedAccessSignature: blobManager.generateSharedAccessSignature,
    generateSharedAccessSignatureWithPolicy: blobManager.generateSharedAccessSignatureWithPolicy,
    getContainerAccessControlList: blobManager.getContainerAccessControlList,
    setContainerAccessControlList: blobManager.setContainerAccessControlList,
    getPrimaryStorageUri: blobManager.getPrimaryStorageUri,
    startCopyStorageBlob: blobManager.startCopyStorageBlob,
    abortCopyStorageBlob: blobManager.abortCopyStorageBlob,
    getCopyBlobProgress: blobManager.getCopyBlobProgress,
    acquireLease: blobManager.acquireLease,
    breakLease: blobManager.breakLease,
    makeSnapshot: blobManager.makeSnapshot
};

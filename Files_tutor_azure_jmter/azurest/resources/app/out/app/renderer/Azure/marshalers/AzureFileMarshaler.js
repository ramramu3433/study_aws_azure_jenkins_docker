"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var fileManager = require("../AzureStorage/FileManager");
module.exports = {
    doesFileShareExist: fileManager.doesFileShareExist,
    doesFileExist: fileManager.doesFileExist,
    doesDirectoryExist: fileManager.doesDirectoryExist,
    createDirectory: fileManager.createDirectory,
    createDirectoryFromExisting: fileManager.createDirectoryFromExisting,
    deleteFile: fileManager.deleteFile,
    deleteDirectory: fileManager.deleteDirectory,
    getFile: fileManager.getFile,
    getDirectory: fileManager.getDirectory,
    getPrimaryStorageUri: fileManager.getPrimaryStorageUri,
    getFileShare: fileManager.getFileShare,
    generateSharedAccessSignature: fileManager.generateSharedAccessSignature,
    generateSharedAccessSignatureWithPolicy: fileManager.generateSharedAccessSignatureWithPolicy,
    getAccessControlList: fileManager.getAccessControlList,
    setAccessControlList: fileManager.setAccessControlList,
    startCopyStorageFile: fileManager.startCopyStorageFile,
    getCopyFileProgress: fileManager.getCopyFileProgress,
    abortCopyStorageFile: fileManager.abortCopyStorageFile,
    getItemProperties: fileManager.getItemProperties,
    setItemMetadata: fileManager.setItemMetadata,
    setItemProperties: fileManager.setItemProperties,
    getUrl: fileManager.getUrl,
    getCorsRule: fileManager.getCorsRules,
    setCorsRule: fileManager.setCorsRules
};

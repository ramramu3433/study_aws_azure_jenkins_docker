"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var fileManager = require("../Azure/AzureStorage/FileManager");
var FileUploadProvider = {
    "Azure.Storage.Files.uploadFile": function (args) {
        return fileManager.uploadFile(args.shareReference, args.destDirectory, args.destFileName, args.sourceFilePath, args.fileSize, args.progressId, args.overwriteIfExists);
    },
    "Azure.Storage.Files.getFileUploadProgress": function (args) {
        return fileManager.getFileUploadProgress(args.progressId);
    },
    "Azure.Storage.Files.releaseFileUpload": function (args) {
        return fileManager.releaseFileUpload(args.progressId);
    },
    "Azure.Storage.Files.abortFileUpload": function (args) {
        return fileManager.abortFileUpload(args.progressId);
    }
};
module.exports = FileUploadProvider;

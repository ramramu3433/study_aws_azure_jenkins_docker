"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var watchFilesManager = require("../WatchFilesManager");
var WatchFileProvider = {
    "StorageExplorer.Blob.Files.WatchFileChange": function (args) {
        return watchFilesManager.watchFileChange(args.watchFileArgs);
    },
    "StorageExplorer.Blob.Files.UnWatchFile": function (args) {
        return watchFilesManager.unWatchFile(args.filePath);
    }
};
module.exports = WatchFileProvider;

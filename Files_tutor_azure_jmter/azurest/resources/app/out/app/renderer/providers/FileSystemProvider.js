"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var electron_1 = require("electron");
var electron_2 = require("electron");
var FileOperationHelper = require("../common/FileOperationHelper");
var FileSystemProvider = {
    "FileSystemProvider.showItemInFolder": function (args) {
        electron_1.shell.showItemInFolder(args.path);
    },
    "FileSystemProvider.getUserDataDir": function () {
        return electron_2.remote.app.getPath("userData");
    },
    "FileSystemProvider.tryOpenFileSafely": function (args) {
        return FileOperationHelper.tryOpenFileSafely(args.path);
    }
};
module.exports = FileSystemProvider;

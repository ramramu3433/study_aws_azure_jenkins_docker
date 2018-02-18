"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var FileQueryOperations = require("../Azure/AzureStorage/Files/FileQueryOperations");
module.exports = {
    "Azure.Storage.Files.listFilesAndDirectoriesSegmented": function (args) {
        return FileQueryOperations.listFilesAndDirectoriesSegmented(args.shareReference, args.directory, args.prefix, args.currentToken, args.numResults);
    }
};

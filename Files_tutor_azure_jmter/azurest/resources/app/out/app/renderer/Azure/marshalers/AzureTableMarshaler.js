"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var tableManager = require("../AzureStorage/TableManager");
module.exports = {
    // TODO: These need to be moved to TableProvider at the same time as the ones in {blob,file,queue}Manager because of the
    // way they're used in code (can't convert from array args to object args of only one set of them).
    generateSharedAccessSignature: tableManager.generateSharedAccessSignature,
    generateSharedAccessSignatureWithPolicy: tableManager.generateSharedAccessSignatureWithPolicy,
    getAccessControlList: tableManager.getAccessControlList,
    setAccessControlList: tableManager.setAccessControlList
};

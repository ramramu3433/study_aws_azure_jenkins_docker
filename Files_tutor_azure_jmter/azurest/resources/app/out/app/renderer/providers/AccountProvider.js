"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var AccountManager = require("../Azure/AzureStorage/AccountManager");
module.exports = {
    "Azure.Storage.Account.generateSharedAccessSignature": function (args) {
        return AccountManager.generateSharedAccessSignature(args.connectionString, args.services, args.resourceTypes, args.permissions, args.expiry, args.start);
    }
};

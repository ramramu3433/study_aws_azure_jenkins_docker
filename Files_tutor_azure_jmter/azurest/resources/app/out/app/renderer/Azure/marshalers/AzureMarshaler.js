"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var AccountManager = require("../AzureStorage/AccountManager");
var AzureAccountsManager = require("../AzureAccountsManager");
var AzureRequest = require("../AzureRequest");
module.exports = {
    // General
    getSubscriptions: AzureAccountsManager.getAccountSubscriptions,
    webRequest: AzureRequest.webRequest,
    generateSharedAccessSignature: AccountManager.generateSharedAccessSignature,
    // TODO: Add functionality to detect if an account is MSDN premium.
    isMSDNPremiumAccount: function () { return false; }
};

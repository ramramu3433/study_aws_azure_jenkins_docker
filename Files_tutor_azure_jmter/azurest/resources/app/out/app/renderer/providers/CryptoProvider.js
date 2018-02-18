"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var LocalStorageHelper = require("../common/LocalStorageHelper");
var CryptoProvider = {
    "CloudExplorer.Actions.Crypto.EncryptText": function (args) { return LocalStorageHelper.encryptText(args); },
    "CloudExplorer.Actions.Crypto.DecryptText": function (args) { return LocalStorageHelper.decryptText(args); },
    "CloudExplorer.Actions.Crypto.GetEncryptionKey": function () { return { EncryptionKey: LocalStorageHelper.getEncryptionKey() }; }
};
module.exports = CryptoProvider;

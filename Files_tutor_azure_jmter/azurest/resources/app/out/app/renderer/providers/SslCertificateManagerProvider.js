"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var SslCertificateManager_1 = require("../SslCertificateManager");
var StorageApiSettingManagerProvider = {
    "SslCertificateManager.getCertsDir": function () { return SslCertificateManager_1.default.getCertsDir(); }
};
module.exports = StorageApiSettingManagerProvider;

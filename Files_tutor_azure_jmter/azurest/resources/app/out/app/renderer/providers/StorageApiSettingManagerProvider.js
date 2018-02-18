"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var StorageApiSettingManager_1 = require("../StorageApiSettingManager");
var StorageApiSettingManagerProvider = {
    "StorageApiSettingManager.getStorageApiSetting": function () { return StorageApiSettingManager_1.default.getStorageApiSetting(); }
};
module.exports = StorageApiSettingManagerProvider;

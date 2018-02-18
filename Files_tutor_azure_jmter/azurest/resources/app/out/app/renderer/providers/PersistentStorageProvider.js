"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var LocalStorageManager_1 = require("../common/PersistentStorage/LocalStorageManager");
var SessionStorageManager_1 = require("../common/PersistentStorage/SessionStorageManager");
module.exports = {
    "PersistentStorage.Local.getItem": function (args) {
        return LocalStorageManager_1.default.getItem(args.key);
    },
    "PersistenStorage.Local.setItem": function (args) {
        return LocalStorageManager_1.default.setItem(args.key, args.value);
    },
    "PersistentStorage.Local.delItemKey": function (args) {
        return LocalStorageManager_1.default.deleteItem(args.key);
    },
    "PersistentStorage.Session.getItem": function (args) {
        return SessionStorageManager_1.default.getItem(args.key);
    },
    "PersistentStorage.Session.setItem": function (args) {
        return SessionStorageManager_1.default.setItem(args.key, args.value);
    },
    "PersistentStorage.Session.delItemKey": function (args) {
        return SessionStorageManager_1.default.deleteItem(args.key);
    }
};

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PersistentStorageManager_1 = require("./PersistentStorageManager");
var LocalStorageManager = (function (_super) {
    tslib_1.__extends(LocalStorageManager, _super);
    function LocalStorageManager() {
        return _super.call(this, localStorage) || this;
    }
    return LocalStorageManager;
}(PersistentStorageManager_1.default));
var instance = new LocalStorageManager();
exports.default = instance;

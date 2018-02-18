"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PersistentStorageManager_1 = require("./PersistentStorageManager");
var SessionStorageManager = (function (_super) {
    tslib_1.__extends(SessionStorageManager, _super);
    function SessionStorageManager() {
        return _super.call(this, sessionStorage) || this;
    }
    return SessionStorageManager;
}(PersistentStorageManager_1.default));
var instance = new SessionStorageManager();
exports.default = instance;

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Settings/BrowserStorageManager"], function (require, exports, BrowserStorageManager_1) {
    "use strict";
    var SessionStorageManager = (function (_super) {
        __extends(SessionStorageManager, _super);
        function SessionStorageManager(telemetry) {
            return _super.call(this, sessionStorage, telemetry) || this;
        }
        return SessionStorageManager;
    }(BrowserStorageManager_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SessionStorageManager;
});

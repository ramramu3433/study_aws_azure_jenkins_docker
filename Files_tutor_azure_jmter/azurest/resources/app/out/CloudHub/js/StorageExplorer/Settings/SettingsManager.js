/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Debug", "StorageExplorer/Settings/LocalStorageManager", "StorageExplorer/Settings/SessionStorageManager"], function (require, exports, Debug, LocalStorageManager_1, SessionStorageManager_1) {
    "use strict";
    /**
     * Manage all settings. For now, the settings are all stored in browser Storage.
     * In future, we may store some settings in sepcified json file.
     */
    var SettingsManager = (function () {
        function SettingsManager(telemetry, storageType) {
            switch (storageType) {
                case 1 /* localStorage */:
                    this._storageManager = new LocalStorageManager_1.default(telemetry);
                    break;
                case 0 /* sessionStorage */:
                    this._storageManager = new SessionStorageManager_1.default(telemetry);
                    break;
                default:
                    Debug.error("storageType is out of range.");
                    break;
            }
        }
        SettingsManager.prototype.loadSettings = function (key) {
            var settings = {};
            if (key) {
                settings = this._storageManager.loadStoredItem(key);
            }
            return settings;
        };
        SettingsManager.prototype.saveSettings = function (settings, key) {
            if (key) {
                this._storageManager.saveItem(key, settings);
            }
        };
        SettingsManager.prototype.removeSettings = function (key) {
            this._storageManager.removeItem(key);
        };
        return SettingsManager;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SettingsManager;
});

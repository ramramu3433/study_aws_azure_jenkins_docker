/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Debug"], function (require, exports, Debug) {
    "use strict";
    var BrowserStorageManager = (function () {
        function BrowserStorageManager(storage, telemetry) {
            if (!this.isStorageSupported()) {
                Debug.error("Storage is not supported in current environment.");
                return;
            }
            this._storage = storage;
            this._telemetry = telemetry;
        }
        /**
         * Load storage item from Browser Storage.
         * @param key
         */
        BrowserStorageManager.prototype.loadStoredItem = function (key) {
            var storedData = {};
            var jsonStoredData = null;
            jsonStoredData = this._storage.getItem(key);
            try {
                storedData = JSON.parse(jsonStoredData);
            }
            catch (err) {
                Debug.error("BrowserStorageManager.loadStoredItem. Error parsing storage data.", err);
                this._telemetry.sendError({
                    name: "BrowserStorageManager.loadStoredItem",
                    error: err
                });
                storedData = {};
            }
            return storedData || {};
        };
        BrowserStorageManager.prototype.saveItem = function (key, data) {
            var jsonString = null;
            try {
                jsonString = JSON.stringify(data);
            }
            catch (err) {
                Debug.error("BrowserStorageManager.saveItem. Error stringify data.", err);
                this._telemetry.sendError({
                    name: "BrowserStorageManager.saveItem",
                    error: err
                });
                jsonString = null;
            }
            if (jsonString) {
                this._storage.setItem(key, JSON.stringify(data));
            }
        };
        BrowserStorageManager.prototype.removeItem = function (key) {
            this._storage.removeItem(key);
        };
        BrowserStorageManager.prototype.clearStorage = function () {
            this._storage.clear();
        };
        BrowserStorageManager.prototype.getStorageSize = function () {
            return this._storage.length;
        };
        /**
         * A cross browser detection if storage is supported.
         */
        BrowserStorageManager.prototype.isStorageSupported = function () {
            return (typeof (Storage) !== "undefined");
        };
        return BrowserStorageManager;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BrowserStorageManager;
});

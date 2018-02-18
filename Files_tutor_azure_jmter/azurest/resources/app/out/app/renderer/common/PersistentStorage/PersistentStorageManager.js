"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var q = require("q");
var PersistentStorageManager = (function () {
    function PersistentStorageManager(storage) {
        this._storage = storage;
    }
    PersistentStorageManager.prototype.getItem = function (key) {
        var _this = this;
        return q.Promise(function (resolve, reject) {
            var value = null;
            var jsonSettings = null;
            if (!!localStorage && !!key) {
                jsonSettings = _this._storage.getItem(key);
                try {
                    value = JSON.parse(jsonSettings);
                }
                catch (error) {
                    console.error(error);
                    _this.deleteItem(key);
                }
            }
            resolve(value);
        });
    };
    PersistentStorageManager.prototype.setItem = function (storageKey, value) {
        var _this = this;
        return q.Promise(function (resolve, reject) {
            if (_this.isPersistentStorageSupported() && storageKey) {
                try {
                    _this._storage.setItem(storageKey, JSON.stringify(value));
                }
                catch (error) {
                    console.error(error);
                    _this.deleteItem(storageKey);
                }
            }
            resolve(undefined);
        });
    };
    PersistentStorageManager.prototype.deleteItem = function (key) {
        var _this = this;
        return q.Promise(function (resolve, reject) {
            if (_this.isPersistentStorageSupported() && key) {
                try {
                    _this._storage.removeItem(key);
                }
                catch (error) {
                    console.error(error);
                }
            }
        });
    };
    PersistentStorageManager.prototype.isPersistentStorageSupported = function () {
        return !!localStorage;
    };
    return PersistentStorageManager;
}());
exports.default = PersistentStorageManager;

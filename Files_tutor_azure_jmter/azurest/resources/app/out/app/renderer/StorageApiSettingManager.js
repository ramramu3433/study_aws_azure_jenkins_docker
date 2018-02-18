"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var AzureStorage = require("azure-storage");
var telemetryManager = require("./telemetry/TelemetryManager");
var constants = require("../Constants");
var NotificationBarManager = require("./NotificationBarManager");
var utilities = require("../Utilities");
var StorageApiSettingManager = (function () {
    function StorageApiSettingManager() {
        this.storageApiSettingKey = "Standalone_StorageApiSettingManager_storageApiSettingKey_v1";
        this.defaultVersion = AzureStorage.Constants.HeaderConstants.TARGET_STORAGE_VERSION;
        this.azureStackApiVersion = "2015-04-05";
    }
    StorageApiSettingManager.prototype.StorageApiSettingManager = function () {
        // noop
    };
    StorageApiSettingManager.prototype.getDefaultVersion = function () {
        return this.defaultVersion;
    };
    StorageApiSettingManager.prototype.getAzureStackApiVersion = function () {
        return this.azureStackApiVersion;
    };
    StorageApiSettingManager.prototype.getStorageApiSetting = function () {
        var storageApiVersion = utilities.loadSettings(this.storageApiSettingKey);
        return storageApiVersion || this.defaultVersion;
    };
    StorageApiSettingManager.prototype.loadStorageApiSetting = function () {
        var storageApiVersion = this.getStorageApiSetting();
        AzureStorage.Constants.HeaderConstants.TARGET_STORAGE_VERSION = storageApiVersion;
        telemetryManager.sendEvent("StorageExplorer.StorageApiSetting", { "version": storageApiVersion });
        return storageApiVersion;
    };
    StorageApiSettingManager.prototype.resetStorageApiSetting = function () {
        this.saveStorageApiSetting("");
    };
    StorageApiSettingManager.prototype.saveStorageApiSetting = function (newVersion) {
        this.showRestartPrompt(newVersion);
    };
    StorageApiSettingManager.prototype.showRestartPrompt = function (newVersion) {
        var _this = this;
        var message = "Storage Explorer must restart for the changes to take effect.";
        var link = "Restart Now";
        var closeText = "Cancel Changes";
        NotificationBarManager.showSingleLink(message, link, constants.InfoBarTypes.other, closeText)
            .then(function (restartNowClicked) {
            if (restartNowClicked) {
                utilities.saveSettings(_this.storageApiSettingKey, newVersion);
                electron_1.remote.app.relaunch();
                electron_1.remote.app.quit();
            }
        });
    };
    return StorageApiSettingManager;
}());
exports.default = new StorageApiSettingManager();

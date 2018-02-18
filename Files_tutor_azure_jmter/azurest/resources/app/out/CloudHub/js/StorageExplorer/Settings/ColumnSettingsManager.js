/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "Common/Debug", "StorageExplorer/Settings/SettingHelper"], function (require, exports, _, Debug, SettingHelper) {
    "use strict";
    /**
     * A class that manages column settings of a DataTable.
     */
    var ColumnSettingsManager = (function () {
        function ColumnSettingsManager(settingsManager, settingId) {
            // This is an indicator whether column settings is enabled by user.
            // Before we have tool options supported, column settings will be always enabled.
            this.enabled = true;
            this._columnSettingsStorageKey = "StorageExplorer_ColumnSettings_SessionKey_v1";
            this._columnSettings = null;
            Debug.assert(!!settingsManager);
            this._settingsManager = settingsManager;
            this._settingId = settingId;
            this.loadColumnSettings();
        }
        ColumnSettingsManager.prototype.setSettingId = function (newSettingId) {
            this._settingId = newSettingId;
        };
        ColumnSettingsManager.prototype.getColumnSetting = function () {
            var _this = this;
            var columnSettings = this.loadColumnSettings();
            var setting = _.find(columnSettings, function (value) {
                return SettingHelper.isSameSettingId(_this._settingId, value.id);
            });
            return !!setting ? SettingHelper.deepClone(setting.setting) : null;
        };
        ColumnSettingsManager.prototype.saveColumnSetting = function (setting) {
            var _this = this;
            var settingCopy = SettingHelper.deepClone(setting);
            var columnSettings = this.loadColumnSettings();
            var index = _.findIndex(columnSettings, function (value) {
                return SettingHelper.isSameSettingId(_this._settingId, value.id);
            });
            // 1. If the setting has been saved before and the new setting is different from the saved, update the setting.
            // 2. If the setting has not been saved before, add the setting.
            if (index >= 0) {
                if (!SettingHelper.isSameColumnSetting(settingCopy, columnSettings[index].setting)) {
                    columnSettings[index].setting = settingCopy;
                    this._settingsManager.saveSettings(columnSettings, this._columnSettingsStorageKey);
                }
            }
            else {
                columnSettings = columnSettings.concat({
                    id: this._settingId,
                    setting: settingCopy
                });
                this._settingsManager.saveSettings(columnSettings, this._columnSettingsStorageKey);
            }
            // update the loaded columnSettings
            this._columnSettings = columnSettings;
        };
        ColumnSettingsManager.prototype.deleteColumnSetting = function () {
            var _this = this;
            var columnSettings = this.loadColumnSettings();
            var index = _.findIndex(columnSettings, function (value) {
                return SettingHelper.isSameSettingId(_this._settingId, value.id);
            });
            if (index >= 0) {
                columnSettings.splice(index, 1);
                this._settingsManager.saveSettings(columnSettings, this._columnSettingsStorageKey);
                this._columnSettings = columnSettings;
            }
        };
        ColumnSettingsManager.prototype.loadColumnSettings = function () {
            if (!this._columnSettings) {
                this._columnSettings = this._settingsManager.loadSettings(this._columnSettingsStorageKey);
                if (_.isEmpty(this._columnSettings)) {
                    this._columnSettings = [];
                }
            }
            return this._columnSettings;
        };
        return ColumnSettingsManager;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ColumnSettingsManager;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "Providers/StorageExplorer/Actions/StorageActionsHelper"], function (require, exports, ko, StorageActionsHelper) {
    "use strict";
    /*
     * Commands that can be performed in a storage explorer editor
     */
    var BaseStorageCommands = (function () {
        function BaseStorageCommands(host, telemetry) {
            this._host = host;
            this._telemetry = telemetry;
        }
        BaseStorageCommands.prototype.selectAllInCurrentPage = function (listViewModel) {
            listViewModel.clearSelection();
            ko.utils.arrayPushAll(listViewModel.selected, listViewModel.getAllItemsInCurrentPage());
        };
        BaseStorageCommands.prototype.selectAllInCache = function (listViewModel) {
            listViewModel.clearSelection();
            ko.utils.arrayPushAll(listViewModel.selected, listViewModel.getAllItemsInCache());
        };
        BaseStorageCommands.prototype._promptDelete = function () {
            var promptMessage = "Are you sure you want to delete the selected item(s)?"; // Localize
            return this._promptYesNoCore(promptMessage, "error");
        };
        BaseStorageCommands.prototype._promptYesNo = function (promptMessage) {
            return this._promptYesNoCore(promptMessage, "question");
        };
        BaseStorageCommands.prototype._promptYesNoCore = function (promptMessage, icon) {
            if (icon === void 0) { icon = "question"; }
            return this._host.executeOperation("Environment.promptYesNo", [promptMessage, icon]);
        };
        BaseStorageCommands.prototype._showError = function (error, telemetryCategory) {
            return StorageActionsHelper.showError(this._host, error, telemetryCategory);
        };
        return BaseStorageCommands;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BaseStorageCommands;
});

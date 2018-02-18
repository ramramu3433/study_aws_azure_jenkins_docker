/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "../../../StorageExplorer/Settings/QuickAccessManager"], function (require, exports, QuickAccessManager_1) {
    "use strict";
    var StorageAccountActions = (function () {
        function StorageAccountActions(host, telemetry) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(StorageAccountActions.pinToQuickAccess, function (args) { return _this.pinToQuickAccess(args); });
                actionBindingManager.addActionBinding(StorageAccountActions.removeFromQuickAccess, function (args) { return _this.removeFromQuickAccess(args); });
                actionBindingManager.addActionBinding(StorageAccountActions.refreshQuickAccess, function (args) { return _this.refreshQuickAccess(args); });
            };
            this._host = host;
            this._quickAccessManager = new QuickAccessManager_1.default(host, telemetry);
        }
        StorageAccountActions.prototype.pinToQuickAccess = function (args) {
            var quickAccessItem = {
                displayName: args.displayName,
                producerArgs: args.producerArgs,
                producerNamespace: args.producerNamespace
            };
            return this._quickAccessManager.addToQuickAccess(quickAccessItem);
        };
        StorageAccountActions.prototype.removeFromQuickAccess = function (args) {
            var quickAccessItem = {
                displayName: args.displayName,
                producerArgs: args.producerArgs,
                producerNamespace: args.producerNamespace
            };
            return this._quickAccessManager.removeFromQuickAccess(quickAccessItem);
        };
        StorageAccountActions.prototype.refreshQuickAccess = function (args) {
            return this._quickAccessManager.refreshQuickAccessNode();
        };
        return StorageAccountActions;
    }());
    StorageAccountActions.pinToQuickAccess = "Azure.Actions.Storage.addToQuickAccess";
    StorageAccountActions.removeFromQuickAccess = "Azure.Actions.Storage.removeFromQuickAccess";
    StorageAccountActions.refreshQuickAccess = "Azure.Actions.Storage.refreshQuickAccess";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = StorageAccountActions;
});

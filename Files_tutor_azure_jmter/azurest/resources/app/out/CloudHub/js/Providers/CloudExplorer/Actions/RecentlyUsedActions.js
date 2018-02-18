/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "../RecentlyUsedManager"], function (require, exports, RecentlyUsedManager_1) {
    "use strict";
    var RecentlyUsedActions = (function () {
        function RecentlyUsedActions(host) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(RecentlyUsedActions.addToRecentlyUsedNamespace, function (args) { return _this.add(args); });
                actionBindingManager.addActionBinding(RecentlyUsedActions.getCountRecentlyUsedNamespace, function (args) { return _this.count(args); });
            };
            this._host = host;
            this._manager = new RecentlyUsedManager_1.default();
        }
        RecentlyUsedActions.prototype.add = function (args) {
            var shortcutItem = {
                displayName: args.displayName,
                producerArgs: args.producerArgs,
                producerNamespace: args.producerNamespace
            };
            return this._manager.addToRecentlyUsed(shortcutItem);
        };
        RecentlyUsedActions.prototype.count = function (args) {
            return this._manager.numOfRecentlyUsedItems();
        };
        return RecentlyUsedActions;
    }());
    RecentlyUsedActions.addToRecentlyUsedNamespace = "CloudExplorer.RecentlyUsed.Add";
    RecentlyUsedActions.getCountRecentlyUsedNamespace = "CloudExplorer.RecentlyUsed.Count";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RecentlyUsedActions;
});

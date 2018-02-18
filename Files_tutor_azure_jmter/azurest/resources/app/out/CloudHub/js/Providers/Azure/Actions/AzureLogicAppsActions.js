/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Actions/AzureGeneralActions", "underscore.string"], function (require, exports, AzureGeneralActions, _string) {
    "use strict";
    var underscore = {
        string: _string
    };
    var AzureLogicAppsActions = (function () {
        function AzureLogicAppsActions(host) {
            var _this = this;
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureLogicAppsActions.deleteLogicAppActionNamespace, _this.deleteLogicApp);
            };
            /**
             * Action to delete an azure logic app.
             */
            this.deleteLogicApp = function (args) {
                var name = args.name;
                var prompt = underscore.string.sprintf("This will permanently delete Azure Data Factory '%0s' and its resources.\r\n\r\n"
                    + "Are you sure you want to delete it? ", name);
                return _this.confirmDelete(prompt).then(function (result) {
                    if (result) {
                        return _this._host.executeOperation(AzureGeneralActions.deleteActionNamespace, [{ id: args.id, subscription: args.subscription, apiVersion: args.apiVersion }]);
                    }
                });
            };
            /**
             * Verify the user wants to delete something
             */
            this.confirmDelete = function (prompt) {
                return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: prompt, iconType: "critical" }]);
            };
            this._host = host;
        }
        return AzureLogicAppsActions;
    }());
    AzureLogicAppsActions.deleteLogicAppActionNamespace = "Azure.Actions.LogicApps.deleteLogicAppAction";
    return AzureLogicAppsActions;
});

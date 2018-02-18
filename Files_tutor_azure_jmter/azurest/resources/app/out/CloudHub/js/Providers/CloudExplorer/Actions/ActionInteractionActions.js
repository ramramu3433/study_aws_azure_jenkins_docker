/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "CloudExplorer/UI/Details/ActionViewModel"], function (require, exports, rsvp, ActionViewModel) {
    "use strict";
    var Promise = rsvp.Promise;
    var ActionInteractionActions = (function () {
        function ActionInteractionActions() {
            var _this = this;
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(ActionInteractionActions.getDisplayName, _this._getDisplayName);
                actionBindingManager.addActionBinding(ActionInteractionActions.getVisible, _this._getVisible);
                actionBindingManager.addActionBinding(ActionInteractionActions.getEnabled, _this._getEnabled);
            };
            this._getDisplayName = function (args) {
                var firstAction = args ? ActionInteractionActions._getFirstAction(args.queryResult) : undefined;
                if (firstAction) {
                    return firstAction.displayNameBinding().updateValue();
                }
                return Promise.resolve();
            };
            this._getVisible = function (args) {
                var firstAction = args ? ActionInteractionActions._getFirstAction(args.queryResult) : undefined;
                if (firstAction) {
                    return firstAction.visibleBinding().updateValue();
                }
                return Promise.resolve();
            };
            this._getEnabled = function (args) {
                var firstAction = args ? ActionInteractionActions._getFirstAction(args.queryResult) : undefined;
                if (firstAction) {
                    return firstAction.enabledBinding().updateValue();
                }
                return Promise.resolve();
            };
        }
        return ActionInteractionActions;
    }());
    ActionInteractionActions.getDisplayName = "CloudExplorer.ActionInteraction.getDisplayName";
    ActionInteractionActions.getVisible = "CloudExplorer.ActionInteraction.getVisible";
    ActionInteractionActions.getEnabled = "CloudExplorer.ActionInteraction.getEnabled";
    ActionInteractionActions._getFirstAction = function (queryResult) {
        if (queryResult && queryResult.uids && queryResult.uids[0]) {
            return ActionViewModel.getAction(queryResult.uids[0]);
        }
        return;
    };
    return ActionInteractionActions;
});

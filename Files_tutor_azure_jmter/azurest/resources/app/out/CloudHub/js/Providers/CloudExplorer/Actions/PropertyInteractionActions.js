/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "CloudExplorer/UI/Details/ReadOnlyPropertyViewModel"], function (require, exports, rsvp, ReadOnlyPropertyViewModel) {
    "use strict";
    var Promise = rsvp.Promise;
    var PropertyInteractionActions = (function () {
        function PropertyInteractionActions() {
            var _this = this;
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(PropertyInteractionActions.getDisplayName, _this._getDisplayName);
                actionBindingManager.addActionBinding(PropertyInteractionActions.getDisplayValue, _this._getDisplayValue);
            };
            this._getDisplayName = function (args) {
                var firstAction = args ? PropertyInteractionActions._getFirstAction(args.queryResult) : undefined;
                if (firstAction) {
                    return firstAction.displayNameBinding().updateValue();
                }
                return Promise.resolve();
            };
            this._getDisplayValue = function (args) {
                var firstAction = args ? PropertyInteractionActions._getFirstAction(args.queryResult) : undefined;
                if (firstAction) {
                    return firstAction.displayValueBinding().updateValue();
                }
                return Promise.resolve();
            };
        }
        return PropertyInteractionActions;
    }());
    PropertyInteractionActions.getDisplayName = "CloudExplorer.PropertyInteraction.getDisplayName";
    PropertyInteractionActions.getDisplayValue = "CloudExplorer.PropertyInteraction.getDisplayValue";
    PropertyInteractionActions._getFirstAction = function (queryResult) {
        if (queryResult && queryResult.uids && queryResult.uids[0]) {
            return ReadOnlyPropertyViewModel.getProperty(queryResult.uids[0]);
        }
        return;
    };
    return PropertyInteractionActions;
});

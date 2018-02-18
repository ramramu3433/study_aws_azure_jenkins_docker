/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "knockout.mapping", "CloudExplorer/TreeNode/BindingHandler", "CloudExplorer/TreeNode/BindingHandlerSet"], function (require, exports, ko, mapping, BindingHandler_1, BindingHandlerSet_1) {
    "use strict";
    var ActionViewModel = (function () {
        function ActionViewModel(action, attributeResolver, resourceResolver) {
            var _this = this;
            this.uid = "Action:" + ActionViewModel._nextUid++;
            this.showIcon = ko.pureComputed(function () { return !_this.themeSrc() && _this.icon(); });
            this.displayName = ko.pureComputed(function () {
                return _this.displayNameBinding().value();
            });
            this.enabled = ko.pureComputed(function () {
                return _this.enabledBinding().value();
            });
            this.resolveArguments = function () {
                var boundArguments = new BindingHandlerSet_1.default(_this.unwrappedAction.boundArguments, _this._attributeResolver, _this._resourceResolver);
                return boundArguments.resolveArguments();
            };
            this.updateStatus = function () {
                _this.displayNameBinding().updateValue();
                _this.enabledBinding().updateValue();
                _this.visibleBinding().updateValue();
            };
            this.visible = ko.pureComputed(function () {
                return _this.visibleBinding().value();
            });
            this.dispose = function () {
                delete ActionViewModel._actionCache[_this.uid];
            };
            ActionViewModel._actionCache[this.uid] = this;
            this._attributeResolver = attributeResolver;
            this._resourceResolver = resourceResolver;
            this.displayNameBinding = ko.observable(new BindingHandler_1.default(action.displayName, attributeResolver, resourceResolver));
            this.enabledBinding = ko.observable(new BindingHandler_1.default(action.enabled, attributeResolver, resourceResolver, true));
            this.visibleBinding = ko.observable(new BindingHandler_1.default(action.visible, attributeResolver, resourceResolver, true));
            this.icon = ko.observable();
            this.isDefault = ko.observable(false);
            this.showChildPlaceholder = !!action.createChild;
            this.themeSrc = ko.observable();
            this.unwrappedAction = action;
            this.selected = ko.observable(false);
            var mappingParam = {
                ignore: ["enabled", "visible", "displayName"]
            };
            mapping.fromJS(action, mappingParam, this);
        }
        return ActionViewModel;
    }());
    ActionViewModel.getAction = function (uid) {
        return uid !== undefined ? ActionViewModel._actionCache[uid] : undefined;
    };
    ActionViewModel.getActions = function (uids) {
        var results = [];
        if (uids) {
            uids.forEach(function (uid) {
                var action = ActionViewModel._actionCache[uid];
                if (action) {
                    results.push(action);
                }
            });
        }
        return results;
    };
    ActionViewModel._actionCache = {};
    ActionViewModel._nextUid = 0;
    return ActionViewModel;
});

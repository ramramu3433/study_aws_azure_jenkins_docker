/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "CloudExplorer/TreeNode/BindingHandler", "CloudExplorer/TreeNode/BindingHandlerSet"], function (require, exports, ko, BindingHandler_1, BindingHandlerSet_1) {
    "use strict";
    var ToolbarItemViewModel = (function () {
        function ToolbarItemViewModel(toolbarItem, attributeResolver, resourceResolver, host) {
            var _this = this;
            this.displayName = ko.pureComputed(function () {
                return _this._displayNameBinding().value();
            });
            this.onClick = function () {
                _this._commandArgsBinding.resolveArguments()
                    .then(function (args) {
                    return _this._host.executeOperation(_this._commandNamespace, [args]);
                });
            };
            this.icon = toolbarItem.icon;
            this.themeSrc = toolbarItem.themeSrc;
            this._displayNameBinding = ko.observable();
            this._displayNameBinding(new BindingHandler_1.default(toolbarItem.displayName, attributeResolver, resourceResolver));
            this._displayNameBinding().updateValue();
            this._commandArgsBinding = new BindingHandlerSet_1.default(toolbarItem.boundArguments, attributeResolver, resourceResolver);
            this._commandNamespace = toolbarItem.commandNamespace;
            this._host = host;
        }
        return ToolbarItemViewModel;
    }());
    return ToolbarItemViewModel;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "CloudExplorer/TreeNode/BindingHandler"], function (require, exports, ko, BindingHandler_1) {
    "use strict";
    var PanelInfoViewModel = (function () {
        function PanelInfoViewModel(panelInfo, attributeResolver, resourceResolver) {
            var _this = this;
            this._displayNameBinding = ko.observable();
            this.displayName = ko.pureComputed(function () {
                return _this._displayNameBinding().value();
            });
            this.name = panelInfo.name;
            this.panelInfo = panelInfo;
            this.panelNamespace = panelInfo.panelNamespace;
            this.panelViewModel = panelInfo.panelViewModel;
            this._displayNameBinding(new BindingHandler_1.default(panelInfo.displayName, attributeResolver, resourceResolver));
            this._displayNameBinding().updateValue();
        }
        return PanelInfoViewModel;
    }());
    return PanelInfoViewModel;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "CloudExplorer/UI/ToolbarItemViewModel"], function (require, exports, ko, ToolbarItemViewModel) {
    "use strict";
    var ToolbarViewModel = (function () {
        function ToolbarViewModel(panelPicker, toolbarItems, resourceResolver, host) {
            var _this = this;
            this.toolbarItems = ko.observableArray([]);
            this.panelPicker = ko.observable();
            this.showPanelPicker = ko.pureComputed(function () {
                return _this.panelPicker() && _this.panelPicker().panelInfos() && _this.panelPicker().panelInfos().length > 1;
            });
            this.resolveAttributes = function (requiresAttributes) {
                return Promise.resolve({});
            };
            this.resolveSynchronousAttributes = function (requiresAttributes) {
                return Promise.resolve({});
            };
            this.panelPicker(panelPicker);
            var itemViewModels = toolbarItems.map(function (item) {
                return new ToolbarItemViewModel(item, _this, resourceResolver, host);
            });
            this.toolbarItems(itemViewModels);
        }
        return ToolbarViewModel;
    }());
    return ToolbarViewModel;
});

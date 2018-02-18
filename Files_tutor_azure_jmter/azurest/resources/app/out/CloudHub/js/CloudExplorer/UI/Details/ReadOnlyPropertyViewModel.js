/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "CloudExplorer/TreeNode/BindingHandler", "Providers/CloudExplorer/Resources/CloudExplorerResources"], function (require, exports, ko, BindingHandler_1, CloudExplorerResources) {
    "use strict";
    var ReadOnlyPropertyViewModel = (function () {
        function ReadOnlyPropertyViewModel(property, attributeResolver, resourceResolver) {
            var _this = this;
            this.uid = "Property:" + ReadOnlyPropertyViewModel._nextUid++;
            this.displayName = ko.pureComputed(function () {
                return _this.displayNameBinding().value();
            });
            this.displayValue = ko.pureComputed(function () {
                var value;
                if (_this.displayValueBinding().isLoading()) {
                    value = ReadOnlyPropertyViewModel._displayValueLoadingText;
                }
                else if (_this.displayValueBinding().updateFailed()) {
                    value = ReadOnlyPropertyViewModel._displayValueFailedText;
                }
                else {
                    value = _this.displayValueBinding().value();
                }
                return value;
            });
            this.updateValue = function () {
                _this.displayNameBinding().updateValue();
                _this.displayValueBinding().updateValue();
            };
            this.dispose = function () {
                delete ReadOnlyPropertyViewModel._propertyCache[_this.uid];
            };
            ReadOnlyPropertyViewModel._propertyCache[this.uid] = this;
            this._property = property;
            this.displayNameBinding = ko.observable(new BindingHandler_1.default(property.displayName, attributeResolver, resourceResolver));
            this.displayValueBinding = ko.observable(new BindingHandler_1.default(property.binding, attributeResolver, resourceResolver));
            this.type = ko.observable("read-only");
            ReadOnlyPropertyViewModel._initializeStaticResources(resourceResolver);
        }
        ReadOnlyPropertyViewModel._initializeStaticResources = function (resourceResolver) {
            if (ReadOnlyPropertyViewModel._displayValueLoadingText == null || ReadOnlyPropertyViewModel._displayValueFailedText == null) {
                ReadOnlyPropertyViewModel._displayValueLoadingText = "";
                ReadOnlyPropertyViewModel._displayValueFailedText = "";
                resourceResolver.resolveResources(CloudExplorerResources.namespace, ["View.PropertiesDetails.PropertyLoading", "View.PropertiesDetails.PropertyFailed"])
                    .then(function (values) {
                    ReadOnlyPropertyViewModel._displayValueLoadingText = values["View.PropertiesDetails.PropertyLoading"];
                    ReadOnlyPropertyViewModel._displayValueFailedText = values["View.PropertiesDetails.PropertyFailed"];
                });
            }
        };
        return ReadOnlyPropertyViewModel;
    }());
    ReadOnlyPropertyViewModel.getProperty = function (uid) {
        return uid !== undefined ? ReadOnlyPropertyViewModel._propertyCache[uid] : undefined;
    };
    ReadOnlyPropertyViewModel.getProperties = function (uids) {
        var results = [];
        if (uids) {
            uids.forEach(function (uid) {
                var property = ReadOnlyPropertyViewModel._propertyCache[uid];
                if (property) {
                    results.push(property);
                }
            });
        }
        return results;
    };
    ReadOnlyPropertyViewModel._propertyCache = {};
    ReadOnlyPropertyViewModel._nextUid = 0;
    return ReadOnlyPropertyViewModel;
});

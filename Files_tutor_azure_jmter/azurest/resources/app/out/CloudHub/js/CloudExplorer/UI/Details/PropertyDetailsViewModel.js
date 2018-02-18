/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "CloudExplorer/UI/Details/BaseDetailsViewModel", "Common/Debug", "Common/Utilities"], function (require, exports, ko, BaseDetailsViewModel, Debug, Utilities) {
    "use strict";
    /**
     * NodeDetailsPanel view representation
     */
    var PropertyDetailsViewModel = (function (_super) {
        __extends(PropertyDetailsViewModel, _super);
        function PropertyDetailsViewModel(resourceResolver) {
            var _this = _super.call(this, "Properties", "propertyDetailsTemplate", "View.PropertiesDetails.Name", resourceResolver) || this;
            _this.loadingMoreProperties = ko.pureComputed(function () { return false; });
            _this.properties = ko.pureComputed(function () {
                var node = _this.node();
                var props = node ? node.properties() : [];
                if (Debug.isDebug() && node) {
                    // Make a copy
                    props = props.slice();
                    var attrNames = node.getLoadedAttributeKeys();
                    // Make all attributes show up as properties
                    attrNames.forEach(function (attributeName) {
                        var attributeValue = node.getAttributeValueIfLoaded(attributeName);
                        var prop = {
                            displayName: ko.pureComputed(function () { return "DEBUG: Attr " + attributeName; }),
                            displayValue: ko.pureComputed(function () { return String(attributeValue); }),
                            uid: "Debug Property:" + Utilities.guid(),
                            type: function () { return "read-only"; },
                            updateValue: function () { }
                        };
                        props.push(prop);
                    });
                }
                return props;
            });
            _this._updateProperties = function () {
                var node = _this.node();
                if (node) {
                    node.properties().forEach(function (property) {
                        property.updateValue();
                    });
                }
            };
            _this.updateHandler = _this._updateProperties;
            return _this;
        }
        PropertyDetailsViewModel.prototype.setFocus = function () {
            var firstPropertyElem = $(".property-details .property-input").first();
            if (!!firstPropertyElem) {
                firstPropertyElem.focus();
                firstPropertyElem.select();
            }
        };
        return PropertyDetailsViewModel;
    }(BaseDetailsViewModel));
    return PropertyDetailsViewModel;
});

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "knockout", "./EntityPropertyViewModel", "../../Tables/Constants", "../../Tables/TableEntityProcessor", "../../Tables/Utilities", "../ContextualPaneBase"], function (require, exports, ko, EntityPropertyViewModel_1, TableConstants, TableEntityProcessor, Utilities, ContextualPaneBase_1) {
    "use strict";
    // Class with variables and functions that are common to both adding and editing entities
    var TableEntityPane = (function (_super) {
        __extends(TableEntityPane, _super);
        function TableEntityPane(options) {
            var _this = _super.call(this, options) || this;
            /* Labels */
            _this.attributeNameLabel = "Property Name"; // localize
            _this.dataTypeLabel = "Type"; // localize
            _this.attributeValueLabel = "Value"; // localize
            /* Controls */
            _this.removeButtonLabel = "Remove"; // localize
            _this.editButtonLabel = "Edit"; // localize
            _this.addButtonLabel = "Add Property"; // localize
            _this.edmTypes = ko.observableArray([
                TableConstants.DisplayedEdmType.String,
                TableConstants.DisplayedEdmType.Boolean,
                TableConstants.DisplayedEdmType.Binary,
                TableConstants.DisplayedEdmType.DateTime,
                TableConstants.DisplayedEdmType.Double,
                TableConstants.DisplayedEdmType.Guid,
                TableConstants.DisplayedEdmType.Int32,
                TableConstants.DisplayedEdmType.Int64
            ]);
            _this.displayedAttributes = ko.observableArray();
            _this.editingProperty = ko.observable();
            _this.isEditing = ko.observable(false);
            _this.removeAttribute = function (index, data) {
                _this.displayedAttributes.splice(index, 1);
                _this.updateIsActionEnabled();
            };
            _this.editAttribute = function (index, data) {
                _this.editingProperty(data);
                _this.isEditing(true);
            };
            _this.finishEditingAttribute = function () {
                _this.isEditing(false);
                _this.editingProperty(null);
            };
            _this.onKeyUp = function (data, event) {
                var handled = Utilities.onEsc(event, function ($sourceElement) {
                    _this.finishEditingAttribute();
                });
                return !handled;
            };
            _this.insertAttribute = function () {
                var entityProperty = new EntityPropertyViewModel_1.default(_this, "", _this.edmTypes()[0], // default to the first Edm type: 'string'
                "", // default to empty string
                /* namePlaceholder */ undefined, 
                /* valuePlaceholder */ undefined, 
                /* editable */ true, 
                /* default valid name */ false, 
                /* default valid value */ true);
                _this.displayedAttributes.push(entityProperty);
                _this.updateIsActionEnabled();
                _this.scrollToBottom();
                entityProperty.hasFocus(true);
            };
            _this.canAdd = ko.computed(function () {
                // Adding '2' to the maximum to take into account PartitionKey and RowKey
                return (_this.displayedAttributes().length < (EntityPropertyViewModel_1.default.maximumNumberOfProperties + 2));
            });
            _this.canApply = ko.observable(true);
            _this.editingProperty(_this.displayedAttributes()[0]);
            return _this;
        }
        TableEntityPane.prototype.updateIsActionEnabled = function (needRequiredFields) {
            if (needRequiredFields === void 0) { needRequiredFields = true; }
            var properties = this.displayedAttributes() || [];
            var disable = _.some(properties, function (property) {
                return property.isInvalidName() || property.isInvalidValue();
            });
            this.canApply(!disable);
        };
        TableEntityPane.prototype.entityFromAttributes = function (displayedAttributes) {
            var entity = {};
            displayedAttributes.forEach(function (attribute) {
                if (attribute.name() && ((attribute.value() !== "") || attribute.isRequired)) {
                    var value = attribute.getPropertyValue();
                    var type = Utilities.getEdmTypeNameFromDisplayedName(attribute.type());
                    if (type === TableConstants.EdmType.Int64) {
                        value = Utilities.padLongWithZeros(value);
                    }
                    entity[attribute.name()] = {
                        "_": value,
                        "$": type
                    };
                }
            });
            return entity;
        };
        // Removing Binary from Add Entity dialog until we have a full story for it.
        TableEntityPane.prototype.setOptionDisable = function (option, value) {
            ko.applyBindingsToNode(option, { disable: (value === TableConstants.DisplayedEdmType.Binary) }, value);
        };
        /**
         * Parse the updated entity to see if there are any new attributes that old headers don't have.
         * In this case, add these attributes names as new headers.
         * Remarks: adding new headers will automatically trigger table redraw.
         */
        TableEntityPane.prototype.tryInsertNewHeaders = function (viewModel, newEntity) {
            var newHeaders = [];
            Object.keys(newEntity).forEach(function (key) {
                if (!_.contains(viewModel.headers, key)
                    && key !== TableEntityProcessor.keyProperties.attachments
                    && key !== TableEntityProcessor.keyProperties.etag
                    && key !== TableEntityProcessor.keyProperties.resourceId
                    && key !== TableEntityProcessor.keyProperties.self) {
                    newHeaders.push(key);
                }
            });
            var newHeadersInserted = false;
            if (newHeaders.length) {
                viewModel.updateHeaders(viewModel.headers.concat(newHeaders), /* notifyColumnChanges */ true, /* enablePrompt */ false);
                newHeadersInserted = true;
            }
            return newHeadersInserted;
        };
        TableEntityPane.prototype.scrollToBottom = function () {
            var scrollBox = document.getElementById(this.scrollId());
            var isScrolledToBottom = scrollBox.scrollHeight - scrollBox.clientHeight <= scrollBox.scrollHeight + 1;
            if (isScrolledToBottom) {
                scrollBox.scrollTop = scrollBox.scrollHeight - scrollBox.clientHeight;
            }
        };
        return TableEntityPane;
    }(ContextualPaneBase_1.ContextualPaneBase));
    TableEntityPane.requiredFields = [
        TableConstants.EntityKeyNames.PartitionKey,
        TableConstants.EntityKeyNames.RowKey
    ];
    return TableEntityPane;
});

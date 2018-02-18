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
define(["require", "exports", "knockout", "./TableEntityPane", "../../Tables/Utilities", "../../Tables/Constants", "./EntityPropertyViewModel", "../../Tables/TableEntityProcessor"], function (require, exports, ko, TableEntityPane, Utilities, TableConstants, EntityPropertyViewModel_1, TableEntityProcessor) {
    "use strict";
    var EditTableEntityPane = (function (_super) {
        __extends(EditTableEntityPane, _super);
        function EditTableEntityPane(container) {
            var _this = _super.call(this, container) || this;
            _this.scrollId = ko.observable("editEntityScroll");
            return _this;
        }
        EditTableEntityPane.prototype.submit = function () {
            var _this = this;
            if (!this.canApply()) {
                return;
            }
            var entity = this.updateEntity(this.displayedAttributes());
            this.container.documentClientUtility.updateDocument(this.originalDocument[0], TableEntityProcessor.convertEntityToNewDocument(entity), null /*options*/).then(function (newDocument) {
                entity = TableEntityProcessor.convertDocumentsToEntities([newDocument])[0];
                var numberOfProperties = 0;
                for (var property in entity) {
                    if (property !== TableEntityProcessor.keyProperties.attachments
                        && property !== TableEntityProcessor.keyProperties.etag
                        && property !== TableEntityProcessor.keyProperties.resourceId
                        && property !== TableEntityProcessor.keyProperties.self) {
                        numberOfProperties++;
                    }
                }
                var propertiesDelta = numberOfProperties - _this.originalNumberOfProperties;
                return _this.tableViewModel.updateCachedEntity(entity).then(function () {
                    if (!_this.tryInsertNewHeaders(_this.tableViewModel, entity)) {
                        _this.tableViewModel.redrawTableThrottled();
                    }
                }).then(function () {
                    // Selecting updated entity
                    _this.tableViewModel.selected.removeAll();
                    _this.tableViewModel.selected.push(entity);
                });
            });
            this.close();
        };
        EditTableEntityPane.prototype.open = function () {
            this.displayedAttributes(this.constructDisplayedAttributes(this.originEntity));
            this.originalDocument = TableEntityProcessor.convertEntitiesToDocuments([this.originEntity], this.tableViewModel.queryTablesTab.collection);
            this.updateIsActionEnabled();
            _super.prototype.open.call(this);
        };
        EditTableEntityPane.prototype.constructDisplayedAttributes = function (entity) {
            var _this = this;
            var displayedAttributes = [];
            Object.keys(entity).forEach(function (key) {
                if (key !== TableEntityProcessor.keyProperties.attachments
                    && key !== TableEntityProcessor.keyProperties.etag
                    && key !== TableEntityProcessor.keyProperties.resourceId
                    && key !== TableEntityProcessor.keyProperties.self) {
                    var entityAttribute = entity[key];
                    var entityAttributeType = Utilities.getDisplayedNameFromEdmTypeName(entityAttribute.$);
                    var displayValue = _this.getPropertyDisplayValue(entity, key, entityAttributeType);
                    var editable = _this.isAttributeEditable(key, entityAttributeType);
                    // As per VSO:189935, Binary properties are read-only, we still want to be able to remove them.
                    var removable = (editable || (entityAttributeType === TableConstants.DisplayedEdmType.Binary));
                    displayedAttributes.push(new EntityPropertyViewModel_1.default(_this, key, entityAttributeType, displayValue, 
                    /* namePlaceholder */ undefined, 
                    /* valuePlaceholder */ undefined, _this.isAttributeEditable(key, entityAttributeType), 
                    /* default valid name */ true, 
                    /* default valid value */ true, 
                    /* isRequired */ false, removable));
                }
            });
            return displayedAttributes;
        };
        EditTableEntityPane.prototype.updateEntity = function (displayedAttributes) {
            var updatedEntity = {};
            displayedAttributes.forEach(function (attribute) {
                if (attribute.name()) {
                    var value = attribute.getPropertyValue();
                    var type = Utilities.getEdmTypeNameFromDisplayedName(attribute.type());
                    if (type === TableConstants.EdmType.Int64) {
                        value = Utilities.padLongWithZeros(value);
                    }
                    updatedEntity[attribute.name()] = {
                        "_": value,
                        "$": type
                    };
                }
            });
            return updatedEntity;
        };
        EditTableEntityPane.prototype.isAttributeEditable = function (attributeName, entityAttributeType) {
            return !(attributeName === TableConstants.EntityKeyNames.PartitionKey ||
                attributeName === TableConstants.EntityKeyNames.RowKey ||
                attributeName === TableConstants.EntityKeyNames.Timestamp ||
                // As per VSO:189935, Making Binary properties read-only in Edit Entity dialog until we have a full story for it.
                entityAttributeType === TableConstants.DisplayedEdmType.Binary);
        };
        EditTableEntityPane.prototype.getPropertyDisplayValue = function (entity, name, type) {
            var attribute = entity[name];
            var displayValue = attribute._;
            var isBinary = (type === TableConstants.DisplayedEdmType.Binary);
            // Showing the value in base64 for binary properties since that is what the Azure Storage Client Library expects.
            // This means that, even if the Azure Storage API returns a byte[] of binary content, it needs that same array
            // *base64 - encoded * as the value for the updated property or the whole update operation will fail.
            if (isBinary && displayValue && $.isArray(displayValue.data)) {
                var bytes = displayValue.data;
                displayValue = this.getBase64DisplayValue(bytes);
            }
            return displayValue;
        };
        EditTableEntityPane.prototype.getBase64DisplayValue = function (bytes) {
            var displayValue = null;
            try {
                var chars = bytes.map(function (byte) { return String.fromCharCode(byte); });
                var toEncode = chars.join("");
                displayValue = window.btoa(toEncode);
            }
            catch (error) {
                // Error
            }
            return displayValue;
        };
        return EditTableEntityPane;
    }(TableEntityPane));
    return EditTableEntityPane;
});

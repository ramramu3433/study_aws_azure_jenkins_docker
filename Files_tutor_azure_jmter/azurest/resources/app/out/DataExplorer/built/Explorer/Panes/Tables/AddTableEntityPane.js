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
define(["require", "exports", "knockout", "underscore", "../../Tables/Constants", "../../Tables/Utilities", "./EntityPropertyViewModel", "../../Tables/TableEntityProcessor", "./TableEntityPane"], function (require, exports, ko, _, TableConstants, Utilities, EntityPropertyViewModel_1, TableEntityProcessor, TableEntityPane) {
    "use strict";
    var AddTableEntityPane = (function (_super) {
        __extends(AddTableEntityPane, _super);
        function AddTableEntityPane(options) {
            var _this = _super.call(this, options) || this;
            _this.enterRequiredValueLabel = "Enter identifier value."; // localize
            _this.enterValueLabel = "Enter value to keep property."; // localize
            _this.scrollId = ko.observable("addEntityScroll");
            return _this;
        }
        AddTableEntityPane.prototype.submit = function () {
            var _this = this;
            if (!this.canApply()) {
                return;
            }
            var entity = this.entityFromAttributes(this.displayedAttributes());
            this.documentClientUtility.createDocument(this.tableViewModel.queryTablesTab.collection, TableEntityProcessor.convertEntityToNewDocument(entity), null /*options*/).then(function (newDocument) {
                var entityToCache = {};
                entity = TableEntityProcessor.convertDocumentsToEntities([newDocument])[0];
                entityToCache[TableConstants.EntityKeyNames.PartitionKey] = entity[TableConstants.EntityKeyNames.PartitionKey];
                entityToCache[TableConstants.EntityKeyNames.RowKey] = entity[TableConstants.EntityKeyNames.RowKey];
                entityToCache[TableConstants.EntityKeyNames.Timestamp] = entity[TableConstants.EntityKeyNames.Timestamp];
                Object.keys(entity).forEach(function (key) {
                    if (entityToCache[key] === undefined) {
                        entityToCache[key] = entity[key];
                    }
                });
                _this.tableViewModel.addEntityToCache(entityToCache).then(function () {
                    if (!_this.tryInsertNewHeaders(_this.tableViewModel, entityToCache)) {
                        _this.tableViewModel.redrawTableThrottled();
                    }
                });
                _this.close();
            });
        };
        AddTableEntityPane.prototype.open = function () {
            var headers = this.tableViewModel.headers;
            this.displayedAttributes(this.constructDisplayedAttributes(headers, Utilities.getDataTypesFromEntities(headers, this.tableViewModel.items())));
            this.updateIsActionEnabled();
            _super.prototype.open.call(this);
        };
        AddTableEntityPane.prototype.constructDisplayedAttributes = function (headers, dataTypes) {
            var _this = this;
            var displayedAttributes = [];
            headers.forEach(function (key) {
                if (!_.contains(AddTableEntityPane._excludedFields, key)) {
                    var isRequired = _.contains(AddTableEntityPane.requiredFields, key);
                    var editable = !_.contains(AddTableEntityPane._readonlyFields, key);
                    var placeholderLabel = (isRequired ? _this.enterRequiredValueLabel : _this.enterValueLabel);
                    var entityAttributeType = Utilities.getDisplayedNameFromEdmTypeName(dataTypes[key]) ||
                        TableConstants.DisplayedEdmType.String; // Default to String if there is no type specified.
                    var entity = new EntityPropertyViewModel_1.default(_this, key, entityAttributeType, "", // default to empty string
                    /* namePlaceholder */ undefined, placeholderLabel, editable, 
                    /* default valid name */ true, 
                    /* default valid value */ true, 
                    /* required value */ isRequired, 
                    /* removable */ editable, 
                    /* valueEditable */ true, 
                    /* ignoreEmptyValue */ true);
                    displayedAttributes.push(entity);
                }
            });
            return displayedAttributes;
        };
        return AddTableEntityPane;
    }(TableEntityPane));
    AddTableEntityPane._excludedFields = [
        TableConstants.EntityKeyNames.Timestamp
    ];
    AddTableEntityPane._readonlyFields = [
        TableConstants.EntityKeyNames.PartitionKey,
        TableConstants.EntityKeyNames.RowKey,
        TableConstants.EntityKeyNames.Timestamp
    ];
    return AddTableEntityPane;
});

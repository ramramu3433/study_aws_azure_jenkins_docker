"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var EntityEditorHelper = require("./EntityEditorHelper");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var EdmTypeDisplayName_1 = require("./EdmTypeDisplayName");
var EntityPropertyViewModel_1 = require("./EntityPropertyViewModel");
var KeyCodes_1 = require("../Common/KeyCodes");
var TableEntitySystemKey_1 = require("./TableEntitySystemKey");
/**
 * View model for the edit(insert/update) table entity dialog
 */
var EntityEditorViewModel = (function (_super) {
    tslib_1.__extends(EntityEditorViewModel, _super);
    function EntityEditorViewModel(tableReference, subtitle) {
        var _this = _super.call(this) || this;
        /* Labels */
        // Localize
        _this.titleLabel = "Add Entity";
        _this.attributeNameLabel = "Property Name";
        _this.dataTypeLabel = "Type";
        _this.attributeValueLabel = "Value";
        _this.removeButtonLabel = "Remove"; // Localize
        _this.editButtonLabel = "Edit"; // Localize
        _this.addButtonLabel = "Add Property"; // Localize
        /* Observables */
        _this.edmTypes = ko.observableArray([
            EdmTypeDisplayName_1.default.String,
            EdmTypeDisplayName_1.default.Boolean,
            EdmTypeDisplayName_1.default.Binary,
            EdmTypeDisplayName_1.default.DateTime,
            EdmTypeDisplayName_1.default.Double,
            EdmTypeDisplayName_1.default.Guid,
            EdmTypeDisplayName_1.default.Int32,
            EdmTypeDisplayName_1.default.Int64
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
        _this.onKeyup = function (data, event) {
            if (_this.isEditing()) {
                var handled = _this.onKey(event, { keyCode: KeyCodes_1.default.Esc }, function (_) {
                    _this.finishEditingAttribute();
                });
                // Let the event bubble up only if it wasn't handled.
                event.cancelBubble = handled;
                return !handled;
            }
            else {
                return true;
            }
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
            entityProperty.hasFocus(true);
        };
        document.title = "Microsoft Azure Storage Explorer - " + subtitle;
        _this.connectionString = tableReference.connectionString;
        _this.tableName = tableReference.tableName;
        _this.canApply = ko.observable(true);
        _this.canAdd = ko.computed(function () {
            // Adding '2' to the maximum to take into account PartitionKey and RowKey
            return (_this.displayedAttributes().length < (EntityPropertyViewModel_1.default.maximumNumberOfProperties + 2));
        });
        _this.editingProperty(_this.displayedAttributes()[0]);
        _this.addCancelButton();
        _this.isEditing.subscribe(function (result) {
            if (result) {
                _this.currentPanel("editor-panel");
            }
            else {
                _this.currentPanel("default-panel");
            }
        });
        return _this;
    }
    EntityEditorViewModel.prototype.updateIsActionEnabled = function (needRequiredFields) {
        if (needRequiredFields === void 0) { needRequiredFields = true; }
        var properties = this.displayedAttributes() || [];
        var disable = properties.some(function (property) { return property.isInvalidName() || property.isInvalidValue(); });
        var propertyNames = [];
        for (var i = 0; i < properties.length; i++) {
            if (propertyNames.indexOf(properties[i].name()) > -1) {
                properties[i].isInvalidName(true);
                properties[i].nameTooltip("A property with this name already exists.");
                disable = true;
            }
            propertyNames.push(properties[i].name());
        }
        this.canApply(!disable);
    };
    EntityEditorViewModel.prototype.entityFromAttributes = function (displayedAttributes) {
        var entity = {};
        displayedAttributes.forEach(function (attribute) {
            if (attribute.name() && ((attribute.value() !== "") || attribute.isRequired)) {
                entity[attribute.name()] = {
                    "_": attribute.getPropertyValue(),
                    "$": EntityEditorHelper.getEdmTypeFromDisplayName(attribute.type())
                };
            }
        });
        return entity;
    };
    /**
     * @override
     * @param message
     * @param error
     */
    EntityEditorViewModel.prototype.showError = function (message, error) {
        _super.prototype.showError.call(this, message, error);
        // Re-enable button if insert fails
        this.canApply(true);
    };
    // As per VSO:189936, Removing Binary from Add Entity dialog until we have a full story for it.
    EntityEditorViewModel.prototype.setOptionDisable = function (option, value) {
        ko.applyBindingsToNode(option, { disable: (value === EdmTypeDisplayName_1.default.Binary) }, value);
    };
    return EntityEditorViewModel;
}(DialogViewModel_1.default));
EntityEditorViewModel.requiredFields = [
    TableEntitySystemKey_1.default.PartitionKey,
    TableEntitySystemKey_1.default.RowKey
];
exports.default = EntityEditorViewModel;

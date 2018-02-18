"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var $ = require("jquery");
var EntityEditorHelper = require("./EntityEditorHelper");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var EdmTypeDisplayName_1 = require("./EdmTypeDisplayName");
var EntityPropertyViewModel_1 = require("./EntityPropertyViewModel");
var EntityEditorViewModel_1 = require("./EntityEditorViewModel");
var TableEntitySystemKey_1 = require("./TableEntitySystemKey");
/**
 * View model for the edit(insert/update) table entity dialog
 */
var EditEntityViewModel = (function (_super) {
    tslib_1.__extends(EditEntityViewModel, _super);
    function EditEntityViewModel(parameters) {
        var _this = _super.call(this, parameters, "Edit Entity") || this;
        /* Labels */
        _this.titleLabel = "Edit Entity"; // localize
        _this._originEntity = parameters.entity;
        var attributes = _this.constructDisplayedAttributes(parameters.entity);
        _this.displayedAttributes(attributes);
        _this.updateIsActionEnabled();
        _this.addCustomButton("update", "Update", function () { return _this.tryUpdate(); }, _this.canApply, undefined, undefined, 0);
        return _this;
    }
    EditEntityViewModel.prototype.constructDisplayedAttributes = function (entity) {
        var _this = this;
        var displayedAttributes = [];
        var systemAttributes = [];
        Object.keys(entity).forEach(function (key) {
            if (key.toLowerCase() !== TableEntitySystemKey_1.default.Metadata) {
                var entityAttribute = entity[key];
                var entityAttributeType = EntityEditorHelper.getDisplayNameFromEdmType(entityAttribute.$);
                var displayValue = _this.getPropertyDisplayValue(entity, key, entityAttributeType);
                var editable = _this.isAttributeEditable(key, entityAttributeType);
                // As per VSO:189935, Binary properties are read-only, we still want to be able to remove them.
                var removable = (editable || (entityAttributeType === EdmTypeDisplayName_1.default.Binary));
                var newEntityViewModel = new EntityPropertyViewModel_1.default(_this, key, entityAttributeType, displayValue, 
                /* namePlaceholder */ undefined, 
                /* valuePlaceholder */ undefined, _this.isAttributeEditable(key, entityAttributeType), 
                /* default valid name */ true, 
                /* default valid value */ true, 
                /* isRequired */ false, removable);
                // Make sure PartitionKey, RowKey, and Timestamp always appear on top in that order.
                if (key === TableEntitySystemKey_1.default.PartitionKey) {
                    systemAttributes[0] = newEntityViewModel;
                }
                else if (key === TableEntitySystemKey_1.default.RowKey) {
                    systemAttributes[1] = newEntityViewModel;
                }
                else if (key === TableEntitySystemKey_1.default.Timestamp) {
                    systemAttributes[2] = newEntityViewModel;
                }
                else {
                    displayedAttributes.push(newEntityViewModel);
                }
            }
        });
        return systemAttributes.concat(displayedAttributes);
    };
    EditEntityViewModel.prototype.getResults = function () {
        return this.updateEntity(this.displayedAttributes());
    };
    EditEntityViewModel.prototype.tryUpdate = function () {
        var _this = this;
        // Disable update button at start
        this.canApply(false);
        var entity = this.getResults();
        if (entity) {
            try {
                // Call Azure Storage to update entity
                DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.Table.updateEntity", {
                    connectionString: this.connectionString,
                    tableName: this.tableName,
                    newEntity: entity
                })
                    .then(function (result) {
                    // Dismiss dialog if save is successful
                    // Need to update the etag after updating an entity.
                    // Otherwise, next time there will be exception due to the outdated etag.
                    entity[TableEntitySystemKey_1.default.Metadata] = result;
                    _this.dialogResult(result ? entity : null);
                })
                    .catch(function (error) {
                    _this.showError("Error when calling Azure Storage:", error); // localize
                });
            }
            catch (error) {
                this.showError("Error updating table entity:", error); // localize
            }
        }
    };
    EditEntityViewModel.prototype.updateEntity = function (displayedAttributes) {
        var updatedEntity = {};
        displayedAttributes.forEach(function (attribute) {
            if (attribute.name()) {
                updatedEntity[attribute.name()] = {
                    "_": attribute.getPropertyValue(),
                    "$": EntityEditorHelper.getEdmTypeFromDisplayName(attribute.type())
                };
            }
        });
        // Add back the etag in case the update operation fails, which will result in an entity without etag.
        updatedEntity[TableEntitySystemKey_1.default.Metadata] = this._originEntity[TableEntitySystemKey_1.default.Metadata];
        return updatedEntity;
    };
    EditEntityViewModel.prototype.isAttributeEditable = function (attributeName, entityAttributeType) {
        return !(attributeName === TableEntitySystemKey_1.default.PartitionKey ||
            attributeName === TableEntitySystemKey_1.default.RowKey ||
            attributeName === TableEntitySystemKey_1.default.Timestamp ||
            // As per VSO:189935, Making Binary properties read-only in Edit Entity dialog until we have a full story for it.
            entityAttributeType === EdmTypeDisplayName_1.default.Binary);
    };
    EditEntityViewModel.prototype.getPropertyDisplayValue = function (entity, name, type) {
        var attribute = entity[name];
        var displayValue = attribute._;
        var isBinary = (type === EdmTypeDisplayName_1.default.Binary);
        // Showing the value in base64 for binary properties since that is what the Azure Storage Client Library expects.
        // This means that, even if the Azure Storage API returns a byte[] of binary content, it needs that same array
        // *base64 - encoded * as the value for the updated property or the whole update operation will fail.
        if (isBinary && displayValue && $.isArray(displayValue.data)) {
            var bytes = displayValue.data;
            displayValue = this.getBase64DisplayValue(bytes);
        }
        return displayValue;
    };
    EditEntityViewModel.prototype.getBase64DisplayValue = function (bytes) {
        var displayValue = null;
        try {
            var chars = bytes.map(function (byte) { return String.fromCharCode(byte); });
            var toEncode = chars.join("");
            displayValue = window.btoa(toEncode);
        }
        catch (error) {
            console.error("EditEntityDialog.getBase64DisplayValue", error);
        }
        return displayValue;
    };
    return EditEntityViewModel;
}(EntityEditorViewModel_1.default));
exports.default = EditEntityViewModel;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _ = require("underscore");
var EntityEditorHelper = require("./EntityEditorHelper");
var EdmTypeDisplayName_1 = require("./EdmTypeDisplayName");
var EntityPropertyViewModel_1 = require("./EntityPropertyViewModel");
var EntityEditorViewModel_1 = require("./EntityEditorViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var TableEntitySystemKey_1 = require("./TableEntitySystemKey");
/**
 * View model for the edit(insert/update) table entity dialog
 */
var AddEntityViewModel = (function (_super) {
    tslib_1.__extends(AddEntityViewModel, _super);
    function AddEntityViewModel(parameters) {
        var _this = _super.call(this, parameters, "Add Entity") || this;
        /* Labels */
        _this.titleLabel = "Add Entity"; // localize
        _this.enterRequiredValueLabel = "Enter identifier value."; // localize
        _this.enterValueLabel = "Enter value to keep property."; // localize
        _this.addCustomButton("insert", "Insert", function () { return _this.tryInsert(); }, _this.canApply, undefined, undefined, 0);
        var attributes = _this.constructDisplayedAttributes(parameters.headers, parameters.dataTypes || {});
        _this.displayedAttributes(attributes);
        _this.updateIsActionEnabled();
        return _this;
    }
    AddEntityViewModel.prototype.constructDisplayedAttributes = function (headers, dataTypes) {
        var _this = this;
        var displayedAttributes = [];
        headers.forEach(function (key) {
            if (!_.contains(AddEntityViewModel._excludedFields, key)) {
                var isRequired = _.contains(AddEntityViewModel.requiredFields, key);
                var editable = !_.contains(AddEntityViewModel._readonlyFields, key);
                var placeholderLabel = (isRequired ? _this.enterRequiredValueLabel : _this.enterValueLabel);
                var entityAttributeType = EntityEditorHelper.getDisplayNameFromEdmType(dataTypes[key]) ||
                    EdmTypeDisplayName_1.default.String; // Default to String if there is no type specified.
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
    AddEntityViewModel.prototype.getResults = function () {
        return this.entityFromAttributes(this.displayedAttributes());
    };
    AddEntityViewModel.prototype.tryInsert = function () {
        var _this = this;
        // Disable insert button at start
        this.canApply(false);
        var entity = this.getResults();
        if (entity) {
            try {
                // Call Azure Storage to insert entity
                // Dismiss dialog if save is successful.
                DialogOperationRouterProxy_1.default.executeOperation("Azure.Storage.Table.addEntity", {
                    connectionString: this.connectionString,
                    tableName: this.tableName,
                    newEntity: entity
                })
                    .then(function (result) {
                    // Adding .metadata and Timestamp to the newly created entity to manually add it to the cache and redraw the table.
                    // Alternatively, we would have had to reload the table to display the timestamp of the newly added entity
                    // (after clearing the cache, see BlobExplorerToolbarViewModel.reloadTable).
                    var metadata = result[TableEntitySystemKey_1.default.Metadata];
                    entity[TableEntitySystemKey_1.default.Metadata] = metadata;
                    entity[TableEntitySystemKey_1.default.Timestamp] = EntityEditorHelper.getTimestampFromMetadata(metadata);
                    _this.dialogResult(result ? entity : null);
                })
                    .catch(function (error) {
                    _this.showError("Error when calling Azure Storage:", error); // localize
                });
            }
            catch (error) {
                this.showError("Error adding table entity:", error); // localize
            }
        }
    };
    return AddEntityViewModel;
}(EntityEditorViewModel_1.default));
/* Constants */
AddEntityViewModel._excludedFields = [
    TableEntitySystemKey_1.default.Timestamp
];
AddEntityViewModel._readonlyFields = [
    TableEntitySystemKey_1.default.PartitionKey,
    TableEntitySystemKey_1.default.RowKey,
    TableEntitySystemKey_1.default.Timestamp
];
exports.default = AddEntityViewModel;

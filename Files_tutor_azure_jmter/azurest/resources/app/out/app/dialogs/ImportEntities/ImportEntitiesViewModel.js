"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogViewModel_1 = require("../Common/DialogViewModel");
var EdmType_1 = require("../EntityEditor/EdmType");
var EdmTypeDisplayName_1 = require("../EntityEditor/EdmTypeDisplayName");
var TableEntitySystemKey_1 = require("../EntityEditor/TableEntitySystemKey");
var EntityEditorHelper = require("../EntityEditor/EntityEditorHelper");
var EntityPropertyNameValidator = require("../EntityEditor/EntityPropertyNameValidator");
var EntityPropertyValidationCommon = require("../EntityEditor/EntityPropertyValidationCommon");
var _ = require("underscore");
var ko = require("knockout");
var Utilities = require("../../Utilities");
var readonlyFields = [
    TableEntitySystemKey_1.default.PartitionKey,
    TableEntitySystemKey_1.default.RowKey,
    TableEntitySystemKey_1.default.Timestamp
];
/**
 * TODO: [cralvord] Merge with EntityPropertyViewModel
 */
var PropertyViewModel = (function () {
    function PropertyViewModel(name, property) {
        var _this = this;
        /*Observables*/
        this.name = ko.observable("");
        this.type = ko.observable(EdmType_1.default.String);
        this.value = ko.observable("");
        this.isNameInvalid = ko.observable(true);
        this.nameTooltip = ko.observable("");
        this._originalName = name;
        this._originalValue = property._;
        this._originalType = property.$ || EdmType_1.default.String;
        this.isReadOnly = _.contains(readonlyFields, name);
        this.name.subscribe(function (newValue) {
            var result = EntityPropertyNameValidator.validate(newValue);
            _this.isNameInvalid(result.isInvalid);
            _this.nameTooltip(result.help);
        });
        this.name(name);
        var bestType;
        if (this.isReadOnly) {
            bestType = this.name() === TableEntitySystemKey_1.default.Timestamp ? EdmType_1.default.DateTime : EdmType_1.default.String;
        }
        else {
            bestType = PropertyViewModel.getBestType(this._originalValue);
        }
        this.type(bestType);
        this.value(this.getConvertedValue());
        this.displayType = ko.computed({
            read: function () { return EntityEditorHelper.getDisplayNameFromEdmType(_this.type()); },
            write: function (value) { return _this.type(EntityEditorHelper.getEdmTypeFromDisplayName(value)); }
        });
        this.type.subscribe(function (newType) {
            if (!_this.isReadOnly) {
                _this.value(_this.getConvertedValue());
            }
        });
    }
    Object.defineProperty(PropertyViewModel.prototype, "originalName", {
        get: function () {
            return this._originalName;
        },
        enumerable: true,
        configurable: true
    });
    PropertyViewModel.getBestType = function (value) {
        if (EntityPropertyValidationCommon.ValidationRegExp.Guid.test(value)) {
            return EdmType_1.default.Guid;
        }
        if (EntityPropertyValidationCommon.ValidationRegExp.Integer.test(value)) {
            if (Utilities.isSafeInteger(value)) {
                var parsedInt = parseInt(value, 10);
                if (parsedInt < EntityPropertyValidationCommon.Int64.Min || parsedInt > EntityPropertyValidationCommon.Int64.Max) {
                    return EdmType_1.default.Double;
                }
                else if (parsedInt < EntityPropertyValidationCommon.Int32.Min || parsedInt > EntityPropertyValidationCommon.Int32.Max) {
                    return EdmType_1.default.Int64;
                }
                else {
                    return EdmType_1.default.Int32;
                }
            }
            else {
                // Fallback to EDM String if the value is not a safe integer i.e. it falls outside of range (-2^53 - 1, 2^53 - 1).
                return EdmType_1.default.String;
            }
        }
        if (EntityPropertyValidationCommon.ValidationRegExp.Float.test(value)) {
            return EdmType_1.default.Double;
        }
        var boolRegex = /^"?(true|false)"?$/i;
        if (boolRegex.test(value)) {
            return EdmType_1.default.Boolean;
        }
        if (EntityPropertyValidationCommon.ValidationRegExp.DateTime.test(value)) {
            return EdmType_1.default.DateTime;
        }
        return EdmType_1.default.String;
    };
    PropertyViewModel.getDateOrString = function (value) {
        var result;
        try {
            result = new Date(value).toISOString();
        }
        catch (error) {
            result = value;
        }
        return result;
    };
    PropertyViewModel.prototype.getConvertedValue = function () {
        switch (this.type()) {
            case EdmType_1.default.Boolean:
                return this._originalValue.toLowerCase() === "true";
            case EdmType_1.default.DateTime:
                return PropertyViewModel.getDateOrString(this._originalValue);
            case EdmType_1.default.Double:
                // We should preserve original formatting, so we don't call parseFloat.
                return this._originalValue;
            case EdmType_1.default.Guid:
                return this._originalValue.replace(/[(){}]/g, "");
            case EdmType_1.default.Int32:
            case EdmType_1.default.Int64:
                return parseInt(this._originalValue, 10) || this._originalValue;
            default:
                return this._originalValue;
        }
    };
    return PropertyViewModel;
}());
/**
 * View model for the insert table entity dialog
 */
var ImportEntitiesViewModel = (function (_super) {
    tslib_1.__extends(ImportEntitiesViewModel, _super);
    function ImportEntitiesViewModel(parameters) {
        var _this = _super.call(this) || this;
        /* Labels */
        _this.titleLabel = "Import Entities"; // localize
        _this.attributeNameLabel = "Property Name"; // localize
        _this.dataTypeLabel = "Data Type"; // localize
        _this.attributeValueLabel = "Sample Value"; // localize
        _this.preserveExistingValuesLabel = "Preserve existing values when updating entities"; // localize
        _this.shouldUseNullLabel = "Treat empty string values as null"; // localize
        /* Controls */
        _this.insertButtonKey = "insert";
        _this.insertButtonLabel = "Insert"; // localize
        /* Observables */
        _this.displayEdmTypes = ko.observableArray([
            EdmTypeDisplayName_1.default.String,
            EdmTypeDisplayName_1.default.Boolean,
            EdmTypeDisplayName_1.default.Binary,
            EdmTypeDisplayName_1.default.DateTime,
            EdmTypeDisplayName_1.default.Double,
            EdmTypeDisplayName_1.default.Guid,
            EdmTypeDisplayName_1.default.Int32,
            EdmTypeDisplayName_1.default.Int64
        ]);
        _this.propertyViewModels = ko.observableArray();
        _this.preserveExistingValues = ko.observable(false);
        _this.shouldUseNull = ko.observable(false);
        var attributes = _this.initializePropertyViewModels(parameters.sampleEntity);
        _this.propertyViewModels(attributes);
        _this.canImport = ko.observable(true);
        _this.addAcceptButton(_this.insertButtonLabel, _this.canImport);
        _this.addCancelButton();
        _this.updateCanImport();
        return _this;
    }
    /**
     * @override
     */
    ImportEntitiesViewModel.prototype.getResults = function () {
        var schema = {
            treatEmptyAsNull: this.shouldUseNull(),
            insertOperation: this.preserveExistingValues() ? "merge" : "replace",
            properties: {}
        };
        this.propertyViewModels().forEach(function (propertyViewModel) {
            schema.properties[propertyViewModel.originalName] = {
                name: propertyViewModel.originalName,
                newName: propertyViewModel.name(),
                type: propertyViewModel.type(),
                skip: propertyViewModel.name() === TableEntitySystemKey_1.default.Timestamp
            };
        });
        return schema;
    };
    ;
    ImportEntitiesViewModel.prototype.initializePropertyViewModels = function (sampleEntity) {
        var _this = this;
        var propertyViewModels = [];
        for (var property in sampleEntity) {
            var viewModel = new PropertyViewModel(property, sampleEntity[property]);
            viewModel.isNameInvalid.subscribe(function (newValue) { return _this.updateCanImport(); });
            propertyViewModels.push(viewModel);
        }
        return propertyViewModels;
    };
    ImportEntitiesViewModel.prototype.updateCanImport = function () {
        this.canImport(_.all(this.propertyViewModels(), function (viewModel) { return !viewModel.isNameInvalid(); }));
    };
    return ImportEntitiesViewModel;
}(DialogViewModel_1.default));
exports.default = ImportEntitiesViewModel;

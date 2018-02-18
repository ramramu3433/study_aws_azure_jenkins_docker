"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var EntityPropertyValueValidator_1 = require("./EntityPropertyValueValidator");
var EntityPropertyNameValidator = require("./EntityPropertyNameValidator");
var ko = require("knockout");
/**
 * View model for an entity proprety
 */
var EntityPropertyViewModel = (function () {
    function EntityPropertyViewModel(actionEnabledDialog, name, type, value, namePlaceholder, valuePlaceholder, editable, defaultValidName, defaultValidValue, isRequired, removable, valueEditable, ignoreEmptyValue) {
        if (namePlaceholder === void 0) { namePlaceholder = ""; }
        if (valuePlaceholder === void 0) { valuePlaceholder = ""; }
        if (editable === void 0) { editable = false; }
        if (defaultValidName === void 0) { defaultValidName = true; }
        if (defaultValidValue === void 0) { defaultValidValue = false; }
        if (isRequired === void 0) { isRequired = false; }
        if (removable === void 0) { removable = editable; }
        if (valueEditable === void 0) { valueEditable = editable; }
        if (ignoreEmptyValue === void 0) { ignoreEmptyValue = false; }
        var _this = this;
        // Labels
        this.closeButtonLabel = "Close"; // Localize
        this.name = ko.observable(name);
        this.type = ko.observable(type);
        this.value = ko.observable(value);
        this.namePlaceholder = ko.observable(namePlaceholder);
        this.valuePlaceholder = ko.observable(valuePlaceholder);
        this.editable = editable;
        this.isRequired = isRequired;
        this.removable = removable;
        this.valueEditable = valueEditable;
        this._actionEnabledDialog = actionEnabledDialog;
        this._validator = new EntityPropertyValueValidator_1.default(isRequired);
        this.nameTooltip = ko.observable(EntityPropertyViewModel.noTooltip);
        this.isInvalidName = ko.observable(!defaultValidName);
        this.name.subscribe(function (name) { return _this.validateName(name); });
        if (!defaultValidName) {
            this.validateName(name);
        }
        this.valueTooltip = ko.observable(EntityPropertyViewModel.noTooltip);
        this.isInvalidValue = ko.observable(!defaultValidValue);
        this.value.subscribe(function (value) { return _this.validateValue(value, _this.type()); });
        if (!defaultValidValue) {
            this.validateValue(value, type);
        }
        this.type.subscribe(function (type) { return _this.validateValue(_this.value(), type); });
        this.hasFocus = ko.observable(false);
        this.valueHasFocus = ko.observable(false);
    }
    /**
     * Gets the Javascript value of the entity property based on its EDM type.
     */
    EntityPropertyViewModel.prototype.getPropertyValue = function () {
        return this._validator.parseValue(this.value(), this.type());
    };
    EntityPropertyViewModel.prototype.validateName = function (name) {
        var result = this.isInvalidNameInput(name);
        this.isInvalidName(result.isInvalid);
        this.nameTooltip(result.help);
        this.namePlaceholder(result.help);
        this._actionEnabledDialog.updateIsActionEnabled();
    };
    EntityPropertyViewModel.prototype.validateValue = function (value, type) {
        var result = this.isInvalidValueInput(value, type);
        this.isInvalidValue(result.isInvalid);
        this.valueTooltip(result.help);
        this.valuePlaceholder(result.help);
        this._actionEnabledDialog.updateIsActionEnabled();
    };
    EntityPropertyViewModel.prototype.isInvalidNameInput = function (name) {
        return EntityPropertyNameValidator.validate(name);
    };
    EntityPropertyViewModel.prototype.isInvalidValueInput = function (value, type) {
        if (this.ignoreEmptyValue && this.value() === "") {
            return { isInvalid: false, help: "" };
        }
        return this._validator.validate(value, type);
    };
    return EntityPropertyViewModel;
}());
/* Constants */
EntityPropertyViewModel.noTooltip = "";
/**
 * Maximum number of custom properties.
 * @see Azure Service Data Model https://msdn.microsoft.com/library/azure/dd179338.aspx
 */
EntityPropertyViewModel.maximumNumberOfProperties = 252;
exports.default = EntityPropertyViewModel;

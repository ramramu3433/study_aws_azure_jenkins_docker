define(["require", "exports", "knockout", "../../Tables/QueryBuilder/DateTimeUtilities", "./Validators/EntityPropertyNameValidator", "./Validators/EntityPropertyValueValidator", "../../Tables/Constants", "../../Tables/Utilities"], function (require, exports, ko, DateTimeUtilities, EntityPropertyNameValidator, EntityPropertyValueValidator, Constants, Utilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * View model for an entity proprety
     */
    var EntityPropertyViewModel = (function () {
        function EntityPropertyViewModel(tableEntityPane, name, type, value, namePlaceholder, valuePlaceholder, editable, defaultValidName, defaultValidValue, isRequired, removable, valueEditable, ignoreEmptyValue) {
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
            this.closeButtonLabel = "Close"; // localize
            this.name = ko.observable(name);
            this.type = ko.observable(type);
            this.isDateType = ko.pureComputed(function () { return _this.type() === Constants.DisplayedEdmType.DateTime; });
            if (this.isDateType()) {
                value = value ? DateTimeUtilities.getLocalDateTime(value) : value;
            }
            this.value = ko.observable(value);
            this.inputType = ko.pureComputed(function () {
                if (!_this.valueHasFocus() && !_this.value() && _this.isDateType()) {
                    return Constants.InputType.Text;
                }
                return Utilities.getInputTypeFromDisplayedName(_this.type());
            });
            this.namePlaceholder = ko.observable(namePlaceholder);
            this.valuePlaceholder = ko.observable(valuePlaceholder);
            this.editable = editable;
            this.isRequired = isRequired;
            this.removable = removable;
            this.valueEditable = valueEditable;
            this._validator = new EntityPropertyValueValidator(isRequired);
            this.tableEntityPane = tableEntityPane;
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
            var value = this.value();
            if (this.type() === Constants.DisplayedEdmType.DateTime) {
                value = DateTimeUtilities.getUTCDateTime(value);
            }
            return this._validator.parseValue(value, this.type());
        };
        EntityPropertyViewModel.prototype.validateName = function (name) {
            var result = this.isInvalidNameInput(name);
            this.isInvalidName(result.isInvalid);
            this.nameTooltip(result.help);
            this.namePlaceholder(result.help);
            this.tableEntityPane.updateIsActionEnabled();
        };
        EntityPropertyViewModel.prototype.validateValue = function (value, type) {
            var result = this.isInvalidValueInput(value, type);
            if (!result) {
                return;
            }
            this.isInvalidValue(result.isInvalid);
            this.valueTooltip(result.help);
            this.valuePlaceholder(result.help);
            this.tableEntityPane.updateIsActionEnabled();
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
    // Maximum number of custom properties, see Azure Service Data Model
    // At https://msdn.microsoft.com/library/azure/dd179338.aspx
    EntityPropertyViewModel.maximumNumberOfProperties = 252;
    exports.default = EntityPropertyViewModel;
});

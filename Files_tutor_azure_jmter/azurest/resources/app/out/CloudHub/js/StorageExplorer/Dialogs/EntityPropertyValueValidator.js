/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "Common/Errors", "Common/Utilities", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Dialogs/EntityPropertyValidationCommon"], function (require, exports, _string, Errors, Utilities, StorageExplorerConstants, EntityPropertyValidationCommon) {
    "use strict";
    /* Constants */
    var noHelp = "";
    var MaximumStringLength = 64 * 1024; // 64 KB
    var MaximumRequiredStringLength = 1 * 1024; //  1 KB
    var ValueValidator = (function () {
        function ValueValidator() {
        }
        ValueValidator.prototype.validate = function (value) {
            throw new Errors.NotImplementedFunctionError("ValueValidator.validate");
        };
        ValueValidator.prototype.parseValue = function (value) {
            return value; // default pass-thru implementation
        };
        return ValueValidator;
    }());
    var KeyValidator = (function () {
        function KeyValidator() {
        }
        KeyValidator.prototype.validate = function (value) {
            if (_string.isBlank(value) || EntityPropertyValidationCommon.ValidationRegExp.PrimaryKey.test(value)) {
                return { isInvalid: false, help: noHelp };
            }
            else {
                return { isInvalid: true, help: KeyValidator.detailedHelp };
            }
        };
        KeyValidator.prototype.parseValue = function (value) {
            return value;
        };
        return KeyValidator;
    }());
    KeyValidator.detailedHelp = "Enter a string ('/', '\\', '#', '?' and control characters not allowed)."; // Localize
    var BooleanValueValidator = (function (_super) {
        __extends(BooleanValueValidator, _super);
        function BooleanValueValidator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.detailedHelp = "Enter true or false."; // localize
            return _this;
        }
        BooleanValueValidator.prototype.validate = function (value) {
            var success = false;
            var help = noHelp;
            if (value) {
                success = EntityPropertyValidationCommon.ValidationRegExp.Boolean.test(value);
            }
            if (!success) {
                help = this.detailedHelp;
            }
            return { isInvalid: !success, help: help };
        };
        BooleanValueValidator.prototype.parseValue = function (value) {
            // OData seems to require lowercase boolean values, see http://www.odata.org/documentation/odata-version-2-0/overview/
            return (value.toString().toLowerCase() === "true");
        };
        return BooleanValueValidator;
    }(ValueValidator));
    var DateTimeValueValidator = (function (_super) {
        __extends(DateTimeValueValidator, _super);
        function DateTimeValueValidator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.detailedHelp = "Enter a date and time."; // localize
            return _this;
        }
        DateTimeValueValidator.prototype.validate = function (value) {
            var success = false;
            var help = noHelp;
            if (value) {
                // Try to parse the value to see if it is a valid date string
                var parsed = Date.parse(value);
                success = (!isNaN(parsed));
            }
            if (!success) {
                help = this.detailedHelp;
            }
            return { isInvalid: !success, help: help };
        };
        DateTimeValueValidator.prototype.parseValue = function (value) {
            var millisecondTime = Date.parse(value);
            var parsed = new Date(millisecondTime);
            return parsed;
        };
        return DateTimeValueValidator;
    }(ValueValidator));
    var DoubleValueValidator = (function (_super) {
        __extends(DoubleValueValidator, _super);
        function DoubleValueValidator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.detailedHelp = "Enter a 64-bit floating point value."; // localize
            return _this;
        }
        DoubleValueValidator.prototype.validate = function (value) {
            var success = false;
            var help = noHelp;
            if (value) {
                success = EntityPropertyValidationCommon.ValidationRegExp.Float.test(value);
            }
            if (!success) {
                help = this.detailedHelp;
            }
            return { isInvalid: !success, help: help };
        };
        DoubleValueValidator.prototype.parseValue = function (value) {
            return parseFloat(value);
        };
        return DoubleValueValidator;
    }(ValueValidator));
    var GuidValueValidator = (function (_super) {
        __extends(GuidValueValidator, _super);
        function GuidValueValidator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.detailedHelp = "Enter a 16-byte (128-bit) GUID value."; // localize
            return _this;
        }
        GuidValueValidator.prototype.validate = function (value) {
            var success = false;
            var help = noHelp;
            if (value) {
                success = EntityPropertyValidationCommon.ValidationRegExp.Guid.test(value);
            }
            if (!success) {
                help = this.detailedHelp;
            }
            return { isInvalid: !success, help: help };
        };
        return GuidValueValidator;
    }(ValueValidator));
    var IntegerValueValidator = (function (_super) {
        __extends(IntegerValueValidator, _super);
        function IntegerValueValidator(isInt64) {
            if (isInt64 === void 0) { isInt64 = true; }
            var _this = _super.call(this) || this;
            _this.detailedInt32Help = "Enter a signed 32-bit integer."; // localize
            _this.detailedInt64Help = "Enter a signed 64-bit integer, in the range (-2^53 - 1, 2^53 - 1)."; // localize
            _this.isInt64 = isInt64;
            return _this;
        }
        IntegerValueValidator.prototype.validate = function (value) {
            var success = false;
            var help = noHelp;
            if (value) {
                success = (EntityPropertyValidationCommon.ValidationRegExp.Integer.test(value) && Utilities.isSafeInteger(value));
                if (success) {
                    var intValue = parseInt(value, 10);
                    success = !isNaN(intValue);
                    if (success && !this.isInt64) {
                        success = ((EntityPropertyValidationCommon.Int32.Min <= intValue) && (intValue <= EntityPropertyValidationCommon.Int32.Max));
                    }
                }
            }
            if (!success) {
                help = ((this.isInt64) ? this.detailedInt64Help : this.detailedInt32Help);
            }
            return { isInvalid: !success, help: help };
        };
        IntegerValueValidator.prototype.parseValue = function (value) {
            return parseInt(value, 10);
        };
        return IntegerValueValidator;
    }(ValueValidator));
    // Allow all values for string type, unless the property is required, in which case an empty string is invalid.
    var StringValidator = (function (_super) {
        __extends(StringValidator, _super);
        function StringValidator(isRequired) {
            var _this = _super.call(this) || this;
            _this.detailedHelp = "Enter a value up to 64 KB in size."; // localize
            _this.isRequiredHelp = "Enter a value up to 1 KB in size."; // localize
            _this.emptyStringHelp = "Empty string."; // localize
            _this.isRequired = isRequired;
            return _this;
        }
        StringValidator.prototype.validate = function (value) {
            // Ensure we validate the string projection of value.
            value = String(value);
            var help = (this.isRequired) ? this.isRequiredHelp : this.detailedHelp;
            var success = true;
            if (success) {
                success = (value.length <= ((this.isRequired) ? MaximumRequiredStringLength : MaximumStringLength));
            }
            if (success && this.isRequired) {
                help = (value) ? noHelp : this.emptyStringHelp;
            }
            return { isInvalid: !success, help: help };
        };
        StringValidator.prototype.parseValue = function (value) {
            return String(value); // Ensure value is converted to string.
        };
        return StringValidator;
    }(ValueValidator));
    var NotSupportedValidator = (function (_super) {
        __extends(NotSupportedValidator, _super);
        function NotSupportedValidator(type) {
            var _this = _super.call(this) || this;
            _this.type = type;
            return _this;
        }
        NotSupportedValidator.prototype.validate = function (ignoredValue) {
            throw new Errors.NotSupportedError(this.getMessage());
        };
        NotSupportedValidator.prototype.parseValue = function (ignoredValue) {
            throw new Errors.NotSupportedError(this.getMessage());
        };
        NotSupportedValidator.prototype.getMessage = function () {
            var messageFormat = "Properties of type '%s' are not supported."; // localize as needed
            return _string.sprintf(messageFormat, this.type);
        };
        return NotSupportedValidator;
    }(ValueValidator));
    var PropertyValidatorFactory = (function () {
        function PropertyValidatorFactory() {
        }
        PropertyValidatorFactory.prototype.getValidator = function (type, isRequired) {
            var validator = null;
            switch (type) {
                case StorageExplorerConstants.DisplayedEdmType.Boolean:
                    validator = new BooleanValueValidator();
                    break;
                case StorageExplorerConstants.DisplayedEdmType.DateTime:
                    validator = new DateTimeValueValidator();
                    break;
                case StorageExplorerConstants.DisplayedEdmType.Double:
                    validator = new DoubleValueValidator();
                    break;
                case StorageExplorerConstants.DisplayedEdmType.Guid:
                    validator = new GuidValueValidator();
                    break;
                case StorageExplorerConstants.DisplayedEdmType.Int32:
                    validator = new IntegerValueValidator(/* isInt64 */ false);
                    break;
                case StorageExplorerConstants.DisplayedEdmType.Int64:
                    validator = new IntegerValueValidator(/* isInt64 */ true);
                    break;
                case StorageExplorerConstants.DisplayedEdmType.String:
                    validator = new StringValidator(isRequired);
                    break;
                case "Key":
                    validator = new KeyValidator();
                    break;
                default:
                    validator = new NotSupportedValidator(type);
                    break;
            }
            return validator;
        };
        return PropertyValidatorFactory;
    }());
    var EntityPropertyValueValidator = (function () {
        function EntityPropertyValueValidator(isRequired) {
            this.validators = {};
            this.validatorFactory = new PropertyValidatorFactory();
            this.isRequired = isRequired;
        }
        EntityPropertyValueValidator.prototype.validate = function (value, type) {
            var validator = this.getValidator(type);
            return (validator) ?
                validator.validate(value) :
                null; // Should not happen.
        };
        EntityPropertyValueValidator.prototype.parseValue = function (value, type) {
            var validator = this.getValidator(type);
            return (validator) ?
                validator.parseValue(value) :
                null; // Should not happen.
        };
        EntityPropertyValueValidator.prototype.getValidator = function (type) {
            var validator = this.validators[type];
            if (!validator) {
                validator = this.validatorFactory.getValidator(type, this.isRequired);
                this.validators[type] = validator;
            }
            return validator;
        };
        return EntityPropertyValueValidator;
    }());
    return EntityPropertyValueValidator;
});

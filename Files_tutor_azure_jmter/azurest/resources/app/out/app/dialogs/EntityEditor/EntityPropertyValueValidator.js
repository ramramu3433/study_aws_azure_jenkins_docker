"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _string = require("underscore.string");
var EntityEditorHelper = require("./EntityEditorHelper");
var EdmTypeDisplayName_1 = require("./EdmTypeDisplayName");
var Utilities = require("../../Utilities");
/* Constants */
var noHelp = "";
var MaximumStringLength = 64 * 1024; // 64 KB
var MaximumRequiredStringLength = 1 * 1024; //  1 KB
// #region ISO String Regex
var year = /\d{4}/.source;
var month = /[01]\d/.source;
var day = /[0-3]\d/.source;
var hour = /[0-2]\d/.source;
var minuteOrSecond = /[0-5]\d/.source;
var fractionalSecond = /\d+/.source;
var timeZone = new RegExp("[+-](" + hour + "):(" + minuteOrSecond + ")|Z").source;
var iso = new RegExp("^(" + year + ")-(" + month + ")-(" + day + ")T(" + hour + "):(" + minuteOrSecond + "):(" + minuteOrSecond + ").(" + fractionalSecond + ")(" + timeZone + ")$");
// #endregion
var ValueValidator = (function () {
    function ValueValidator() {
    }
    ValueValidator.prototype.validate = function (value) {
        throw new Error("Function 'ValueValidator.validate' is not implemented.");
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
        if (_string.isBlank(value) || EntityEditorHelper.ValidationRegExp.PrimaryKey.test(value)) {
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
    tslib_1.__extends(BooleanValueValidator, _super);
    function BooleanValueValidator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.detailedHelp = "Enter true or false."; // localize
        return _this;
    }
    BooleanValueValidator.prototype.validate = function (value) {
        var success = false;
        var help = noHelp;
        if (value) {
            success = EntityEditorHelper.ValidationRegExp.Boolean.test(value);
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
var DoubleValueValidator = (function (_super) {
    tslib_1.__extends(DoubleValueValidator, _super);
    function DoubleValueValidator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.detailedHelp = "Enter a 64-bit floating point value."; // localize
        return _this;
    }
    DoubleValueValidator.prototype.validate = function (value) {
        var success = false;
        var help = noHelp;
        if (value) {
            success = EntityEditorHelper.ValidationRegExp.Float.test(value);
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
    tslib_1.__extends(GuidValueValidator, _super);
    function GuidValueValidator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.detailedHelp = "Enter a 16-byte (128-bit) GUID value."; // localize
        return _this;
    }
    GuidValueValidator.prototype.validate = function (value) {
        var success = false;
        var help = noHelp;
        if (value) {
            success = EntityEditorHelper.ValidationRegExp.Guid.test(value);
        }
        if (!success) {
            help = this.detailedHelp;
        }
        return { isInvalid: !success, help: help };
    };
    return GuidValueValidator;
}(ValueValidator));
var IntegerValueValidator = (function (_super) {
    tslib_1.__extends(IntegerValueValidator, _super);
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
            success = (EntityEditorHelper.ValidationRegExp.Integer.test(value) && Utilities.isSafeInteger(value));
            if (success) {
                var intValue = parseInt(value, 10);
                success = !isNaN(intValue);
                if (success && !this.isInt64) {
                    success = ((EntityEditorHelper.Int32.Min <= intValue) && (intValue <= EntityEditorHelper.Int32.Max));
                }
            }
        }
        if (!success) {
            help = ((this.isInt64) ? this.detailedInt64Help : this.detailedInt32Help);
        }
        return { isInvalid: !success, help: help };
    };
    IntegerValueValidator.prototype.parseValue = function (value) {
        if (this.isInt64) {
            // Int64 values should be passed as strings and not parsed.
            return value;
        }
        else {
            return parseInt(value, 10);
        }
    };
    return IntegerValueValidator;
}(ValueValidator));
// Allow all values for string type, unless the property is required, in which case an empty string is invalid.
var StringValidator = (function (_super) {
    tslib_1.__extends(StringValidator, _super);
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
var IsoDateTimeStringValidator = (function (_super) {
    tslib_1.__extends(IsoDateTimeStringValidator, _super);
    function IsoDateTimeStringValidator() {
        var _this = _super.call(this, true) || this;
        _this.formatHelp = "Enter an ISO date time formatted string."; // Localize
        _this.dateHelp = "The ISO date time is invalid. The month, day, time, or time zone is out of range."; // Localize
        return _this;
    }
    IsoDateTimeStringValidator.prototype.validate = function (value) {
        var success = false;
        var help = this.formatHelp;
        if (value) {
            if (!iso.test(value)) {
                help = this.formatHelp;
            }
            else if (isNaN(new Date(value).getTime())) {
                help = this.dateHelp;
            }
            else {
                help = noHelp;
                success = true;
            }
        }
        return { isInvalid: !success, help: help };
    };
    return IsoDateTimeStringValidator;
}(StringValidator));
var NotSupportedValidator = (function (_super) {
    tslib_1.__extends(NotSupportedValidator, _super);
    function NotSupportedValidator(type) {
        var _this = _super.call(this) || this;
        _this.type = type;
        return _this;
    }
    NotSupportedValidator.prototype.validate = function (ignoredValue) {
        throw new Error(this.getMessage());
    };
    NotSupportedValidator.prototype.parseValue = function (ignoredValue) {
        throw new Error(this.getMessage());
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
            case EdmTypeDisplayName_1.default.Boolean:
                validator = new BooleanValueValidator();
                break;
            case EdmTypeDisplayName_1.default.DateTime:
                validator = new IsoDateTimeStringValidator();
                break;
            case EdmTypeDisplayName_1.default.Double:
                validator = new DoubleValueValidator();
                break;
            case EdmTypeDisplayName_1.default.Guid:
                validator = new GuidValueValidator();
                break;
            case EdmTypeDisplayName_1.default.Int32:
                validator = new IntegerValueValidator(/* isInt64 */ false);
                break;
            case EdmTypeDisplayName_1.default.Int64:
                validator = new IntegerValueValidator(/* isInt64 */ true);
                break;
            case EdmTypeDisplayName_1.default.String:
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
exports.default = EntityPropertyValueValidator;

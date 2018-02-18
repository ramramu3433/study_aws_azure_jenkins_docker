"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ko = require("knockout");
var _string = require("underscore.string");
var emptyValueMessage = "Empty metadata values will not be saved. Specify a value or remove the metadata.";
var onlyAsciiMessage = "Only ASCII characters are allowed for property values";
var percentNotAllowed = "The '%' character is not allowed for property or metadata values";
var FlobPropertyViewModel = (function () {
    function FlobPropertyViewModel(originalName, displayName, value, isMetadata) {
        var _this = this;
        this.originalName = originalName;
        this._originalRawValue = value;
        this._isMetadata = isMetadata;
        this.isRemoveButtonFocused = ko.observable(false);
        this.displayName = ko.observable(displayName);
        this.displayValue = ko.observable(this._allowNonAsciiCharacters ? this._decode(value) : value);
        this._originalDisplayValue = this.displayValue();
        this.deleteMetadataButton = ko.observable("Delete Metadata");
        this.nameError = ko.observable("");
        this.isNameValid = ko.pureComputed(function () { return !_this.nameError(); });
        this.valueError = ko.observable("");
        this.isValueValid = ko.pureComputed(function () { return !_this.valueError(); });
        this.isValid = ko.pureComputed(function () { return _this.isNameValid() && _this.isValueValid(); });
    }
    FlobPropertyViewModel.prototype._encode = function (s) {
        if (this.isAscii(s)) {
            return s;
        }
        var length = s.length;
        var result = "";
        for (var i = 0; i < length; ++i) {
            var c = s.charAt(i);
            var code = s.charCodeAt(i);
            if (this.isAsciiChar(code)) {
                result += c;
            }
            else {
                result += encodeURIComponent(c);
            }
        }
        return result;
    };
    FlobPropertyViewModel.prototype.isAscii = function (s) {
        return s.match(/^[\x00-\x7F]*$/);
    };
    FlobPropertyViewModel.prototype.isAsciiChar = function (code) {
        return code < 128;
    };
    FlobPropertyViewModel.prototype._decode = function (s) {
        // The value might or might not be encoded. If it decodes successfully, we'll display the decoded version
        try {
            return decodeURIComponent(s);
        }
        catch (error) {
            return s;
        }
    };
    Object.defineProperty(FlobPropertyViewModel.prototype, "_allowNonAsciiCharacters", {
        get: function () {
            return this._isMetadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FlobPropertyViewModel.prototype, "actualValue", {
        /**
         * The raw value to store in Azure (encoded if the display value contains non-ASCII characters)
         */
        get: function () {
            // If the user hasn't changed the value, then don't do any encoding/decoding - always return the original raw value unchanged
            if (this.displayValue() === this._originalDisplayValue) {
                return this._originalRawValue;
            }
            else {
                // Otherwise encode for non-ASCII if desired
                if (this._allowNonAsciiCharacters) {
                    return this._encode(this.displayValue());
                }
                else {
                    return this.displayValue();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    FlobPropertyViewModel.prototype.getValueValidationError = function () {
        if (this._isMetadata && _string.isBlank(this.displayValue())) {
            return emptyValueMessage;
        }
        else if (!this._allowNonAsciiCharacters && !this.isAscii(this.displayValue())) {
            return onlyAsciiMessage;
        }
        else if (this.displayValue().indexOf("%") >= 0) {
            return percentNotAllowed;
        }
        return null;
    };
    return FlobPropertyViewModel;
}());
exports.default = FlobPropertyViewModel;

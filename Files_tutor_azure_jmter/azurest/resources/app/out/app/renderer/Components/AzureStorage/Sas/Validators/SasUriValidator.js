"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SasTokenValidator_1 = require("./SasTokenValidator");
var SasUriValidationError_1 = require("./SasUriValidationError");
var ValidationResult_1 = require("../../../Validation/ValidationResult");
var ValidatorBase_1 = require("../../../Validation/ValidatorBase");
var _string = require("underscore.string");
var localEndpoints = {
    LocalBlobEndpoint: "http://127.0.0.1:10000/devstoreaccount1",
    LocalQueueEndpoint: "http://127.0.0.1:10001/devstoreaccount1",
    LocalTableEndpoint: "http://127.0.0.1:10002/devstoreaccount1"
};
var SasUriValidator = (function (_super) {
    tslib_1.__extends(SasUriValidator, _super);
    function SasUriValidator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SasUriValidator.prototype.validate = function (obj) {
        var result = new ValidationResult_1.default();
        result.join(this._rule_notEmpty(obj));
        result.join(this._rule_validToken(obj));
        result.join(this._rule_protocolRequired(obj));
        result.join(this._rule_hostnameRequired(obj));
        result.join(this._rule_notDevelopment(obj));
        result.join(this._rule_pathRequired(obj));
        return result;
    };
    SasUriValidator.prototype._rule_notEmpty = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.sasUri) {
            result.errors.push({ code: SasUriValidationError_1.default.UriEmpty, message: "The SAS URI is empty." });
        }
        return result;
    };
    SasUriValidator.prototype._rule_validToken = function (obj) {
        return SasTokenValidator_1.default.validate(obj.sasToken);
    };
    SasUriValidator.prototype._rule_protocolRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.protocol) {
            result.errors.push({ code: SasUriValidationError_1.default.UriMissingProtocol, message: "No protocol provided." });
        }
        return result;
    };
    SasUriValidator.prototype._rule_hostnameRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.hostname) {
            result.errors.push({ code: SasUriValidationError_1.default.UriMissingHost, message: "No hostname provided." });
        }
        return result;
    };
    SasUriValidator.prototype._rule_notDevelopment = function (obj) {
        var result = new ValidationResult_1.default();
        if (_string.startsWith(obj.resourceUri, localEndpoints.LocalBlobEndpoint) ||
            _string.startsWith(obj.resourceUri, localEndpoints.LocalQueueEndpoint) ||
            _string.startsWith(obj.resourceUri, localEndpoints.LocalTableEndpoint)) {
            result.errors.push({ code: SasUriValidationError_1.default.UnsupportedAttach, message: "Attaching to development resources is not supported." });
        }
        return result;
    };
    SasUriValidator.prototype._rule_pathRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.sasToken.isServiceToken() && _string.endsWith(obj.path, "/")) {
            result.errors.push({ code: SasUriValidationError_1.default.UriMissingPath, message: "Missing path in service SAS URI. The path identifies the resource." });
        }
        return result;
    };
    return SasUriValidator;
}(ValidatorBase_1.default));
var instance = new SasUriValidator();
exports.default = instance;

"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SasTokenValidationError_1 = require("./SasTokenValidationError");
var ValidationResult_1 = require("../../../Validation/ValidationResult");
var ValidatorBase_1 = require("../../../Validation/ValidatorBase");
var SasTokenValidator = (function (_super) {
    tslib_1.__extends(SasTokenValidator, _super);
    function SasTokenValidator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SasTokenValidator.prototype.validate = function (obj) {
        var result = new ValidationResult_1.default();
        result.join(this._rule_notEmpty(obj));
        result.join(this._rule_signatureParameterRequired(obj));
        result.join(this._rule_versionParameterRequired(obj));
        result.join(this._rule_identifierOrExpiryParameterRequired(obj));
        result.join(this._rule_permissionsParameterRequired(obj));
        result.join(this._rule_notExpired(obj));
        result.join(this._rule_servicesParameterRequired(obj));
        result.join(this._rule_resourceTypesParameterRequired(obj));
        result.join(this._rule_hasServiceLevelAccess(obj));
        result.join(this._rule_hasAccountRequiredPermissions(obj));
        result.join(this._rule_resourceParameterRequired(obj));
        result.join(this._rule_notBlobResource(obj));
        result.join(this._rule_hasBlobRequiredPermissions(obj));
        result.join(this._rule_notFileResource(obj));
        result.join(this._rule_hasFileRequiredPermissions(obj));
        result.join(this._rule_hasQueueRequiredPermissions(obj));
        result.join(this._rule_tableNameParameterRequired(obj));
        result.join(this._rule_hasTableRequiredPermissions(obj));
        return result;
    };
    SasTokenValidator.prototype._rule_notEmpty = function (obj) {
        var result = new ValidationResult_1.default();
        if (Object.getOwnPropertyNames(obj.token).length === 0) {
            result.errors.push({ code: SasTokenValidationError_1.default.TokenEmpty, message: "The SAS token is empty." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_signatureParameterRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.signature) {
            result.errors.push({ code: SasTokenValidationError_1.default.MissingParamSignature, message: "Missing required parameter 'sig' in SAS token." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_versionParameterRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.version) {
            result.errors.push({ code: SasTokenValidationError_1.default.MissingParamVersion, message: "Missing required parameter 'sv' in SAS token." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_identifierOrExpiryParameterRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.identifier && !obj.expiration) {
            result.errors.push({ code: SasTokenValidationError_1.default.MissingParamExpiryOrIdentifier, message: "Missing required parameter 'se' or 'si' in SAS token." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_permissionsParameterRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.identifier && !obj.permissions) {
            result.errors.push({ code: SasTokenValidationError_1.default.MissingParamPermissions, message: "Missing required parameter 'sp' in SAS token." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_notExpired = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isExpired()) {
            result.errors.push({ code: SasTokenValidationError_1.default.Expired, message: "The SAS token has expired." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_servicesParameterRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isAccountToken() && !obj.services) {
            result.errors.push({ code: SasTokenValidationError_1.default.MissingParamServices, message: "Missing required parameter 'ss' in SAS token." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_resourceTypesParameterRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isAccountToken() && !obj.resourceTypes) {
            result.errors.push({ code: SasTokenValidationError_1.default.MissingParamResourceTypes, message: "Missing required parameter 'srt' in SAS token." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_hasServiceLevelAccess = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isAccountToken() && !obj.hasResourceTypeAccess("s")) {
            result.errors.push({ code: SasTokenValidationError_1.default.InadequateAccountResourceTypeAccess, message: "Inadequate resource type access. At least service-level ('s') access is required." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_hasAccountRequiredPermissions = function (obj) {
        var result = new ValidationResult_1.default();
        if ((obj.isAccountToken() || obj.isBlobServiceToken() || obj.isFileServiceToken()) && !obj.hasPermission("l")) {
            result.errors.push({ code: SasTokenValidationError_1.default.InadequateAccountPermissions, message: "Inadequate permissions in SAS token. At least list ('l') permission is required." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_resourceParameterRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if ((obj.isBlobServiceToken() || obj.isFileServiceToken()) && !obj.resource) {
            result.errors.push({ code: SasTokenValidationError_1.default.MissingParamResource, message: "Missing required parameter 'sr' in SAS token." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_notBlobResource = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isBlobServiceToken() && !obj.isResource("c")) {
            result.errors.push({ code: SasTokenValidationError_1.default.UnsupportedAttach, message: "Invalid resource in SAS token. Only blob container ('c') resources are supported." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_hasBlobRequiredPermissions = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isBlobServiceToken() && !obj.hasPermission("l")) {
            result.errors.push({ code: SasTokenValidationError_1.default.InadequateBlobPermissions, message: "Inadequate permissions in SAS token. At least list ('l') permission is required." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_notFileResource = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isFileServiceToken() && !obj.isResource("s")) {
            result.errors.push({ code: SasTokenValidationError_1.default.UnsupportedAttach, message: "Invalid resource in SAS token. Only file share ('s') resources are supported." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_hasFileRequiredPermissions = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isFileServiceToken() && !obj.hasPermission("l")) {
            result.errors.push({ code: SasTokenValidationError_1.default.InadequateFilePermissions, message: "Inadequate permissions in SAS token. At least list ('l') permission is required." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_hasQueueRequiredPermissions = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isQueueServiceToken() && !obj.hasPermission("r")) {
            result.errors.push({ code: SasTokenValidationError_1.default.InadequateQueuePermissions, message: "Inadequate permissions in SAS token. At least read ('r') permissions required." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_tableNameParameterRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isTableServiceToken() && !obj.tableName) {
            result.errors.push({ code: SasTokenValidationError_1.default.MissingParamTableName, message: "Missing required parameter 'tn' in SAS token." });
        }
        return result;
    };
    SasTokenValidator.prototype._rule_hasTableRequiredPermissions = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.isTableServiceToken() && !obj.hasPermission("r")) {
            result.errors.push({ code: SasTokenValidationError_1.default.InadequateTablePermissions, message: "Inadequate permissions in SAS token. At least query ('r') permissions required." });
        }
        return result;
    };
    return SasTokenValidator;
}(ValidatorBase_1.default));
var instance = new SasTokenValidator();
exports.default = instance;

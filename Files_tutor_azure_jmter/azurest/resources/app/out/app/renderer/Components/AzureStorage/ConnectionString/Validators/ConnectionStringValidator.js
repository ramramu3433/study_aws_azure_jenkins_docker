"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SasTokenValidator_1 = require("../../Sas/Validators/SasTokenValidator");
var ConnectionStringValidationError_1 = require("./ConnectionStringValidationError");
var ValidationResult_1 = require("../../../Validation/ValidationResult");
var ValidatorBase_1 = require("../../../Validation/ValidatorBase");
var url = require("url");
var ConnectionStringValidator = (function (_super) {
    tslib_1.__extends(ConnectionStringValidator, _super);
    function ConnectionStringValidator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConnectionStringValidator.prototype.validate = function (obj) {
        var result = new ValidationResult_1.default();
        result.join(this._rule_notEmpty(obj));
        result.join(this._rule_notDevelopment(obj));
        result.join(this._rule_keyOrTokenRequired(obj));
        result.join(this._rule_validBlobEndpoint(obj));
        result.join(this._rule_validFileEndpoint(obj));
        result.join(this._rule_validQueueEndpoint(obj));
        result.join(this._rule_validTableEndpoint(obj));
        result.join(this._rule_validToken(obj));
        result.join(this._rule_accountNameRequired(obj));
        result.join(this._rule_endpointRequired(obj));
        result.join(this._rule_blobServiceAccessRequired(obj));
        result.join(this._rule_fileServiceAccessRequired(obj));
        result.join(this._rule_queueServiceAccessRequired(obj));
        result.join(this._rule_tableServiceAccessRequired(obj));
        return result;
    };
    ConnectionStringValidator.prototype._rule_notEmpty = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.inputString) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.ConnectionStringEmpty, message: "The connection string is empty." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_notDevelopment = function (obj) {
        var result = new ValidationResult_1.default();
        if (obj.useDevelopmentStorage) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.UnsupportedAttach, message: "Attaching to development resources is not supported." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_keyOrTokenRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.accountKey && !obj.getSAS()) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.MissingAccountKeyOrToken, message: "Missing key or SAS token in connection string." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_validBlobEndpoint = function (obj) {
        var result = new ValidationResult_1.default();
        if (!!obj.blobEndpoint && !this._isValidEndpoint(obj.blobEndpoint)) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.InvalidEndpoint, message: "The blob endpoint is invalid." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_validFileEndpoint = function (obj) {
        var result = new ValidationResult_1.default();
        if (!!obj.fileEndpoint && !this._isValidEndpoint(obj.fileEndpoint)) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.InvalidEndpoint, message: "The file endpoint is invalid." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_validQueueEndpoint = function (obj) {
        var result = new ValidationResult_1.default();
        if (!!obj.queueEndpoint && !this._isValidEndpoint(obj.queueEndpoint)) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.InvalidEndpoint, message: "The queue endpoint is invalid." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_validTableEndpoint = function (obj) {
        var result = new ValidationResult_1.default();
        if (!!obj.tableEndpoint && !this._isValidEndpoint(obj.tableEndpoint)) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.InvalidEndpoint, message: "The table endpoint is invalid." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_validToken = function (obj) {
        var result = new ValidationResult_1.default();
        if (!!obj.getSAS()) {
            result.join(SasTokenValidator_1.default.validate(obj.token));
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_accountNameRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!!obj.accountKey && !obj.accountName) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.MissingAccountName, message: "Missing account name in connection string." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_endpointRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.accountKey && !obj.blobEndpoint && !obj.fileEndpoint && !obj.queueEndpoint && !obj.tableEndpoint) {
            result.errors.push({ code: ConnectionStringValidationError_1.default.MissingEndpoint, message: "The connection string does not have any endpoints." });
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_blobServiceAccessRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.accountKey && !!obj.blobEndpoint) {
            if (obj.token.isAccountToken()) {
                if (!obj.token.hasServiceAccess("b")) {
                    result.errors.push({ code: ConnectionStringValidationError_1.default.InadequateAccountServiceAccess, message: "Inadequate service access in SAS token. At least blob ('b') service access required." });
                }
            }
            else if (!obj.token.isBlobServiceToken()) {
                result.errors.push({ code: ConnectionStringValidationError_1.default.EndpointTokenMismatch, message: "SAS token is not suitable for blob services. Use another endpoint type." });
            }
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_fileServiceAccessRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.accountKey && !!obj.fileEndpoint) {
            if (obj.token.isAccountToken()) {
                if (!obj.token.hasServiceAccess("f")) {
                    result.errors.push({ code: ConnectionStringValidationError_1.default.InadequateAccountServiceAccess, message: "Inadequate service access in SAS token. At least file ('f') service access required." });
                }
            }
            else if (!obj.token.isFileServiceToken()) {
                result.errors.push({ code: ConnectionStringValidationError_1.default.EndpointTokenMismatch, message: "SAS token is not suitable for file services. Use another endpoint type." });
            }
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_queueServiceAccessRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.accountKey && !!obj.queueEndpoint) {
            if (obj.token.isAccountToken()) {
                if (!obj.token.hasServiceAccess("q")) {
                    result.errors.push({ code: ConnectionStringValidationError_1.default.InadequateAccountServiceAccess, message: "Inadequate service access in SAS token. At least queue ('q') service access required." });
                }
            }
            else if (!obj.token.isQueueServiceToken()) {
                result.errors.push({ code: ConnectionStringValidationError_1.default.EndpointTokenMismatch, message: "SAS token is not suitable for queue services. Use another endpoint type." });
            }
        }
        return result;
    };
    ConnectionStringValidator.prototype._rule_tableServiceAccessRequired = function (obj) {
        var result = new ValidationResult_1.default();
        if (!obj.accountKey && !!obj.tableEndpoint) {
            if (obj.token.isAccountToken()) {
                if (!obj.token.hasServiceAccess("t")) {
                    result.errors.push({ code: ConnectionStringValidationError_1.default.InadequateAccountServiceAccess, message: "Inadequate service access in SAS token. At least table ('t') service access required." });
                }
            }
            else if (!obj.token.isTableServiceToken()) {
                result.errors.push({ code: ConnectionStringValidationError_1.default.EndpointTokenMismatch, message: "SAS token is not suitable for table services. Use another endpoint type." });
            }
        }
        return result;
    };
    ConnectionStringValidator.prototype._isValidEndpoint = function (uri) {
        var parsedUri = url.parse(uri, true);
        var protocol = parsedUri.protocol;
        var hostname = parsedUri.hostname;
        var path = parsedUri.pathname;
        var query = parsedUri.query;
        return !!protocol && !!hostname && path === "/" && Object.getOwnPropertyNames(query).length === 0;
    };
    return ConnectionStringValidator;
}(ValidatorBase_1.default));
var instance = new ConnectionStringValidator();
exports.default = instance;

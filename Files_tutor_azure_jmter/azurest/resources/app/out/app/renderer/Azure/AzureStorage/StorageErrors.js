"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _string = require("underscore.string");
var Utilities = require("../../../Utilities");
var errorNames;
(function (errorNames) {
    errorNames.ActionCanceledError = "ActionCanceledError";
    errorNames.AuthenticationFailedError = "AuthenticationFailedError";
    errorNames.AuthorizationServiceMismatchError = "AuthorizationServiceMismatch";
    errorNames.TableQuerySyntaxError = "TableQuerySyntaxError";
    errorNames.TableQuerySemanticError = "TableQuerySemanticError";
    errorNames.DestinationExistsError = "DestinationExistsError";
    errorNames.HostNotFoundError = "HostNotFoundError";
    errorNames.NotFoundError = "NotFoundError";
    errorNames.NullArgumentError = "NullArgumentError";
    errorNames.NullOrEmptyArgumentError = "NullOrEmptyArgumentError";
    errorNames.PageBlobInvalidSizeError = "PageBlobInvalidSizeError";
    errorNames.ParentNotFoundError = "ParentNotFoundError";
    errorNames.QueueAlreadyExistsError = "QueueAlreadyExistsError";
    errorNames.VersionNotSupportedByEmulator = "VersionNotSupportedByEmulator";
    errorNames.NetworkTimeoutError = "NetworkTimeoutError";
    errorNames.ArgumentError = "ArgumentError";
    errorNames.PolicyAlreadyExistsError = "PolicyAlreadyExistsError";
    errorNames.InvalidResourceNameError = "InvalidResourceNameError";
})(errorNames = exports.errorNames || (exports.errorNames = {}));
// Wraps the error in a host error for Daytona to de/serialize it correctly.
function ToHostError(error) {
    error["source"] = "Host";
    return error;
}
var ActionCanceledError = (function () {
    function ActionCanceledError(message) {
        this.name = errorNames.ActionCanceledError;
        this.message = message;
    }
    ActionCanceledError.getHostErrorInstance = function (message) {
        return ToHostError(new ActionCanceledError(message));
    };
    return ActionCanceledError;
}());
exports.ActionCanceledError = ActionCanceledError;
var ParentNotFoundError = (function () {
    function ParentNotFoundError(message) {
        if (message === void 0) { message = "The specified parent path does not exist."; }
        this.name = errorNames.ParentNotFoundError;
        this.message = message;
    }
    ParentNotFoundError.getHostErrorInstance = function (message) {
        return ToHostError(new ParentNotFoundError(message));
    };
    return ParentNotFoundError;
}());
exports.ParentNotFoundError = ParentNotFoundError;
var DestinationExistsError = (function () {
    function DestinationExistsError() {
        this.name = errorNames.DestinationExistsError;
        this.message = this.name;
    }
    return DestinationExistsError;
}());
exports.DestinationExistsError = DestinationExistsError;
var PageBlobInvalidSize = (function () {
    function PageBlobInvalidSize() {
        this.name = errorNames.PageBlobInvalidSizeError;
        this.message = this.name;
    }
    return PageBlobInvalidSize;
}());
exports.PageBlobInvalidSize = PageBlobInvalidSize;
var HostNotFoundError = (function () {
    function HostNotFoundError(host) {
        this.name = errorNames.HostNotFoundError;
        var message = host ?
            _string.sprintf(HostNotFoundError.hostNotFoundMessageTemplate, host) :
            HostNotFoundError.hostNotFoundMessage;
        this.message = message;
    }
    return HostNotFoundError;
}());
HostNotFoundError.hostNotFoundMessageTemplate = "Unable to connect to \"%s\". Please check your network and try again."; // localize
HostNotFoundError.hostNotFoundMessage = "Unable to connect to host. Please check your network and try again."; // localize
exports.HostNotFoundError = HostNotFoundError;
var NotFoundError = (function () {
    function NotFoundError() {
        this.name = errorNames.NotFoundError;
        // localize
        this.message = "Resource not found. Do you have the required permissions?";
    }
    return NotFoundError;
}());
exports.NotFoundError = NotFoundError;
var AuthenticationFailedError = (function () {
    function AuthenticationFailedError(authenticationerrordetail) {
        this.name = errorNames.AuthenticationFailedError;
        this.message = AuthenticationFailedError.messagePrefix + (authenticationerrordetail || "");
    }
    return AuthenticationFailedError;
}());
AuthenticationFailedError.messagePrefix = "Authentication Error. "; // localize
exports.AuthenticationFailedError = AuthenticationFailedError;
var AuthorizationServiceMismatchError = (function () {
    function AuthorizationServiceMismatchError(message) {
        this.name = errorNames.AuthorizationServiceMismatchError;
        this.message = message;
    }
    return AuthorizationServiceMismatchError;
}());
exports.AuthorizationServiceMismatchError = AuthorizationServiceMismatchError;
var NullArgumentError = (function () {
    function NullArgumentError(parameterName) {
        this.name = errorNames.NullArgumentError;
        var messageFormat = "Parameter %s is not instantiated.";
        this.message = _string.sprintf(messageFormat, parameterName);
    }
    return NullArgumentError;
}());
exports.NullArgumentError = NullArgumentError;
var NullOrEmptyArgumentError = (function () {
    function NullOrEmptyArgumentError(parameterName) {
        this.name = errorNames.NullOrEmptyArgumentError;
        this.message = _string.sprintf(NullOrEmptyArgumentError.messageFormat, parameterName);
    }
    NullOrEmptyArgumentError.getHostErrorInstance = function (parameterName) {
        var error = new NullOrEmptyArgumentError(parameterName);
        return ToHostError(error);
    };
    return NullOrEmptyArgumentError;
}());
NullOrEmptyArgumentError.messageFormat = "Value cannot be null or empty. Parameter name: '%s'"; // localize
exports.NullOrEmptyArgumentError = NullOrEmptyArgumentError;
var TableQuerySyntaxError = (function () {
    function TableQuerySyntaxError(query) {
        this.name = errorNames.TableQuerySyntaxError;
        this.message = "There is a syntax error in the table query. Please correct it and try again."; // localize
        this.query = query;
    }
    TableQuerySyntaxError.getHostErrorInstance = function (query) {
        var error = new TableQuerySyntaxError(query);
        return ToHostError(error);
    };
    return TableQuerySyntaxError;
}());
exports.TableQuerySyntaxError = TableQuerySyntaxError;
var TableQuerySemanticError = (function () {
    function TableQuerySemanticError(query) {
        this.name = errorNames.TableQuerySemanticError;
        this.message = "The query contains an error. This could be caused by missing quotes or other typographical errors."; // localize
        this.query = query;
    }
    TableQuerySemanticError.getHostErrorInstance = function (query) {
        var error = new TableQuerySemanticError(query);
        return ToHostError(error);
    };
    return TableQuerySemanticError;
}());
exports.TableQuerySemanticError = TableQuerySemanticError;
var VersionNotSupportedByEmulatorError = (function () {
    function VersionNotSupportedByEmulatorError(message) {
        this.name = errorNames.VersionNotSupportedByEmulator;
        this.message = message;
    }
    return VersionNotSupportedByEmulatorError;
}());
exports.VersionNotSupportedByEmulatorError = VersionNotSupportedByEmulatorError;
var QueueAlreadyExistsError = (function () {
    function QueueAlreadyExistsError(requestId, date) {
        this.name = errorNames.QueueAlreadyExistsError;
        // To make it consistent with blob container and table
        // mimic their error message format for resources already existing.
        // localize
        this.messageFormat = "The specified queue already exists." +
            Utilities.getEnvironmentNewLine() +
            "RequestId: %s" +
            Utilities.getEnvironmentNewLine() +
            "Time: %s";
        var displayedDate = new Date(date).toISOString();
        this.message = _string.sprintf(this.messageFormat, requestId, displayedDate);
    }
    return QueueAlreadyExistsError;
}());
exports.QueueAlreadyExistsError = QueueAlreadyExistsError;
var NetworkTimeoutError = (function () {
    function NetworkTimeoutError(error) {
        this.name = errorNames.NetworkTimeoutError;
        this.message = "A network error occurred" // Localize
            + " (NetworkTimeoutError: " + (error.message || error.code || error.errno) + ")";
    }
    return NetworkTimeoutError;
}());
exports.NetworkTimeoutError = NetworkTimeoutError;
var InvalidResourceNameError = (function () {
    function InvalidResourceNameError() {
        this.name = errorNames.InvalidResourceNameError;
        this.message = "The specified directory name contains invalid characters.";
    }
    return InvalidResourceNameError;
}());
exports.InvalidResourceNameError = InvalidResourceNameError;
var ArgumentError = (function () {
    function ArgumentError(parameterName, message) {
        if (message === void 0) { message = null; }
        this.name = errorNames.ArgumentError;
        this.parameterName = parameterName;
        this.message = _string.sprintf(ArgumentError.messageFormat, (message || ArgumentError.defaultMessage), parameterName);
    }
    ArgumentError.getHostErrorInstance = function (parameterName, message) {
        var error = new ArgumentError(parameterName, message);
        return ToHostError(error);
    };
    return ArgumentError;
}());
ArgumentError.defaultMessage = "Invalid argument."; // localize
ArgumentError.messageFormat = "%s\r\nParameter name: '%s'"; // localize
exports.ArgumentError = ArgumentError;
var PolicyAlreadyExistsError = (function (_super) {
    tslib_1.__extends(PolicyAlreadyExistsError, _super);
    function PolicyAlreadyExistsError(policyIdParameterName, policyId) {
        var _this = _super.call(this, policyIdParameterName, _string.sprintf(PolicyAlreadyExistsError.policyExistsMessageFormat, policyId)) || this;
        _this.name = errorNames.PolicyAlreadyExistsError;
        return _this;
    }
    PolicyAlreadyExistsError.getHostErrorInstance = function (policyIdParameterName, policyId) {
        var error = new PolicyAlreadyExistsError(policyIdParameterName, policyId);
        return ToHostError(error);
    };
    return PolicyAlreadyExistsError;
}(ArgumentError));
PolicyAlreadyExistsError.policyExistsMessageFormat = "A policy with the same ID already exists: '%s'"; // localize;
exports.PolicyAlreadyExistsError = PolicyAlreadyExistsError;

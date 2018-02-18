"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _string = require("underscore.string");
exports.errorNames = {
    ActionableError: "ActionableError",
    ActiveLeaseError: "ActiveLeaseError",
    AuthenticationNeededError: "AuthenticationNeededError",
    ArgumentOutOfRangeError: "ArgumentOutOfRangeError",
    DestinationExistsError: "DestinationExistsError",
    DisplayableError: "DisplayableError",
    FunctionNotFoundError: "FunctionNotFoundError",
    HostOperationError: "HostOperationError",
    InvalidNamespaceError: "InvalidNamespaceError",
    InvalidOperationError: "InvalidOperationError",
    NotImplementedFunctionError: "NotImplementedFunctionError",
    NotSupportedError: "NotSupportedError",
    NullArgumentError: "NullArgumentError",
    OperationNotFoundError: "OperationNotFoundError",
    PageBlobInvalidSize: "PageBlobInvalidSizeError",
    ParentNotFoundError: "ParentNotFoundError",
    ProviderNotFoundError: "ProviderNotFoundError",
    QueryManagerNotFoundError: "QueryManagerNotFoundError",
    ResourceNamespaceNotFoundError: "ResourceNamespaceNotFoundError",
    ResourceNotFoundError: "ResourceNotFoundError",
    TryableActionError: "TryableActionError"
};
var ActionableError = (function () {
    function ActionableError(error, message, link, actionNamespace, args) {
        this.name = exports.errorNames.ActionableError;
        this.innerError = error;
        this.message = message;
        this.link = link;
        this.actionNamespace = actionNamespace;
        this.args = args;
    }
    ActionableError.prototype.toString = function () {
        return this.message;
    };
    return ActionableError;
}());
exports.ActionableError = ActionableError;
/**
 * An error that user can try taking action on.
 */
var TryableActionError = (function (_super) {
    tslib_1.__extends(TryableActionError, _super);
    function TryableActionError(error, message, link, actionNamespace, args) {
        var _this = _super.call(this, error, message, link, actionNamespace, args) || this;
        _this.name = exports.errorNames.TryableActionError;
        return _this;
    }
    TryableActionError.prototype.toString = function () {
        return this.message;
    };
    return TryableActionError;
}(ActionableError));
exports.TryableActionError = TryableActionError;
/**
 * ArgumentOutOfRangeError
 */
var ArgumentOutOfRangeError = (function () {
    function ArgumentOutOfRangeError(argumentName, actualValue) {
        this.name = exports.errorNames.ArgumentOutOfRangeError;
        // TODO: Put this string into global resource manager.
        this.message = "Specified argument was out of the range of valid values.";
        if (argumentName) {
            this.message += " Parameter name: " + argumentName + ".";
            if (actualValue) {
                this.message += " Actual value was " + actualValue;
            }
        }
    }
    ArgumentOutOfRangeError.prototype.toString = function () {
        return this.message;
    };
    return ArgumentOutOfRangeError;
}());
exports.ArgumentOutOfRangeError = ArgumentOutOfRangeError;
var DestinationExistsError = (function () {
    function DestinationExistsError(message, error) {
        this.name = exports.errorNames.DestinationExistsError;
        this.error = error;
        this.message = message;
    }
    DestinationExistsError.prototype.toString = function () {
        return this.message;
    };
    return DestinationExistsError;
}());
exports.DestinationExistsError = DestinationExistsError;
var DisplayableError = (function () {
    function DisplayableError(message, error) {
        this.name = exports.errorNames.DisplayableError;
        this.error = error;
        this.message = message;
    }
    DisplayableError.prototype.toString = function () {
        return this.message;
    };
    return DisplayableError;
}());
exports.DisplayableError = DisplayableError;
var FunctionNotFoundError = (function () {
    function FunctionNotFoundError(functionName) {
        this.name = exports.errorNames.FunctionNotFoundError;
        // TODO: Put this string into global resource manager.
        var messageFormat = "Function '%s' not found.";
        this.message = _string.sprintf(messageFormat, functionName);
    }
    FunctionNotFoundError.prototype.toString = function () {
        return this.message;
    };
    return FunctionNotFoundError;
}());
exports.FunctionNotFoundError = FunctionNotFoundError;
var InvalidNamespaceError = (function () {
    function InvalidNamespaceError(namespace, correctFormat) {
        this.name = exports.errorNames.InvalidNamespaceError;
        // TODO: Put this string into global resource manager.
        var messageFormat = "Namespace '%s' is invalid. Correct format is: %s.";
        this.message = _string.sprintf(messageFormat, namespace, correctFormat);
    }
    InvalidNamespaceError.prototype.toString = function () {
        return this.message;
    };
    return InvalidNamespaceError;
}());
exports.InvalidNamespaceError = InvalidNamespaceError;
var InvalidOperationError = (function () {
    function InvalidOperationError(operationName) {
        this.name = exports.errorNames.InvalidOperationError;
        var messageFormat = "Operation %s is invalid.";
        this.message = _string.sprintf(messageFormat, operationName);
    }
    return InvalidOperationError;
}());
exports.InvalidOperationError = InvalidOperationError;
var NotImplementedFunctionError = (function () {
    function NotImplementedFunctionError(functionName) {
        this.name = exports.errorNames.NotImplementedFunctionError;
        // TODO: Put this string into global resource manager.
        var messageFormat = "Function '%s' is not implemented.";
        this.message = _string.sprintf(messageFormat, functionName);
    }
    NotImplementedFunctionError.prototype.toString = function () {
        return this.message;
    };
    return NotImplementedFunctionError;
}());
exports.NotImplementedFunctionError = NotImplementedFunctionError;
var NotSupportedError = (function () {
    function NotSupportedError(message) {
        if (message === void 0) { message = null; }
        this.name = exports.errorNames.NotSupportedError;
        if (message) {
            this.message = message;
        }
        else {
            this.message = "Specified function is not supported"; // localize as needed
        }
    }
    NotSupportedError.prototype.toString = function () {
        return this.message;
    };
    return NotSupportedError;
}());
exports.NotSupportedError = NotSupportedError;
var NullArgumentError = (function () {
    function NullArgumentError(parameterName) {
        this.name = exports.errorNames.NullArgumentError;
        // TODO: Put this string into global resource manager.
        var messageFormat = "Parameter '%s' is not instantiated.";
        this.message = _string.sprintf(messageFormat, parameterName);
    }
    NullArgumentError.prototype.toString = function () {
        return this.message;
    };
    return NullArgumentError;
}());
exports.NullArgumentError = NullArgumentError;
var OperationNotFoundError = (function () {
    function OperationNotFoundError(operationName) {
        this.name = exports.errorNames.OperationNotFoundError;
        // TODO: Put this string into global resource manager.
        var messageFormat = "Operation '%s' not found";
        this.message = _string.sprintf(messageFormat, operationName);
    }
    OperationNotFoundError.prototype.toString = function () {
        return this.message;
    };
    return OperationNotFoundError;
}());
exports.OperationNotFoundError = OperationNotFoundError;
var ProviderNotFoundError = (function () {
    function ProviderNotFoundError(providerName) {
        this.name = exports.errorNames.ProviderNotFoundError;
        // TODO: Put this string into global resource manager.
        var messageFormat = "Provider not found. Name: %s";
        this.message = _string.sprintf(messageFormat, providerName);
    }
    ProviderNotFoundError.prototype.toString = function () {
        return this.message;
    };
    return ProviderNotFoundError;
}());
exports.ProviderNotFoundError = ProviderNotFoundError;
var QueryManagerNotFoundError = (function () {
    function QueryManagerNotFoundError(queryManagerName) {
        this.name = exports.errorNames.QueryManagerNotFoundError;
        // TODO: Put this string into global resource manager.
        var messageFormat = "Query manager '%s' not found.";
        this.message = _string.sprintf(messageFormat, queryManagerName);
    }
    QueryManagerNotFoundError.prototype.toString = function () {
        return this.message;
    };
    return QueryManagerNotFoundError;
}());
exports.QueryManagerNotFoundError = QueryManagerNotFoundError;
var ResourceNamespaceNotFoundError = (function () {
    function ResourceNamespaceNotFoundError(namespace) {
        this.name = exports.errorNames.ResourceNamespaceNotFoundError;
        // TODO: Put this string into global resource manager.
        var messageFormat = "Resource Namespace '%s' not found";
        this.message = _string.sprintf(messageFormat, namespace);
    }
    ResourceNamespaceNotFoundError.prototype.toString = function () {
        return this.message;
    };
    return ResourceNamespaceNotFoundError;
}());
exports.ResourceNamespaceNotFoundError = ResourceNamespaceNotFoundError;
var ResourceNotFoundError = (function () {
    function ResourceNotFoundError(resourceId, namespace) {
        this.name = exports.errorNames.ResourceNotFoundError;
        // TODO: Put this string into global resource manager.
        var ids = resourceId.toString().split(",").map(function (value) { return "'" + value + "'"; }).join(", ");
        this.message = "At least one resource ID was not found in namespace '" + namespace + "': " + ids;
    }
    ResourceNotFoundError.prototype.toString = function () {
        return this.message;
    };
    return ResourceNotFoundError;
}());
exports.ResourceNotFoundError = ResourceNotFoundError;

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string"], function (require, exports, _string) {
    "use strict";
    /**
     * Collection of errors used across the apps.
     */
    var Errors;
    (function (Errors) {
        var errorNames;
        (function (errorNames) {
            errorNames.ActionableError = "ActionableError";
            errorNames.ActiveLeaseError = "ActiveLeaseError";
            errorNames.AuthenticationNeededError = "AuthenticationNeededError";
            errorNames.ArgumentOutOfRangeError = "ArgumentOutOfRangeError";
            errorNames.DestinationExistsError = "DestinationExistsError";
            errorNames.DisplayableError = "DisplayableError";
            errorNames.FunctionNotFoundError = "FunctionNotFoundError";
            errorNames.HostOperationError = "HostOperationError";
            errorNames.InvalidNamespaceError = "InvalidNamespaceError";
            errorNames.InvalidOperationError = "InvalidOperationError";
            errorNames.NotImplementedFunctionError = "NotImplementedFunctionError";
            errorNames.NotSupportedError = "NotSupportedError";
            errorNames.NullArgumentError = "NullArgumentError";
            errorNames.OperationNotFoundError = "OperationNotFoundError";
            errorNames.PageBlobInvalidSize = "PageBlobInvalidSizeError";
            errorNames.ParentNotFoundError = "ParentNotFoundError";
            errorNames.ProviderNotFoundError = "ProviderNotFoundError";
            errorNames.QueryManagerNotFoundError = "QueryManagerNotFoundError";
            errorNames.ResourceNamespaceNotFoundError = "ResourceNamespaceNotFoundError";
            errorNames.ResourceNotFoundError = "ResourceNotFoundError";
            errorNames.TryableActionError = "TryableActionError";
        })(errorNames = Errors.errorNames || (Errors.errorNames = {}));
        var ActionableError = (function () {
            function ActionableError(error, message, link, actionNamespace, args) {
                this.name = errorNames.ActionableError;
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
        Errors.ActionableError = ActionableError;
        /**
         * An error that user can try taking action on.
         */
        var TryableActionError = (function (_super) {
            __extends(TryableActionError, _super);
            function TryableActionError(error, message, link, actionNamespace, args) {
                var _this = _super.call(this, error, message, link, actionNamespace, args) || this;
                _this.name = errorNames.TryableActionError;
                return _this;
            }
            TryableActionError.prototype.toString = function () {
                return this.message;
            };
            return TryableActionError;
        }(ActionableError));
        Errors.TryableActionError = TryableActionError;
        /**
         * ArgumentOutOfRangeError
         */
        var ArgumentOutOfRangeError = (function () {
            function ArgumentOutOfRangeError(argumentName, actualValue) {
                this.name = errorNames.ArgumentOutOfRangeError;
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
        Errors.ArgumentOutOfRangeError = ArgumentOutOfRangeError;
        var DestinationExistsError = (function () {
            function DestinationExistsError(message, error) {
                this.name = errorNames.DestinationExistsError;
                this.error = error;
                this.message = message;
            }
            DestinationExistsError.prototype.toString = function () {
                return this.message;
            };
            return DestinationExistsError;
        }());
        Errors.DestinationExistsError = DestinationExistsError;
        var DisplayableError = (function () {
            function DisplayableError(message, error) {
                this.name = errorNames.DisplayableError;
                this.error = error;
                this.message = message;
            }
            DisplayableError.prototype.toString = function () {
                return this.message;
            };
            return DisplayableError;
        }());
        Errors.DisplayableError = DisplayableError;
        var FunctionNotFoundError = (function () {
            function FunctionNotFoundError(functionName) {
                this.name = errorNames.FunctionNotFoundError;
                // TODO: Put this string into global resource manager.
                var messageFormat = "Function '%s' not found.";
                this.message = _string.sprintf(messageFormat, functionName);
            }
            FunctionNotFoundError.prototype.toString = function () {
                return this.message;
            };
            return FunctionNotFoundError;
        }());
        Errors.FunctionNotFoundError = FunctionNotFoundError;
        var InvalidNamespaceError = (function () {
            function InvalidNamespaceError(namespace, correctFormat) {
                this.name = errorNames.InvalidNamespaceError;
                // TODO: Put this string into global resource manager.
                var messageFormat = "Namespace '%s' is invalid. Correct format is: %s.";
                this.message = _string.sprintf(messageFormat, namespace, correctFormat);
            }
            InvalidNamespaceError.prototype.toString = function () {
                return this.message;
            };
            return InvalidNamespaceError;
        }());
        Errors.InvalidNamespaceError = InvalidNamespaceError;
        var InvalidOperationError = (function () {
            function InvalidOperationError(operationName) {
                this.name = errorNames.InvalidOperationError;
                var messageFormat = "Operation %s is invalid.";
                this.message = _string.sprintf(messageFormat, operationName);
            }
            return InvalidOperationError;
        }());
        Errors.InvalidOperationError = InvalidOperationError;
        var NotImplementedFunctionError = (function () {
            function NotImplementedFunctionError(functionName) {
                this.name = errorNames.NotImplementedFunctionError;
                // TODO: Put this string into global resource manager.
                var messageFormat = "Function '%s' is not implemented.";
                this.message = _string.sprintf(messageFormat, functionName);
            }
            NotImplementedFunctionError.prototype.toString = function () {
                return this.message;
            };
            return NotImplementedFunctionError;
        }());
        Errors.NotImplementedFunctionError = NotImplementedFunctionError;
        var NotSupportedError = (function () {
            function NotSupportedError(message) {
                if (message === void 0) { message = null; }
                this.name = errorNames.NotSupportedError;
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
        Errors.NotSupportedError = NotSupportedError;
        var NullArgumentError = (function () {
            function NullArgumentError(parameterName) {
                this.name = errorNames.NullArgumentError;
                // TODO: Put this string into global resource manager.
                var messageFormat = "Parameter '%s' is not instantiated.";
                this.message = _string.sprintf(messageFormat, parameterName);
            }
            NullArgumentError.prototype.toString = function () {
                return this.message;
            };
            return NullArgumentError;
        }());
        Errors.NullArgumentError = NullArgumentError;
        var OperationNotFoundError = (function () {
            function OperationNotFoundError(operationName) {
                this.name = errorNames.OperationNotFoundError;
                // TODO: Put this string into global resource manager.
                var messageFormat = "Operation '%s' not found";
                this.message = _string.sprintf(messageFormat, operationName);
            }
            OperationNotFoundError.prototype.toString = function () {
                return this.message;
            };
            return OperationNotFoundError;
        }());
        Errors.OperationNotFoundError = OperationNotFoundError;
        var ProviderNotFoundError = (function () {
            function ProviderNotFoundError(functionName) {
                this.name = errorNames.ProviderNotFoundError;
                // TODO: Put this string into global resource manager.
                var messageFormat = "Provider not found for operation '%s'";
                this.message = _string.sprintf(messageFormat, functionName);
            }
            ProviderNotFoundError.prototype.toString = function () {
                return this.message;
            };
            return ProviderNotFoundError;
        }());
        Errors.ProviderNotFoundError = ProviderNotFoundError;
        var QueryManagerNotFoundError = (function () {
            function QueryManagerNotFoundError(queryManagerName) {
                this.name = errorNames.QueryManagerNotFoundError;
                // TODO: Put this string into global resource manager.
                var messageFormat = "Query manager '%s' not found.";
                this.message = _string.sprintf(messageFormat, queryManagerName);
            }
            QueryManagerNotFoundError.prototype.toString = function () {
                return this.message;
            };
            return QueryManagerNotFoundError;
        }());
        Errors.QueryManagerNotFoundError = QueryManagerNotFoundError;
        var ResourceNamespaceNotFoundError = (function () {
            function ResourceNamespaceNotFoundError(namespace) {
                this.name = errorNames.ResourceNamespaceNotFoundError;
                // TODO: Put this string into global resource manager.
                var messageFormat = "Resource Namespace '%s' not found";
                this.message = _string.sprintf(messageFormat, namespace);
            }
            ResourceNamespaceNotFoundError.prototype.toString = function () {
                return this.message;
            };
            return ResourceNamespaceNotFoundError;
        }());
        Errors.ResourceNamespaceNotFoundError = ResourceNamespaceNotFoundError;
        var ResourceNotFoundError = (function () {
            function ResourceNotFoundError(resourceId, namespace) {
                this.name = errorNames.ResourceNotFoundError;
                // TODO: Put this string into global resource manager.
                var ids = resourceId.toString().split(",").map(function (value) { return "'" + value + "'"; }).join(", ");
                this.message = "At least one resource ID was not found in namespace '" + namespace + "': " + ids;
            }
            ResourceNotFoundError.prototype.toString = function () {
                return this.message;
            };
            return ResourceNotFoundError;
        }());
        Errors.ResourceNotFoundError = ResourceNotFoundError;
    })(Errors || (Errors = {}));
    return Errors;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "q"], function (require, exports, Q) {
    "use strict";
    var DaytonaHostProxy = (function () {
        function DaytonaHostProxy() {
            var _this = this;
            this.onThemeChange = function (callback) {
                _this._themeChangeHandler = callback;
            };
            this.executeOperation = function (operationNamespace, args) {
                var marshallerInfo = _this._parseMarshallerNamespace(operationNamespace);
                if (!marshallerInfo) {
                    return _this.executeProviderOperation(operationNamespace, (args && args.length) ? args[0] : undefined);
                }
                return _this._callMarshaler(marshallerInfo.marshaller, marshallerInfo.functionName, args);
            };
            this.executeProviderOperation = function (operationNamespace, args) {
                return _this._executeOperationUnsafe("HostProxy", "executeOperation", [operationNamespace, args]);
            };
            this._executeOperationUnsafe = function (marshalerName, functionName, args) {
                return _this._callMarshaler(_this._marshallers[marshalerName], functionName, args);
            };
            this._parseMarshallerNamespace = function (marshallerNamespace) {
                var operationParts = marshallerNamespace ? marshallerNamespace.split(".") : [];
                if (operationParts.length !== 2) {
                    return null;
                }
                var marshallerName = operationParts[0];
                return {
                    marshaller: _this._marshallers[marshallerName],
                    functionName: operationParts[1]
                };
            };
            this._marshallers = {
                Environment: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Environment", {}, true),
                HostProxy: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("HostProxy", {}, true),
                Telemetry: Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Telemetry", {}, true)
            };
            Microsoft.Plugin.Theme.addEventListener("themechanged", function (event) {
                if (!!_this._themeChangeHandler) {
                    _this.executeOperation("Environment.Theming.getTheme").then(function (newTheme) {
                        _this._themeChangeHandler(newTheme);
                    });
                }
            });
        }
        DaytonaHostProxy.prototype._callMarshaler = function (marshaler, functionName, args) {
            var defer = Q.defer();
            marshaler._call.apply(marshaler, [functionName].concat(args))
                .then(function (json) {
                var resultOrError;
                try {
                    resultOrError = JSON.parse(json);
                }
                catch (e) {
                    defer.reject(e);
                }
                if (resultOrError.type === "error") {
                    defer.reject(resultOrError.error);
                }
                else {
                    defer.resolve(resultOrError.result);
                }
            })
                .then(null, function (operationError) {
                defer.reject(operationError);
            });
            return defer.promise;
        };
        return DaytonaHostProxy;
    }());
    return DaytonaHostProxy;
});

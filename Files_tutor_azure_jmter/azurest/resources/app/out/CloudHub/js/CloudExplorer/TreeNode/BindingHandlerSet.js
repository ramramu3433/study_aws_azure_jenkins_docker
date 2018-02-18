/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "./BindingHandler", "es6-promise"], function (require, exports, BindingHandler_1, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    var BindingHandlerSet = (function () {
        function BindingHandlerSet(boundArguments, attributeResolver, resourceResolver) {
            var _this = this;
            this.resolveArguments = function () {
                if (!_this._boundArgumentHandlers) {
                    _this._boundArgumentHandlers = {};
                    if (_this._boundArguments) {
                        for (var boundArgumentName in _this._boundArguments) {
                            var boundArgument = _this._boundArguments[boundArgumentName];
                            _this._boundArgumentHandlers[boundArgumentName] = new BindingHandler_1.default(boundArgument, _this._attributeResolver, _this._resourceResolver);
                        }
                    }
                }
                var updatePromises = [];
                for (var boundArgumentHandlerName in _this._boundArgumentHandlers) {
                    updatePromises.push(_this.updateBoundArgument(boundArgumentHandlerName));
                }
                return Promise.all(updatePromises).then(function (keyValuePairs) {
                    var resolverArgumentObject = {};
                    keyValuePairs.forEach(function (keyValuePair) {
                        resolverArgumentObject[keyValuePair.key] = keyValuePair.value;
                    });
                    return resolverArgumentObject;
                });
            };
            this.updateBoundArgument = function (name) {
                return _this._boundArgumentHandlers[name].updateValue().then(function (value) {
                    return {
                        key: name,
                        value: value
                    };
                });
            };
            this._attributeResolver = attributeResolver;
            this._boundArguments = boundArguments;
            this._resourceResolver = resourceResolver;
        }
        return BindingHandlerSet;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BindingHandlerSet;
});

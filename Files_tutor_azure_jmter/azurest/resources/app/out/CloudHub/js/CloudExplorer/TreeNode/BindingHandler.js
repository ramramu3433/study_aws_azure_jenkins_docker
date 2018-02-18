/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "es6-promise", "Common/Debug", "./BindingHandlerSet"], function (require, exports, ko, rsvp, Debug, BindingHandlerSet_1) {
    "use strict";
    var Promise = rsvp.Promise;
    var BindingHandler = (function () {
        function BindingHandler(binding, attributeResolver, resourceResolver, defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            var _this = this;
            this.isLoading = ko.observable(false);
            this.updateFailed = ko.observable(false);
            this.value = ko.observable();
            this.updateValue = function () {
                if (!_this._updatePromise) {
                    // Set isLoading to 'true' only if we failed before to
                    // avoid blinking UI because of binding refreshes.
                    if (_this.updateFailed()) {
                        _this.isLoading(true);
                    }
                    var promise = _this._updateFunction()
                        .then(function (value) {
                        _this.value(value);
                        _this.updateFailed(false);
                        return value;
                    }, function (error) {
                        Debug.error(error);
                        // TODO: enable when all warnings fixed: Debug.fail(error);
                        _this.updateFailed(true);
                    });
                    _this._updatePromise = promise;
                    promise.then(function () {
                        _this.isLoading(false);
                        _this._updatePromise = null;
                    });
                }
                return _this._updatePromise;
            };
            this._createExpressionEvaluator = function (expressionBinding) {
                var names = expressionBinding.requires.slice();
                names.push("return " + expressionBinding.expression + ";");
                var f = Function.apply(null, names);
                return f;
            };
            this._getUpdateFunction = function () {
                var updateFunction = _this._evaluateNoOp;
                if (_this._binding) {
                    if (_this._binding.attribute) {
                        updateFunction = _this._evaluateAttribute;
                    }
                    else if (_this._binding.expression) {
                        updateFunction = _this._evaluateExpression;
                    }
                    else if (_this._binding.resource) {
                        updateFunction = _this._evaluateResource;
                    }
                    else if (_this._binding.boundArguments) {
                        updateFunction = _this._evaluateBoundArguments;
                    }
                }
                return updateFunction;
            };
            this._evaluateAttribute = function () {
                return _this._attributeResolver
                    .resolveAttributes([_this._binding.attribute])
                    .then(function (attributeValues) { return attributeValues[_this._binding.attribute]; });
            };
            this._evaluateExpression = function () {
                if (!_this._expressionFunction) {
                    _this._expressionFunction = _this._createExpressionEvaluator(_this._binding.expression);
                }
                return _this._attributeResolver
                    .resolveAttributes(_this._binding.expression.requires)
                    .then(function (attributeValues) {
                    var args = new Array(_this._binding.expression.requires.length);
                    _this._binding.expression.requires.forEach(function (value, index) {
                        args[index] = attributeValues[value];
                    });
                    return _this._expressionFunction.apply(null, args);
                });
            };
            this._evaluateNoOp = function () { return Promise.resolve(_this.value()); };
            this._evaluateResource = function () {
                var res = _this._binding.resource;
                return _this._resourceResolver.resolveResource(res.namespace, res.resourceId);
            };
            this._evaluateBoundArguments = function () {
                if (!_this._bindingHandlerSet) {
                    // var BindingHandlerSet = require("CloudExplorer/TreeNode/BindingHandlerSet");
                    _this._bindingHandlerSet = new BindingHandlerSet_1.default(_this._binding.boundArguments, _this._attributeResolver, _this._resourceResolver);
                }
                return _this._bindingHandlerSet.resolveArguments();
            };
            this._attributeResolver = attributeResolver;
            this._binding = binding;
            this._resourceResolver = resourceResolver;
            this._updateFunction = this._getUpdateFunction();
            if (binding && binding.value !== undefined) {
                this.value(binding.value);
            }
            else if (binding && binding.synchronousAttribute !== undefined) {
                var synchronousAttribute = this._attributeResolver.resolveSynchronousAttributes([binding.synchronousAttribute])[binding.synchronousAttribute];
                if (!!synchronousAttribute) {
                    this.value(synchronousAttribute.value);
                }
                else {
                    this.value(defaultValue);
                }
            }
            else {
                this.value(defaultValue);
            }
        }
        return BindingHandler;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BindingHandler;
});

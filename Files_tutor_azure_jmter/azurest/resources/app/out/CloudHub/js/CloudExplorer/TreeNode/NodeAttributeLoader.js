/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "CloudExplorer/TreeNode/NodeAttribute", "CloudExplorer/TreeNode/BindingHandlerSet"], function (require, exports, rsvp, NodeAttribute, BindingHandlerSet_1) {
    "use strict";
    var Promise = rsvp.Promise;
    /*
     * This class handles executing an Attribute Loader as specified in the Node Config
     */
    var NodeAttributeLoader = (function () {
        function NodeAttributeLoader(loaderConfig, host, attributeResolver, resourceResolver) {
            var _this = this;
            this.getAttribute = function (attributeName) {
                _this._initialize();
                return _this._attributes[attributeName];
            };
            this.getAttributeValue = function (attributeName) {
                _this._initialize();
                return _this._attributes[attributeName].getValue();
            };
            this._initialize = function () {
                if (_this._initialized) {
                    return;
                }
                _this._bindingHandlerSet = new BindingHandlerSet_1.default(_this._attributeLoaderConfig.boundArguments, _this._attributeResolver, _this._resourceResolver);
                _this._attributeLoaderConfig.provides.forEach(function (attributeName) {
                    _this._attributes[attributeName] = new NodeAttribute(attributeName, _this._invokeAttributeLoader);
                });
                _this._initialized = true;
            };
            this._invokeAttributeLoader = function () {
                if (_this._invokeAttributeLoaderPromise) {
                    return _this._invokeAttributeLoaderPromise;
                }
                _this._invokeAttributeLoaderPromise = _this._bindingHandlerSet.resolveArguments().then(function (boundArguments) {
                    return _this._host.executeAttributeLoader(_this._attributeLoaderConfig.namespace, boundArguments)
                        .then(function (attributeLoaderResults) {
                        if (attributeLoaderResults.error) {
                            return Promise.reject(attributeLoaderResults.error);
                        }
                        else {
                            var attributes = attributeLoaderResults.results;
                            attributes.forEach(function (attribute) {
                                var nodeAttribute = _this._attributes[attribute.name];
                                if (nodeAttribute) {
                                    nodeAttribute.updateValue(attribute);
                                }
                                else {
                                }
                            });
                            _this._invokeAttributeLoaderPromise = null;
                            return Promise.resolve(attributes);
                        }
                    });
                });
                return _this._invokeAttributeLoaderPromise;
            };
            this._attributes = {};
            this._attributeLoaderConfig = loaderConfig;
            this._attributeResolver = attributeResolver;
            this._host = host;
            this._resourceResolver = resourceResolver;
        }
        return NodeAttributeLoader;
    }());
    return NodeAttributeLoader;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "underscore", "CloudExplorer/TreeNode/NodeAttributeLoader"], function (require, exports, rsvp, underscore, NodeAttributeLoader) {
    "use strict";
    var Promise = rsvp.Promise;
    /*
     * This class manages all of the Attributes and Attribute Loaders for a given Node
     */
    var NodeAttributeResolver = (function () {
        function NodeAttributeResolver(attributes, loaderConfig, host, resourceResolver) {
            var _this = this;
            this._initialize = function () {
                if (_this._initialized) {
                    return;
                }
                _this._initialAttributes.forEach(function (attribute) {
                    _this._attributeMap[attribute.name] = attribute;
                });
                _this._loaderConfig.forEach(function (loader) {
                    var attributeLoader = new NodeAttributeLoader(loader, _this._host, _this, _this._resourceResolver);
                    loader.provides.forEach(function (attributeName) { return _this._attributeLoaderMapping[attributeName] = attributeLoader; });
                });
                _this._initialized = true;
            };
            this.resolveAttributes = function (requiresAttributes) {
                _this._initialize();
                var attributePromises = [];
                requiresAttributes.forEach(function (attribute) {
                    var initialAttributeValue = _this._attributeMap[attribute];
                    if (initialAttributeValue && (!initialAttributeValue.expiration || Date.now() < initialAttributeValue.expiration)) {
                        attributePromises.push(Promise.resolve(initialAttributeValue));
                    }
                    else {
                        var loader = _this._attributeLoaderMapping[attribute];
                        if (loader) {
                            attributePromises.push(loader.getAttribute(attribute).getValue());
                        }
                        else {
                            attributePromises.push(Promise.reject("No attribute loader for: " + attribute));
                        }
                    }
                });
                return Promise.all(attributePromises).then(function (attributes) {
                    var attributeValues = {};
                    attributes.forEach(function (attribute) {
                        attributeValues[attribute.name] = attribute.value;
                    });
                    return attributeValues;
                });
            };
            this.resolveSynchronousAttributes = function (requiresAttributes) {
                var attributeValues = {};
                requiresAttributes.forEach(function (attribute) {
                    attributeValues[attribute] = _this.getAttributeValueIfLoaded(attribute);
                });
                return attributeValues;
            };
            this.getAttributeValueIfLoaded = function (name) {
                _this._initialize();
                var initialAttributeValue = _this._attributeMap[name];
                if (initialAttributeValue && (!initialAttributeValue.expiration || Date.now() < initialAttributeValue.expiration)) {
                    return initialAttributeValue;
                }
                else {
                    var loader = _this._attributeLoaderMapping[name];
                    if (loader) {
                        var attribute = loader.getAttribute(name);
                        return attribute.getValueIfLoaded();
                    }
                }
            };
            this.getLoadedAttributeKeys = function () {
                _this._initialize();
                // TODO make more efficient (track which are loaded)
                return underscore.keys(_this.getLoadedAttributeValues());
            };
            this.getLoadedAttributeValues = function () {
                _this._initialize();
                // TODO make more efficient (track which are loaded)
                var attributeNames = underscore.keys(_this._attributeMap).concat(underscore.keys(_this._attributeLoaderMapping));
                var results = {};
                attributeNames.forEach(function (attributeName) {
                    var value = _this.getAttributeValueIfLoaded(attributeName);
                    if (value) {
                        results[attributeName] = value;
                    }
                });
                return results;
            };
            this.setAttribute = function (attribute) {
                _this._initialize();
                _this._attributeMap[attribute.name] = attribute;
            };
            this.expireAttributes = function () {
                _this._initialize();
                var dynamicAttributes = underscore.keys(_this._attributeLoaderMapping);
                dynamicAttributes.forEach(function (attributeName) {
                    var initialValue = _this._attributeMap[attributeName];
                    var attributeLoader = _this._attributeLoaderMapping[attributeName];
                    if (initialValue) {
                        initialValue.expiration = Date.now() - 1;
                    }
                    if (attributeLoader) {
                        attributeLoader.getAttribute(attributeName).expire();
                    }
                });
            };
            this._initialAttributes = attributes || [];
            this._attributeLoaderMapping = {};
            this._attributeMap = {};
            this._host = host;
            this._loaderConfig = loaderConfig || [];
            this._resourceResolver = resourceResolver;
        }
        return NodeAttributeResolver;
    }());
    return NodeAttributeResolver;
});

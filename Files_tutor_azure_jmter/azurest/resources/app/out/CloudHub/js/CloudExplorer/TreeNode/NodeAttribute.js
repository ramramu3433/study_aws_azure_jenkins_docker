/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "CloudExplorer/TreeNode/NodeAttributeSubscription"], function (require, exports, rsvp, NodeAttributeSubscription) {
    "use strict";
    var Promise = rsvp.Promise;
    var NodeAttribute = (function () {
        function NodeAttribute(name, refreshCallback) {
            var _this = this;
            this.subscribe = function (callback) {
                var subscription = new NodeAttributeSubscription(callback, _this.unsubscribe);
                _this._subscriptions[subscription.id] = subscription;
                return subscription;
            };
            this.unsubscribe = function (subscription) {
                _this._subscriptions[subscription.id].dispose();
                delete _this._subscriptions[subscription.id];
            };
            this.getValue = function () {
                if (_this.hasValue() && !_this.isExpired()) {
                    return Promise.resolve(_this._attribute);
                }
                else {
                    return _this._refreshCallback().then(function () {
                        if (_this.hasValue() && !_this.isExpired()) {
                            return Promise.resolve(_this._attribute);
                        }
                        else {
                            // TODO Handle Error
                            return Promise.reject("Failed to load attribute: " + _this._name);
                        }
                    });
                }
            };
            this.getValueIfLoaded = function () {
                return _this._attribute;
            };
            this.hasValue = function () {
                return !!_this._attribute;
            };
            this.isExpired = function () {
                return _this._attribute.expiration && Date.now() > _this._attribute.expiration;
            };
            this.expire = function () {
                if (_this._attribute) {
                    _this._attribute.expiration = Date.now() - 1;
                }
            };
            this.updateValue = function (attribute) {
                _this._attribute = attribute;
                for (var key in _this._subscriptions) {
                    _this._subscriptions[key].notify(_this);
                }
            };
            this._refreshCallback = refreshCallback;
            this._name = name;
        }
        return NodeAttribute;
    }());
    return NodeAttribute;
});

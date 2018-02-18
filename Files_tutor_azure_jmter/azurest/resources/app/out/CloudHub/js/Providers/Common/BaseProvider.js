/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Common/Errors", "Common/FrameHostProxy"], function (require, exports, rsvp, Errors, FrameHostProxy_1) {
    "use strict";
    var Promise = rsvp.Promise;
    var BaseProvider = (function () {
        function BaseProvider(appNamespace, host) {
            var _this = this;
            this._functionMapping = {};
            /**
             * Initializes the provider. Child classes should invoke base implementation
             */
            this.initialize = function () {
                _this.host.sendInitializationMessage();
                return Promise.resolve();
            };
            this.addActionBinding = function (namespace, executeActionFunction) {
                _this._functionMapping[namespace] = executeActionFunction;
            };
            this.addAttributeLoaderBinding = function (namespace, executeFunction) {
                _this._functionMapping[namespace] = executeFunction;
            };
            this.addProducerBinding = function (namespace, executeQueryFunction) {
                _this._functionMapping[namespace] = executeQueryFunction;
            };
            this.addResourceBinding = function (namespace, getResourceFunction) {
                _this._functionMapping[namespace] = getResourceFunction;
            };
            this.addFunctionBinding = function (namespace, func) {
                _this._functionMapping[namespace] = func;
            };
            this.getFunction = function (exportId) {
                return _this._functionMapping[exportId];
            };
            this.getResourceValues = function (exportId, resourceIds) {
                var value;
                var getResourceFunction = _this._functionMapping[exportId];
                if (getResourceFunction) {
                    value = getResourceFunction(resourceIds);
                }
                else {
                    throw new Errors.ResourceNamespaceNotFoundError(exportId);
                }
                return value;
            };
            this.namespace = appNamespace;
            this.host = host || new FrameHostProxy_1.default(this, window.parent);
        }
        return BaseProvider;
    }());
    return BaseProvider;
});

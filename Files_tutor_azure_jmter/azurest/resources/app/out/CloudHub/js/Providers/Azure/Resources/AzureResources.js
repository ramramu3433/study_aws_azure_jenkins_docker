/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../../Scripts/global.d.ts" />
    /**
     * Resources exposed by the Azure provider.
     */
    var AzureResources = (function () {
        function AzureResources(host) {
            var _this = this;
            this.registerBindings = function (resourceBindingManager) {
                resourceBindingManager.addResourceBinding(AzureResources.commonNamespace, _this._getCommonResourceValues);
            };
            this._getCommonResourceValues = function (resourceIds) {
                if (!_this._commonResourcesSource) {
                    _this._commonResourcesSource = _this._host.executeOperation("Environment.loadResourceFile", ["azure", "resources/azure"]);
                }
                return _this._commonResourcesSource.then(function (alias) {
                    return _this._host.executeOperation("Environment.getResourceStrings", [alias, resourceIds]);
                });
            };
            this._host = host;
        }
        return AzureResources;
    }());
    AzureResources.commonNamespace = "Azure.Resources";
    return AzureResources;
});

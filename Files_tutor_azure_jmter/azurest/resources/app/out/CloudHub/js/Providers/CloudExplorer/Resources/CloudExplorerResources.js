/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../../Scripts/global.d.ts" />
    /**
     * Resources exposed by the CloudExplorer provider.
     */
    var CloudExplorerResources = (function () {
        function CloudExplorerResources(host) {
            var _this = this;
            this.registerBindings = function (resourceBindingManager) {
                resourceBindingManager.addResourceBinding(CloudExplorerResources.namespace, _this._getResourceValues);
            };
            this._getResourceValues = function (resourceIds) {
                if (!_this._resourcesSource) {
                    _this._resourcesSource = _this._host.executeOperation("Environment.loadResourceFile", ["host", "resources/host"]);
                }
                return _this._resourcesSource.then(function (alias) {
                    return _this._host.executeOperation("Environment.getResourceStrings", [alias, resourceIds]);
                });
            };
            this._host = host;
        }
        return CloudExplorerResources;
    }());
    CloudExplorerResources.namespace = "CloudExplorer.Resources";
    return CloudExplorerResources;
});

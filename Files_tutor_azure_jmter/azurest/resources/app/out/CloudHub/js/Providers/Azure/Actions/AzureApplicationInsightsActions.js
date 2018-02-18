/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../../Scripts/global.d.ts" />
    var AzureApplicationInsightsActions = (function () {
        function AzureApplicationInsightsActions(host) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureApplicationInsightsActions.showApplicationInsightsSearchExplorerNamespace, _this.showApplicationInsightsSearchExplorer);
            };
            /**
             * Action for showing the ApplicationInsights Search Explorer window
             */
            this.showApplicationInsightsSearchExplorer = function (args) {
                var subscription = JSON.parse(args.subscription), name = args.name, resourceGroup = args.resourceGroup, instrumentationKey = args.instrumentationKey;
                return _this._host.executeOperation("Azure.showApplicationInsightsSearchExplorer", [subscription, name, resourceGroup, instrumentationKey]);
            };
            this._host = host;
        }
        return AzureApplicationInsightsActions;
    }());
    AzureApplicationInsightsActions.showApplicationInsightsSearchExplorerNamespace = "Azure.Actions.ApplicationInsights.showApplicationInsightsSearchExplorer";
    return AzureApplicationInsightsActions;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/CloudExplorer/Actions/CloudExplorerActions", "URIjs/URITemplate"], function (require, exports, CloudExplorerActions, URITemplate) {
    "use strict";
    var AzureActions = (function () {
        function AzureActions(host) {
            var _this = this;
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureActions.openResourceInPortalNamespace, _this.openResourceInPortal);
                actionBindingManager.addActionBinding(AzureActions.openResourceGroupInPortalNamespace, _this.openResourceGroupInPortal);
            };
            this.openResourceInPortal = function (args) {
                var subscription = JSON.parse(args.subscription);
                var portalUrl = AzureActions._portalResourceDeepLinkTemplate.expand({
                    portalEndpoint: subscription.portalEndpoint,
                    resourceId: args.id,
                    tenantId: args.tenantId
                });
                return _this._host.executeOperation(CloudExplorerActions.openUrlNamespace, [{ url: portalUrl }]);
            };
            this.openResourceGroupInPortal = function (args) {
                var subscription = JSON.parse(args.subscription);
                var portalUrl = AzureActions._portalResourceGroupDeepLinkTemplate.expand({
                    portalEndpoint: subscription.portalEndpoint,
                    resourceGroupId: args.id,
                    tenantId: args.tenantId
                });
                return _this._host.executeOperation(CloudExplorerActions.openUrlNamespace, [{ url: portalUrl }]);
            };
            this._host = host;
        }
        return AzureActions;
    }());
    AzureActions.openResourceInPortalNamespace = "Azure.openResourceInPortal";
    AzureActions.openResourceGroupInPortalNamespace = "Azure.openResourceGroupInPortal";
    AzureActions._portalResourceDeepLinkTemplate = URITemplate("{+portalEndpoint}/{tenantId}/#resource/{+resourceId}");
    AzureActions._portalResourceGroupDeepLinkTemplate = URITemplate("{+portalEndpoint}/{tenantId}/#asset/HubsExtension/ResourceGroups/{+resourceGroupId}");
    return AzureActions;
});

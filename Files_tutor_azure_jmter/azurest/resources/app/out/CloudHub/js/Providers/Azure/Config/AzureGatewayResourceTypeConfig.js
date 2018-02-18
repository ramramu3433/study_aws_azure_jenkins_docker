/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureGatewayResourceTypeConfig = (function () {
        function AzureGatewayResourceTypeConfig() {
        }
        return AzureGatewayResourceTypeConfig;
    }());
    AzureGatewayResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.GatewayResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Gateways" },
        icon: AzureConstants.imagePaths.GatewaysIcon,
        themeSrc: AzureConstants.imageThemeSrc.GatewaysIcon,
        supported: true
    };
    return AzureGatewayResourceTypeConfig;
});

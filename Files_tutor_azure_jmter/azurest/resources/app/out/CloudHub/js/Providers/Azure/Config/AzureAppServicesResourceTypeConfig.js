/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureResources) {
    "use strict";
    var AzureAppServicesResourceTypeConfig = (function () {
        function AzureAppServicesResourceTypeConfig() {
        }
        return AzureAppServicesResourceTypeConfig;
    }());
    AzureAppServicesResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.WebSitesResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "App Services" },
        icon: AzureConstants.imagePaths.WebsiteIcon,
        themeSrc: AzureConstants.imageThemeSrc.WebsiteIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.Website.CreateNewAppService", namespace: AzureResources.commonNamespace }
                },
                namespace: "Azure.Actions.Website.CreateNewAppService",
                boundArguments: {
                    subscription: {
                        attribute: "subscription"
                    }
                }
            }
        ]
    };
    return AzureAppServicesResourceTypeConfig;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AzureApplicationInsightsAttributeLoader", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureApplicationInsightsActions"], function (require, exports, AzureApplicationInsightsAttributeLoader, AzureConstants, AzureResources, AzureApplicationInsightsActions) {
    "use strict";
    var AzureApplicationInsightsConfig = (function () {
        function AzureApplicationInsightsConfig() {
        }
        return AzureApplicationInsightsConfig;
    }());
    AzureApplicationInsightsConfig.Config = {
        aliases: [AzureConstants.resourceTypes.ApplicationInsightsComponents],
        parentType: AzureConstants.resourceTypes.AzureApplicationInsightsResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.ApplicationInsightsIcon,
        themeSrc: AzureConstants.imageThemeSrc.ApplicationInsightsIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.ApplicationInsights.InstrumentationKey", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "instrumentationKey"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureApplicationInsightsAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2014-08-01"
                    }
                },
                provides: ["instrumentationKey"]
            },
            {
                namespace: AzureApplicationInsightsAttributeLoader.isSearchAvailableNamespace,
                boundArguments: {},
                provides: ["isApplicationInsightsSearchWindowAvailable"]
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.ApplicationInsights.Search", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.ApplicationInsightsSearchIcon,
                themeSrc: AzureConstants.imageThemeSrc.ApplicationInsightsSearchIcon,
                namespace: AzureApplicationInsightsActions.showApplicationInsightsSearchExplorerNamespace,
                visible: {
                    expression: {
                        requires: ["isApplicationInsightsSearchWindowAvailable"],
                        expression: "isApplicationInsightsSearchWindowAvailable === true"
                    },
                    value: false
                },
                boundArguments: {
                    subscription: {
                        attribute: "subscription"
                    },
                    resourceGroup: {
                        attribute: "resourceGroup"
                    },
                    name: {
                        attribute: "name"
                    },
                    instrumentationKey: {
                        attribute: "instrumentationKey"
                    }
                }
            }
        ]
    };
    return AzureApplicationInsightsConfig;
});

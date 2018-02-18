/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureGeneralActions", "Providers/Azure/Actions/AzureLogicAppsActions", "Providers/Azure/Loaders/AzureLogicAppsAttributeLoader"], function (require, exports, AzureConstants, AzureResources, AzureGeneralActions, AzureLogicAppsActions, AzureLogicAppsAttributeLoader) {
    "use strict";
    var AzureLogicAppsConfig = (function () {
        function AzureLogicAppsConfig() {
        }
        return AzureLogicAppsConfig;
    }());
    AzureLogicAppsConfig.AzureLogicAppsResourceConfig = {
        aliases: [AzureConstants.resourceTypes.LogicApps],
        parentType: AzureConstants.resourceTypes.LogicAppsResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.LogicAppsIcon,
        themeSrc: AzureConstants.imageThemeSrc.LogicAppsIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.LogicApps.IntegrationAccount", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "integrationAccountId"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.LogicApps.State", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "state"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.LogicApps.OpenEditor", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.AzureLogicAppDesignerIcon,
                themeSrc: AzureConstants.imageThemeSrc.AzureLogicAppDesignerIcon,
                namespace: "Azure.Actions.LogicApps.openEditor",
                boundArguments: {
                    subscription: {
                        attribute: "subscription"
                    },
                    id: {
                        attribute: "id"
                    },
                    location: {
                        attribute: "location"
                    }
                },
                visible: {
                    attribute: "isLogicAppExtensionEnabled"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.LogicApps.OpenRunHistory", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.AzureLogicAppHistoryIcon,
                themeSrc: AzureConstants.imageThemeSrc.AzureLogicAppHistoryIcon,
                namespace: "Azure.Actions.LogicApps.openRunHistory",
                boundArguments: {
                    subscription: {
                        attribute: "subscription"
                    },
                    id: {
                        attribute: "id"
                    },
                    location: {
                        attribute: "location"
                    }
                },
                visible: {
                    attribute: "isLogicAppExtensionEnabled"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.LogicApps.Enable", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.AzureLogicAppEnableIcon,
                themeSrc: AzureConstants.imageThemeSrc.AzureLogicAppEnableIcon,
                namespace: AzureGeneralActions.postActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2016-06-01"
                    },
                    resourceAction: {
                        value: "enable"
                    }
                },
                visible: {
                    expression: {
                        requires: ["state"],
                        expression: "state && state.toLowerCase() === 'disabled'"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.LogicApps.Disable", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.AzureLogicAppDisableIcon,
                themeSrc: AzureConstants.imageThemeSrc.AzureLogicAppDisableIcon,
                namespace: AzureGeneralActions.postActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2016-06-01"
                    },
                    resourceAction: {
                        value: "disable"
                    }
                },
                visible: {
                    expression: {
                        requires: ["state"],
                        expression: "state && state.toLowerCase() === 'enabled'"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.LogicApps.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DeleteApplicationIcon,
                themeSrc: AzureConstants.imageThemeSrc.DeleteApplicationIcon,
                namespace: AzureLogicAppsActions.deleteLogicAppActionNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2016-06-01"
                    },
                    name: {
                        attribute: "name"
                    }
                }
            }
        ],
        loaders: [
            {
                namespace: AzureLogicAppsAttributeLoader.getAzureLogicAppsAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2016-06-01"
                    }
                },
                provides: ["integrationAccountId", "state"]
            },
            {
                namespace: "Azure.Loaders.LogicApps.getLogicAppExtensionConfig",
                provides: ["isLogicAppExtensionEnabled"]
            }
        ]
    };
    AzureLogicAppsConfig.AzureSQLServerConfig = {
        aliases: [AzureConstants.resourceTypes.SQLServers],
        parentType: AzureConstants.resourceTypes.SQLServersResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.SQLDatabaseServersIcon,
        themeSrc: AzureConstants.imageThemeSrc.SQLDatabaseServersIcon,
        supported: true
    };
    return AzureLogicAppsConfig;
});

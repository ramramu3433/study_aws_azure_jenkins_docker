/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/CloudExplorer/Actions/CloudExplorerActions", "CloudExplorer/CloudExplorerConstants", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Utilities"], function (require, exports, AzureConstants, CloudExplorerActions, CloudExplorerConstants, CloudExplorerResources, Utilities) {
    "use strict";
    var AppearanceLoader = (function () {
        function AppearanceLoader() {
            this._appearance = Utilities.isRunningOnElectron() ? AppearanceLoader.storageExplorerAppearances : AppearanceLoader.vsAppearances;
        }
        Object.defineProperty(AppearanceLoader.prototype, "appearance", {
            get: function () {
                return this._appearance;
            },
            enumerable: true,
            configurable: true
        });
        return AppearanceLoader;
    }());
    AppearanceLoader.vsAppearances = [
        {
            displayName: {
                resource: { namespace: CloudExplorerResources.namespace, resourceId: "CloudExplorer.Appearance.Azure.Name" }
            },
            panelInfos: [
                {
                    displayName: {
                        resource: {
                            namespace: CloudExplorerResources.namespace, resourceId: "View.ResourceType.Name"
                        }
                    },
                    name: "Resource Type",
                    panelNamespace: CloudExplorerConstants.panelNamespaces.treeViewPanel,
                    panelQuery: {
                        namespace: "Azure.Producers.Resources.GetSubscriptionNodes",
                        boundArguments: {
                            type: {
                                value: "Azure.SubscriptionWithResourceTypes"
                            }
                        },
                        canRunWithoutSubscription: true
                    },
                    providerNamespace: "Azure.ResourceTypeView"
                },
                {
                    displayName: {
                        resource: {
                            namespace: CloudExplorerResources.namespace, resourceId: "View.ResourceGroup.Name"
                        }
                    },
                    name: "Resource Group",
                    panelNamespace: CloudExplorerConstants.panelNamespaces.treeViewPanel,
                    panelQuery: {
                        namespace: "Azure.Producers.Resources.GetSubscriptionNodes",
                        boundArguments: {
                            type: {
                                value: "Azure.SubscriptionWithResourceGroups"
                            }
                        },
                        canRunWithoutSubscription: true
                    },
                    providerNamespace: "Azure.ResourceGroupView"
                }
            ],
            toolbarItems: [
                {
                    displayName: {
                        resource: { namespace: CloudExplorerResources.namespace, resourceId: "Toolbar.Settings.Name" }
                    },
                    icon: AzureConstants.imagePaths.SettingsIcon,
                    themeSrc: AzureConstants.imageThemeSrc.SettingsIcon,
                    commandNamespace: CloudExplorerActions.openPanel,
                    boundArguments: {
                        panelInfo: {
                            value: AzureConstants.panelInfos.settingsPanel
                        }
                    }
                }
            ]
        }
    ];
    AppearanceLoader.storageExplorerAppearances = [
        {
            displayName: {
                resource: { namespace: CloudExplorerResources.namespace, resourceId: "CloudExplorer.Appearance.Explorer.Name" }
            },
            panelInfos: [
                {
                    displayName: {
                        resource: {
                            namespace: CloudExplorerResources.namespace, resourceId: "CloudExplorer.Appearance.Explorer.Name"
                        }
                    },
                    name: "Resource Type",
                    panelNamespace: CloudExplorerConstants.panelNamespaces.treeViewPanel,
                    panelQuery: {
                        namespace: "Azure.Producers.Resources.GetSubscriptionNodes",
                        boundArguments: {
                            type: {
                                value: "Azure.StorageExplorerSubscriptionWithResourceTypes"
                            }
                        },
                        canRunWithoutSubscription: true
                    },
                    providerNamespace: "Azure.ResourceTypeView"
                }
            ],
            toolbarItems: []
        }
    ];
    return AppearanceLoader;
});

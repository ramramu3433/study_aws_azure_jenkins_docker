/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureDocumentDBActions", "Providers/CloudExplorer/Resources/CloudExplorerResources", "CloudExplorer/CloudExplorerConstants", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureDocumentDBActions, CloudExplorerResources, CloudExplorerConstants, Utilities) {
    "use strict";
    var AzureDocumentDBCollectionConfig = (function () {
        function AzureDocumentDBCollectionConfig() {
        }
        return AzureDocumentDBCollectionConfig;
    }());
    AzureDocumentDBCollectionConfig.Config = {
        aliases: ["Azure.DocumentDB.Collection"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBCollectionsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBCollectionsIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDB.Id", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "id"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDB.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    value: "Collection"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDB.SelfLink", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "selfLink"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDB.PricingTier", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "pricingTier"
                }
            }
        ],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DocumentDB.OpenInPortal", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.OpenInPortalIcon,
                themeSrc: AzureConstants.imageThemeSrc.OpenInPortalIcon,
                namespace: AzureDocumentDBActions.openPortalBladeActionNamespace,
                visible: {
                    value: !Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    editorNamespace: {
                        attribute: "editorNamespace"
                    },
                    resourceId: {
                        attribute: "resourceId"
                    },
                    id: {
                        attribute: "id"
                    },
                    selfLink: {
                        attribute: "selfLink"
                    },
                    documentdbResourceId: {
                        attribute: "documentdbResourceId"
                    },
                    databaseId: {
                        attribute: "databaseId"
                    },
                    databaseRid: {
                        attribute: "databaseRid"
                    }
                }
            },
            {
                icon: AzureConstants.imagePaths.QuickAccessIcon,
                themeSrc: AzureConstants.imageThemeSrc.QuickAccessIcon,
                // Localize
                displayName: {
                    resource: { namespace: CloudExplorerResources.namespace, resourceId: "TreeView.QuickAccess.Add" }
                },
                isDefault: false,
                namespace: "Azure.Actions.Storage.addToQuickAccess",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    displayName: {
                        attribute: "id"
                    },
                    producerNamespace: {
                        value: "Azure.Producers.DocumentDB.GetSingleCollection"
                    },
                    producerArgs: {
                        boundArguments: {
                            documentEndpoint: {
                                attribute: "documentEndpoint"
                            },
                            primaryMasterKey: {
                                attribute: "primaryMasterKey"
                            },
                            id: {
                                attribute: "id"
                            },
                            selfLink: {
                                attribute: "selfLink"
                            },
                            accountId: {
                                attribute: "accountId"
                            },
                            defaultExperience: {
                                attribute: "defaultExperience"
                            }
                        }
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DocumentDB.Collection.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBCollectionsIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.DocumentDB.safeDeleteColection",
                boundArguments: {
                    documentEndpoint: {
                        attribute: "documentEndpoint"
                    },
                    primaryMasterKey: {
                        attribute: "primaryMasterKey"
                    },
                    selfLink: {
                        attribute: "selfLink"
                    },
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.DocumentDB.GetCollectionChildNodes",
            boundArguments: {
                documentEndpoint: {
                    attribute: "documentEndpoint"
                },
                primaryMasterKey: {
                    attribute: "primaryMasterKey"
                },
                resourceId: {
                    attribute: "resourceId"
                },
                accountId: {
                    attribute: "accountId"
                },
                databaseId: {
                    attribute: "databaseId"
                },
                defaultExperience: {
                    attribute: "defaultExperience"
                },
                selfLink: {
                    attribute: "selfLink"
                },
                id: {
                    attribute: "id"
                },
                partitionKeyKind: {
                    attribute: "partitionKeyKind"
                },
                partitionKeyPath: {
                    attribute: "partitionKeyPath"
                }
            }
        }
    };
    return AzureDocumentDBCollectionConfig;
});

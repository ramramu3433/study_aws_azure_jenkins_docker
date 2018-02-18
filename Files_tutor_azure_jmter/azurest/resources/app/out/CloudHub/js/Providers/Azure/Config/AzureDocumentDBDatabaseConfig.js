/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Actions/AzureDocumentDBActions", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Utilities", "CloudExplorer/CloudExplorerConstants"], function (require, exports, AzureConstants, AzureResources, AzureDocumentDBActions, CloudExplorerResources, Utilities, CloudExplorerConstants) {
    "use strict";
    var AzureDocumentDBDatabaseConfig = (function () {
        function AzureDocumentDBDatabaseConfig() {
        }
        return AzureDocumentDBDatabaseConfig;
    }());
    AzureDocumentDBDatabaseConfig.Config = {
        aliases: ["Azure.DocumentDB.Database"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBDatabasesIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBDatabasesIcon,
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
                    value: "Database"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDB.SelfLink", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "selfLink"
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
                    attribute: "needSubscription"
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
                        value: "Azure.Producers.DocumentDB.GetSingleDatabase"
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
                            },
                            needSubscription: {
                                attribute: "needSubscription"
                            }
                        }
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DocumentDB.CreateCollection", namespace: AzureResources.commonNamespace }
                },
                themeSrc: AzureConstants.imageThemeSrc.DocumentDBCreateIcon,
                namespace: AzureDocumentDBActions.openCreateCollectionDialogActionNamespace,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    documentEndpoint: {
                        attribute: "documentEndpoint"
                    },
                    primaryMasterKey: {
                        attribute: "primaryMasterKey"
                    },
                    databaseId: {
                        attribute: "id"
                    },
                    databaseSelfLink: {
                        attribute: "selfLink"
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DocumentDB.Database.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBDatabasesIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.DocumentDB.safeDeleteDatabase",
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
            namespace: "Azure.Producers.DocumentDB.GetAllCollections",
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
                documentdbResourceId: {
                    attribute: "documentdbResourceId"
                },
                pricingTier: {
                    attribute: "pricingTier"
                },
                resourceId: {
                    attribute: "resourceId"
                },
                accountId: {
                    attribute: "accountId"
                },
                defaultExperience: {
                    attribute: "defaultExperience"
                }
            }
        }
    };
    return AzureDocumentDBDatabaseConfig;
});

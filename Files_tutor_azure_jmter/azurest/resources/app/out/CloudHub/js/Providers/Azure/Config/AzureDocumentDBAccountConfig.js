/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Loaders/AzureDocumentDBAttributeLoader", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, AzureDocumentDBAttributeLoader, CloudExplorerResources, Utilities) {
    "use strict";
    var AzureDocumentDBAccountConfig = (function () {
        function AzureDocumentDBAccountConfig() {
        }
        return AzureDocumentDBAccountConfig;
    }());
    AzureDocumentDBAccountConfig.Config = {
        aliases: [AzureConstants.resourceTypes.DocumentDBAccounts],
        parentType: AzureConstants.resourceTypes.DocumentDBAccountsResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { value: Utilities.isRunningOnElectron() ? "Cosmos DB Accounts (Preview)" : "Cosmos DB Accounts" },
        icon: AzureConstants.imagePaths.DocumentDBAccountsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBAccountsIcon,
        supported: true,
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDBAccounts.ProvisioningState", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "provisioningState"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDBAccounts.DocumentEndpoint", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "documentEndpoint"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDBAccounts.PrimaryMasterKey", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "primaryMasterKey"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDBAccounts.PrimaryReadonlyKey", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "primaryReadonlyMasterKey"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.DocumentDBAccounts.Tags", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "tags"
                }
            }
        ],
        actions: [
            {
                icon: AzureConstants.imagePaths.QuickAccessIcon,
                themeSrc: AzureConstants.imageThemeSrc.QuickAccessIcon,
                displayName: {
                    resource: { namespace: CloudExplorerResources.namespace, resourceId: "TreeView.QuickAccess.Add" }
                },
                namespace: "Azure.Actions.Storage.addToQuickAccess",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    displayName: {
                        attribute: "name"
                    },
                    producerNamespace: {
                        value: "Azure.Producers.Resources.GetFromResourceId"
                    },
                    producerArgs: {
                        boundArguments: {
                            subscription: {
                                attribute: "subscription"
                            },
                            id: {
                                attribute: "id"
                            },
                            apiVersion: {
                                value: "2015-04-08"
                            }
                        }
                    }
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Actions.DocumentDB.Database.Create", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBCreateIcon,
                themeSrc: AzureConstants.imageThemeSrc.DocumentDBCreateIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                createChild: {
                    newChildName: "",
                    namespace: "Azure.Actions.DocumentDB.ValidateScriptNameAction"
                },
                namespace: "Azure.Actions.DocumentDB.CreateDatabaseAction",
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
                    pricingTier: {
                        attribute: "pricingTier"
                    },
                    kind: {
                        attribute: "kind"
                    },
                    tags: {
                        attribute: "tags"
                    },
                    needSubscription: {
                        value: true
                    }
                }
            }
        ],
        loaders: [
            {
                namespace: AzureDocumentDBAttributeLoader.getAllAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-04-08"
                    }
                },
                provides: ["provisioningState", "pricingTier", "documentEndpoint", "resourceId", "accountId"]
            },
            {
                namespace: AzureDocumentDBAttributeLoader.listKeysAttributesNamespace,
                boundArguments: {
                    id: {
                        attribute: "id"
                    },
                    subscription: {
                        attribute: "subscription"
                    },
                    apiVersion: {
                        value: "2015-04-08"
                    }
                },
                provides: ["primaryMasterKey", "primaryReadonlyMasterKey"]
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.DocumentDB.GetAllDatabases",
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
                pricingTier: {
                    attribute: "pricingTier"
                },
                kind: {
                    attribute: "kind"
                },
                tags: {
                    attribute: "tags"
                },
                defaultExperience: {
                    attribute: "defaultExperience"
                },
                needSubscription: {
                    value: true
                }
            }
        }
    };
    return AzureDocumentDBAccountConfig;
});

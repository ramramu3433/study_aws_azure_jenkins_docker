/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureResources) {
    "use strict";
    var AzureExternalDocumentDBAccountConfig = (function () {
        function AzureExternalDocumentDBAccountConfig() {
        }
        return AzureExternalDocumentDBAccountConfig;
    }());
    AzureExternalDocumentDBAccountConfig.Config = {
        aliases: [AzureConstants.resourceTypes.ExternalDocumentDBAccounts],
        parentType: AzureConstants.resourceTypes.ExternalDocumentDBAccountsResourceType,
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBAccountsIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBAccountsIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        properties: [],
        loaders: [],
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
                defaultExperience: {
                    attribute: "defaultExperience"
                },
                needSubscription: {
                    value: false
                }
            }
        },
        actions: [
            {
                // Localize
                displayName: {
                    value: "Detach"
                },
                isDefault: false,
                namespace: "Azure.Actions.DocumentDB.detachAccount",
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
                    defaultExperience: {
                        attribute: "defaultExperience"
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
                        attribute: "id"
                    },
                    accountId: {
                        attribute: "accountId"
                    },
                    defaultExperience: {
                        attribute: "defaultExperience"
                    },
                    needSubscription: {
                        value: false
                    }
                }
            }
        ]
    };
    return AzureExternalDocumentDBAccountConfig;
});

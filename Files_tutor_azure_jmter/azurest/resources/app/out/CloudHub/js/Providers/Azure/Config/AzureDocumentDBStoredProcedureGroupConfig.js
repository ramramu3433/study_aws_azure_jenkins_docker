/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, Utilities) {
    "use strict";
    var AzureDocumentDBStoredProcedureGroupConfig = (function () {
        function AzureDocumentDBStoredProcedureGroupConfig() {
        }
        return AzureDocumentDBStoredProcedureGroupConfig;
    }());
    AzureDocumentDBStoredProcedureGroupConfig.Config = {
        aliases: ["Azure.DocumentDB.StoredProcedureGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBStoredProcedureIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBStoredProcedureIcon,
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
                    value: "StoredProcedure"
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
                    resource: { resourceId: "Actions.DocumentDB.StoredProcedures.Create", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBNewStoredProcedureIcon,
                themeSrc: AzureConstants.imageThemeSrc.DocumentDBNewStoredProcedureIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                createChild: {
                    newChildName: "",
                    namespace: "Azure.Actions.DocumentDB.ValidateScriptNameAction"
                },
                namespace: "Azure.Actions.DocumentDB.CreateStoredProcedureAction",
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
                    partitionKeyKind: {
                        attribute: "partitionKeyKind"
                    }
                }
            }
        ],
        childrenQuery: {
            namespace: "Azure.Producers.DocumentDB.GetAllStoredProcedures",
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
                accountId: {
                    attribute: "accountId"
                },
                id: {
                    attribute: "id"
                },
                defaultExperience: {
                    attribute: "defaultExperience"
                },
                partitionKeyKind: {
                    attribute: "partitionKeyKind"
                }
            }
        }
    };
    return AzureDocumentDBStoredProcedureGroupConfig;
});

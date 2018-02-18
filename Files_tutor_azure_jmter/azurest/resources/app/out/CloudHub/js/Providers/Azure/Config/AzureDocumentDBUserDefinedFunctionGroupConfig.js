/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, Utilities) {
    "use strict";
    var AzureDocumentDBUserDefinedFunctionGroupConfig = (function () {
        function AzureDocumentDBUserDefinedFunctionGroupConfig() {
        }
        return AzureDocumentDBUserDefinedFunctionGroupConfig;
    }());
    AzureDocumentDBUserDefinedFunctionGroupConfig.Config = {
        aliases: ["Azure.DocumentDB.UserDefinedFunctionGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBUDFIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBUDFIcon,
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
                    value: "UserDefinedFunction"
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
                    resource: { resourceId: "Actions.DocumentDB.UDF.Create", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBNewUDFIcon,
                themeSrc: AzureConstants.imageThemeSrc.DocumentDBNewUDFIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                createChild: {
                    newChildName: "",
                    namespace: "Azure.Actions.DocumentDB.ValidateScriptNameAction"
                },
                namespace: "Azure.Actions.DocumentDB.CreateUDFAction",
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
            namespace: "Azure.Producers.DocumentDB.GetAllUserDefinedFunctions",
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
    return AzureDocumentDBUserDefinedFunctionGroupConfig;
});

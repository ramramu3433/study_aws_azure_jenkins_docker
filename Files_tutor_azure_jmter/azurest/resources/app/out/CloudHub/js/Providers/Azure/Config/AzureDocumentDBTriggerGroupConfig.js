/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, Utilities) {
    "use strict";
    var AzureDocumentDBTriggerGroupConfig = (function () {
        function AzureDocumentDBTriggerGroupConfig() {
        }
        return AzureDocumentDBTriggerGroupConfig;
    }());
    AzureDocumentDBTriggerGroupConfig.Config = {
        aliases: ["Azure.DocumentDB.TriggerGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DocumentDBTriggerIcon,
        themeSrc: AzureConstants.imageThemeSrc.DocumentDBTriggerIcon,
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
                    value: "Trigger"
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
                    resource: { resourceId: "Actions.DocumentDB.Trigger.Create", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DocumentDBNewTriggerIcon,
                themeSrc: AzureConstants.imageThemeSrc.DocumentDBNewTriggerIcon,
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                createChild: {
                    newChildName: "",
                    namespace: "Azure.Actions.DocumentDB.ValidateScriptNameAction"
                },
                namespace: "Azure.Actions.DocumentDB.CreateTriggerAction",
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
            namespace: "Azure.Producers.DocumentDB.GetAllTriggers",
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
    return AzureDocumentDBTriggerGroupConfig;
});

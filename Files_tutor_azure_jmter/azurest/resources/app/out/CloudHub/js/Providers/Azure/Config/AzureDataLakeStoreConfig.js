/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Actions/AzureDataLakeAnalyticsActions", "Providers/Azure/Resources/AzureResources"], function (require, exports, AzureConstants, AzureDataLakeAnalyticsActions, AzureResources) {
    "use strict";
    var AzureDataLakeStoreConfig = (function () {
        function AzureDataLakeStoreConfig() {
        }
        return AzureDataLakeStoreConfig;
    }());
    AzureDataLakeStoreConfig.Account = {
        aliases: [AzureConstants.resourceTypes.DataLakeStore],
        parentType: AzureConstants.resourceTypes.DataLakeStoreResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataLakeStoreIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataLakeStoreIcon,
        supported: true,
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.DataLake.Analytics.OpenFileExplorer", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.DataLakeStoreIcon,
                themeSrc: AzureConstants.imageThemeSrc.DataLakeStoreIcon,
                namespace: AzureDataLakeAnalyticsActions.openADLSFileExplorerNamespace,
                boundArguments: {
                    dataLakeStorageAccountName: {
                        expression: {
                            requires: ["name", "subscription"],
                            expression: "name + \"@#@\" + JSON.parse(subscription).accountId"
                        }
                    }
                }
            }
        ]
    };
    return AzureDataLakeStoreConfig;
});

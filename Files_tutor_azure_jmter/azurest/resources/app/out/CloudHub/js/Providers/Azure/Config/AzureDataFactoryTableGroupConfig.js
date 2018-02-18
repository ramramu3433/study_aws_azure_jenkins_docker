/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureDataFactoryTableGroupConfig = (function () {
        function AzureDataFactoryTableGroupConfig() {
        }
        return AzureDataFactoryTableGroupConfig;
    }());
    AzureDataFactoryTableGroupConfig.Config = {
        aliases: ["Azure.DataFactoryDatasetGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataFactoryTableGroupIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataFactoryTableGroupIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataFactory.getAllDatasets",
            boundArguments: {
                dataFactoryName: {
                    attribute: "dataFactoryName"
                },
                id: {
                    attribute: "id"
                },
                subscription: {
                    attribute: "subscription"
                }
            },
            preLoad: true
        }
    };
    return AzureDataFactoryTableGroupConfig;
});

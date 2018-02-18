/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureDataFactoryPipelineGroupConfig = (function () {
        function AzureDataFactoryPipelineGroupConfig() {
        }
        return AzureDataFactoryPipelineGroupConfig;
    }());
    AzureDataFactoryPipelineGroupConfig.Config = {
        aliases: ["Azure.DataFactoryPipelineGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataFactoryPipelineGroupIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataFactoryPipelineGroupIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataFactory.GetAllPipelines",
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
    return AzureDataFactoryPipelineGroupConfig;
});

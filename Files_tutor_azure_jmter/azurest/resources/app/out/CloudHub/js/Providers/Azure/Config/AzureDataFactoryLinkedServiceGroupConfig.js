/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureDataFactoryLinkedServiceGroupConfig = (function () {
        function AzureDataFactoryLinkedServiceGroupConfig() {
        }
        return AzureDataFactoryLinkedServiceGroupConfig;
    }());
    AzureDataFactoryLinkedServiceGroupConfig.Config = {
        aliases: ["Azure.DataFactoryLinkedServiceGroup"],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DataFactoryLinkedServiceGroupIcon,
        themeSrc: AzureConstants.imageThemeSrc.DataFactoryLinkedServiceGroupIcon,
        supported: true,
        childrenQuery: {
            namespace: "Azure.Producers.DataFactory.GetAllLinkedServices",
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
    return AzureDataFactoryLinkedServiceGroupConfig;
});

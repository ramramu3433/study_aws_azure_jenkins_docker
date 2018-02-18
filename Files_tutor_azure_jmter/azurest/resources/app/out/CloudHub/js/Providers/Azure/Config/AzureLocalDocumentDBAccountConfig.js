/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureLocalDocumentDBAccountConfig = (function () {
        function AzureLocalDocumentDBAccountConfig() {
        }
        return AzureLocalDocumentDBAccountConfig;
    }());
    AzureLocalDocumentDBAccountConfig.Config = {
        aliases: [AzureConstants.resourceTypes.LocalDocumentDBAccounts],
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
        childrenQuery: {
            namespace: "Azure.Producers.DocumentDB.GetAllDatabasesFromLocal"
        }
    };
    return AzureLocalDocumentDBAccountConfig;
});

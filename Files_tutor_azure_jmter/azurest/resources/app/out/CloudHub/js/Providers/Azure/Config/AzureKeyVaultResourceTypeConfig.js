/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureKeyVaultResourceTypeConfig = (function () {
        function AzureKeyVaultResourceTypeConfig() {
        }
        return AzureKeyVaultResourceTypeConfig;
    }());
    AzureKeyVaultResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.KeyVaultResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Key Vaults" },
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        supported: true
    };
    return AzureKeyVaultResourceTypeConfig;
});

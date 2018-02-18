/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureKeyVaultConfig = (function () {
        function AzureKeyVaultConfig() {
        }
        return AzureKeyVaultConfig;
    }());
    AzureKeyVaultConfig.Config = {
        aliases: [AzureConstants.resourceTypes.KeyVault],
        parentType: AzureConstants.resourceTypes.KeyVaultResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        supported: true
    };
    return AzureKeyVaultConfig;
});

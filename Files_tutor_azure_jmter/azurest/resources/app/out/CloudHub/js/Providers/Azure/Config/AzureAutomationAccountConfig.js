/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureAutomationAccountConfig = (function () {
        function AzureAutomationAccountConfig() {
        }
        return AzureAutomationAccountConfig;
    }());
    AzureAutomationAccountConfig.Config = {
        aliases: [AzureConstants.resourceTypes.AutomationAccounts],
        parentType: AzureConstants.resourceTypes.AutomationAccountsResourceType,
        inherits: [AzureConstants.baseTypes.Resource],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        supported: true
    };
    return AzureAutomationAccountConfig;
});

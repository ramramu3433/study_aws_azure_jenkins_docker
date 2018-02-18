/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureAutomationAccountResourceTypeConfig = (function () {
        function AzureAutomationAccountResourceTypeConfig() {
        }
        return AzureAutomationAccountResourceTypeConfig;
    }());
    AzureAutomationAccountResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.AutomationAccountsResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "Automation Accounts" },
        icon: AzureConstants.imagePaths.DefaultResourceIcon,
        themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
        supported: true
    };
    return AzureAutomationAccountResourceTypeConfig;
});

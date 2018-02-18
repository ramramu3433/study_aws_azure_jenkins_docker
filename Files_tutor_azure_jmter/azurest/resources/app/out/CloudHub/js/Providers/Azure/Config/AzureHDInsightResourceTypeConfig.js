/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants"], function (require, exports, AzureConstants) {
    "use strict";
    var AzureHDInsightResourceTypeConfig = (function () {
        function AzureHDInsightResourceTypeConfig() {
        }
        return AzureHDInsightResourceTypeConfig;
    }());
    AzureHDInsightResourceTypeConfig.Config = {
        aliases: [AzureConstants.resourceTypes.HDInsightResourceType],
        inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
        displayName: { value: "HDInsight" },
        icon: AzureConstants.imagePaths.HDInsightIcon,
        themeSrc: AzureConstants.imageThemeSrc.HDInsightIcon,
        supported: true
    };
    return AzureHDInsightResourceTypeConfig;
});

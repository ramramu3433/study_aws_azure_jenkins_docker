/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var HDInsightProviderConfig = (function () {
        function HDInsightProviderConfig() {
            this.namespace = "Azure.CloudExplorer.HDInsight";
            this.requirePath = "Providers/Azure/HDInsightProvider";
            this.exports = [
                "Azure.Producers.HDInsight.GenerateAccountNode",
                "Azure.Producers.HDInsight.GetHiveDatabases",
                "Azure.Producers.HDInsight.GetHiveTables",
                "Azure.Producers.HDInsight.GetTableColumns",
                "Azure.Producers.HDInsight.GetContainers",
                "Azure.Producers.HDInsight.GetHadoopServicelogTable",
                "Azure.HDInsight.writeHiveQuery",
                "Azure.HDInsight.viewJobs",
                "Azure.HDInsight.viewStormTopologies",
                "Azure.HDInsight.viewHadoopServicelogTable",
                "Azure.HDInsight.viewContainer",
                "Azure.HDInsight.createTable",
                "Azure.HDInsight.viewTableData",
                "Azure.Attributes.HDInsight.getGetClusterDetails",
                "Azure.Attributes.HDInsight.getGetDatabaseProperty",
                "Azure.Attributes.HDInsight.getGetTableProperty",
                "Azure.Attributes.HDInsight.getGetStorageProperty",
                "Azure.Attributes.HDInsight.getGetContainerProperty"
            ];
        }
        return HDInsightProviderConfig;
    }());
    return HDInsightProviderConfig;
});

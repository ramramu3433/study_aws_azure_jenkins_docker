/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var HDInsightMarshalerProviderConfig = (function () {
        function HDInsightMarshalerProviderConfig() {
            this.namespace = "Azure.HDInsight";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.Azure.HDInsightProvider"
            };
            this.exports = [
                "Azure.Actions.HDInsight.GetAccount",
                "Azure.Actions.HDInsight.GetHiveDatabases",
                "Azure.Actions.HDInsight.GetHiveTables",
                "Azure.Actions.HDInsight.GetTableColumns",
                "Azure.Actions.HDInsight.GetDatabaseProperty",
                "Azure.Actions.HDInsight.GetTableProperty",
                "Azure.Actions.HDInsight.GetStorageProperty",
                "Azure.Actions.HDInsight.GetContainerProperty",
                "Azure.Actions.HDInsight.GetHadoopServicelogTable",
                "Azure.Actions.HDInsight.WriteHiveQuery",
                "Azure.Actions.HDInsight.ViewJobs",
                "Azure.Actions.HDInsight.ViewStormTopologies",
                "Azure.Actions.HDInsight.ViewHadoopServicelogTable",
                "Azure.Actions.HDInsight.ViewContainer",
                "Azure.Actions.HDInsight.CreateTable",
                "Azure.Actions.HDInsight.ViewTableData"
            ];
        }
        return HDInsightMarshalerProviderConfig;
    }());
    return HDInsightMarshalerProviderConfig;
});

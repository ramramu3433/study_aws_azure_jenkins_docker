/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var DataLakeProviderConfig = (function () {
        function DataLakeProviderConfig() {
            this.namespace = "Azure.CloudExplorer.DataLake";
            this.requirePath = "Providers/Azure/DataLakeProvider";
            this.exports = [
                "Azure.Producers.DataLake.Analytics.GenerateAccountNode",
                "Azure.DataLake.Analytics.Catalog.createDatabase",
                "Azure.DataLake.Analytics.Catalog.deleteDatabase",
                "Azure.DataLake.Analytics.Catalog.registerAssembly",
                "Azure.DataLake.Analytics.Catalog.deleteAssembly",
                "Azure.DataLake.Analytics.Catalog.reflectAssembly",
                "Azure.DataLake.Analytics.Catalog.downloadAssembly",
                "Azure.DataLake.Analytics.Catalog.createSchema",
                "Azure.DataLake.Analytics.Catalog.deleteSchema",
                "Azure.DataLake.Analytics.Catalog.createTable",
                "Azure.DataLake.Analytics.Catalog.deleteTable",
                "Azure.DataLake.Analytics.Catalog.createTableType",
                "Azure.DataLake.Analytics.Catalog.deleteTableType",
                "Azure.DataLake.Analytics.Catalog.createTableIndex",
                "Azure.DataLake.Analytics.Catalog.createTableStatistics",
                "Azure.DataLake.Analytics.Catalog.deleteTableStatistics",
                "Azure.DataLake.Analytics.Catalog.openScript",
                "Azure.DataLake.Analytics.Catalog.deleteProcedure",
                "Azure.DataLake.Analytics.Catalog.deleteTvf",
                "Azure.DataLake.Analytics.Catalog.deleteView",
                "Azure.DataLake.Analytics.openJobsExplorer",
                "Azure.DataLake.Analytics.Catalog.createCredential",
                "Azure.DataLake.Analytics.Catalog.deleteCredential",
                "Azure.DataLake.Analytics.Catalog.deleteExternalDataSource",
                "Azure.DataLake.Store.openLinkedADLAFileExplorer",
                "Azure.DataLake.Store.openADLSFileExplorer",
                "Azure.DataLake.Store.openWasbContainerExplorer",
                "Azure.Producers.DataLake.Analytics.Catalog.GetDatabases",
                "Azure.Producers.DataLake.Analytics.Catalog.GenerateDatabaseNode",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetAssemblies",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetCredentials",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSourceInfo",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSourcePushdownTypes",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetExternalDataSources",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetProcedures",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetSchemas",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableInfo",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableColumns",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableIndexes",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTablePartitions",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableStatistics",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTables",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTableTypes",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetTvfs",
                "Azure.Producers.DataLake.Analytics.Catalog.Database.GetViews",
                "Azure.Producers.DataLake.Analytics.GetLinkedStorages",
                "Azure.Producers.DataLake.Analytics.GetContainers",
                "Azure.Producers.DataLake.Analytics.GetLocalAccountNode"
            ];
        }
        return DataLakeProviderConfig;
    }());
    return DataLakeProviderConfig;
});

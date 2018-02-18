/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var DataLakeMarshalerProviderConfig = (function () {
        function DataLakeMarshalerProviderConfig() {
            this.namespace = "Azure.DataLake";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.Azure.DataLakeProvider"
            };
            this.exports = [
                "Azure.Actions.DataLake.Analytics.GetAccount",
                "Azure.Actions.DataLake.Analytics.GetDefaultStorage",
                "Azure.Actions.DataLake.Analytics.WaitJob",
                "Azure.Actions.DataLake.Analytics.Catalog.CreateDatabase",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteDatabase",
                "Azure.Actions.DataLake.Analytics.Catalog.RegisterAssembly",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteAssembly",
                "Azure.Actions.DataLake.Analytics.Catalog.DownloadAssembly",
                "Azure.Actions.DataLake.Analytics.Catalog.CreateSchema",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteSchema",
                "Azure.Actions.DataLake.Analytics.Catalog.CreateTable",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteTable",
                "Azure.Actions.DataLake.Analytics.Catalog.CreateTableType",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteTableType",
                "Azure.Actions.DataLake.Analytics.Catalog.ReflectAssembly",
                "Azure.Actions.DataLake.Analytics.Catalog.GetDatabases",
                "Azure.Actions.DataLake.Analytics.Catalog.GetAssemblies",
                "Azure.Actions.DataLake.Analytics.Catalog.GetSchemas",
                "Azure.Actions.DataLake.Analytics.Catalog.GetTables",
                "Azure.Actions.DataLake.Analytics.Catalog.GetTableStatistics",
                "Azure.Actions.DataLake.Analytics.Catalog.GetTableTypes",
                "Azure.Actions.DataLake.Analytics.Catalog.CreateTableStatistics",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteTableStatistics",
                "Azure.Actions.DataLake.Analytics.Catalog.CreateTableIndex",
                "Azure.Actions.DataLake.Analytics.Catalog.GetProcedures",
                "Azure.Actions.DataLake.Analytics.Catalog.GetTvfs",
                "Azure.Actions.DataLake.Analytics.Catalog.GetViews",
                "Azure.Actions.DataLake.Analytics.Catalog.GetCredentials",
                "Azure.Actions.DataLake.Analytics.Catalog.CreateCredential",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteCredential",
                "Azure.Actions.DataLake.Analytics.Catalog.GetExternalDataSources",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteExternalDataSource",
                "Azure.Actions.DataLake.Analytics.BrowseJobs",
                "Azure.Actions.DataLake.Store.OpenLinkedAdlaFileExplorer",
                "Azure.Actions.DataLake.Store.OpenAdlsFileExplorer",
                "Azure.Actions.DataLake.Store.OpenWasbContainerFileExplorer",
                "Azure.Actions.UpdateSelectedAzureAccount",
                "Azure.Actions.UpdateSelectedSubscriptions",
                "Azure.Actions.DataLake.Analytics.Catalog.OpenScript",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteProcedure",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteTvf",
                "Azure.Actions.DataLake.Analytics.Catalog.DeleteView"
            ];
        }
        return DataLakeMarshalerProviderConfig;
    }());
    return DataLakeMarshalerProviderConfig;
});

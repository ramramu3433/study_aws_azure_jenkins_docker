/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/CloudExplorer/Resources/CloudExplorerResources"], function (require, exports, CloudExplorerResources) {
    "use strict";
    /**
     * Contains all the constants for Azure plugins.
     */
    var AzureConstants;
    (function (AzureConstants) {
        AzureConstants.baseTypes = {
            Resource: "Azure.Resource",
            ResourceNoActions: "Azure.Resource.NoActions",
            ResourceRefreshAction: "Azure.Resource.RefreshAction",
            ResourceTypeChildrenQueryConfig: "Azure.Resource.TypeChildrenQueryConfig",
            Fabric: "Azure.Fabric"
        };
        AzureConstants.resourceTypes = {
            ApiApps: "Microsoft.AppService/apiapps",
            ApiAppsResourceType: "ResourceType:Microsoft.AppService/apiapps",
            ApplicationInsightsComponents: "microsoft.insights/components",
            AzureApplicationInsightsResourceType: "ResourceType:microsoft.insights/components",
            ApplicationInsightsWebTests: "microsoft.insights/webtests",
            AlertRules: "microsoft.insights/alertrules",
            AvailabilitySets: "Microsoft.Compute/availabilitySets",
            AvailabilitySetsResourceType: "ResourceType:Microsoft.Compute/availabilitySets",
            AutomationAccounts: "Microsoft.Automation/automationAccounts",
            AutomationAccountsResourceType: "ResourceType:Microsoft.Automation/automationAccounts",
            AutoscaleSettings: "microsoft.insights/autoscalesettings",
            BatchAccounts: "Microsoft.Batch/batchAccounts",
            BatchAccountsResourceType: "ResourceType:Microsoft.Batch/batchAccounts",
            DataFactories: "Microsoft.DataFactory/dataFactories",
            DataFactoriesResourceType: "ResourceType:Microsoft.DataFactory/dataFactories",
            DataLakeAnalytics: "Microsoft.DataLakeAnalytics/accounts",
            DataLakeAnalyticsLocal: "Microsoft.DataLakeAnalytics/accounts/local",
            DataLakeAnalyticsResourceType: "ResourceType:Microsoft.DataLakeAnalytics/accounts",
            DataLakeStore: "Microsoft.DataLakeStore/accounts",
            DataLakeStoreResourceType: "ResourceType:Microsoft.DataLakeStore/accounts",
            DocumentDBAccounts: "Microsoft.DocumentDb/databaseAccounts",
            DocumentDBAccountsResourceType: "ResourceType:Microsoft.DocumentDb/databaseAccounts",
            DomainNamesClassic: "Microsoft.ClassicCompute/domainNames",
            EventHubNamespaces: "Microsoft.EventHub/namespaces",
            EventHubNamespacesResourceType: "ResourceType:Microsoft.EventHub/namespaces",
            ExternalDocumentDBAccounts: "Microsoft.DocumentDb/databaseAccounts/external",
            ExternalStorageAccounts: "Microsoft.ClassicStorage/storageAccounts/external",
            Gateways: "Microsoft.AppService/gateways",
            GatewayResourceType: "ResourceType:Microsoft.AppService/gateways",
            HDInsight: "Microsoft.HDInsight/clusters",
            HDInsightResourceType: "ResourceType:Microsoft.HDInsight/clusters",
            KeyVault: "Microsoft.KeyVault/vaults",
            KeyVaultResourceType: "ResourceType:Microsoft.KeyVault/vaults",
            LoadBalancers: "Microsoft.Network/loadBalancers",
            LoadBalancersResourceType: "ResourceType:Microsoft.Network/loadBalancers",
            LocalDocumentDBAccounts: "Microsoft.DocumentDb/databaseAccounts/local",
            LocalStorageAccounts: "Microsoft.ClassicStorage/storageAccounts/local",
            LogicApps: "Microsoft.Logic/workflows",
            LogicAppsResourceType: "ResourceType:Microsoft.Logic/workflows",
            MediaServices: "Microsoft.Media/mediaservices",
            MediaServicesResourceType: "ResourceType:Microsoft.Media/mediaservices",
            MobileAppClassic: "Microsoft.Web/classicMobileServices",
            MobileAppResourceType: "ResourceType:Microsoft.Web/classicMobileServices",
            MySQLDatabases: "Successbricks.cleardb/databases",
            MySQLDatabasesResourceType: "ResourceType:Successbricks.cleardb/databases",
            NetworkInterfaces: "Microsoft.Network/networkInterfaces",
            NetworkInterfacesResourceType: "ResourceType:Microsoft.Network/networkInterfaces",
            NetworkSecurityGroups: "Microsoft.Network/networkSecurityGroups",
            NetworkSecurityGroupsResourceType: "ResourceType:Microsoft.Network/networkSecurityGroups",
            Namespaces: "Microsoft.NotificationHubs/namespaces",
            NotificationHubs: "Microsoft.NotificationHubs/namespaces/notificationHubs",
            NotificationHubsResourceTypes: "ResourceTypes:Microsoft.NotificationHubs/namespaces/notificationHubs",
            OperationalInsights: "Microsoft.OperationalInsights/workspaces",
            OperationalInsightsResourceType: "ResourceType:Microsoft.OperationalInsights/workspaces",
            PublicIPAddresses: "Microsoft.Network/publicIPAddresses",
            PublicIPAddressesResourceType: "ResourceType:Microsoft.Network/publicIPAddresses",
            RedisCaches: "Microsoft.Cache/Redis",
            RedisCachesResourceType: "ResourceType:Microsoft.Cache/Redis",
            ReservedIPAddressesClassic: "Microsoft.ClassicNetwork/reservedIps",
            ReservedIPAddressesClassicResourceType: "ResourceType:Microsoft.ClassicNetwork/reservedIps",
            SASStorage: "Microsoft.ClassicStorage/storageAccounts/sas",
            SchedulerJobCollections: "Microsoft.Scheduler/jobcollections",
            SchedulerJobCollectionsResourceType: "ResourceType:Microsoft.Scheduler/jobcollections",
            SearchServices: "Microsoft.Search/searchServices",
            SearchServicesResourceType: "ResourceType:Microsoft.Search/searchServices",
            ServiceBusNamespaces: "Microsoft.ServiceBus/namespaces",
            ServiceBusNamespacesResourceType: "ResourceType:Microsoft.ServiceBus/namespaces",
            SQLDatabases: "Microsoft.Sql/servers/databases",
            SQLDatabasesResourceType: "ResourceType:Microsoft.Sql/servers/databases",
            SQLServers: "Microsoft.Sql/servers",
            SQLServersResourceType: "ResourceType:Microsoft.Sql/servers",
            StorageAccountsClassic: "Microsoft.ClassicStorage/storageAccounts",
            StorageAccountsV2: "Microsoft.Storage/storageAccounts",
            StorageAccountsV2ResourceType: "ResourceType:Microsoft.Storage/storageAccounts",
            ExternalStorageAccountsV2ResourceType: "ResourceType:External/Microsoft.Storage/storageAccounts",
            ExternalDocumentDBAccountsResourceType: "ResourceType:External/Microsoft.DocumentDB/documentDBAccounts",
            StreamingJobs: "Microsoft.StreamAnalytics/streamingjobs",
            StreamingJobsResourceType: "ResourceType:Microsoft.StreamAnalytics/streamingjobs",
            VirtualMachineScaleSets: "Microsoft.Compute/virtualMachineScaleSets",
            VirtualMachineScaleSetsResourceType: "ResourceType:Microsoft.Compute/virtualMachineScaleSets",
            VirtualMachinesClassic: "Microsoft.ClassicCompute/virtualMachines",
            VirtualMachinesClassicResourceType: "ResourceType:Microsoft.ClassicCompute/virtualMachines",
            VirtualMachinesV2: "Microsoft.Compute/virtualMachines",
            VirtualMachinesV2ResourceType: "ResourceType:Microsoft.Compute/virtualMachines",
            VirtualMachineV2Extensions: "Microsoft.Compute/virtualMachines/extensions",
            VirtualMachineV2ExtensionsResourceType: "ResourceType:Microsoft.Compute/virtualMachines/extensions",
            VirtualNetworksClassic: "Microsoft.ClassicNetwork/virtualNetworks",
            VirtualNetworksClassicResourceType: "ResourceType:Microsoft.ClassicNetwork/virtualNetworks",
            VirtualNetworksV2: "Microsoft.Network/virtualNetworks",
            VirtualNetworksV2ResourceType: "ResourceType:Microsoft.Network/virtualNetworks",
            VirtualNetworkV2Gateways: "Microsoft.Network/virtualNetworks",
            VirtualNetworkV2GatewaysResourceType: "ResourceType:Microsoft.Network/virtualNetworks",
            VisualStudioAccount: "Microsoft.VisualStudio/account",
            VisualStudioAccountProject: "Microsoft.VisualStudio/account/project",
            WebCertificates: "Microsoft.Web/certificates",
            WebHostingPlan: "Microsoft.Web/serverFarms",
            WebHostingPlanResourceType: "ResourceType:Microsoft.Web/serverFarms",
            WebSites: "Microsoft.Web/sites",
            WebSitesSlots: "Microsoft.Web/sites/slots",
            WebSitesResourceType: "ResourceType:Microsoft.Web/sites",
            ServiceFabricClusters: "Microsoft.ServiceFabric/clusters",
            ServiceFabricLocalClusters: "Microsoft.ServiceFabric/clusters/local",
            ServiceFabricClustersResourceType: "ResourceType:Microsoft.ServiceFabric/clusters"
        };
        AzureConstants.resourceKinds = {
            NotDefined: undefined,
            ApiApp: "api",
            BlobStorage: "BlobStorage",
            PremiumStorage: "Premium",
            Gateway: "gateway",
            MobileAppCode: "mobileAppCode",
            MobileApp: "mobileapp",
            FunctionApp: "functionapp",
            WebApp: "app"
        };
        AzureConstants.imagePaths = {
            DefaultResourceIcon: "../../images/CloudExplorer/AzureDefaultResource_16x.png",
            ApiAppsIcon: "../../images/CloudExplorer/AzureAPIApp_16x.png",
            ApplicationInsightsIcon: "../../images/CloudExplorer/ApplicationInsights_16x.png",
            ApplicationInsightsSearchIcon: "../../images/CloudExplorer/ApplicationInsightsSearch_16x.png",
            AvailabilitySetsIcon: "../../images/CloudExplorer/AzureAvailabilitySet_16x.png",
            AzureActiveDirectoryIcon: "../../images/CloudExplorer/AzureActiveDirectory_16x.png",
            AzureLogicAppDesignerIcon: "../../images/CloudExplorer/AzureLogicAppDesigner_16x.png",
            AzureLogicAppEnableIcon: "../../images/CloudExplorer/AzureLogicAppEnable_16x.png",
            AzureLogicAppDisableIcon: "../../images/CloudExplorer/AzureLogicAppDisable_16x.png",
            AzureLogicAppHistoryIcon: "../../images/CloudExplorer/AzureLogicAppHistory_16x.png",
            ConnectIcon: "../../images/CloudExplorer/Connect_16x.png",
            DataFactoriesIcon: "../../images/CloudExplorer/AzureDataFactory_16x.png",
            DataFactoryLinkedServiceGroupIcon: "../../images/CloudExplorer/AzureDataFactoryLinkedServiceGroup_16x.png",
            DataFactoryTableGroupIcon: "../../images/CloudExplorer/AzureDataFactoryTableGroup_16x.png",
            DataFactoryPipelineGroupIcon: "../../images/CloudExplorer/AzureDataFactoryPipelineGroup_16x.png",
            DataFactoryLinkedServiceIcon: "../../images/CloudExplorer/AzureDataFactoryLinkedService_16x.png",
            DataFactoryTableIcon: "../../images/CloudExplorer/AzureDataFactoryTable_16x.png",
            DataFactoryPipelineIcon: "../../images/CloudExplorer/AzureDataFactoryPipeline_16x.png",
            DataLakeAnalyticsCatalogAssemblyIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogAssembly_16x.png",
            DataLakeAnalyticsCatalogDatabaseIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogDatabase_16x.png",
            DataLakeAnalyticsCatalogDatabasesIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogDatabases_16x.png",
            DataLakeAnalyticsCatalogSchemaIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogSchema_16x.png",
            DataLakeAnalyticsCatalogTableIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogTable_16x.png",
            DataLakeAnalyticsCatalogTVFIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogTVF_16x.png",
            DataLakeAnalyticsIcon: "../../images/CloudExplorer/AzureDataLakeAnalytics_16x.png",
            DataLakeAnalyticsAccountIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsAccount_16x.png",
            DataLakeAnalyticsJobsIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsJobs_16x.png",
            DataLakeAnalyticsLinkedStorageIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsLinkedStorage_16x.png",
            DataLakeAnalyticsLinkedStoragesIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsLinkedStorages_16x.png",
            DataLakeAnalyticsMetadataIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsMetadata_16x.png",
            DataLakeFolderOpenIcon: "../../images/CloudExplorer/AzureDataLakeFolderOpen_16x.png",
            DataLakeAnalyticsCatalogCredentialIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogCredential_16x.png",
            DataLakeAnalyticsCatalogExternalDataSourceIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogExternalDataSource_16x.png",
            DataLakeAnalyticsCatalogProcedureIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogProcedure_16x.png",
            DataLakeAnalyticsCatalogTableColumnIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogTableColumn_16x.png",
            DataLakeAnalyticsCatalogTableIndexIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogTableIndex_16x.png",
            DataLakeAnalyticsCatalogTableStatisticsIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogTableStatistics_16x.png",
            DataLakeAnalyticsCatalogTableTypeIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogTableType_16x.png",
            DataLakeAnalyticsCatalogViewIcon: "../../images/CloudExplorer/AzureDataLakeAnalyticsCatalogView_16x.png",
            DataLakeStoreIcon: "../../images/CloudExplorer/AzureDataLakeStore_16x.png",
            DisableDebuggingIcon: "../../images/CloudExplorer/DisableDebugging_16x.png",
            DisableDiagnosticsIcon: "../../images/CloudExplorer/DisableDiagnostics_16x.png",
            DisableLogIcon: "../../images/CloudExplorer/DisableLog_16x.png",
            DeleteApplicationIcon: "../../images/CloudExplorer/DeleteApplication_16x.png",
            DeploymentSlotsIcon: "../../images/CloudExplorer/AzureDeploymentSlots_16x.png",
            DocumentDBAccountsIcon: "../../images/CloudExplorer/AzureCosmosDB.svg",
            DocumentDBDatabasesIcon: "../../images/CloudExplorer/AzureDocumentDBDatabase_16x.png",
            DocumentDBCollectionsIcon: "../../images/CloudExplorer/AzureDocumentDBCollection_16x.png",
            DocumentDBDocumentsIcon: "../../images/CloudExplorer/AzureDocumentDBDocument_16x.png",
            DocumentDBGraphIcon: "../../images/CloudExplorer/AzureDocumentDBGraph.svg",
            DocumentDBStoredProcedureIcon: "../../images/CloudExplorer/AzureDocumentDBStoredProcedure.svg",
            DocumentDBTriggerIcon: "../../images/CloudExplorer/AzureDocumentDBTrigger.svg",
            DocumentDBUDFIcon: "../../images/CloudExplorer/AzureDocumentDBUDF.svg",
            DocumentDBNewStoredProcedureIcon: "../../images/CloudExplorer/AzureDocumentDBNewStoredProcedure.svg",
            DocumentDBNewTriggerIcon: "../../images/CloudExplorer/AzureDocumentDBNewTrigger.svg",
            DocumentDBNewUDFIcon: "../../images/CloudExplorer/AzureDocumentDBNewUDF.svg",
            DocumentDBCreateIcon: "../../images/CloudExplorer/AzureDocumentDBCreate.svg",
            DownloadIcon: "../../images/CloudExplorer/DownloadIcon.png",
            EnableDebuggingIcon: "../../images/CloudExplorer/EnableDebugging_16x.png",
            EnableDiagnosticsIcon: "../../images/CloudExplorer/EnableDiagnostics_16x.png",
            EnableLogIcon: "../../images/CloudExplorer/EnableLog_16x.png",
            FunctionAppIcon: "../../images/CloudExplorer/AzureFunctionsApp_16x.png",
            GatewaysIcon: "../../images/CloudExplorer/AzureGateway_16x.png",
            GenericFileIcon: "../../images/CloudExplorer/GenericFile_16x.png",
            GenericFolderIcon: "../../images/CloudExplorer/GenericFolder_16x.png",
            HDInsightIcon: "../../images/CloudExplorer/AzureHDInsight_16x.png",
            HDInsightClusterIcon: "../../images/CloudExplorer/AzureHDInsightCluster_16x.png",
            HDInsightContainerIcon: "../../images/CloudExplorer/AzureHDInsightContainer_16x.png",
            HDInsightHBaseIcon: "../../images/CloudExplorer/AzureHDInsightHBase_16x.png",
            HDInsightHiveDatabaseIcon: "../../images/CloudExplorer/AzureHDInsightHiveDatabase_16x.png",
            HDInsightHiveDatabasesIcon: "../../images/CloudExplorer/AzureHDInsightHiveDatabases_16x.png",
            HDInsightServiceLogIcon: "../../images/CloudExplorer/AzureHDInsightServiceLog_16x.png",
            HDInsightSparkIcon: "../../images/CloudExplorer/AzureHDInsightSpark_16x.png",
            HDInsightStorageAccountIcon: "../../images/CloudExplorer/AzureHDInsightStorageAccount_16x.png",
            HDInsightStormIcon: "../../images/CloudExplorer/AzureHDInsightStorm_16x.png",
            HDInsightTableIcon: "../../images/CloudExplorer/AzureHDInsightTable_16x.png",
            HDInsightTableColumnIcon: "../../images/CloudExplorer/AzureHDInsightTableColumn_16x.png",
            LoadBalancersIcon: "../../images/CloudExplorer/AzureLoadBalancer_16x.png",
            LogicAppsIcon: "../../images/CloudExplorer/AzureLogicApp_16x.png",
            MobileAppsIcon: "../../images/CloudExplorer/AzureMobileApp_16x.png",
            MySQLDatabaseIcon: "../../images/CloudExplorer/AzureMySQLDatabase_16x.png",
            NetworkInterfaceIcon: "../../images/CloudExplorer/AzureNetworkInterface_16x.png",
            NetworkSecurityGroupIcon: "../../images/CloudExplorer/AzureNetworkSecurityGroup_16x.png",
            NotificationHubsIcon: "../../images/CloudExplorer/AzureNotificationHub_16x.png",
            OpenInPortalIcon: "../../images/CloudExplorer/OpenInPortal_16x.png",
            OpenInSQLServerObjectExplorerIcon: "../../images/CloudExplorer/OpenInSQLServerObjectExplorer_16x.png",
            OpenIcon: "../../images/CloudExplorer/Open_16x.png",
            DeleteIcon: "../../images/CloudExplorer/Remove_16x.png",
            OpenWebsiteIcon: "../../images/CloudExplorer/OpenInBrowser_16x.png",
            KuduIcon: "../../images/CloudExplorer/kudu_16x.png",
            RedisCacheIcon: "../../images/CloudExplorer/AzureRedisCache_16x.png",
            RefreshIcon: "../../images/CloudExplorer/Refresh_16x.png",
            RestartIcon: "../../images/CloudExplorer/Restart_16x.png",
            ReservedIPAddressIcon: "../../images/CloudExplorer/AzureReservedIPAddress_16x.png",
            ResourceGroupIcon: "../../images/CloudExplorer/AzureResourceGroup_16x.png",
            SchedulerJobCollectionsIcon: "../../images/CloudExplorer/AzureSchedulerJob_16x.png",
            SearchIcon: "../../images/CloudExplorer/SearchIcon.png",
            SearchServicesIcon: "../../images/CloudExplorer/AzureCloudSearch_16x.png",
            SettingsIcon: "../../images/CloudExplorer/Settings_16x.png",
            SQLDatabaseIcon: "../../images/CloudExplorer/AzureSQLDatabase_16x.png",
            SQLDatabaseServersIcon: "../../images/CloudExplorer/AzureSQLServer_16x.png",
            StartDebuggingIcon: "../../images/CloudExplorer/AttachDebugger_16x.png",
            StartIcon: "../../images/CloudExplorer/StartIcon.png",
            StartProfilerIcon: "../../images/CloudExplorer/StartProfiler_16x.png",
            StartStreamingLogsIcon: "../../images/CloudExplorer/StartStreamingLogsIcon_16x.png",
            StatusInvalidIcon: "../../images/CloudExplorer/StatusInvalid_16x.png",
            StopIcon: "../../images/CloudExplorer/StopIcon.png",
            StopProfilerIcon: "../../images/CloudExplorer/StopProfiler_16x.png",
            StopStreamingLogsIcon: "../../images/CloudExplorer/StopStreamingLogs_16x.png",
            StorageAccountIcon: "../../images/CloudExplorer/AzureStorageAccount_16x.png",
            StorageAccountBlobContainerIcon: "../../images/CloudExplorer/AzureBlob_16x.png",
            StorageAccountFileShareIcon: "../../images/CloudExplorer/AzureFileShare_16x.png",
            StorageAccountQueueIcon: "../../images/CloudExplorer/AzureQueue_16x.png",
            StorageAccountTableIcon: "../../images/CloudExplorer/AzureTable_16x.png",
            StorageAccountCreateIcon: "../../images/CloudExplorer/AzureFileShare_16x.png",
            StorageAccountDeleteIcon: "../../images/CloudExplorer/Remove_16x.png",
            StorageAccountOpenIcon: "../../images/CloudExplorer/Open_16x.png",
            SubscriptionIcon: "../../images/CloudExplorer/AzureSubscription_16x.png",
            TeamProjectIcon: "../../images/CloudExplorer/AzureTeam_16x.png",
            UploadIcon: "../../images/CloudExplorer/UploadIcon_16x.png",
            ViewDiagnosticsIcon: "../../images/CloudExplorer/ViewDiagnostics_16x.png",
            ViewLogIcon: "../../images/CloudExplorer/Log_16x.png",
            OpenApplicationInsightsIcon: "../../images/CloudExplorer/OpenApplicationInsights_16x.png",
            VirtualMachineIcon: "../../images/CloudExplorer/AzureVirtualMachine_16x.png",
            VirtualMachineExtensionIcon: "../../images/CloudExplorer/AzureVirtualMachineExtension_16x.png",
            VirtualMachineScaleSetIcon: "../../images/CloudExplorer/AzureVirtualMachineScaleSet_16x.png",
            VirtualNetworkIcon: "../../images/CloudExplorer/AzureVirtualNetworkIPAddress_16x.png",
            WebHostingIcon: "../../images/CloudExplorer/AzureWebHostingPlan_16x.png",
            WebjobIcon: "../../images/CloudExplorer/AzureWebjob_16x.png",
            WebsiteIcon: "../../images/CloudExplorer/AzureWebsite_16x.png",
            WebsiteSlotSwapIcon: "../../images/CloudExplorer/WebsiteSlotSwap_16x.png",
            ServiceFabricIcon: "../../images/CloudExplorer/ServiceFabric_16x.png",
            ServiceFabricColorIcon: "../../images/CloudExplorer/ServiceFabric_color_16x.png",
            DefaultExpandIcon: "../../images/CloudExplorer/Halo_GlyphRight.svg",
            ToggleExpandIcon: "../../images/CloudExplorer/Halo_GlyphDownRight.svg",
            QuickAccessIcon: "../../images/CloudExplorer/QuickAccess_16x.svg",
            BrokenLinkIcon: "../../images/CloudExplorer/LinkRemoved_16x.svg"
        };
        AzureConstants.imageThemeSrc = {
            DefaultResourceIcon: "DefaultResourceIcon",
            ApiAppsIcon: "ApiAppsIcon",
            ApplicationInsightsIcon: "ApplicationInsightsIcon",
            ApplicationInsightsSearchIcon: "ApplicationInsightsSearchIcon",
            AvailabilitySetsIcon: "AvailabilitySetsIcon",
            AzureActiveDirectoryIcon: "AzureActiveDirectoryIcon",
            AzureLogicAppDesignerIcon: "AzureLogicAppDesignerIcon",
            AzureLogicAppEnableIcon: "AzureLogicAppEnableIcon",
            AzureLogicAppDisableIcon: "AzureLogicAppDisableIcon",
            AzureLogicAppHistoryIcon: "AzureLogicAppHistoryIcon",
            ConnectIcon: "ConnectIcon",
            CollapseAllIcon: "CollapseAllIcon",
            DataFactoriesIcon: "DataFactoriesIcon",
            DataFactoryLinkedServiceGroupIcon: "DataFactoryLinkedServiceGroupIcon",
            DataFactoryTableGroupIcon: "DataFactoryTableGroupIcon",
            DataFactoryPipelineGroupIcon: "DataFactoryPipelineGroupIcon",
            DataFactoryLinkedServiceIcon: "DataFactoryLinkedServiceIcon",
            DataFactoryTableIcon: "DataFactoryTableIcon",
            DataFactoryPipelineIcon: "DataFactoryPipelineIcon",
            DataLakeAnalyticsCatalogAssemblyIcon: "DataLakeAnalyticsCatalogAssemblyIcon",
            DataLakeAnalyticsCatalogDatabaseIcon: "DataLakeAnalyticsCatalogDatabaseIcon",
            DataLakeAnalyticsCatalogDatabasesIcon: "DataLakeAnalyticsCatalogDatabasesIcon",
            DataLakeAnalyticsCatalogSchemaIcon: "DataLakeAnalyticsCatalogSchemaIcon",
            DataLakeAnalyticsCatalogTableIcon: "DataLakeAnalyticsCatalogTableIcon",
            DataLakeAnalyticsCatalogTVFIcon: "DataLakeAnalyticsCatalogTVFIcon",
            DataLakeAnalyticsIcon: "DataLakeAnalyticsIcon",
            DataLakeAnalyticsAccountIcon: "DataLakeAnalyticsAccountIcon",
            DataLakeAnalyticsJobsIcon: "DataLakeAnalyticsJobsIcon",
            DataLakeAnalyticsLinkedStorageIcon: "DataLakeAnalyticsLinkedStorageIcon",
            DataLakeAnalyticsLinkedStoragesIcon: "DataLakeAnalyticsLinkedStoragesIcon",
            DataLakeAnalyticsMetadataIcon: "DataLakeAnalyticsMetadataIcon",
            DataLakeFolderOpenIcon: "DataLakeFolderOpenIcon",
            DataLakeAnalyticsCatalogCredentialIcon: "DataLakeAnalyticsCatalogCredentialIcon",
            DataLakeAnalyticsCatalogExternalDataSourceIcon: "DataLakeAnalyticsCatalogExternalDataSourceIcon",
            DataLakeAnalyticsCatalogProcedureIcon: "DataLakeAnalyticsCatalogProcedureIcon",
            DataLakeAnalyticsCatalogTableColumnIcon: "DataLakeAnalyticsCatalogTableColumnIcon",
            DataLakeAnalyticsCatalogTableIndexIcon: "DataLakeAnalyticsCatalogTableIndexIcon",
            DataLakeAnalyticsCatalogTableStatisticsIcon: "DataLakeAnalyticsCatalogTableStatisticsIcon",
            DataLakeAnalyticsCatalogTableTypeIcon: "DataLakeAnalyticsCatalogTableTypeIcon",
            DataLakeAnalyticsCatalogViewIcon: "DataLakeAnalyticsCatalogViewIcon",
            DataLakeStoreIcon: "DataLakeStoreIcon",
            DeleteApplicationIcon: "DeleteApplicationIcon",
            DeploymentSlotsIcon: "DeploymentSlotsIcon",
            DisableDebuggingIcon: "DisableDebuggingIcon",
            DisableDiagnosticsIcon: "DisableDiagnosticsIcon",
            DisableLogIcon: "DisableLogIcon",
            DocumentDBAccountsIcon: "DocumentDBAccountsIcon",
            DocumentDBDatabasesIcon: "DocumentDBDatabasesIcon",
            DocumentDBCollectionsIcon: "DocumentDBCollectionsIcon",
            DocumentDBDocumentsIcon: "DocumentDBDocumentsIcon",
            DocumentDBGraphIcon: "DocumentDBGraphIcon",
            DocumentDBStoredProcedureIcon: "DocumentDBStoredProcedureIcon",
            DocumentDBTriggerIcon: "DocumentDBTriggerIcon",
            DocumentDBUDFIcon: "DocumentDBUDFIcon",
            DocumentDBNewStoredProcedureIcon: "DocumentDBNewStoredProcedureIcon",
            DocumentDBNewTriggerIcon: "DocumentDBNewTriggerIcon",
            DocumentDBNewUDFIcon: "DocumentDBNewUDFIcon",
            DocumentDBCreateIcon: "DocumentDBCreateIcon",
            DownloadIcon: "DownloadIcon",
            EnableDebuggingIcon: "EnableDebuggingIcon",
            EnableDiagnosticsIcon: "EnableDiagnosticsIcon",
            EnableLogIcon: "EnableLogIcon",
            FunctionsAppIcon: "FunctionsAppIcon",
            GatewaysIcon: "GatewaysIcon",
            GenericFileIcon: "GenericFileIcon",
            GenericFolderIcon: "GenericFolderIcon",
            HDInsightIcon: "HDInsightIcon",
            HDInsightClusterIcon: "HDInsightClusterIcon",
            HDInsightContainerIcon: "HDInsightContainerIcon",
            HDInsightHBaseIcon: "HDInsightHBaseIcon",
            HDInsightHiveDatabaseIcon: "HDInsightHiveDatabaseIcon",
            HDInsightHiveDatabasesIcon: "HDInsightHiveDatabasesIcon",
            HDInsightServiceLogIcon: "HDInsightServiceLogIcon",
            HDInsightSparkIcon: "HDInsightSparkIcon",
            HDInsightStorageAccountIcon: "HDInsightStorageAccountIcon",
            HDInsightStormIcon: "HDInsightStormIcon",
            HDInsightTableIcon: "HDInsightTableIcon",
            HDInsightTableColumnIcon: "HDInsightTableColumnIcon",
            LoadBalancersIcon: "LoadBalancersIcon",
            LogicAppsIcon: "LogicAppsIcon",
            MobileAppsIcon: "MobileAppsIcon",
            MySQLDatabaseIcon: "MySQLDatabaseIcon",
            NetworkInterfaceIcon: "NetworkInterfaceIcon",
            NetworkSecurityGroupIcon: "NetworkSecurityGroupIcon",
            NotificationHubsIcon: "NotificationHubsIcon",
            OpenInPortalIcon: "OpenInPortalIcon",
            OpenInSQLServerObjectExplorerIcon: "OpenInSQLServerObjectExplorerIcon",
            OpenIcon: "OpenIcon",
            DeleteIcon: "DeleteIcon",
            OpenWebsiteIcon: "OpenWebsiteIcon",
            KuduIcon: "KuduIcon",
            RedisCacheIcon: "RedisCacheIcon",
            RefreshIcon: "RefreshIcon",
            ReservedIPAddressIcon: "ReservedIPAddressIcon",
            ResourceGroupIcon: "ResourceGroupIcon",
            RestartIcon: "RestartIcon",
            SchedulerJobCollectionsIcon: "SchedulerJobCollectionsIcon",
            SearchServicesIcon: "SearchServicesIcon",
            SettingsIcon: "SettingsIcon",
            SQLDatabaseIcon: "SQLDatabaseIcon",
            SQLDatabaseServersIcon: "SQLDatabaseServersIcon",
            StartDebuggingIcon: "StartDebuggingIcon",
            StartIcon: "StartIcon",
            StartProfilerIcon: "StartProfilerIcon",
            StartStreamingLogsIcon: "StartStreamingLogsIcon",
            StatusInvalidIcon: "StatusInvalidIcon",
            StopIcon: "StopIcon",
            StopProfilerIcon: "StopProfilerIcon",
            StopStreamingLogsIcon: "StopStreamingLogsIcon",
            StorageAccountIcon: "StorageAccountIcon",
            StorageAccountBlobContainerIcon: "StorageAccountBlobContainerIcon",
            StorageAccountFileShareIcon: "StorageAccountFileShareIcon",
            StorageAccountQueueIcon: "StorageAccountQueueIcon",
            StorageAccountTableIcon: "StorageAccountTableIcon",
            StorageAccountCreateIcon: "StorageAccountCreateIcon",
            StorageAccountDeleteIcon: "StorageAccountDeleteIcon",
            StorageAccountOpenIcon: "StorageAccountOpenIcon",
            SubscriptionIcon: "AzureSubscriptionIcon",
            UploadIcon: "UploadIcon",
            TeamProjectIcon: "TeamProjectIcon",
            ViewDiagnosticsIcon: "ViewDiagnosticsIcon",
            ViewLogIcon: "ViewLogIcon",
            OpenApplicationInsightsIcon: "OpenApplicationInsightsIcon",
            VirtualMachineIcon: "VirtualMachineIcon",
            VirtualMachineExtensionIcon: "VirtualMachineExtensionIcon",
            VirtualMachineScaleSetIcon: "VirtualMachineScaleSetIcon",
            VirtualNetworkIcon: "VirtualNetworkIcon",
            WebHostingIcon: "WebHostingIcon",
            WebjobIcon: "WebjobIcon",
            WebsiteIcon: "WebsiteIcon",
            WebsiteSlotSwapIcon: "WebsiteSlotSwapIcon",
            ServiceFabricIcon: "ServiceFabricIcon",
            ServiceFabricColorIcon: "ServiceFabricColorIcon",
            QuickAccessIcon: "QuickAccessIcon",
            BrokenLinkIcon: "BrokenLinkIcon"
        };
        AzureConstants.diagnosticsExtension = {
            defaultName: "Microsoft.Insights.VMDiagnosticsSettings",
            publisher: "Microsoft.Azure.Diagnostics",
            type: "IaaSDiagnostics"
        };
        AzureConstants.registeredDialogs = {
            addCollection: "addCollection",
            addCosmosDBAccount: "addCosmosDBAccount",
            addDirectory: "addDirectory",
            addEntity: "addEntity",
            addMessage: "addMessage",
            connectFileShare: "connectFileShare",
            connect: "connectDialog",
            corsSettings: "corsSettings",
            customizeColumns: "customizeColumns",
            customizeTimestamp: "customizeTimestamp",
            editEntity: "editEntity",
            feedback: "feedback",
            flobProperties: "flobProperties",
            generateAccountSas: "generateAccountSas",
            generateBlobSas: "generateBlobSas",
            generateFileSas: "generateFileSas",
            generateQueueSas: "generateQueueSas",
            generateTableSas: "generateTableSas",
            importEntities: "importEntities",
            manageBlobAcl: "manageBlobAcl",
            manageFileAcl: "manageFileAcl",
            manageQueueAcl: "manageQueueAcl",
            manageTableAcl: "manageTableAcl",
            options: "options",
            querySelect: "querySelect",
            rename: "rename",
            uploadBlobs: "uploadBlobs",
            uploadFiles: "uploadFiles",
            viewMessage: "viewMessage",
            addStorageAccountDialog: "AddStorageAccountDialog",
            addStorageAccountSASDialog: "AddStorageAccountSasDialog",
            addStorageServiceSASDialog: "AddStorageServiceSASDialog",
            // queryBuilderDialog: "QueryBuilderDialog",
            connectFileShareDialog: "ConnectFileShareDialog",
            querySelectDialog: "QuerySelectDialog",
            proxySettingsDialog: "ProxySettingsDialog",
            eulaDialog: "EulaDialog",
            feedbackDialog: "FeedbackDialog",
            npsDialog: "NpsDialog"
        };
        AzureConstants.ServiceFabric = {
            EtwListenerExtensionPublisher: "Microsoft.VisualStudio.Azure.ETWTraceListenerService",
            EtwListenerExtensionType: "VSETWTraceListenerService"
        };
        AzureConstants.RemoteDebugging = {
            RemoteDebuggingExtensionPublisher: "Microsoft.VisualStudio.Azure.RemoteDebug",
            RemoteDebuggingExtensionType: "VSRemoteDebugger"
        };
        AzureConstants.generateSasDialog = {
            blob: {
                width: 500,
                height: 500
            },
            file: {
                width: 500,
                height: 420
            },
            queue: {
                width: 500,
                height: 420
            },
            table: {
                width: 500,
                height: 575
            },
            account: {
                width: 500,
                height: 575
            }
        };
        AzureConstants.panelInfos = {
            settingsPanel: {
                displayName: {
                    resource: { namespace: CloudExplorerResources.namespace, resourceId: "Toolbar.Settings.Name" }
                },
                name: "Settings",
                panelNamespace: "azureFilterPanel",
                providerNamespace: "Azure.FilterPanel"
            }
        };
        AzureConstants.leaseStatuses = {
            unlocked: "unlocked",
            locked: "locked"
        };
    })(AzureConstants || (AzureConstants = {}));
    return AzureConstants;
});

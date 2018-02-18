/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Config/AzureApiAppConfig", "Providers/Azure/Config/AzureFunctionAppConfig", "Providers/Azure/Config/AzureWebMobileAppConfig", "Providers/Azure/Config/AzureApplicationInsightsConfig", "Providers/Azure/Config/AzureApplicationInsightsResourceTypeConfig", "Providers/Azure/Config/AzureAppServicesResourceTypeConfig", "Providers/Azure/Config/AzureAutomationAccountConfig", "Providers/Azure/Config/AzureAutomationAccountResourceTypeConfig", "Providers/Azure/Config/AzureBlobContainerPiecesConfig", "Providers/Azure/Config/AzureBlobContainerConfig", "Providers/Azure/Config/AzureBlobContainerGroupConfig", "Providers/Azure/Config/AzureFileSharePiecesConfig", "Providers/Azure/Config/AzureFileShareConfig", "Providers/Azure/Config/AzureFileShareGroupConfig", "Providers/Azure/Config/AzureBlobStorageAccountConfig", "Providers/Azure/Config/AzureCloudGroupConfig", "Providers/Azure/Config/AzureDataFactoryConfig", "Providers/Azure/Config/AzureDataFactoryResourceTypeConfig", "Providers/Azure/Config/AzureDataFactoryLinkedServiceGroupConfig", "Providers/Azure/Config/AzureDataFactoryPipelineGroupConfig", "Providers/Azure/Config/AzureDataFactoryTableGroupConfig", "Providers/Azure/Config/AzureDataFactoryLinkedServiceConfig", "Providers/Azure/Config/AzureDataFactoryPipelineConfig", "Providers/Azure/Config/AzureDataFactoryTableConfig", "Providers/Azure/Config/AzureDataLakeAnalyticsConfig", "Providers/Azure/Config/AzureDataLakeAnalyticsResourceTypeConfig", "Providers/Azure/Config/AzureDataLakeStoreConfig", "Providers/Azure/Config/AzureDataLakeStoreResourceTypeConfig", "Providers/Azure/Config/AzureDocumentDBAccountConfig", "Providers/Azure/Config/AzureDocumentDBAccountResourceTypeConfig", "Providers/Azure/Config/AzureDocumentDBCollectionConfig", "Providers/Azure/Config/AzureDocumentDBDatabaseConfig", "Providers/Azure/Config/AzureDocumentDBDocumentConfig", "Providers/Azure/Config/AzureDocumentDBStoredProcedureConfig", "Providers/Azure/Config/AzureDocumentDBStoredProcedureGroupConfig", "Providers/Azure/Config/AzureDocumentDBUserDefinedFunctionConfig", "Providers/Azure/Config/AzureDocumentDBUserDefinedFunctionGroupConfig", "Providers/Azure/Config/AzureDocumentDBTriggerConfig", "Providers/Azure/Config/AzureDocumentDBTriggerGroupConfig", "Providers/Azure/Config/AzureExternalStorageAccountConfig", "Providers/Azure/Config/AzureExternalDocumentDBAccountConfig", "Providers/Azure/Config/AzureGatewayConfig", "Providers/Azure/Config/AzureGatewayResourceTypeConfig", "Providers/Azure/Config/AzureHDInsightConfig", "Providers/Azure/Config/AzureHDInsightResourceTypeConfig", "Providers/Azure/Actions/AzureGeneralActions", "Providers/Azure/Config/AzureKeyVaultConfig", "Providers/Azure/Config/AzureKeyVaultResourceTypeConfig", "Providers/Azure/Config/AzureLocalDocumentDBAccountConfig", "Providers/Azure/Config/AzureLocalStorageAccountConfig", "Providers/Azure/Config/AzureLogicAppsConfig", "Providers/Azure/Config/AzureMobileAppConfig", "Providers/Azure/Config/AzurePremiumStorageAccountConfig", "Providers/Azure/Config/AzureQueueConfig", "Providers/Azure/Config/AzureQueueGroupConfig", "Providers/Azure/Config/AzureRedisCacheConfig", "Providers/Azure/Config/AzureRedisCacheResourceTypeConfig", "Providers/Azure/Config/AzureResourceConfig", "Providers/Azure/Config/AzureResourceGroupConfig", "Providers/Azure/Resources/AzureResources", "Providers/Azure/Config/AzureSASFileShareConfig", "Providers/Azure/Config/AzureSASFileShareGroupConfig", "Providers/Azure/Config/AzureSASQueueConfig", "Providers/Azure/Config/AzureSASQueueGroupConfig", "Providers/Azure/Config/AzureSASStorageConfig", "Providers/Azure/Config/AzureSASTableConfig", "Providers/Azure/Config/AzureSASTableGroupConfig", "Providers/Azure/Config/AzureSearchServiceConfig", "Providers/Azure/Config/AzureSearchServiceResourceTypeConfig", "Providers/Azure/Config/AzureStorageAccountConfig", "Providers/Azure/Config/AzureSQLConfig", "Providers/Azure/Config/AzureSQLResourceTypeConfig", "Providers/Azure/Config/AzureStorageAccountV2Config", "Providers/Azure/Config/AzureStorageAccountV2ResourceTypeConfig", "Providers/Azure/Config/AzureStorageAccountPiecesConfig", "Providers/Azure/Config/AzureStorageConnectionTypeConfig", "Providers/Azure/Config/AzureSubscriptionConfig", "Providers/Azure/Config/AzureTablePiecesConfig", "Providers/Azure/Config/AzureTableConfig", "Providers/Azure/Config/AzureTableGroupConfig", "Providers/Azure/Config/AzureVirtualMachineConfig", "Providers/Azure/Config/AzureVirtualMachineResourceTypeConfig", "Providers/Azure/Config/AzureVirtualMachineScaleSetConfig", "Providers/Azure/Config/AzureVirtualMachineScaleSetInstanceConfig", "Providers/Azure/Config/AzureVirtualMachineScaleSetResourceTypeConfig", "Providers/Azure/Config/AzureVirtualMachineV2BaseActionsConfig", "Providers/Azure/Config/AzureVirtualMachineV2Config", "Providers/Azure/Config/AzureVirtualMachineV2DebuggingConfig", "Providers/Azure/Config/AzureVirtualMachineV2DiagnosticsConfig", "Providers/Azure/Config/AzureVirtualMachineV2PropertiesAndLoadersConfig", "Providers/Azure/Config/AzureVirtualMachineV2ResourceTypeConfig", "Providers/Azure/Config/AzureWebJobConfig", "Providers/Azure/Config/AzureWebsiteConfig", "Providers/Azure/Config/AzureWebsiteDeploymentSlotConfig", "Providers/Azure/Config/AzureWebHostingPlanConfig", "Providers/Azure/Config/AzureWebHostingPlanResourceTypeConfig", "Providers/Azure/Config/AzureFabricConfig", "Providers/Azure/Config/AzureFabricResourceTypeConfig", "Providers/Common/AzureConstants", "underscore", "Common/Debug"], function (require, exports, AzureApiAppConfig, AzureFunctionAppConfig, AzureWebMobileAppConfig, AzureApplicationInsightsConfig, AzureApplicationInsightsResourceTypeConfig, AzureAppServicesResourceTypeConfig, AzureAutomationAccountConfig, AzureAutomationAccountResourceTypeConfig, AzureBlobContainerPiecesConfig_1, AzureBlobContainerConfig, AzureBlobContainerGroupConfig, AzureFileSharePiecesConfig_1, AzureFileShareConfig, AzureFileShareGroupConfig, AzureBlobStorageAccountConfig, AzureCloudGroupConfig, AzureDataFactoryConfig, AzureDataFactoryResourceTypeConfig, AzureDataFactoryLinkedServiceGroupConfig, AzureDataFactoryPipelineGroupConfig, AzureDataFactoryTableGroupConfig, AzureDataFactoryLinkedServiceConfig, AzureDataFactoryPipelineConfig, AzureDataFactoryTableConfig, AzureDataLakeAnalyticsConfig, AzureDataLakeAnalyticsResourceTypeConfig, AzureDataLakeStoreConfig, AzureDataLakeStoreResourceTypeConfig, AzureDocumentDBAccountConfig, AzureDocumentDBAccountResourceTypeConfig, AzureDocumentDBCollectionConfig, AzureDocumentDBDatabaseConfig, AzureDocumentDBDocumentConfig, AzureDocumentDBStoredProcedureConfig, AzureDocumentDBStoredProcedureGroupConfig, AzureDocumentDBUserDefinedFunctionConfig, AzureDocumentDBUserDefinedFunctionGroupConfig, AzureDocumentDBTriggerConfig, AzureDocumentDBTriggerGroupConfig, AzureExternalStorageAccountConfig, AzureExternalDocumentDBAccountConfig, AzureGatewayConfig, AzureGatewayResourceTypeConfig, AzureHDInsightConfig, AzureHDInsightResourceTypeConfig, AzureGeneralActions, AzureKeyVaultConfig, AzureKeyVaultResourceTypeConfig, AzureLocalDocumentDBConfig, AzureLocalStorageAccountConfig, AzureLogicAppsConfig, AzureMobileAppConfig, AzurePremiumStorageAccountConfig_1, AzureQueueConfig, AzureQueueGroupConfig, AzureRedisCacheConfig, AzureRedisCacheResourceTypeConfig, AzureResourceConfig, AzureResourceGroupConfig, AzureResources, AzureSASFileShareConfig, AzureSASFileShareGroupConfig, AzureSASQueueConfig, AzureSASQueueGroupConfig, AzureSASStorageConfig, AzureSASTableConfig, AzureSASTableGroupConfig, AzureSearchServiceConfig, AzureSearchServicResourceTypeConfig, AzureStorageAccountConfig, AzureSQLConfig, AzureSQLResourceTypeConfig, AzureStorageAccountV2Config, AzureStorageAccountV2ResourceTypeConfig, AzureStorageAccountCopyKeyConfig, AzureStorageConnectionTypeConfig_1, AzureSubscriptionConfig, AzureTablePiecesConfig_1, AzureTableConfig, AzureTableGroupConfig, AzureVirtualMachineConfig, AzureVirtualMachineResourceTypeConfig, AzureVirtualMachineScaleSetConfig, AzureVirtualMachineScaleSetInstanceConfig, AzureVirtualMachineScaleSetResourceTypeConfig, AzureVirtualMachineV2BaseActionsConfig, AzureVirtualMachineV2Config, AzureVirtualMachineV2DebuggingConfig, AzureVirtualMachineV2DiagnosticsConfig, AzureVirtualMachineV2PropertiesAndLoadersConfig, AzureVirtualMachineV2ResourceTypeConfig, AzureWebJobConfig, AzureWebsiteConfig, AzureWebsiteDeploymentSlotConfig, AzureWebHostingPlanConfig, AzureWebHostingPlanResourceTypeConfig, AzureFabricConfig, AzureFabricResourceTypeConfig, AzureConstants, _, Debug) {
    "use strict";
    /**
     * Represents a cache of retrieved resource configurations.
     */
    var ResourceConfigCache = (function () {
        function ResourceConfigCache() {
            this.cache = {};
        }
        ResourceConfigCache.prototype.set = function (resourceType, kind, value) {
            if (!this.cache[resourceType]) {
                this.cache[resourceType] = {};
            }
            this.cache[resourceType][kind || ResourceConfigCache.noKindKey] = value;
        };
        ResourceConfigCache.prototype.get = function (resourceType, kind) {
            if (!!this.cache[resourceType]) {
                return this.cache[resourceType][kind || ResourceConfigCache.noKindKey];
            }
            return undefined;
        };
        return ResourceConfigCache;
    }());
    ResourceConfigCache.noKindKey = "_noKind";
    /**
     * Stores the search results of `AzureResourceTypeConfig.findResourceType` for reuse.
     * Makes `findResourceType` (which is called a lot!) much faster.
     */
    var resourceTypeConfigCache = new ResourceConfigCache();
    /**
     * Actions exposed by the Azure Cloud Explorer plugin.
     */
    var AzureResourceTypeConfig = (function () {
        function AzureResourceTypeConfig() {
        }
        /**
         * Gets the config with the matching resource type and kind.
         */
        AzureResourceTypeConfig.getResourceTypeConfig = function (type, kind) {
            return AzureResourceTypeConfig.findResourceType(AzureResourceTypeConfig._resourceTypeConfigList, type, kind);
        };
        /**
         * Returns the first config matching the specified resource type and kind.
         */
        AzureResourceTypeConfig.findResourceType = function (resources, type, kind) {
            var result = resourceTypeConfigCache.get(type, kind);
            if (!!result) {
                // Ensure that, if the config was cached, that it is the same as the actual config.
                if (Debug.isDebug()) {
                    Debug.assert(result === AzureResourceTypeConfig.findUncachedResourceType(resources, type, kind));
                }
                return result;
            }
            else {
                // Add the config to the cache for faster reference later.
                result = AzureResourceTypeConfig.findUncachedResourceType(resources, type, kind);
                resourceTypeConfigCache.set(type, kind, result);
                return result;
            }
        };
        AzureResourceTypeConfig.findUncachedResourceType = function (resources, type, kind) {
            // Match by type
            var matches = _.filter(resources, function (resource) {
                return !!_.find(resource.aliases, function (alias) {
                    return alias.toLowerCase() === type.toLowerCase();
                });
            });
            // Filter by resourceKind
            if (matches.length > 0) {
                var matchedByType = _.filter(matches, function (resource) {
                    return (!resource.kind || (resource.kind === kind))
                        && (!resource.unsupportedKinds ||
                            resource.unsupportedKinds.indexOf(kind) === -1);
                });
                matches = matchedByType;
            }
            return _.first(matches);
        };
        return AzureResourceTypeConfig;
    }());
    AzureResourceTypeConfig._resourceTypeConfigList = [
        AzureApiAppConfig.Config,
        AzureFunctionAppConfig.Config,
        AzureWebMobileAppConfig.Config,
        AzureApplicationInsightsConfig.Config,
        AzureApplicationInsightsResourceTypeConfig.Config,
        AzureAppServicesResourceTypeConfig.Config,
        AzureAutomationAccountConfig.Config,
        AzureAutomationAccountResourceTypeConfig.Config,
        AzureBlobContainerPiecesConfig_1.default.Common,
        AzureBlobContainerPiecesConfig_1.default.Copy,
        AzureBlobContainerPiecesConfig_1.default.CopyLink,
        AzureBlobContainerPiecesConfig_1.default.Delete,
        AzureBlobContainerPiecesConfig_1.default.Rename,
        AzureBlobContainerPiecesConfig_1.default.LastModified,
        AzureBlobContainerPiecesConfig_1.default.Leases,
        AzureBlobContainerPiecesConfig_1.default.PublicAccessLevel,
        AzureBlobContainerPiecesConfig_1.default.SasSapManagement,
        AzureBlobContainerPiecesConfig_1.default.PinToQuickAccess,
        AzureBlobContainerConfig.SubscriptionOrKey,
        AzureBlobContainerConfig.InSasAccount,
        AzureBlobContainerConfig.ServiceSas,
        AzureBlobContainerGroupConfig.SubscriptionOrKey,
        AzureBlobContainerGroupConfig.Sas,
        AzureFileSharePiecesConfig_1.default.Copy,
        AzureFileSharePiecesConfig_1.default.Rename,
        AzureFileShareConfig.Config,
        AzureFileShareGroupConfig.Config,
        AzureBlobStorageAccountConfig.Config,
        AzureCloudGroupConfig.Config,
        AzureDataFactoryConfig.Config,
        AzureDataFactoryLinkedServiceGroupConfig.Config,
        AzureDataFactoryTableGroupConfig.Config,
        AzureDataFactoryPipelineGroupConfig.Config,
        AzureDataFactoryLinkedServiceConfig.Config,
        AzureDataFactoryTableConfig.Config,
        AzureDataFactoryPipelineConfig.Config,
        AzureDataFactoryResourceTypeConfig.Config,
        AzureDataLakeAnalyticsConfig.Account,
        AzureDataLakeAnalyticsResourceTypeConfig.Config,
        AzureDataLakeAnalyticsConfig.Adl,
        AzureDataLakeAnalyticsConfig.AssembliesGroup,
        AzureDataLakeAnalyticsConfig.Assembly,
        AzureDataLakeAnalyticsConfig.Container,
        AzureDataLakeAnalyticsConfig.Credential,
        AzureDataLakeAnalyticsConfig.CredentialsGroup,
        AzureDataLakeAnalyticsConfig.Database,
        AzureDataLakeAnalyticsConfig.Databases,
        AzureDataLakeAnalyticsConfig.ExternalDataSource,
        AzureDataLakeAnalyticsConfig.ExternalDataSourcesGroup,
        AzureDataLakeAnalyticsConfig.ExternalDataSourcePushdownType,
        AzureDataLakeAnalyticsConfig.ExternalDataSourcePushdownTypesGroup,
        AzureDataLakeAnalyticsConfig.Jobs,
        AzureDataLakeAnalyticsConfig.LinkedStorages,
        AzureDataLakeAnalyticsConfig.Local,
        AzureDataLakeAnalyticsConfig.Procedure,
        AzureDataLakeAnalyticsConfig.ProceduresGroup,
        AzureDataLakeAnalyticsConfig.Schema,
        AzureDataLakeAnalyticsConfig.SchemasGroup,
        AzureDataLakeAnalyticsConfig.Table,
        AzureDataLakeAnalyticsConfig.TableColumn,
        AzureDataLakeAnalyticsConfig.TableColumnsGroup,
        AzureDataLakeAnalyticsConfig.TablePartition,
        AzureDataLakeAnalyticsConfig.TablePartitionsGroup,
        AzureDataLakeAnalyticsConfig.TableIndex,
        AzureDataLakeAnalyticsConfig.TableIndexesGroup,
        AzureDataLakeAnalyticsConfig.TableStatistics,
        AzureDataLakeAnalyticsConfig.TableStatisticsGroup,
        AzureDataLakeAnalyticsConfig.TablesGroup,
        AzureDataLakeAnalyticsConfig.TableType,
        AzureDataLakeAnalyticsConfig.TableTypesGroup,
        AzureDataLakeAnalyticsConfig.Tvf,
        AzureDataLakeAnalyticsConfig.TvfsGroup,
        AzureDataLakeAnalyticsConfig.View,
        AzureDataLakeAnalyticsConfig.ViewsGroup,
        AzureDataLakeAnalyticsConfig.Wasb,
        AzureDataLakeStoreConfig.Account,
        AzureDataLakeStoreResourceTypeConfig.Config,
        AzureDocumentDBAccountConfig.Config,
        AzureDocumentDBAccountResourceTypeConfig.Config,
        AzureDocumentDBAccountResourceTypeConfig.ExternalConfig,
        AzureDocumentDBCollectionConfig.Config,
        AzureDocumentDBDatabaseConfig.Config,
        AzureDocumentDBDocumentConfig.Config,
        AzureDocumentDBStoredProcedureConfig.Config,
        AzureDocumentDBStoredProcedureGroupConfig.Config,
        AzureDocumentDBTriggerConfig.Config,
        AzureDocumentDBTriggerGroupConfig.Config,
        AzureDocumentDBUserDefinedFunctionConfig.Config,
        AzureDocumentDBUserDefinedFunctionGroupConfig.Config,
        AzureExternalStorageAccountConfig.Config,
        AzureExternalDocumentDBAccountConfig.Config,
        AzureGatewayConfig.Config,
        AzureGatewayResourceTypeConfig.Config,
        AzureHDInsightConfig.Config,
        AzureHDInsightConfig.HiveDatabases,
        AzureHDInsightConfig.HiveDatabase,
        AzureHDInsightConfig.Table,
        AzureHDInsightConfig.Column,
        AzureHDInsightConfig.StorageAccount,
        AzureHDInsightConfig.Container,
        AzureHDInsightConfig.HadoopServiceLogs,
        AzureHDInsightConfig.HadoopServiceLogTable,
        AzureHDInsightResourceTypeConfig.Config,
        AzureKeyVaultConfig.Config,
        AzureKeyVaultResourceTypeConfig.Config,
        AzureLocalDocumentDBConfig.Config,
        AzureLocalStorageAccountConfig.Config,
        AzureLogicAppsConfig.AzureLogicAppsResourceConfig,
        AzureMobileAppConfig.Config,
        AzurePremiumStorageAccountConfig_1.default.Config,
        AzureQueueConfig.Config,
        AzureQueueGroupConfig.Config,
        AzureRedisCacheConfig.Config,
        AzureRedisCacheResourceTypeConfig.Config,
        AzureResourceConfig.Config,
        AzureResourceConfig.NoActionsConfig,
        AzureResourceConfig.RefreshActionConfig,
        AzureResourceConfig.ResourceTypeChildrenQueryConfig,
        AzureResourceGroupConfig.Config,
        AzureSASFileShareConfig.Config,
        AzureSASFileShareGroupConfig.Config,
        AzureSASQueueConfig.Config,
        AzureSASQueueGroupConfig.Config,
        AzureSASStorageConfig.Config,
        AzureSASTableConfig.Config,
        AzureSASTableGroupConfig.Config,
        AzureSearchServiceConfig.Config,
        AzureSearchServicResourceTypeConfig.Config,
        AzureStorageAccountConfig.Config,
        AzureStorageAccountV2Config.Config,
        AzureStorageAccountV2ResourceTypeConfig.Config,
        AzureStorageAccountV2ResourceTypeConfig.ExternalConfig,
        AzureStorageAccountCopyKeyConfig.CopyKey,
        AzureStorageConnectionTypeConfig_1.default.Config,
        AzureSubscriptionConfig.Subscription,
        AzureSubscriptionConfig.SubscriptionWithResourceTypes,
        AzureSubscriptionConfig.SubscriptionWithResourceGroups,
        AzureSubscriptionConfig.SubscriptionWithResourceTypesStorageExplorer,
        AzureSubscriptionConfig.ExternalSubscription,
        AzureSubscriptionConfig.QuickAccess,
        AzureSubscriptionConfig.RecentlyUsed,
        AzureTablePiecesConfig_1.default.Rename,
        AzureTableConfig.Config,
        AzureTableGroupConfig.Config,
        AzureVirtualMachineConfig.Config,
        AzureVirtualMachineResourceTypeConfig.Config,
        AzureVirtualMachineScaleSetConfig.Config,
        AzureVirtualMachineScaleSetInstanceConfig.Config,
        AzureVirtualMachineScaleSetResourceTypeConfig.Config,
        AzureVirtualMachineV2BaseActionsConfig.Config,
        AzureVirtualMachineV2Config.Config,
        AzureVirtualMachineV2DebuggingConfig.Config,
        AzureVirtualMachineV2DiagnosticsConfig.Config,
        AzureVirtualMachineV2PropertiesAndLoadersConfig.Config,
        AzureVirtualMachineV2ResourceTypeConfig.Config,
        AzureWebHostingPlanConfig.Config,
        AzureWebHostingPlanResourceTypeConfig.Config,
        AzureWebJobConfig.WebJobContinuousConfig,
        AzureWebJobConfig.WebJobTriggeredConfig,
        AzureWebsiteConfig.Config,
        AzureWebsiteConfig.DirectoryConfig,
        AzureWebsiteConfig.FileConfig,
        AzureWebsiteConfig.LogDirectoryConfig,
        AzureWebsiteConfig.LogFileConfig,
        AzureWebsiteConfig.SlotsGroupConfig,
        AzureWebsiteConfig.WebJobsGroupConfig,
        AzureWebsiteConfig.WebJobsGroupContinuousConfig,
        AzureWebsiteConfig.WebJobsGroupTriggeredConfig,
        AzureWebsiteDeploymentSlotConfig.Config,
        AzureFabricConfig.Base,
        AzureFabricConfig.Root,
        AzureFabricConfig.Local,
        AzureFabricConfig.ApplicationGroup,
        AzureFabricConfig.NodeGroup,
        AzureFabricConfig.Node,
        AzureFabricConfig.ApplicationType,
        AzureFabricConfig.Application,
        AzureFabricConfig.Service,
        AzureFabricConfig.Partition,
        AzureFabricConfig.Replica,
        AzureFabricConfig.Error,
        AzureFabricResourceTypeConfig.Config,
        AzureSQLConfig.AzureSQLDatabaseConfig,
        AzureSQLConfig.AzureSQLServerConfig,
        AzureSQLResourceTypeConfig.DatabaseConfig,
        AzureSQLResourceTypeConfig.ServerConfig,
        {
            aliases: [AzureConstants.resourceTypes.AvailabilitySets],
            parentType: AzureConstants.resourceTypes.AvailabilitySetsResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.AvailabilitySetsIcon,
            themeSrc: AzureConstants.imageThemeSrc.AvailabilitySetsIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.AvailabilitySetsResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Availability Sets" },
            icon: AzureConstants.imagePaths.AvailabilitySetsIcon,
            themeSrc: AzureConstants.imageThemeSrc.AvailabilitySetsIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.BatchAccounts],
            parentType: AzureConstants.resourceTypes.BatchAccountsResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.BatchAccountsResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Batch Accounts" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.LoadBalancers],
            parentType: AzureConstants.resourceTypes.LoadBalancersResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.LoadBalancersIcon,
            themeSrc: AzureConstants.imageThemeSrc.LoadBalancersIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.LoadBalancersResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Load Balancers" },
            icon: AzureConstants.imagePaths.LoadBalancersIcon,
            themeSrc: AzureConstants.imageThemeSrc.LoadBalancersIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.LogicAppsResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Logic Apps" },
            icon: AzureConstants.imagePaths.LogicAppsIcon,
            themeSrc: AzureConstants.imageThemeSrc.LogicAppsIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.MediaServices],
            parentType: AzureConstants.resourceTypes.MediaServicesResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.MediaServicesResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Media Services" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.MySQLDatabases],
            parentType: AzureConstants.resourceTypes.MySQLDatabasesResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.MySQLDatabaseIcon,
            themeSrc: AzureConstants.imageThemeSrc.MySQLDatabaseIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.MySQLDatabasesResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "MySQL Databases" },
            icon: AzureConstants.imagePaths.MySQLDatabaseIcon,
            themeSrc: AzureConstants.imageThemeSrc.MySQLDatabaseIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.NetworkInterfaces],
            parentType: AzureConstants.resourceTypes.NetworkInterfacesResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.NetworkInterfaceIcon,
            themeSrc: AzureConstants.imageThemeSrc.NetworkInterfaceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.NetworkInterfacesResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Network Interfaces" },
            icon: AzureConstants.imagePaths.NetworkInterfaceIcon,
            themeSrc: AzureConstants.imageThemeSrc.NetworkInterfaceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.NetworkSecurityGroups],
            parentType: AzureConstants.resourceTypes.NetworkSecurityGroupsResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.NetworkSecurityGroupIcon,
            themeSrc: AzureConstants.imageThemeSrc.NetworkSecurityGroupIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.NetworkSecurityGroupsResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Network Security Groups" },
            icon: AzureConstants.imagePaths.NetworkSecurityGroupIcon,
            themeSrc: AzureConstants.imageThemeSrc.NetworkSecurityGroupIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.NotificationHubs],
            parentType: AzureConstants.resourceTypes.NotificationHubsResourceTypes,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.NotificationHubsIcon,
            themeSrc: AzureConstants.imageThemeSrc.NotificationHubsIcon,
            supported: true,
            properties: [
                {
                    displayName: {
                        resource: { namespace: AzureResources.commonNamespace, resourceId: "Properties.NotificationHubs.Namespace" }
                    },
                    binding: {
                        attribute: "namespace"
                    }
                }
            ]
        },
        {
            aliases: [AzureConstants.resourceTypes.NotificationHubsResourceTypes],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Notification Hubs" },
            icon: AzureConstants.imagePaths.NotificationHubsIcon,
            themeSrc: AzureConstants.imageThemeSrc.NotificationHubsIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.OperationalInsights],
            parentType: AzureConstants.resourceTypes.OperationalInsightsResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.OperationalInsightsResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Operational Insights" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.PublicIPAddresses],
            parentType: AzureConstants.resourceTypes.PublicIPAddressesResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.ReservedIPAddressIcon,
            themeSrc: AzureConstants.imageThemeSrc.ReservedIPAddressIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.PublicIPAddressesResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Public IP Addresses" },
            icon: AzureConstants.imagePaths.ReservedIPAddressIcon,
            themeSrc: AzureConstants.imageThemeSrc.ReservedIPAddressIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.ReservedIPAddressesClassic],
            parentType: AzureConstants.resourceTypes.ReservedIPAddressesClassicResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.ReservedIPAddressIcon,
            themeSrc: AzureConstants.imageThemeSrc.ReservedIPAddressIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.ReservedIPAddressesClassicResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Reserved IP Addresses (Classic)" },
            icon: AzureConstants.imagePaths.ReservedIPAddressIcon,
            themeSrc: AzureConstants.imageThemeSrc.ReservedIPAddressIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.SchedulerJobCollections],
            parentType: AzureConstants.resourceTypes.SchedulerJobCollectionsResourceType,
            inherits: [AzureConstants.baseTypes.ResourceNoActions],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.SchedulerJobCollectionsIcon,
            themeSrc: AzureConstants.imageThemeSrc.SchedulerJobCollectionsIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.SchedulerJobCollectionsResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Scheduler Job Collections" },
            icon: AzureConstants.imagePaths.SchedulerJobCollectionsIcon,
            themeSrc: AzureConstants.imageThemeSrc.SchedulerJobCollectionsIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.ServiceBusNamespaces],
            parentType: AzureConstants.resourceTypes.ServiceBusNamespacesResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.ServiceBusNamespacesResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Service Bus Namespaces" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.EventHubNamespaces],
            parentType: AzureConstants.resourceTypes.EventHubNamespacesResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.EventHubNamespacesResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Event Hub Namespaces" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.StreamingJobs],
            parentType: AzureConstants.resourceTypes.StreamingJobsResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.StreamingJobsResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Streaming Jobs" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.VirtualMachineV2Extensions],
            parentType: AzureConstants.resourceTypes.VirtualMachineV2ExtensionsResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.VirtualMachineExtensionIcon,
            themeSrc: AzureConstants.imageThemeSrc.VirtualMachineExtensionIcon,
            supported: true,
            actions: [
                {
                    displayName: {
                        resource: {
                            namespace: AzureResources.commonNamespace, resourceId: "Actions.VirtualMachineExtensions.Remove"
                        }
                    },
                    icon: AzureConstants.imagePaths.DefaultResourceIcon,
                    themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
                    namespace: AzureGeneralActions.deleteActionNamespace,
                    boundArguments: {
                        id: {
                            attribute: "id"
                        },
                        subscription: {
                            attribute: "subscription"
                        },
                        apiVersion: {
                            value: "2015-06-15"
                        },
                        polling: {
                            value: {
                                initialStatusType: "Removing extension",
                                statusType: "Extension",
                                timeOutInSeconds: 300
                            }
                        }
                    },
                    visible: {
                        value: true
                    },
                    enabled: {
                        value: true
                    }
                }
            ]
        },
        {
            aliases: [AzureConstants.resourceTypes.VirtualMachineV2ExtensionsResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Virtual Machine Extensions" },
            icon: AzureConstants.imagePaths.VirtualMachineExtensionIcon,
            themeSrc: AzureConstants.imageThemeSrc.VirtualMachineExtensionIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.VirtualNetworksClassic],
            parentType: AzureConstants.resourceTypes.VirtualNetworksClassicResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.VirtualNetworkIcon,
            themeSrc: AzureConstants.imageThemeSrc.VirtualNetworkIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.VirtualNetworksClassicResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Virtual Networks (Classic)" },
            icon: AzureConstants.imagePaths.VirtualNetworkIcon,
            themeSrc: AzureConstants.imageThemeSrc.VirtualNetworkIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.VirtualNetworksV2],
            parentType: AzureConstants.resourceTypes.VirtualNetworksV2ResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.VirtualNetworkIcon,
            themeSrc: AzureConstants.imageThemeSrc.VirtualNetworkIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.VirtualNetworksV2ResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Virtual Networks" },
            icon: AzureConstants.imagePaths.VirtualNetworkIcon,
            themeSrc: AzureConstants.imageThemeSrc.VirtualNetworkIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.VirtualNetworkV2Gateways],
            parentType: AzureConstants.resourceTypes.VirtualNetworkV2GatewaysResourceType,
            inherits: [AzureConstants.baseTypes.Resource],
            displayName: { attribute: "name" },
            icon: AzureConstants.imagePaths.GatewaysIcon,
            themeSrc: AzureConstants.imageThemeSrc.GatewaysIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.VirtualNetworkV2GatewaysResourceType],
            inherits: [AzureConstants.baseTypes.ResourceRefreshAction, AzureConstants.baseTypes.ResourceTypeChildrenQueryConfig],
            displayName: { value: "Virtual Network Gateways" },
            icon: AzureConstants.imagePaths.GatewaysIcon,
            themeSrc: AzureConstants.imageThemeSrc.GatewaysIcon,
            supported: true
        },
        {
            aliases: [AzureConstants.resourceTypes.WebSites],
            kind: "apiApp",
            displayName: { value: "Blacklisted!!" },
            icon: AzureConstants.imagePaths.WebsiteIcon,
            themeSrc: AzureConstants.imageThemeSrc.WebsiteIcon,
            supported: false
        },
        {
            aliases: [AzureConstants.resourceTypes.WebSites],
            kind: "gateway",
            displayName: { value: "Blacklisted!!" },
            icon: AzureConstants.imagePaths.WebsiteIcon,
            themeSrc: AzureConstants.imageThemeSrc.WebsiteIcon,
            supported: false
        },
        {
            aliases: [
                AzureConstants.resourceTypes.AlertRules,
                AzureConstants.resourceTypes.AutoscaleSettings,
                AzureConstants.resourceTypes.DomainNamesClassic,
                AzureConstants.resourceTypes.MobileAppClassic,
                AzureConstants.resourceTypes.Namespaces,
                AzureConstants.resourceTypes.WebCertificates,
                AzureConstants.resourceTypes.VisualStudioAccount,
                AzureConstants.resourceTypes.VisualStudioAccountProject,
                AzureConstants.resourceTypes.ApplicationInsightsWebTests
            ],
            displayName: { value: "Blacklisted!!" },
            icon: AzureConstants.imagePaths.DefaultResourceIcon,
            themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
            supported: false
        }
    ];
    return AzureResourceTypeConfig;
});

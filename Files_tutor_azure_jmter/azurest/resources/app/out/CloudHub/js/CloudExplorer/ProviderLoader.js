/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Common/Debug", "Common/Errors", "Providers/Azure/AzureProviderConfig", "Providers/Azure/AzureDocumentDBProviderConfig", "Providers/Azure/AzureLogicAppsMarshalerProviderConfig", "Providers/Azure/AzureSubscriptionProviderConfig", "Providers/CloudExplorer/CloudExplorerProviderConfig", "Providers/Azure/DataLakeMarshalerProviderConfig", "Providers/Azure/DataLakeProviderConfig", "Providers/Azure/DiagnosticsExtensionProviderConfig", "Providers/CloudExplorer/DialogProviderConfig", "Providers/CloudExplorer/FeedbackProviderConfig", "Providers/Azure/FilterPanelProviderConfig", "Common/FrameProviderProxy", "Providers/Azure/HDInsightProviderConfig", "Providers/Azure/HDInsightMarshalerProviderConfig", "Providers/CloudExplorer/RecentlyUsedProviderConfig", "Providers/Azure/ResourceGroupViewProviderConfig", "Providers/Azure/ResourceTypeViewProviderConfig", "Providers/Azure/StorageMarshalerProviderConfig", "Providers/CloudExplorer/TelemetryProviderConfig", "Providers/Azure/UserAccountsProviderConfig", "Providers/Azure/VirtualMachineProviderConfig", "Providers/Azure/VirtualMachineScaleSetProviderConfig", "Providers/Azure/WebsiteProviderConfig", "Providers/Azure/WebsiteMarshalerProviderConfig", "CloudExplorer/MarshalerProviderProxy", "CloudExplorer/NodeJSProviderProxy", "Providers/Azure/AccountProviderConfig", "Providers/Azure/WorkerManagerProviderConfig", "Providers/Azure/MenuManagerProviderConfig", "Providers/Azure/BlobOperationProviderConfig", "Providers/Azure/BlobProviderConfig", "Providers/Azure/BlobQueryProviderConfig", "Providers/Azure/ClipboardProviderConfig", "Providers/Azure/BrowserProviderConfig", "Providers/StorageExplorer/DialogOperationHandlerConfig", "Providers/StorageExplorer/EditorProviderConfig", "Providers/Azure/FileDownloadProviderConfig", "Providers/Azure/FileOperationsProviderConfig", "Providers/Azure/FileProviderConfig", "Providers/Azure//FileQueryProviderConfig", "Providers/Azure/FileUploadProviderConfig", "Providers/Azure/ActivityResponseProviderConfig", "Providers/StorageExplorer/StorageExplorerProviderConfig", "Providers/Azure/TableProviderConfig", "Providers/Azure/JobQueueProviderConfig", "Providers/Azure/LogProviderConfig", "Providers/Azure/ActivityProviderConfig", "Providers/Azure/ActivityUIWrapperProviderConfig", "Providers/StorageExplorer/SettingsProviderConfig", "Providers/Azure/QueueProviderConfig", "Providers/Azure/Testing.Errors.ChildProcProviderConfig", "Providers/Azure/Testing.Errors.InProcProviderConfig", "Providers/StorageExplorer/ThemeProvider", "Providers/Azure/TestManagerProviderConfig", "Providers/Azure/FileSystemProviderConfig", "Providers/StorageExplorer/JobQueuers/BlobOpenJobQueuerProviderConfig", "Providers/StorageExplorer/JobQueuers/BlobDownloadJobQueuerProviderConfig", "Providers/StorageExplorer/JobIteratorProcessors/BlobDownloadIteratorProcessorConfig", "Providers/StorageExplorer/JobQueuers/BlobUploadJobQueuerProviderConfig", "Providers/StorageExplorer/JobIteratorProcessors/BlobUploadIteratorProcessorConfig", "Providers/StorageExplorer/SharedDataProviderConfig", "Providers/Azure/NotificationBarProviderConfig", "Providers/Azure/WatchFileProviderConfig", "Providers/StorageExplorer/SslCertificateManagerProviderConfig", "Providers/StorageExplorer/StorageApiSettingManagerProviderConfig", "Providers/Azure/BlobUpdateProviderConfig", "Providers/StorageExplorer/BlobUploadGroupManagerProviderConfig", "Providers/StorageExplorer/BlobDownloadGroupManagerProviderConfig", "Providers/Azure/NodeJSStorageMarshalerProviderConfig", "Providers/CloudExplorer/NodeJSDialogProviderConfig", "Providers/Azure/NodeJSDocumentDBProviderConfig", "Providers/CloudExplorer/NodeJSFeedbackProviderConfig", "Providers/Azure/NodeJSUserAccountsProviderConfig", "Providers/CloudExplorer/DeeplinkProviderConfig", "Providers/CloudExplorer/NodeJSCryptoProviderConfig", "Providers/StorageExplorer/SessionManagerProviderConfig", "Providers/Azure/NotificationsProviderConfig", "Providers/Azure/SnapshotDebuggerProviderConfig", "Providers/Azure/NetworkProviderConfig", "Providers/Azure/DaytonaTabMessengerProviderConfig", "Providers/CloudExplorer/BrowserProviderConfig", "Providers/StorageExplorer/PersistentStorageProviderConfig", "Providers/StorageExplorer/RequestProviderConfig", "Common/Utilities", "Providers/Test/JobQueueTestsProviderConfig"], function (require, exports, rsvp, Debug, Errors, AzureProviderConfig, AzureDocumentDBProviderConfig_1, AzureLogicAppsMarshalerProviderConfig, AzureSubscriptionProviderConfig, CloudExplorerProviderConfig, DataLakeMarshalerProviderConfig, DataLakeProviderConfig, DiagnosticsExtensionProviderConfig, DialogProviderConfig, FeedbackProviderConfig, FilterPanelProviderConfig, FrameProviderProxy, HDInsightProviderConfig, HDInsightMarshalerProviderConfig, RecentlyUsedProviderConfig_1, ResourceGroupViewProviderConfig, ResourceTypeViewProviderConfig, StorageMarshalerProviderConfig, TelemetryProviderConfig, UserAccountsProviderConfig, VirtualMachineProviderConfig, VirtualMachineScaleSetProviderConfig, WebsiteProviderConfig, WebsiteMarshalerProviderConfig, MarshalerProviderProxy_1, NodeJSProviderProxy, AccountProviderConfig_1, WorkerManagerProviderConfig_1, MenuManagerProviderConfig_1, BlobOperationProviderConfig_1, BlobProviderConfig_1, BlobQueryProviderConfig_1, ClipboardProviderConfig_1, BrowserProviderConfig_1, DialogOperationHandlerConfig_1, EditorProviderConfig_1, FileDownloadProviderConfig_1, FileOperationsProviderConfig_1, FileProviderConfig_1, FileQueryProviderConfig_1, FileUploadProviderConfig_1, ActivityResponseProviderConfig_1, StorageExplorerProviderConfig, TableProviderConfig_1, JobQueueProviderConfig_1, LogProviderConfig_1, ActivityProviderConfig_1, ActivityUIWrapperProviderConfig_1, SettingsProviderConfig_1, QueueProviderConfig_1, Testing_Errors_ChildProcProviderConfig_1, Testing_Errors_InProcProviderConfig_1, ThemeProvider_1, TestManagerProviderConfig_1, FileSystemProviderConfig_1, BlobOpenJobQueuerProviderConfig_1, BlobDownloadJobQueuerProviderConfig_1, BlobDownloadIteratorProcessorConfig_1, BlobUploadJobQueuerProviderConfig_1, BlobUploadIteratorProcessorConfig_1, SharedDataProviderConfig_1, NotificationBarProviderConfig_1, WatchFileProviderConfig_1, SslCertificateManagerProviderConfig_1, StorageApiSettingManagerProviderConfig_1, BlobUpdateProviderConfig_1, BlobUploadGroupManagerProviderConfig_1, BlobDownloadGroupManagerProviderConfig_1, nodeJSStorageMarshalerProviderConfig, nodeJSDialogProviderConfig, NodeJSDocumentDBProviderConfig_1, nodeJSFeedbackProviderConfig, NodeJSUserAccountsProviderConfig, DeeplinkProviderConfig_1, NodeJSCryptoProviderConfig_1, SessionManagerProviderConfig, NotificationsProviderConfig, SnapshotDebuggerProviderConfig, NetworkProviderConfig_1, DaytonaTabMessengerProviderConfig_1, CSharpBrowserProviderConfig, PersistentStorageProviderConfig_1, RequestProviderConfig_1, Utilities, JobQueueTestsProviderConfig_1) {
    "use strict";
    var Promise = rsvp.Promise;
    var ProviderLoader = (function () {
        function ProviderLoader(host) {
            var _this = this;
            this.getMatchingProvider = function (functionNamespace) {
                var providerPromises = _this._getMatchingProviders(functionNamespace);
                return (providerPromises && providerPromises.length > 0)
                    ? providerPromises[0]
                    : Promise.reject(new Errors.ProviderNotFoundError(functionNamespace));
            };
            this.getMatchingProviders = function (functionNamespace) {
                return _this._getMatchingProviders(functionNamespace);
            };
            this._getMatchingProviders = function (functionNamespace) {
                var providerLoadData = _this._providerLookupMap[functionNamespace];
                var promises;
                if (!providerLoadData || providerLoadData.length === 0) {
                    promises = [Promise.reject(new Errors.ProviderNotFoundError(functionNamespace))];
                }
                else {
                    promises = providerLoadData.map(function (loadData) {
                        var promise = loadData.provider;
                        if (!promise) {
                            promise = loadData.provider = _this._loadProvider(loadData.config);
                        }
                        if (!promise) {
                            promise = Promise.reject(new Errors.OperationNotFoundError(functionNamespace));
                        }
                        return promise;
                    });
                }
                return promises;
            };
            this._createFrameProviderHandler = function (config) {
                return (config.requirePath)
                    ? new FrameProviderProxy(_this._host, config.namespace, config.requirePath)
                    : null;
            };
            this._createMarshalerProviderHandler = function (config) {
                return (config.marshalerProviderConfig)
                    ? new MarshalerProviderProxy_1.default(config.namespace, config.marshalerProviderConfig)
                    : null;
            };
            this._createNodeJSProviderHandler = function (config) {
                if (config.nodeJSProviderConfig) {
                    return new NodeJSProviderProxy(config.namespace, config.nodeJSProviderConfig);
                }
                return null;
            };
            this._loadProvider = function (config) {
                var provider;
                for (var i = 0; i < _this.createProviderHandlers.length && !provider; i++) {
                    provider = _this.createProviderHandlers[i](config);
                }
                if (provider) {
                    var providerPromise = provider.initialize().then(function () { return provider; });
                    return providerPromise;
                }
            };
            this._loadProviderConfigs = function () {
                // TODO: Detect providers instead of hardcoding here
                var providerConfigs = [
                    new AzureProviderConfig(),
                    new AzureDocumentDBProviderConfig_1.default(),
                    new CloudExplorerProviderConfig(),
                    new AzureSubscriptionProviderConfig(),
                    new FilterPanelProviderConfig(),
                    new ResourceGroupViewProviderConfig(),
                    new ResourceTypeViewProviderConfig()
                ];
                if (Utilities.isRunningOnElectron()) {
                    // Add Node provider configs
                    providerConfigs.push(new nodeJSDialogProviderConfig());
                    providerConfigs.push(new nodeJSFeedbackProviderConfig());
                    // provider configs for resources
                    providerConfigs.push(new nodeJSStorageMarshalerProviderConfig());
                    providerConfigs.push(new NodeJSDocumentDBProviderConfig_1.default());
                    // Add the storage explorer provider config to the array if we are running in electron
                    providerConfigs.push(new AccountProviderConfig_1.default());
                    providerConfigs.push(new StorageExplorerProviderConfig());
                    providerConfigs.push(new NodeJSUserAccountsProviderConfig());
                    providerConfigs.push(new DeeplinkProviderConfig_1.default());
                    providerConfigs.push(new EditorProviderConfig_1.default());
                    providerConfigs.push(new BlobOperationProviderConfig_1.default());
                    providerConfigs.push(new BlobProviderConfig_1.default());
                    providerConfigs.push(new BlobQueryProviderConfig_1.default());
                    providerConfigs.push(new ClipboardProviderConfig_1.default());
                    providerConfigs.push(new BrowserProviderConfig_1.default());
                    providerConfigs.push(new DialogOperationHandlerConfig_1.default());
                    providerConfigs.push(new EditorProviderConfig_1.default());
                    providerConfigs.push(new FileDownloadProviderConfig_1.default());
                    providerConfigs.push(new FileOperationsProviderConfig_1.default());
                    providerConfigs.push(new FileProviderConfig_1.default());
                    providerConfigs.push(new FileQueryProviderConfig_1.default());
                    providerConfigs.push(new FileUploadProviderConfig_1.default());
                    providerConfigs.push(new ActivityResponseProviderConfig_1.default());
                    providerConfigs.push(new SettingsProviderConfig_1.default());
                    providerConfigs.push(new QueueProviderConfig_1.default());
                    providerConfigs.push(new TableProviderConfig_1.default());
                    providerConfigs.push(new ThemeProvider_1.default());
                    providerConfigs.push(new NotificationBarProviderConfig_1.default());
                    providerConfigs.push(new NodeJSCryptoProviderConfig_1.default());
                    providerConfigs.push(new JobQueueProviderConfig_1.default());
                    providerConfigs.push(new LogProviderConfig_1.default());
                    providerConfigs.push(new ActivityProviderConfig_1.default());
                    providerConfigs.push(new ActivityUIWrapperProviderConfig_1.default());
                    providerConfigs.push(new TestManagerProviderConfig_1.default());
                    providerConfigs.push(new FileSystemProviderConfig_1.default());
                    providerConfigs.push(new SessionManagerProviderConfig());
                    providerConfigs.push(new WorkerManagerProviderConfig_1.default());
                    providerConfigs.push(new MenuManagerProviderConfig_1.default());
                    providerConfigs.push(new BlobOpenJobQueuerProviderConfig_1.default());
                    providerConfigs.push(new BlobDownloadJobQueuerProviderConfig_1.default());
                    providerConfigs.push(new BlobDownloadIteratorProcessorConfig_1.default());
                    providerConfigs.push(new JobQueueTestsProviderConfig_1.default());
                    providerConfigs.push(new SharedDataProviderConfig_1.default());
                    providerConfigs.push(new BlobUploadJobQueuerProviderConfig_1.default());
                    providerConfigs.push(new BlobUploadIteratorProcessorConfig_1.default());
                    providerConfigs.push(new WatchFileProviderConfig_1.default());
                    providerConfigs.push(new StorageApiSettingManagerProviderConfig_1.default());
                    providerConfigs.push(new SslCertificateManagerProviderConfig_1.default());
                    providerConfigs.push(new BlobUploadGroupManagerProviderConfig_1.default());
                    providerConfigs.push(new BlobDownloadGroupManagerProviderConfig_1.default());
                    providerConfigs.push(new NotificationsProviderConfig());
                    providerConfigs.push(new BlobUpdateProviderConfig_1.default);
                    providerConfigs.push(new NetworkProviderConfig_1.default());
                    providerConfigs.push(new DaytonaTabMessengerProviderConfig_1.default());
                    providerConfigs.push(new PersistentStorageProviderConfig_1.default());
                    providerConfigs.push(new RequestProviderConfig_1.default());
                }
                else {
                    // Add C# provider configs
                    providerConfigs.push(new DialogProviderConfig());
                    providerConfigs.push(new FeedbackProviderConfig());
                    providerConfigs.push(new TelemetryProviderConfig());
                    providerConfigs.push(new UserAccountsProviderConfig());
                    providerConfigs.push(new SnapshotDebuggerProviderConfig());
                    providerConfigs.push(new CSharpBrowserProviderConfig());
                    // provider configs for resources
                    providerConfigs.push(new AzureLogicAppsMarshalerProviderConfig());
                    providerConfigs.push(new StorageMarshalerProviderConfig());
                    providerConfigs.push(new DataLakeProviderConfig());
                    providerConfigs.push(new DataLakeMarshalerProviderConfig());
                    providerConfigs.push(new DiagnosticsExtensionProviderConfig());
                    providerConfigs.push(new HDInsightProviderConfig());
                    providerConfigs.push(new HDInsightMarshalerProviderConfig());
                    providerConfigs.push(new VirtualMachineProviderConfig());
                    providerConfigs.push(new VirtualMachineScaleSetProviderConfig());
                    providerConfigs.push(new WebsiteProviderConfig());
                    providerConfigs.push(new WebsiteMarshalerProviderConfig());
                    // provider for "Recently Used" resources
                    providerConfigs.push(new RecentlyUsedProviderConfig_1.default());
                }
                if (Debug.isDebug()) {
                    // Add test providers if in debug mode
                    providerConfigs.push(new Testing_Errors_ChildProcProviderConfig_1.default(), new Testing_Errors_InProcProviderConfig_1.default());
                }
                return providerConfigs;
            };
            this._host = host;
            this._providerLookupMap = {};
            this._loadProviderConfigs().forEach(function (config) {
                var providerLoaderData = {
                    config: config,
                    provider: null
                };
                config.exports.forEach(function (exp) {
                    if (_this._providerLookupMap[exp]) {
                        _this._providerLookupMap[exp].push(providerLoaderData);
                    }
                    else {
                        _this._providerLookupMap[exp] = [providerLoaderData];
                    }
                });
            });
            // Each of these will be called one after the other, and the first one which is able to provider
            //   a handler for the given provider will return it.
            this.createProviderHandlers = [
                this._createFrameProviderHandler,
                this._createMarshalerProviderHandler,
                this._createNodeJSProviderHandler
            ];
        }
        return ProviderLoader;
    }());
    return ProviderLoader;
});

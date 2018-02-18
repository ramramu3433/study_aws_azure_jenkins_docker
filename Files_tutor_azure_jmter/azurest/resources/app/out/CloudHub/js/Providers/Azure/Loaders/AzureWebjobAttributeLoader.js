/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper", "URIjs/URITemplate", "es6-promise"], function (require, exports, AttributeLoaderHelper, URITemplate, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return Azure Resource entitites.
     */
    var AzureWebJobAttributeLoader = (function () {
        function AzureWebJobAttributeLoader(azureConnection, host) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureWebJobAttributeLoader.getStatusAttributeNamespace, _this.getStatus);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebJobAttributeLoader.canContinuousWebJobAttachRemoteDebugger, _this.canContinuousWebJobAttachDebugger);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebJobAttributeLoader.canContinuousWebJobAttachRemoteProfiler, _this.canContinuousWebJobAttachRemoteProfiler);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebJobAttributeLoader.isContinuousWebJobRunningRemoteProfiling, _this.isContinuousWebJobRunningRemoteProfiling);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebJobAttributeLoader.getAzureStackRemoteDebuggerProfilerNamespace, _this._getAzureStackRemoteDebuggerProfilerAttributes);
            };
            /**
             * Gets status for an Azure Webjob
             */
            this.getStatus = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.Website.getWebJobStatus", [args])
                    .then(function (status) {
                    var attributes = [
                        {
                            name: "status",
                            value: status,
                            expiration: Date.now() + 2000
                        }
                    ];
                    return { results: attributes };
                });
            };
            /**
             * Gets remote debug status for an Azure Webjob
             */
            this.canContinuousWebJobAttachDebugger = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.WebJob.canContinuousWebJobAttachDebugger", [args])
                    .then(function (status) {
                    var attributes = [
                        {
                            name: "canContinuousWebJobAttachDebugger",
                            value: status,
                            expiration: Date.now() + 2000
                        }
                    ];
                    return { results: attributes };
                });
            };
            /**
             * Gets remote profiling status for an Azure Webjob
             */
            this.canContinuousWebJobAttachRemoteProfiler = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.WebJob.canContinuousWebJobAttachRemoteProfiler", [args])
                    .then(function (status) {
                    var attributes = [
                        {
                            name: "canContinuousWebJobAttachRemoteProfiler",
                            value: status,
                            expiration: Date.now() + 2000
                        }
                    ];
                    return { results: attributes };
                });
            };
            this.isContinuousWebJobRunningRemoteProfiling = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.WebJob.isContinuousWebJobRunningRemoteProfiling", [args])
                    .then(function (status) {
                    var attributes = [
                        {
                            name: "isContinuousWebJobRunningRemoteProfiling",
                            value: status,
                            expiration: Date.now() + 2000
                        }
                    ];
                    return { results: attributes };
                });
            };
            /*
          * Gets remote debugger/profiler availabilities for Azure Stack
          */
            this._getAzureStackRemoteDebuggerProfilerAttributes = function (args) {
                if (args === void 0) { args = null; }
                var subscription = JSON.parse(args.subscription);
                var resourceId = args.id;
                var resourceGroupIndex = resourceId.search("/resourceGroups/");
                var canAttachRemoteDebuggerInAzureStack = true;
                var canAttachRemoteProfilerInAzureStack = true;
                var getAzureStackAttributePromise = Promise.resolve();
                // only for azure stack subscription
                if (subscription.isAzureStackSubscription && resourceGroupIndex !== -1) {
                    // if subscription is azure stack subscription, default them to false.
                    canAttachRemoteDebuggerInAzureStack = false;
                    canAttachRemoteProfilerInAzureStack = false;
                    // cut string after subscription id
                    args.id = resourceId.substring(0, resourceGroupIndex);
                    var severFarmId;
                    var skuSize;
                    getAzureStackAttributePromise = _this._attributeLoaderHelper.getRequest(AzureWebJobAttributeLoader.ResourceSiteUriTemplate, args)
                        .then(function (siteResult) {
                        var site = siteResult;
                        for (var i = 0; i < site.value.length; i++) {
                            if (site.value[i].id === resourceId) {
                                severFarmId = site.value[i].properties.serverFarmId;
                                break;
                            }
                        }
                    })
                        .then(function () {
                        return _this._attributeLoaderHelper.getRequest(AzureWebJobAttributeLoader.ResourceServerFarmsUriTemplate, args)
                            .then(function (serverFarmResult) {
                            var websiteServerFarm = serverFarmResult;
                            for (var i = 0; i < websiteServerFarm.value.length; i++) {
                                if (websiteServerFarm.value[i].id === severFarmId) {
                                    skuSize = websiteServerFarm.value[i].sku.size;
                                    break;
                                }
                            }
                        })
                            .then(function () {
                            return _this._attributeLoaderHelper.getRequest(AzureWebJobAttributeLoader.ResourceAzureStackMetadataUriTemplate, args)
                                .then(function (metadataResult) {
                                var azureStackEntry;
                                var metadata = metadataResult;
                                for (var i = 0; i < metadata.length; i++) {
                                    if (metadata[i].skuCode === skuSize) {
                                        azureStackEntry = metadata[i];
                                        break;
                                    }
                                }
                                if (azureStackEntry != null) {
                                    for (var j = 0; j < azureStackEntry.capabilities.length; j++) {
                                        if (azureStackEntry.capabilities[j].name === "RemoteDebuggerEnabled" && azureStackEntry.capabilities[j].value === "1") {
                                            canAttachRemoteDebuggerInAzureStack = true;
                                        }
                                        else if (azureStackEntry.capabilities[j].name === "RemoteProfilerEnabled" && azureStackEntry.capabilities[j].value === "1") {
                                            canAttachRemoteProfilerInAzureStack = true;
                                        }
                                    }
                                }
                            });
                        });
                    });
                }
                return getAzureStackAttributePromise.then(function () {
                    var attributes = [
                        {
                            name: "canAttachRemoteDebuggerInAzureStack",
                            value: canAttachRemoteDebuggerInAzureStack
                        },
                        {
                            name: "canAttachRemoteProfilerInAzureStack",
                            value: canAttachRemoteProfilerInAzureStack
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
            this._host = host;
        }
        return AzureWebJobAttributeLoader;
    }());
    AzureWebJobAttributeLoader.getStatusAttributeNamespace = "Azure.Attributes.Webjob.GetStatus";
    AzureWebJobAttributeLoader.canContinuousWebJobAttachRemoteDebugger = "Azure.Attributes.Webjob.canContinuousWebJobAttachRemoteDebugger";
    AzureWebJobAttributeLoader.canContinuousWebJobAttachRemoteProfiler = "Azure.Attributes.Webjob.canContinuousWebJobAttachRemoteProfiler";
    AzureWebJobAttributeLoader.isContinuousWebJobRunningRemoteProfiling = "Azure.Attributes.Webjob.isContinuousWebJobRunningRemoteProfiling";
    AzureWebJobAttributeLoader.getAzureStackRemoteDebuggerProfilerNamespace = "Azure.Attributes.Webjob.GetAzureStackRemoteDebuggerProfilerAttributes";
    // Note : resourceId here is "/subscriptions/{subcription id}"
    AzureWebJobAttributeLoader.ResourceServerFarmsUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/providers/Microsoft.Web/serverFarms?api-version=2016-09-01");
    // Note : resourceId here is "/subscriptions/{subcription id}"
    AzureWebJobAttributeLoader.ResourceAzureStackMetadataUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/providers/Microsoft.Web/metadata?api-version=2016-08-01");
    // Note : resourceId here is "/subscriptions/{subcription id}"
    AzureWebJobAttributeLoader.ResourceSiteUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/providers/Microsoft.Web/sites?api-version=2016-08-01");
    return AzureWebJobAttributeLoader;
});

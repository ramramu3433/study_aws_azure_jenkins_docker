/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Loaders/AttributeLoaderHelper", "URIjs/URITemplate", "es6-promise"], function (require, exports, AttributeLoaderHelper, URITemplate, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return Azure Resource entitites.
     */
    var AzureWebsiteAttributeLoader = (function () {
        function AzureWebsiteAttributeLoader(azureConnection, host) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (loaderBindingManger) {
                loaderBindingManger.addAttributeLoaderBinding(AzureWebsiteAttributeLoader.getAllAttributesNamespace, _this._getAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebsiteAttributeLoader.getConfigAttributesNamespace, _this._getConfigAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebsiteAttributeLoader.getStateNamespace, _this._getState);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebsiteAttributeLoader.getPublishCredentialNamespace, _this._getPublishCredentialAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebsiteAttributeLoader.getAzureStackRemoteDebuggerProfilerNamespace, _this._getAzureStackRemoteDebuggerProfilerAttributes);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebsiteAttributeLoader.getIsDeleteFileEnabledNamespace, _this._getIsDeleteFileEnabled);
                loaderBindingManger.addAttributeLoaderBinding(AzureWebsiteAttributeLoader.getAttachSnapshotDebuggerNamespace, _this._getCanAttachSnapshotDebugger);
            };
            /**
             * Gets properties for Azure Website Node
             */
            this._getAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AttributeLoaderHelper.ResourceUriTemplate, args)
                    .then(function (resource) {
                    var attributes = [
                        {
                            name: "status",
                            value: resource.properties.state,
                            expiration: Date.now() + 5000
                        },
                        {
                            name: "url",
                            value: "http://" + resource.properties.hostNames[0]
                        },
                        {
                            name: "webAppSku",
                            value: resource.properties.sku
                        },
                        {
                            name: "kind",
                            value: resource.properties.kind
                        }
                    ];
                    return { results: attributes };
                });
            };
            /**
             * Gets publishingcredentials properties for Azure Website Node
             */
            this._getPublishCredentialAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.postRequest(AzureWebsiteAttributeLoader.ResourcePublishCredentialUriTemplate, args)
                    .then(function (resource) {
                    var scmUrl = "";
                    if (resource.properties.scmUri) {
                        var url = document.createElement("a");
                        url.href = resource.properties.scmUri;
                        scmUrl = url.protocol + "//" + url.hostname; // remove username and password to avoid browser issue
                    }
                    var attributes = [
                        {
                            name: "scmUrl",
                            value: scmUrl
                        }
                    ];
                    return { results: attributes };
                });
            };
            /**
             * Gets config properties for Azure Website Node
             */
            this._getConfigAttributes = function (args) {
                if (args === void 0) { args = null; }
                return _this._attributeLoaderHelper.getRequest(AzureWebsiteAttributeLoader.ResourceConfigUriTemplate, args)
                    .then(function (config) {
                    var attributes = [
                        {
                            name: "apiDefinition",
                            value: (config.properties.apiDefinition && config.properties.apiDefinition.url) || ""
                        }
                    ];
                    return { results: attributes };
                });
            };
            /**
             * Gets infrastructure-related state information for Azure Website Node
             */
            this._getState = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.Website.getState", [args])
                    .then(function (state) {
                    var attributes = [
                        {
                            name: "isProfiling",
                            value: state.isProfiling,
                            expiration: Date.now() + 5000
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._getIsDeleteFileEnabled = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.Website.isDeleteFileEnabled", [args])
                    .then(function (state) {
                    var attributes = [
                        {
                            name: "isDeleteFileEnabled",
                            value: state
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
                    getAzureStackAttributePromise = _this._attributeLoaderHelper.getRequest(AzureWebsiteAttributeLoader.ResourceSiteUriTemplate, args)
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
                        return _this._attributeLoaderHelper.getRequest(AzureWebsiteAttributeLoader.ResourceServerFarmsUriTemplate, args)
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
                            return _this._attributeLoaderHelper.getRequest(AzureWebsiteAttributeLoader.ResourceAzureStackMetadataUriTemplate, args)
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
            /*
             * Gets snapshot debugger availabilities for Azure Web Site
             */
            this._getCanAttachSnapshotDebugger = function (args) {
                if (args === void 0) { args = null; }
                return _this._host.executeOperation("Azure.Actions.Website.canAttachSnapshotDebugger", [args])
                    .then(function (state) {
                    var attributes = [
                        {
                            name: "canAttachSnapshotDebugger",
                            value: state
                        }
                    ];
                    return { results: attributes };
                });
            };
            this._azureConnection = azureConnection;
            this._attributeLoaderHelper = new AttributeLoaderHelper(azureConnection);
            this._host = host;
        }
        return AzureWebsiteAttributeLoader;
    }());
    AzureWebsiteAttributeLoader.getAllAttributesNamespace = "Azure.Attributes.Website.GetAttributes";
    AzureWebsiteAttributeLoader.getConfigAttributesNamespace = "Azure.Attributes.Website.GetConfigAttributes";
    AzureWebsiteAttributeLoader.getStateNamespace = "Azure.Attributes.Website.GetState";
    AzureWebsiteAttributeLoader.getPublishCredentialNamespace = "Azure.Attributes.Website.GetPublishCredentialAttributes";
    AzureWebsiteAttributeLoader.getAzureStackRemoteDebuggerProfilerNamespace = "Azure.Attributes.Website.GetAzureStackRemoteDebuggerProfilerAttributes";
    AzureWebsiteAttributeLoader.getIsDeleteFileEnabledNamespace = "Azure.Attributes.Website.GetDeleteFileAttributes";
    AzureWebsiteAttributeLoader.getAttachSnapshotDebuggerNamespace = "Azure.Attributes.Website.GetAttachSnapshotDebuggerNamespace";
    AzureWebsiteAttributeLoader.ResourceConfigUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/config/web?api-version={+apiVersion}");
    AzureWebsiteAttributeLoader.ResourcePublishCredentialUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/config/publishingcredentials/list?api-version={+apiVersion}");
    // Note : resourceId here is "/subscriptions/{subcription id}"
    AzureWebsiteAttributeLoader.ResourceServerFarmsUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/providers/Microsoft.Web/serverFarms?api-version=2016-09-01");
    // Note : resourceId here is "/subscriptions/{subcription id}"
    AzureWebsiteAttributeLoader.ResourceAzureStackMetadataUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/providers/Microsoft.Web/metadata?api-version=2016-08-01");
    // Note : resourceId here is "/subscriptions/{subcription id}"
    AzureWebsiteAttributeLoader.ResourceSiteUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/providers/Microsoft.Web/sites?api-version=2016-08-01");
    return AzureWebsiteAttributeLoader;
});

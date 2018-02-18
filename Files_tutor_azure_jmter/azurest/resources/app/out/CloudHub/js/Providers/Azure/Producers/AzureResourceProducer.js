/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Errors/ExceptionSerializationExtended", "es6-promise", "underscore", "underscore.string", "URIjs/URI", "URIjs/URITemplate", "Providers/Common/AzureConstants", "Providers/Common/ResourceTypesService", "Common/Errors", "Common/PromisesUtils"], function (require, exports, ExceptionSerializationExtended_1, rsvp, underscore, _string, URI, URITemplate, AzureConstants, ResourceTypesService, Errors, PromisesUtils) {
    "use strict";
    var Promise = rsvp.Promise;
    underscore.string = _string;
    /**
     * Contains the query actions that return Azure Resource entitites.
     */
    var AzureResourceProducer = (function () {
        function AzureResourceProducer(azureConnection, host, telemetryActions) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureResourceProducer.getFromResourceGroupNamespace, _this.getFromResourceGroup);
                queryBindingManager.addProducerBinding(AzureResourceProducer.getFromResourceIdNamespace, _this.getFromResourceId);
            };
            /**
             * Gets all resources from all subscriptions.
             */
            this.getAll = function (searchQuery, resourceTypes, findExactName, cloudName, subscription, continuationToken) {
                return _this.getAllResources(searchQuery, resourceTypes, findExactName, cloudName, subscription, continuationToken)
                    .then(function (result) {
                    return _this.processAppServices(result.results).then(function () {
                        var cloudGroups = underscore.groupBy(result.results, function (node) { return node.subscription.cloudName; });
                        var cloudNodes = [];
                        for (var key in cloudGroups) {
                            if (cloudGroups[key].length) {
                                var node = _this.createCloudGroup(key, cloudGroups[key][0].subscription, searchQuery);
                                node.children = _this._convertToNodeCollection(cloudGroups[key], searchQuery);
                                cloudNodes.push(node);
                            }
                        }
                        var actionableError;
                        if (!!result.error) {
                            actionableError = ExceptionSerializationExtended_1.default.serializeToObject(result.error);
                        }
                        return {
                            results: cloudNodes,
                            error: actionableError,
                            continuationToken: result.continuationToken
                        };
                    });
                });
            };
            this.createCloudGroup = function (name, subscription, searchQuery) {
                var cloudGroup = {
                    type: "Azure.CloudGroup",
                    attributes: [
                        {
                            name: "name",
                            value: name
                        }
                    ]
                };
                var node = require("Providers/Azure/Nodes/AzureResourceNodeFactory").convertAzureResource(cloudGroup);
                node.preExpanded = true;
                return node;
            };
            this.getAllResources = function (searchQuery, resourceTypes, findExactName, cloudName, subscription, continuationToken) {
                if (findExactName === void 0) { findExactName = false; }
                return new Promise(function (resolve, reject) {
                    var subsciptionsProimise;
                    if (subscription) {
                        subsciptionsProimise = Promise.resolve([subscription]);
                    }
                    else {
                        // Get all subscriptions
                        subsciptionsProimise = _this._azureConnection.getSelectedSubscriptions();
                    }
                    subsciptionsProimise.then(function (subscriptions) {
                        var requestOperations = [];
                        if (subscriptions) {
                            // Prepare the Resource Type filtering if the parameters
                            // are provided.
                            var resourceTypesQuery = "";
                            if (resourceTypes) {
                                resourceTypes.forEach(function (rt) {
                                    if (resourceTypesQuery) {
                                        resourceTypesQuery += " or ";
                                    }
                                    resourceTypesQuery += underscore.string.sprintf("resourceType eq '%s'", rt);
                                });
                                resourceTypesQuery = underscore.string.sprintf(" and (%s)", resourceTypesQuery);
                            }
                            // Query for exact resource name or substring of resource name.
                            var queryURITemplate = (findExactName) ? AzureResourceProducer.getAllResourcesEqualsUrlTemplate :
                                AzureResourceProducer.getAllResourcesSubstringUrlTemplate;
                            // Query for all resources of each subscription.
                            // We save the promise in an array so we can join all the responses together
                            // once all promises are resolved.
                            subscriptions.forEach(function (subscription) {
                                // Create the url according to the proper format
                                var url = queryURITemplate.expand({
                                    managementEndpoint: subscription.managementEndpoint,
                                    subscriptionId: subscription.id,
                                    searchQuery: searchQuery,
                                    resourceTypesQuery: resourceTypesQuery
                                });
                                if (!!continuationToken && continuationToken.indexOf("http") === 0) {
                                    // If we were passed a continuationToken that looks like a nextLink, use it as the url.
                                    url = URI(continuationToken);
                                }
                                if (cloudName && cloudName !== subscription.cloudName) {
                                    return;
                                }
                                var requestPromise = _this._azureConnection.webRequest(url.toString(), subscription, "GET")
                                    .then(function (response) {
                                    var parsedWebResponse = AzureResourceProducer.parseResourceWebResponse(response, subscription);
                                    var resources = parsedWebResponse.resources;
                                    // Special case: remove gateways for this particular query
                                    resources = underscore.filter(resources, function (resource) {
                                        return resource.type !== AzureConstants.resourceTypes.Gateways;
                                    });
                                    // Handle special case to identify mobile apps
                                    var mobileAppPromises = _this.processMobileApps(subscription, resources);
                                    // Wait for all promises to finish
                                    return Promise.all(mobileAppPromises)
                                        .then(function (mobileApps) {
                                        // Merge or update, as needed
                                        for (var i = 0; i < mobileApps.length; i++) {
                                            for (var j = 0; j < mobileApps[i].length; j++) {
                                                var currentMobileApp = mobileApps[i][j];
                                                var existingResource = underscore.findWhere(resources, { id: currentMobileApp.id });
                                                if (existingResource) {
                                                    existingResource.kind = currentMobileApp.kind;
                                                }
                                                else {
                                                    resources.push(currentMobileApp);
                                                }
                                            }
                                        }
                                        return parsedWebResponse;
                                    });
                                });
                                requestOperations.push(requestPromise);
                            });
                        }
                        // Wait for all operations to finish and
                        // join the responses together.
                        PromisesUtils.waitForAll(requestOperations)
                            .then(function (results) {
                            var resources = [];
                            var nextLink;
                            var rejectedValues = [];
                            results.forEach(function (promiseResult) {
                                if (!!promiseResult.rejectedValue) {
                                    rejectedValues.push(promiseResult.rejectedValue);
                                }
                                else if (!!promiseResult.resolvedValue) {
                                    if (promiseResult.resolvedValue.resources.length) {
                                        resources = resources.concat(promiseResult.resolvedValue.resources);
                                    }
                                    nextLink = promiseResult.resolvedValue.nextLink;
                                }
                            });
                            // Check if there is any rejected operation
                            // and log their errors.
                            var actionableError;
                            if (rejectedValues.length) {
                                rejectedValues.forEach(function (err) {
                                    // If the error is an ActionableError we save its reference
                                    // but we don't send telemetry about it.
                                    if (err.name === Errors.errorNames.ActionableError) {
                                        actionableError = err;
                                    }
                                    else {
                                        var errorInfo = {
                                            name: "AzureResourcesQueries.getAllResources",
                                            error: err
                                        };
                                        _this._telemetryActions.sendError(errorInfo);
                                    }
                                });
                            }
                            var result = {
                                results: resources,
                                error: actionableError,
                                continuationToken: nextLink
                            };
                            resolve(result);
                        }, reject);
                    }, reject);
                });
            };
            /**
             * Get all resources from a Resource Group
             */
            this.getFromResourceGroup = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var resourceGroupId = args.id;
                var subscriptionJson = args.subscription;
                var subscription = JSON.parse(subscriptionJson);
                var url = AzureResourceProducer.getResourcesFromResourceGroupUrlTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceGroupId: resourceGroupId
                });
                return _this.verifyAzureSdk.then(function (azureSdkInstalled) {
                    return _this._azureConnection.webRequest(url.toString(), subscription, "GET")
                        .then(function (response) {
                        var parsedResources = AzureResourceProducer.parseResourceWebResponse(response, subscription);
                        var resources = underscore.filter(parsedResources.resources, function (resource) {
                            // Do not process nodes that require Azure SDK
                            if (!azureSdkInstalled && AzureResourceProducer.requiresAzureSdk(resource.type)) {
                                return false;
                            }
                            // Using local require to deal with circular dependency.
                            var azureResourceTypeConfig = require("Providers/Azure/AzureResourceTypeConfig");
                            var typeConfig = azureResourceTypeConfig.getResourceTypeConfig(resource.type, resource.kind);
                            return !typeConfig || !typeConfig.hideTypeNode;
                        });
                        return _this.processAppServices(resources)
                            .then(function () {
                            return {
                                results: _this._convertToNodeCollection(resources)
                            };
                        });
                    });
                });
            };
            this.getFromResourceId = function (args) {
                if (args === void 0) { args = null; }
                var resourceId = args.id;
                var subscriptionJson = args.subscription;
                var apiVersion = args.apiVersion;
                var subscription = JSON.parse(subscriptionJson);
                var url = AzureResourceProducer.getResourcesFromResourceIdUrlTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: resourceId,
                    apiVersion: apiVersion
                });
                return _this.verifyAzureSdk.then(function (azureSdkInstalled) {
                    return _this._azureConnection.webRequest(url.toString(), subscription, "GET")
                        .then(function (response) {
                        var resource = JSON.parse(response);
                        AzureResourceProducer.processSingleResourceResponse(resource, subscription);
                        return {
                            results: _this._convertToNodeCollection([resource])
                        };
                    });
                });
            };
            this.processMobileApps = function (subscription, resources) {
                // Determine if any of these resources are web sites
                var webSites = underscore.filter(resources, function (resource) {
                    return resource.type === AzureConstants.resourceTypes.WebSites;
                });
                // Get a unique list of all resource groups containing web sites
                var webSiteResourceGroups = underscore.map(webSites, function (resource) {
                    return resource.resourceGroup;
                });
                webSiteResourceGroups = underscore.uniq(webSiteResourceGroups);
                // Query for all mobile apps in each resource group
                return underscore.map(webSiteResourceGroups, function (resourceGroup) {
                    return _this.getAllMobileApps(subscription, resourceGroup);
                });
            };
            this.getAllMobileApps = function (subscription, resourceGroup) {
                // Create the url according to the proper format
                var url = AzureResourceProducer.getAllMobileAppsUrlTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    subscriptionId: subscription.id,
                    resourceGroupId: resourceGroup
                });
                return _this._azureConnection.webRequest(url.toString(), subscription, "GET")
                    .then(function (response) {
                    var parsedWebResponse = AzureResourceProducer.parseResourceWebResponse(response, subscription);
                    var resources = parsedWebResponse.resources;
                    resources = underscore.filter(resources, function (resource) {
                        return resource.kind === AzureConstants.resourceKinds.MobileAppCode;
                    });
                    return resources;
                });
            };
            this.processAppServices = function (resources) {
                var checkIfWebsitesSupportSearchPromise;
                var websites = underscore.filter(resources, function (resource) { return _this.isAppService(resource); });
                for (var i = 0; i < websites.length; i++) {
                    if (String(websites[i].kind).toLowerCase() === "apiapp" || String(websites[i].kind).toLowerCase() === "api") {
                        // Make kind = (apiapp, api) become API app
                        websites[i].kind = AzureConstants.resourceKinds.ApiApp;
                    }
                    else if (String(websites[i].kind).toLowerCase() === "mobileapp" || String(websites[i].kind).toLowerCase() === "mobileappcode") {
                        // Make kind = (mobileapp, mobileApp) become Mobile app
                        websites[i].kind = AzureConstants.resourceKinds.MobileApp;
                    }
                    else if (String(websites[i].kind).toLowerCase() === "functionapp") {
                        // Make kind = (functionApp, functionapp) become Function app
                        websites[i].kind = AzureConstants.resourceKinds.FunctionApp;
                    }
                    else {
                        // Make everything else as Web app
                        websites[i].kind = AzureConstants.resourceKinds.WebApp;
                    }
                }
                if (websites.length > 0) {
                    // don't do anything unless we actually have to
                    if (AzureResourceProducer.webSitesSupportSearch === undefined) {
                        // need to find out if the current web sites tooling supports deep search
                        checkIfWebsitesSupportSearchPromise = _this.checkIfWebsitesSupportSearch();
                    }
                    else {
                        // we've already figured it out
                        checkIfWebsitesSupportSearchPromise = Promise.resolve();
                    }
                }
                else {
                    return Promise.resolve();
                }
                return checkIfWebsitesSupportSearchPromise.then(function () {
                    // when the promise is complete, we'll know if the web sites tooling supports deep search
                    websites.forEach(function (element) {
                        if (!!element.attributes) {
                            element.attributes.push({
                                name: "deepSearch",
                                value: AzureResourceProducer.webSitesSupportSearch
                            });
                        }
                        else {
                            element.attributes = [{
                                    name: "deepSearch",
                                    value: AzureResourceProducer.webSitesSupportSearch
                                }];
                        }
                    });
                });
            };
            this.checkIfWebsitesSupportSearch = function () {
                return _this._host.executeOperation("Azure.Actions.Website.canDeepSearch", [])
                    .then(function (result) {
                    AzureResourceProducer.webSitesSupportSearch = result;
                });
            };
            this.isAppService = function (resource) {
                return resource.type === AzureConstants.resourceTypes.WebSites;
            };
            this._azureConnection = azureConnection;
            this._host = host;
            this._telemetryActions = telemetryActions;
            this._convertToNodeCollection = require("Providers/Azure/Nodes/AzureResourceNodeFactory").convertToNodeCollection2;
            this.verifyAzureSdk = this._host.executeOperation("Environment.IsAzureSdkInstalled");
        }
        /**
         * Parses a list of IResponse objects from JSON representing a list of resources.
         */
        AzureResourceProducer.parseResourceWebResponse = function (response, subscription) {
            var parsedResponse = JSON.parse(response);
            // Check if the response was parsed
            if (!parsedResponse) {
                return;
            }
            var parsedWebResponse = {
                resources: parsedResponse.value,
                nextLink: parsedResponse.nextLink
            };
            // Check if the response contains a value
            if (!parsedWebResponse) {
                return;
            }
            // Iterate over all resources to add properties not added by Azure REST APIs
            parsedWebResponse.resources.forEach(function (resource) { return AzureResourceProducer.processSingleResourceResponse(resource, subscription); });
            return parsedWebResponse;
        };
        ;
        AzureResourceProducer.processSingleResourceResponse = function (resource, subscription) {
            // Azure does not provide a unique kind for premium storage accounts.
            // We have to define this kind of storage account ourselves.
            if (resource.sku && resource.sku.tier === AzureConstants.resourceKinds.PremiumStorage) {
                resource.kind = AzureConstants.resourceKinds.PremiumStorage;
            }
            // Extract the Resource Group from the id and add it as a property
            resource.resourceGroup = ResourceTypesService.parseResourceDescriptor(resource.id).resourceGroup;
            // We save the subscription object in every resource to avoid having to parse
            // it from the resource id every time we need it.
            resource.subscription = subscription;
        };
        return AzureResourceProducer;
    }());
    AzureResourceProducer.getFromResourceGroupNamespace = "Azure.Producers.Resources.GetFromResourceGroup";
    AzureResourceProducer.getFromResourceIdNamespace = "Azure.Producers.Resources.GetFromResourceId";
    AzureResourceProducer.getAllResourcesSubstringUrlTemplate = URITemplate("{+managementEndpoint}/subscriptions/{+subscriptionId}/resources?api-version=2014-04-01" +
        "&$filter=substringof('{+searchQuery}',name){resourceTypesQuery}");
    AzureResourceProducer.getAllResourcesEqualsUrlTemplate = URITemplate("{+managementEndpoint}/subscriptions/{+subscriptionId}/resources?api-version=2014-04-01" +
        "&$filter=name eq '{+searchQuery}' {resourceTypesQuery}");
    AzureResourceProducer.getAllMobileAppsUrlTemplate = URITemplate("{+managementEndpoint}/subscriptions/{+subscriptionId}/resourcegroups" +
        "/{+resourceGroupId}/providers/Microsoft.Web/sites?api-version=2015-05-01");
    AzureResourceProducer.getResourcesFromResourceGroupUrlTemplate = URITemplate("{+managementEndpoint}/{+resourceGroupId}/resources?api-version=2015-01-01");
    AzureResourceProducer.getResourcesFromResourceIdUrlTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/?api-version={+apiVersion}");
    AzureResourceProducer.requiresAzureSdk = function (resourceType) {
        return resourceType !== AzureConstants.resourceTypes.SQLServers
            && resourceType !== AzureConstants.resourceTypes.SQLDatabases
            && resourceType !== AzureConstants.resourceTypes.WebSites
            && resourceType !== AzureConstants.resourceTypes.WebSitesSlots;
    };
    /**
     * Add subscription and resource group information to resource.
     */
    AzureResourceProducer.addResourceContext = function (response, subscription) {
        var resource = response;
        resource.resourceGroup = ResourceTypesService.parseResourceDescriptor(resource.id).resourceGroup;
        resource.subscription = subscription;
        return resource;
    };
    AzureResourceProducer.webSitesSupportSearch = undefined;
    return AzureResourceProducer;
});

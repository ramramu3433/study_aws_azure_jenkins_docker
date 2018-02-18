/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "URIjs/URITemplate", "underscore", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Common/Errors", "Common/PromisesUtils", "Providers/Common/ResourceTypesService", "Common/Utilities"], function (require, exports, es6_promise_1, URITemplate, underscore, AzureResourceNodeFactory, Errors, PromisesUtils, ResourceTypesService, Utilities) {
    "use strict";
    /**
     * Contains the query actions that return Azure Resource Groups.
     */
    var AzureResourceGroupProducer = (function () {
        function AzureResourceGroupProducer(azureConnection, telemetryActions) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureResourceGroupProducer.getAllResourceGroupsNamespace, _this.getAll);
            };
            this.getAll = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var searchQuery = args.$search;
                // If there is no search query, use the regular method for
                // getting resource groups
                if (!searchQuery) {
                    return _this.getAllResourceGroups(args);
                }
                var subsciptionsProimise;
                if (args.subscription) {
                    var subscription = JSON.parse(args.subscription);
                    subsciptionsProimise = es6_promise_1.Promise.resolve([subscription]);
                }
                else {
                    // Get all subscriptions
                    subsciptionsProimise = _this._azureConnection.getSelectedSubscriptions();
                }
                return subsciptionsProimise
                    .then(function (subscriptions) {
                    var requestOperations = [];
                    var resourceNodes = [];
                    subscriptions.forEach(function (subscription) {
                        var url = AzureResourceGroupProducer.getResourcesForResourceGroupsCreationUrlTemplate.expand({
                            managementEndpoint: subscription.managementEndpoint,
                            searchQuery: searchQuery,
                            subscriptionId: subscription.id
                        });
                        requestOperations.push(_this._azureConnection.webRequest(url.toString(), subscription, "GET")
                            .then(function (response) {
                            var parsedResources = [];
                            var parsedResourceGroups = [];
                            var parsedResponse = JSON.parse(response);
                            if (parsedResponse && parsedResponse.value && parsedResponse.value.length) {
                                parsedResources = parsedResponse.value;
                            }
                            // For each resource, add their resourcep group and subscription properties
                            parsedResources.forEach(function (resource) {
                                // Extract the Resource Group from the id and add it as a property
                                resource.resourceGroup = ResourceTypesService.parseResourceDescriptor(resource.id).resourceGroup;
                                // We save the subscription id in every resource to avoid having to parse
                                // it from the resource id every time we need it.
                                resource.subscription = subscription;
                            });
                            // Convert the resources into a node collection
                            var nodes = AzureResourceNodeFactory.convertToNodeCollection2(parsedResources, searchQuery);
                            resourceNodes = resourceNodes.concat(nodes);
                            // Iterate over all resources that were successfully converted into nodes, and
                            // construct the resource groups using the information from the nodes
                            nodes.forEach(function (node) {
                                // Get the resource group name and subscription for each node
                                var nodeGroup = underscore.findWhere(node.attributes, { name: "resourceGroup" }).value;
                                // Iterate over all resource groups we have constructed,
                                // breaking from the loop if the resource group of the current
                                // node has already been created
                                var foundResourceGroup = parsedResourceGroups.some(function (resourceGroup) {
                                    return _this._groupContainsResource(resourceGroup, node);
                                });
                                // If we couldn't find the resource group of the current node, construct it
                                if (!foundResourceGroup) {
                                    var groupNode = _this._createResourceGroup(nodeGroup, subscription, searchQuery);
                                    groupNode.children = [];
                                    groupNode.children.push(node);
                                    parsedResourceGroups.push(groupNode);
                                }
                            });
                            return parsedResourceGroups;
                        }));
                    });
                    // Wait for all operations to finish and
                    // join the responses together.
                    return PromisesUtils.waitForAll(requestOperations)
                        .then(function (results) {
                        var resourceGroups = [];
                        var rejectedValues = [];
                        results.forEach(function (promiseResult) {
                            if (!!promiseResult.rejectedValue) {
                                rejectedValues.push(promiseResult.rejectedValue);
                            }
                            else if (!!promiseResult.resolvedValue && promiseResult.resolvedValue.length) {
                                resourceGroups = resourceGroups.concat(promiseResult.resolvedValue);
                            }
                        });
                        // Check if there is any rejected operation
                        // and log their errors.
                        var actionableError;
                        if (rejectedValues.length) {
                            rejectedValues.forEach(function (err, index) {
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
                        var queryResult = {
                            results: resourceGroups,
                            error: actionableError
                        };
                        // Iterate over each resource group and filter them by matching nodes.
                        queryResult.results.forEach(function (groupNode) {
                            var matchingNodes = _this._getMatchingChildren(groupNode, searchQuery);
                            groupNode.children = matchingNodes;
                            groupNode.preExpanded = (matchingNodes.length > 0);
                        });
                        return queryResult;
                    });
                });
            };
            /**
             * Gets all Resource Groups from all subscriptions.
             */
            this.getAllResourceGroups = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var subsciptionsProimise;
                if (args.subscription) {
                    var subscription = JSON.parse(args.subscription);
                    subsciptionsProimise = es6_promise_1.Promise.resolve([subscription]);
                }
                else {
                    // Get all subscriptions
                    subsciptionsProimise = _this._azureConnection.getSelectedSubscriptions();
                }
                // Get all subscriptions
                return subsciptionsProimise
                    .then(function (subscriptions) {
                    var requestOperations = [];
                    if (subscriptions) {
                        // Query for all resource groups for all subscriptions
                        // We save the promise in an array so we can join all the
                        // responses together once all promises are resolved.
                        subscriptions.forEach(function (subscription) {
                            // Create the url according to the proper format
                            var url = AzureResourceGroupProducer.getResourceGroupsUrlTemplate.expand({
                                managementEndpoint: subscription.managementEndpoint,
                                subscriptionId: subscription.id
                            });
                            requestOperations.push(_this._azureConnection.webRequest(url.toString(), subscription, "GET")
                                .then(function (response) {
                                var parsedResourceGroups = [];
                                var parsedResponse = JSON.parse(response);
                                // Check if the response was parsed
                                if (!!parsedResponse && !!parsedResponse.value && parsedResponse.value.length) {
                                    parsedResourceGroups = parsedResponse.value;
                                }
                                // Iterate over all resources to add properties not added by Azure REST APIs
                                parsedResourceGroups.forEach(function (resourceGroup) {
                                    // We save the subscription id in every resource to avoid having to parse
                                    // it from the resource id every time we need it.
                                    resourceGroup.subscription = subscription;
                                    resourceGroup.type = "Azure.ResourceGroup";
                                    _this._createResourceGroupAttributes(resourceGroup, []);
                                });
                                return parsedResourceGroups;
                            }));
                        });
                    }
                    // Wait for all operations to finish and join the responses
                    // together.
                    return PromisesUtils.waitForAll(requestOperations)
                        .then(function (results) {
                        var resourceGroups = [];
                        var rejectedValues = [];
                        results.forEach(function (promiseResult) {
                            if (!!promiseResult.rejectedValue) {
                                rejectedValues.push(promiseResult.rejectedValue);
                            }
                            else if (!!promiseResult.resolvedValue && promiseResult.resolvedValue.length) {
                                resourceGroups = resourceGroups.concat(promiseResult.resolvedValue);
                            }
                        });
                        // Check if there is any rejected operation
                        // and log their errors.
                        var actionableError;
                        if (rejectedValues.length) {
                            rejectedValues.forEach(function (err, index) {
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
                        var cloudGroups = underscore.groupBy(resourceGroups, function (node) { return node.subscription.cloudName; });
                        var cloudNodes = [];
                        for (var key in cloudGroups) {
                            if (cloudGroups[key].length) {
                                var node = _this._createCloudGroup(key, cloudGroups[key][0].subscription, "");
                                node.children = _this.convertToNodeCollection(cloudGroups[key]);
                                cloudNodes.push(node);
                            }
                        }
                        return {
                            results: cloudNodes.length === 1 ? cloudNodes[0].children : cloudNodes,
                            error: actionableError
                        };
                    });
                });
            };
            this.convertToQueryResult = function (resources, err) {
                return {
                    results: _this.convertToNodeCollection(resources),
                    error: err
                };
            };
            /**
             * Converts a collection of Azure Resource entities to a collection of nodes.
             */
            this.convertToNodeCollection = function (resources) {
                return AzureResourceNodeFactory.convertToNodeCollection(resources);
            };
            /**
             * Checks if a Resource belongs to a Resource Group.
             * The Resource is added as a child of the Resource Group if true.
             */
            this._groupContainsResource = function (resourceGroup, resource) {
                var groupSubscription = JSON.parse(underscore.findWhere(resourceGroup.attributes, { name: "subscription" }).value).id;
                var groupName = underscore.findWhere(resource.attributes, { name: "resourceGroup" }).value;
                var resourceSubscription = JSON.parse(underscore.findWhere(resource.attributes, { name: "subscription" }).value).id;
                // Check if the current resource belongs to the resource group
                var nameAttributes = resourceGroup.attributes.filter(function (attr) { return attr.value === "name"; });
                var name = (nameAttributes.length > 0) && nameAttributes[0].value;
                var containsResource = (groupName === name) && (resourceSubscription === groupSubscription);
                // If the resource does belong to the resource group, add
                // it to the group's children
                if (containsResource) {
                    resourceGroup.children.push(resource);
                }
                return containsResource;
            };
            /**
             * Creates a Resource Group node from information given by a resource.
             */
            this._createResourceGroup = function (name, subscription, searchQuery) {
                var resourceGroup = {
                    id: "/subscriptions/" + subscription.id + "/resourceGroups/" + name,
                    location: "",
                    name: name,
                    type: "Azure.ResourceGroup"
                };
                resourceGroup.subscription = subscription;
                var highlightLocations = Utilities.getHighlightLocations(name, searchQuery);
                _this._createResourceGroupAttributes(resourceGroup, highlightLocations);
                return AzureResourceNodeFactory.convertAzureResource(resourceGroup);
            };
            this._createCloudGroup = function (name, subscription, searchQuery) {
                var cloudGroup = {
                    type: "Azure.CloudGroup",
                    attributes: [
                        {
                            name: "name",
                            value: name
                        }
                    ]
                };
                var node = AzureResourceNodeFactory.convertAzureResource(cloudGroup);
                node.preExpanded = true;
                return node;
            };
            /**
             * Creates the attributes for a Resource Group.
             */
            this._createResourceGroupAttributes = function (resourceGroup, highlightLocations) {
                resourceGroup.attributes = [
                    {
                        name: "id",
                        value: resourceGroup.id
                    },
                    {
                        name: "isIsolatedCloud",
                        value: resourceGroup.subscription.isIsolatedCloud
                    },
                    {
                        name: "name",
                        value: resourceGroup.name
                    },
                    {
                        name: "subscriptionName",
                        value: resourceGroup.subscription.name
                    },
                    {
                        name: "location",
                        value: resourceGroup.location
                    },
                    {
                        name: "subscription",
                        value: JSON.stringify(resourceGroup.subscription)
                    },
                    {
                        name: "tenantId",
                        value: resourceGroup.subscription.tenantId
                    },
                    {
                        name: "highlightLocations",
                        value: JSON.stringify(highlightLocations)
                    }
                ];
            };
            /**
             * Gets list of nodes that contain the search query
             */
            this._getMatchingChildren = function (resourceGroup, searchQuery) {
                var matches = resourceGroup.children
                    .filter(function (node) {
                    var highlightLocations = Utilities.getNodeHighlightLocations(node, searchQuery);
                    return (highlightLocations.length > 0);
                });
                return matches;
            };
            this._azureConnection = azureConnection;
            this._telemetryActions = telemetryActions;
            this._resourceNodeFactory = new AzureResourceNodeFactory();
        }
        return AzureResourceGroupProducer;
    }());
    AzureResourceGroupProducer.getAllResourceGroupsNamespace = "Azure.Producers.ResourceGroups.GetAll";
    AzureResourceGroupProducer.getResourceGroupsUrlTemplate = URITemplate("{+managementEndpoint}/subscriptions/{+subscriptionId}/resourcegroups?api-version=2015-01-01");
    // This URL will be used to create the resource groups based on the search query;
    // it will return resources that contain the search query or are in a resource group
    // that contain the search query.
    AzureResourceGroupProducer.getResourcesForResourceGroupsCreationUrlTemplate = URITemplate("{+managementEndpoint}/subscriptions/{+subscriptionId}/resources?api-version=2014-04-01" +
        "&$filter=substringof('{+searchQuery}',name)%20or%20substringof('{+searchQuery}',resourceGroup)");
    return AzureResourceGroupProducer;
});

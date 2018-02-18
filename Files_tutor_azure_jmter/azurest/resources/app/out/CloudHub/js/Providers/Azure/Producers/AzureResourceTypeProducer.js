/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "es6-promise", "Providers/Common/AzureConstants", "Providers/Azure/Producers/AzureResourceProducer", "Providers/Azure/Nodes/AzureResourceNodeFactory", "Providers/Azure/AzureResourceTypeConfig", "Providers/Azure/DeepSearch/DeepSearch"], function (require, exports, underscore, rsvp, AzureConstants, AzureResourceProducer, AzureResourceNodeFactory, AzureResourceTypeConfig, DeepSearch) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Contains the query actions that return Azure Resource Type entitites.
     */
    var AzureResourceTypeProducer = (function () {
        function AzureResourceTypeProducer(azureConnection, azureResourceProducer, externalResourceProducer, telemetry) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureResourceTypeProducer.getAllResourceTypesNamespace, _this.getAll);
                queryBindingManager.addProducerBinding(AzureResourceTypeProducer.getResourcesByTypeNamespace, _this.getResourcesByType);
                queryBindingManager.addProducerBinding(AzureResourceTypeProducer.getAllExternalResourceTypesNamespace, _this.getAllExternal);
            };
            /**
             * Makes sure that the clode nodes from the Azure Resource Producer are
             *   Since resource types view showscontain external resources, there needs to be a cloud to contain these.
             *   This function guarantees that there will be at least one cloud node. If Azure returns no clouds, there will
             *   be a node created for external resources
             */
            this._normalizeCloudNodes = function (cloudNodes, searchQuery) {
                if (!cloudNodes.results || !cloudNodes.results.length) {
                    var node = _this._azureResourceProducer.createCloudGroup("", null, searchQuery);
                    node.children = [];
                    cloudNodes.results.push(node);
                }
            };
            /**
             * Get all resources for the resources types provided in args.
             */
            this.getResourcesByType = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var nodeType = args.type;
                var resourceTypes = args.resourceTypes;
                if (!resourceTypes) {
                    return Promise.resolve({
                        results: []
                    });
                }
                var resourceTypesArray = resourceTypes.split(";");
                var searchQuery = args.$search;
                var cloudName = args.$cloudName;
                var deepSearchProvider;
                var isDeepSearchQuery;
                var searchResourceName;
                if (searchQuery) {
                    // Parse the search query.
                    // Get the correct provider for this deep search.
                    deepSearchProvider = DeepSearch.getProvider(searchQuery);
                    isDeepSearchQuery = !!deepSearchProvider;
                    searchResourceName = (isDeepSearchQuery) ? deepSearchProvider.getResourceName() : searchQuery;
                }
                var subscription;
                if (args.subscription) {
                    subscription = JSON.parse(args.subscription);
                }
                return _this._azureResourceProducer.verifyAzureSdk.then(function (azureSdkInstalled) {
                    // Find the exact name only if there is actually a resource name provided.
                    var findExactName = !!(isDeepSearchQuery && searchResourceName);
                    return _this._azureResourceProducer.getAll(searchResourceName, resourceTypesArray, findExactName, cloudName, subscription, continuationToken)
                        .then(function (resourceNodes) {
                        _this._normalizeCloudNodes(resourceNodes, searchQuery);
                        return _this._externalResourceProducer.getAll(args, continuationToken, resourceTypesArray, findExactName, searchResourceName)
                            .then(function (externalNodes) {
                            var filteredNodes = [];
                            resourceNodes.results.forEach(function (node) {
                                node.children = externalNodes.results ? externalNodes.results.concat(node.children) : node.children;
                                // Ignore nodes that should not be included.
                                node.children.forEach(function (node) {
                                    if (!node.parentType) {
                                        return;
                                    }
                                    var effectiveType = node.parentType;
                                    if (!azureSdkInstalled && AzureResourceProducer.requiresAzureSdk(effectiveType)) {
                                        return;
                                    }
                                    var resourceTypeConfig = AzureResourceTypeConfig.getResourceTypeConfig(effectiveType, node.kind);
                                    if (resourceTypeConfig) {
                                        if (resourceTypeConfig.hideTypeNode || !resourceTypeConfig.supported) {
                                            return;
                                        }
                                    }
                                    // Check if this node belongs to the resource type we should be loading.
                                    // resourceTypeConfig is the config for the node's parent type.
                                    // We check if that config's alias includes our resource type.
                                    var expectedParentType = resourceTypeConfig.aliases.some(function (alias) {
                                        return (AzureResourceTypeProducer.resourceTypeNodeTypeAttributePrefix + alias) === nodeType;
                                    });
                                    if (!expectedParentType) {
                                        return;
                                    }
                                    if (node.kind) {
                                        // Check if the resource kind is part of the blocked list
                                        if (resourceTypeConfig &&
                                            resourceTypeConfig.unsupportedKinds &&
                                            resourceTypeConfig.unsupportedKinds.indexOf(node.kind) >= 0) {
                                            return;
                                        }
                                    }
                                    if (isDeepSearchQuery) {
                                        // Allow the deep search provider the opportunity to handle the node.
                                        deepSearchProvider.handleResultNode(node);
                                    }
                                    // Finally, add the node as it didn't match any of the above criteria.
                                    filteredNodes.push(node);
                                });
                            });
                            return {
                                results: filteredNodes,
                                error: resourceNodes.error,
                                continuationToken: resourceNodes.continuationToken
                            };
                        });
                    });
                });
            };
            /**
             * Gets resource types from all subscriptions.
             */
            this.getAll = function (args, continuationToken, existingTypes) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                if (existingTypes === void 0) { existingTypes = null; }
                var searchQuery = args.$search;
                // If no resource types are specified, all will be retrieved.
                var searchResourceTypes = (args.supportedResourceTypes) ? args.supportedResourceTypes : null;
                var resourceTypesShouldPreExpand = !!args.preExpand;
                var deepSearchProvider;
                var isDeepSearchQuery;
                var searchResourceName;
                if (searchQuery) {
                    // Parse the search query.
                    // Get the correct provider for this deep search.
                    deepSearchProvider = DeepSearch.getProvider(searchQuery);
                    isDeepSearchQuery = !!deepSearchProvider;
                    searchResourceName = (isDeepSearchQuery) ? deepSearchProvider.getResourceName() : searchQuery;
                    if (isDeepSearchQuery) {
                        var deepSearchSupportedResourceTypes = deepSearchProvider.getSupportedResourceTypes();
                        // If searchResourceTypes is set, we do intersection to prevent users from executing deep
                        // search on resource types that we didn't want to show.
                        searchResourceTypes = (searchResourceTypes) ? underscore.intersection(searchResourceTypes, deepSearchSupportedResourceTypes) : deepSearchSupportedResourceTypes;
                    }
                }
                var subscription;
                if (args.subscription) {
                    subscription = JSON.parse(args.subscription);
                }
                return _this._azureResourceProducer.verifyAzureSdk.then(function (azureSdkInstalled) {
                    // Find the exact name only if there is actually a resource name provided.
                    var findExactName = !!(isDeepSearchQuery && searchResourceName);
                    // So far there is no way to request azure for only the resources type used by
                    // subscriptions. So we need to query for all resources and group them manually.
                    // TODO: Find a better solution.
                    return _this._azureResourceProducer.getAll(searchResourceName, searchResourceTypes, findExactName, null, subscription, continuationToken)
                        .then(function (resourceNodes) {
                        _this._normalizeCloudNodes(resourceNodes, searchQuery);
                        resourceNodes.results.forEach(function (node) {
                            node.children = _this.createResourceTypeNodes(node.children, azureSdkInstalled, subscription);
                            // Add the search query as an attribute to the nodes
                            node.children.forEach(function (resourceType) {
                                resourceType.attributes.push({
                                    name: "$cloudName",
                                    value: _this.getCloudNodeName(node)
                                });
                            });
                            if (resourceTypesShouldPreExpand || searchQuery) {
                                node.children.forEach(function (node) {
                                    // Expand the nodes so their children are loaded.
                                    node.preExpanded = true;
                                });
                            }
                        });
                        // If we only have one cloud, only show the children in the tree view
                        var allNodes = resourceNodes.results.length === 1 ? resourceNodes.results[0].children : resourceNodes.results;
                        if (!!existingTypes) {
                            // if this is a recursive call of getAll, add on the previously generated types
                            allNodes = allNodes.concat(existingTypes);
                            allNodes = underscore.uniq(allNodes, function (node) {
                                return node.displayName.value;
                            });
                        }
                        if (!!resourceNodes.continuationToken) {
                            // if we have a continuation token, then grab the next set of resources
                            return _this.getAll(args, resourceNodes.continuationToken, allNodes);
                        }
                        else {
                            var pluginQueryResult = _this.convertToQueryResult(allNodes, resourceNodes.error, resourceNodes.continuationToken);
                            return pluginQueryResult;
                        }
                    });
                });
            };
            /**
             * Gets resource types from all subscriptions.
             */
            this.getAllExternal = function (args, continuationToken) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                var searchQuery = args.$search;
                // If no resource types are specified, all will be retrieved.
                var searchResourceTypes = (args.supportedResourceTypes) ? args.supportedResourceTypes : null;
                var resourceTypesShouldPreExpand = !!args.preExpand;
                var deepSearchProvider;
                var isDeepSearchQuery;
                var searchResourceName;
                if (searchQuery) {
                    // Parse the search query.
                    // Get the correct provider for this deep search.
                    deepSearchProvider = DeepSearch.getProvider(searchQuery);
                    isDeepSearchQuery = !!deepSearchProvider;
                    searchResourceName = (isDeepSearchQuery) ? deepSearchProvider.getResourceName() : searchQuery;
                    if (isDeepSearchQuery) {
                        var deepSearchSupportedResourceTypes = deepSearchProvider.getSupportedResourceTypes();
                        // If searchResourceTypes is set, we do intersection to prevent users from executing deep
                        // search on resource types that we didn't want to show.
                        searchResourceTypes = (searchResourceTypes) ? underscore.intersection(searchResourceTypes, deepSearchSupportedResourceTypes) : deepSearchSupportedResourceTypes;
                    }
                }
                return _this._azureResourceProducer.verifyAzureSdk.then(function (azureSdkInstalled) {
                    // Find the exact name only if there is actually a resource name provided.
                    var findExactName = !!(isDeepSearchQuery && searchResourceName);
                    // So far there is no way to request azure for only the resources type used by
                    // subscriptions. So we need to query for all resources and group them manually.
                    // TODO: Find a better solution.
                    return Promise.resolve({ results: [] })
                        .then(function (resourceNodes) {
                        _this._normalizeCloudNodes(resourceNodes, searchQuery);
                        return _this._externalResourceProducer.getAll(args, continuationToken, null, findExactName, searchResourceName)
                            .then(function (externalNodes) {
                            resourceNodes.results.forEach(function (node) {
                                node.children = node.children.concat(externalNodes.results);
                                node.children = _this.createResourceTypeNodes(node.children, azureSdkInstalled);
                                // Add the search query as an attribute to the nodes
                                node.children.forEach(function (resourceType) {
                                    resourceType.attributes.push({
                                        name: "$cloudName",
                                        value: _this.getCloudNodeName(node)
                                    });
                                });
                                if (resourceTypesShouldPreExpand || searchQuery) {
                                    node.children.forEach(function (node) {
                                        // Expand the nodes so their children are loaded.
                                        node.preExpanded = true;
                                    });
                                }
                            });
                            // If we only have one cloud, only show the children in the tree view
                            var allNodes = resourceNodes.results.length === 1 ? resourceNodes.results[0].children : resourceNodes.results;
                            var pluginQueryResult = _this.convertToQueryResult(allNodes, resourceNodes.error);
                            return pluginQueryResult;
                        });
                    });
                });
            };
            /**
             * Groups a list of nodes by their resource type.
             */
            this.createResourceTypeNodes = function (nodes, azureSdkInstalled, subscription) {
                var resourceTypes = [];
                var subscriptionJson;
                if (subscription) {
                    subscriptionJson = JSON.stringify(subscription);
                }
                if (nodes.length) {
                    // Iterate over all resources and create their resource type
                    nodes.forEach(function (node) {
                        if (!node.parentType) {
                            // Parent type is required for nodes.
                            // If a node does not have parentType defined, it will be ignored.
                            return;
                        }
                        var effectiveType = node.parentType;
                        // Do not process nodes that require Azure SDK
                        if (!azureSdkInstalled && AzureResourceProducer.requiresAzureSdk(effectiveType)) {
                            return;
                        }
                        // Get Resource Type Config
                        var resourceTypeConfig = AzureResourceTypeConfig.getResourceTypeConfig(effectiveType, node.kind);
                        // Check if the resource types should be excluded
                        if (resourceTypeConfig) {
                            if (resourceTypeConfig.hideTypeNode || !resourceTypeConfig.supported) {
                                return;
                            }
                        }
                        // Check if the resource type was already added
                        var resourceType = AzureResourceTypeProducer.findResourceType(resourceTypes, effectiveType, node.kind);
                        if (!resourceType) {
                            if (resourceTypeConfig) {
                                // If resource config exists, create a new resource type from config.
                                resourceType = _this.createResourceType(resourceTypeConfig, effectiveType, subscription);
                            }
                            else {
                                // If no resource config exists, create a new resource type
                                // The resource type format is "{Provider}/{Type}/{SubType}/...".
                                // We only show the last sub-type part of it as its name.
                                var typeParts = effectiveType.split("/");
                                var name = typeParts[typeParts.length - 1];
                                // Telemetry: Track unknown resources.
                                var telemetryType = "Type";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = effectiveType;
                                _this._telemetry.sendEvent("Azure.unknownResource", telemetryProperties);
                                resourceType = {
                                    type: effectiveType,
                                    kind: node.kind,
                                    displayName: { value: name },
                                    icon: AzureConstants.imagePaths.DefaultResourceIcon,
                                    themeSrc: AzureConstants.imageThemeSrc.DefaultResourceIcon,
                                    attributes: [
                                        {
                                            name: "type",
                                            value: AzureResourceTypeProducer.resourceTypeNodeTypeAttributePrefix + "unknown"
                                        },
                                        {
                                            name: "subscription",
                                            value: subscriptionJson
                                        }
                                    ]
                                };
                            }
                            resourceTypes.push(resourceType);
                        }
                        if (!!node.kind) {
                            // Check if the resource kind is part of the blocked list
                            if (!!resourceTypeConfig &&
                                !!resourceTypeConfig.unsupportedKinds &&
                                resourceTypeConfig.unsupportedKinds.indexOf(node.kind) >= 0) {
                                return;
                            }
                        }
                        _this.appendResourceTypesAttribute(resourceType.attributes, node.type);
                    });
                }
                return resourceTypes;
            };
            /**
             * Add the 'resourceTypes' attribute to the resource and append the node type.
             * e.g.
             * { name: "resourceTypes", value: "Microsoft.ClassicStorage/storageAccounts;Microsoft.Storage/storageAccounts" }
             */
            this.appendResourceTypesAttribute = function (resourceTypeAttributes, nodeType) {
                var resourceTypeAttributeExists = false;
                resourceTypeAttributes.forEach(function (attribute) {
                    // find the resourceTypes attribute
                    if (attribute.name === "resourceTypes") {
                        resourceTypeAttributeExists = true;
                        // only add the node type if it hasn't already been added
                        if (attribute.value.indexOf(nodeType) === -1) {
                            attribute.value += ";" + nodeType;
                        }
                    }
                });
                // the attribute wasn't found so add now
                if (!resourceTypeAttributeExists) {
                    resourceTypeAttributes.push({
                        name: "resourceTypes",
                        value: nodeType
                    });
                }
            };
            /**
             * Create the resource type INode using the resource node factory.
             */
            this.createResourceType = function (resourceTypeConfig, effectiveType, subscription) {
                var subscriptionJson;
                if (subscription) {
                    subscriptionJson = JSON.stringify(subscription);
                }
                var resourceType = AzureResourceNodeFactory.convertAzureResource({
                    type: effectiveType,
                    kind: resourceTypeConfig.kind,
                    attributes: [
                        {
                            name: "type",
                            value: AzureResourceTypeProducer.resourceTypeNodeTypeAttributePrefix + effectiveType
                        },
                        {
                            name: "subscription",
                            value: subscriptionJson
                        }
                    ]
                });
                return resourceType;
            };
            this.getCloudNodeName = function (node) {
                return underscore.findWhere(node.attributes, { name: "name" }).value;
            };
            /**
             * Converts a collection of Azure Resource Type entities to a collection of nodes.
             */
            this.convertToQueryResult = function (resourceTypes, err, continuationToken) {
                return {
                    results: resourceTypes,
                    error: err,
                    continuationToken: continuationToken
                };
            };
            this._azureConnection = azureConnection;
            this._azureResourceProducer = azureResourceProducer;
            this._externalResourceProducer = externalResourceProducer;
            this._telemetry = telemetry;
        }
        return AzureResourceTypeProducer;
    }());
    AzureResourceTypeProducer.getAllResourceTypesNamespace = "Azure.Producers.ResourceTypes.GetAll";
    AzureResourceTypeProducer.getAllExternalResourceTypesNamespace = "Azure.Producers.ResourceTypes.GetAllExternal";
    AzureResourceTypeProducer.getResourcesByTypeNamespace = "Azure.Producers.ResourceTypes.GetResourcesByType";
    AzureResourceTypeProducer.resourceTypeNodeTypeAttributePrefix = "ResourceTypeGroupNode-";
    AzureResourceTypeProducer.findResourceType = function (resourceTypes, resourceType, resourceKind) {
        var matches = underscore.filter(resourceTypes, function (resourceTypeNode) {
            return resourceTypeNode.type.toLowerCase() === resourceType.toLowerCase();
        });
        return underscore.first(matches);
    };
    return AzureResourceTypeProducer;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/AzureResourceTypeConfig", "Providers/Azure/Nodes/AzureResourceNode", "Providers/Common/AzureConstants", "Common/Utilities"], function (require, exports, AzureResourceTypeConfig, AzureResourceNode, AzureConstants, Utilities) {
    "use strict";
    /**
     * Converts Azure Resource entity to Cloud Explore Node
     */
    var AzureResourceNodeFactory = (function () {
        function AzureResourceNodeFactory() {
        }
        return AzureResourceNodeFactory;
    }());
    /**
     * Converts an AzureResource to a Cloud Explorer Tree View node.
     * It returns undefined if the node couldn't be converted,
     * i.e: The node is in the blocked list
     */
    AzureResourceNodeFactory.convertAzureResource = function (resource) {
        // Check if the resource type is part of the blocked list
        var resourceTypeConfig = AzureResourceTypeConfig.getResourceTypeConfig(resource.type, resource.kind);
        if (!!resourceTypeConfig && resourceTypeConfig.supported === false) {
            return;
        }
        if (!resourceTypeConfig) {
            resourceTypeConfig = AzureResourceTypeConfig.getResourceTypeConfig(AzureConstants.baseTypes.Resource);
        }
        var node = new AzureResourceNode();
        node.attributes = resource.attributes;
        // add subscription id as an attribute
        for (var i = 0; i < resource.attributes.length; i++) {
            if (resource.attributes[i].name === "subscription" && typeof resource.attributes[i].value !== "undefined" && resource.attributes[i].value !== null) {
                var parsedSubsctiption = JSON.parse(resource.attributes[i].value);
                node.attributes.push({ name: "subscriptionId", value: parsedSubsctiption.id });
            }
        }
        node.kind = resource.kind;
        node.type = resource.type;
        if (!!resourceTypeConfig.inherits) {
            resourceTypeConfig.inherits.forEach(function (config) {
                var parentTypeConfig = AzureResourceTypeConfig.getResourceTypeConfig(config);
                node = AzureResourceNodeFactory.addConfigToNode(node, parentTypeConfig);
                var grandparentTypes = parentTypeConfig.inherits;
                if (grandparentTypes) {
                    grandparentTypes.forEach(function (grandparentType) {
                        // Multiple levels of inheritance?
                        // It's not an error if the grandchild is one that's also explicitly inherited by the parent
                        if (config.indexOf("Microsoft.Web/sites") > 0) {
                            return;
                        }
                        if (grandparentType && (resourceTypeConfig.inherits.indexOf(grandparentType) < 0)) {
                            throw "Only a single level of inheritance is supported in the configuration. "
                                + (resourceTypeConfig.aliases[0] + " inherits " + config + " inherits " + grandparentType); // No need to localize
                        }
                    });
                }
            });
        }
        node = AzureResourceNodeFactory.addConfigToNode(node, resourceTypeConfig);
        // Set the displayName here (as some resources don't have the name provided in the attributes)
        // If resource name is available, it overrides any preceding displayName set by configs.
        if (resource.name) {
            node.displayName = { value: resource.name };
        }
        AzureResourceNodeFactory.setNodeUid(resource, node);
        return node;
    };
    /**
     * Converts an AzureResource collection to a collection of Cloud Explorer Tree View nodes.
     */
    AzureResourceNodeFactory.convertToNodeCollection = function (resources, searchQuery) {
        var nodes = [];
        // Convert each resource and add to the result list.
        resources.forEach(function (resource) {
            var node = AzureResourceNodeFactory.convertAzureResource(resource);
            if (node) {
                // Get the highlight properties of the node
                var highlightLocations = Utilities.getNodeHighlightLocations(node, searchQuery);
                if (highlightLocations.length > 1) {
                    // Since deep search supports prefix right now, only highlight the prefix (not all occurrences).
                    highlightLocations = highlightLocations.slice(0, 1);
                }
                node.attributes.push({
                    name: "highlightLocations",
                    value: JSON.stringify(highlightLocations)
                });
                nodes.push(node);
            }
        });
        return nodes;
    };
    /**
     * Converts a collection of Azure Resource entities to a collection of nodes.
     * TODO: reconcile with the other 'convertToNodeCollection' method, if possible
     */
    AzureResourceNodeFactory.convertToNodeCollection2 = function (resources, searchQuery) {
        var nodes = [];
        // Convert each resource and add to the result list.
        resources.forEach(function (resource) {
            if (!resource.attributes) {
                resource.attributes = [];
            }
            resource.attributes.push({ name: "id", value: resource.id }, { name: "isIsolatedCloud", value: resource.subscription.isIsolatedCloud }, { name: "kind", value: resource.kind }, { name: "location", value: resource.location }, { name: "name", value: resource.name }, { name: "resourceGroup", value: resource.resourceGroup }, { name: "subscription", value: JSON.stringify(resource.subscription) }, { name: "subscriptionName", value: resource.subscription.name }, { name: "tenantId", value: resource.subscription.tenantId }, { name: "type", value: resource.type }, { name: "sku", value: resource.sku }, { name: "tags", value: JSON.stringify(resource.tags) });
            // TODO add portalUrl and remove special Open in Portal command.
            if (resource.type.toLowerCase() === AzureConstants.resourceTypes.SQLDatabases.toLowerCase()) {
                names = resource.name.split("/");
                resource.name = names[1];
                resource.attributes.push({
                    name: "server",
                    value: names[0]
                });
            }
            var names;
            if (resource.type.toLowerCase() === AzureConstants.resourceTypes.NotificationHubs.toLowerCase()) {
                // parse the name value to get the namespace and name and set resource name
                names = resource.name.split("/");
                resource.name = names[1];
                resource.attributes.push({
                    name: "namespace",
                    value: names[0]
                });
            }
            var node = AzureResourceNodeFactory.convertAzureResource(resource);
            if (node) {
                var highlightLocations = Utilities.getNodeHighlightLocations(node, searchQuery);
                node.attributes.push({
                    name: "highlightLocations",
                    value: JSON.stringify(highlightLocations)
                });
                nodes.push(node);
            }
        });
        return nodes;
    };
    /**
     * Adds config properties to a given node.
     */
    AzureResourceNodeFactory.addConfigToNode = function (node, config) {
        if (config) {
            if (config.displayName) {
                node.displayName = config.displayName;
            }
            if (config.parentType) {
                node.parentType = config.parentType;
            }
            if (config.highlightLocations) {
                node.highlightLocations = config.highlightLocations;
            }
            if (config.status) {
                node.status = config.status;
            }
            if (config.deepSearchSupported) {
                node.deepSearchSupported = config.deepSearchSupported;
            }
            if (config.icon) {
                node.icon = config.icon;
                node.themeSrc = config.themeSrc;
            }
            if (config.actions) {
                node.actions = node.actions.concat(config.actions);
            }
            if (config.childrenQuery) {
                node.childrenQuery = config.childrenQuery;
            }
            if (config.searchQuery) {
                node.searchQuery = config.searchQuery;
            }
            if (config.loaders) {
                node.loaders = node.loaders.concat(config.loaders);
            }
            if (config.properties) {
                node.properties = node.properties.concat(config.properties);
            }
        }
        return node;
    };
    AzureResourceNodeFactory.setNodeUid = function (resource, iNode) {
        if (!resource.uidAttribute) {
            iNode.uid = AzureResourceNodeFactory.findUid(iNode);
        }
        else {
            iNode.attributes.forEach(function (attribute) {
                if (attribute.name === resource.uidAttribute) {
                    iNode.uid = attribute.value;
                }
            });
        }
    };
    /**
     * Used if the producer didn't tell us what attribute to use for the node's uid (aka, uidAttribute). The method will examine the node's attributes
     * to try and find possible candidiates, and then return the best one we find.
     */
    AzureResourceNodeFactory.findUid = function (iNode) {
        /* tslint:disable */
        var possibleUids = {};
        iNode.attributes.forEach(function (attribute) {
            if (attribute.name === "url" || attribute.name === "id" || attribute.name === "nodeType" || attribute.name === "type" || attribute.name === "name") {
                if (typeof attribute.value === "string") {
                    possibleUids[attribute.name] = attribute.value;
                }
            }
        });
        if (!!iNode.displayName && typeof iNode.displayName.value === "string") {
            possibleUids["iNode.displayName.value"] = iNode.displayName.value;
        }
        return possibleUids["url"] || possibleUids["iNode.displayName.value"] || possibleUids["id"] || possibleUids["nodeType"] || possibleUids["type"] || possibleUids["name"];
        /* tslint:enable */
    };
    return AzureResourceNodeFactory;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "../../../StorageExplorer/Settings/QuickAccessManager", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Common/Debug"], function (require, exports, AzureConstants, QuickAccessManager_1, CloudExplorerResources, Debug) {
    "use strict";
    /**
     * Contains the query actions that return Quick Access nodes.
     */
    var QuickAccessProducer = (function () {
        function QuickAccessProducer(host, telemetry) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(QuickAccessProducer.getQuickAccessNamespace, _this.getAll);
            };
            /**
             * Gets all quick access nodes.
             */
            this.getAll = function (args, continuationToken, resourceTypes, findExactName, searchResourceName) {
                if (args === void 0) { args = null; }
                if (continuationToken === void 0) { continuationToken = null; }
                if (resourceTypes === void 0) { resourceTypes = null; }
                if (findExactName === void 0) { findExactName = false; }
                if (searchResourceName === void 0) { searchResourceName = ""; }
                return _this._quickAccessManager.getQuickAccessItems().then(function (quickAccessItems) {
                    var nodePromises = quickAccessItems.map(function (element) { return _this._host.executeOperation(element.producerNamespace, [element.producerArgs]).then(function (result) {
                        var node = null;
                        if (result && result.results && result.results.length > 0) {
                            node = result.results[0];
                        }
                        return {
                            element: element,
                            node: node
                        };
                    }).catch(function (error) {
                        // Unable to produce the node, create a placeholder indicating the link to the original item is broken.
                        var node = {
                            icon: AzureConstants.imagePaths.BrokenLinkIcon,
                            displayName: { value: element.displayName },
                            uid: JSON.stringify(element)
                        };
                        return {
                            element: element,
                            node: node
                        };
                    }); });
                    return Promise.all(nodePromises).then(function (quickAccessNodes) {
                        var nodes = [];
                        quickAccessNodes.forEach(function (quickAccessNode) {
                            try {
                                var node = quickAccessNode.node;
                                if (node) {
                                    // Adds "Remove from Quick Access" action.
                                    var removeAction = {
                                        namespace: "Azure.Actions.Storage.removeFromQuickAccess",
                                        displayName: { resource: { namespace: CloudExplorerResources.namespace, resourceId: QuickAccessManager_1.default.RemoveFromQuickAccessResourceStringId } },
                                        boundArguments: {
                                            displayName: {
                                                value: quickAccessNode.element.displayName
                                            },
                                            producerNamespace: {
                                                value: quickAccessNode.element.producerNamespace
                                            },
                                            producerArgs: {
                                                value: quickAccessNode.element.producerArgs
                                            }
                                        }
                                    };
                                    if (!node.actions) {
                                        node.actions = [];
                                    }
                                    node.actions.push(removeAction);
                                    // Removes "Add to Quick Access" action since this node is already in Quick Access.
                                    var addActionIndex_1 = -1;
                                    node.actions.forEach(function (value, index, array) {
                                        if (value.namespace === "Azure.Actions.Storage.addToQuickAccess") {
                                            addActionIndex_1 = index;
                                        }
                                    });
                                    if (addActionIndex_1 >= 0) {
                                        node.actions.splice(addActionIndex_1, 1);
                                    }
                                    nodes.push(node);
                                }
                            }
                            catch (error) {
                                Debug.warn(error);
                            }
                        });
                        var result = {
                            results: nodes
                        };
                        return result;
                    });
                });
            };
            this._host = host;
            this._quickAccessManager = new QuickAccessManager_1.default(host, telemetry);
        }
        return QuickAccessProducer;
    }());
    QuickAccessProducer.getQuickAccessNamespace = "Azure.Producers.ResourceTypes.GetQuickAccess";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QuickAccessProducer;
});

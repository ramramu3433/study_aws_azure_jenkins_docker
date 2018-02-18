/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Common/Debug", "CloudExplorer/UI/NodeViewModel", "CloudExplorer/TreeNode/NodeUid"], function (require, exports, rsvp, Debug, NodeViewModel, NodeUid) {
    "use strict";
    var Promise = rsvp.Promise;
    var ElementInteractionActions = (function () {
        function ElementInteractionActions(explorerInteractionExecutor, host) {
            var _this = this;
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(ElementInteractionActions.query, _this._executeElementQuery);
                actionBindingManager.addActionBinding(ElementInteractionActions.childrenQuery, _this._executeElementChildrenQuery);
                actionBindingManager.addActionBinding(ElementInteractionActions.getAttribute, _this._getAttribute);
                actionBindingManager.addActionBinding(ElementInteractionActions.getAttributes, _this._getAttributes);
                actionBindingManager.addActionBinding(ElementInteractionActions.setAttribute, _this._setAttribute);
                actionBindingManager.addActionBinding(ElementInteractionActions.select, _this._select);
                actionBindingManager.addActionBinding(ElementInteractionActions.expand, _this._expand);
                actionBindingManager.addActionBinding(ElementInteractionActions.refresh, _this._refresh);
                actionBindingManager.addActionBinding(ElementInteractionActions.collapse, _this._collapse);
                actionBindingManager.addActionBinding(ElementInteractionActions.getActions, _this._getActions);
                actionBindingManager.addActionBinding(ElementInteractionActions.getProperties, _this._getProperties);
                actionBindingManager.addActionBinding(ElementInteractionActions.executeDefaultAction, _this._executeDefaultAction);
                actionBindingManager.addActionBinding(ElementInteractionActions.loadMoreChildren, _this._loadMoreChildren);
                actionBindingManager.addActionBinding(ElementInteractionActions.refreshChildren, _this._refreshChildren);
                actionBindingManager.addActionBinding(ElementInteractionActions.refresDynamicAttributes, _this._refreshDynamicAttributes);
                actionBindingManager.addActionBinding(ElementInteractionActions.addChild, _this._addChild);
                actionBindingManager.addActionBinding(ElementInteractionActions.addChildByUid, _this._addChildByUid);
                actionBindingManager.addActionBinding(ElementInteractionActions.findChildByName, _this._findChildByName);
                actionBindingManager.addActionBinding(ElementInteractionActions.deleteSelf, _this._delete);
                actionBindingManager.addActionBinding(ElementInteractionActions.scopedSearch, _this._scopedSearch);
                actionBindingManager.addActionBinding(ElementInteractionActions.makeSearchResult, _this._makeSearchResult);
            };
            this._executeElementQuery = function (args) {
                return _this._explorerInteractionExecutor.executeElementQuery(args.selector, args.caseInsensitive);
            };
            this._executeElementChildrenQuery = function (args) {
                var childrenQueryPromises = [];
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    childrenQueryPromises = nodes.map(function (node) {
                        return node.executeElementChildrenQuery(args.selector, args.caseInsensitive);
                    });
                }
                return Promise.all(childrenQueryPromises).then(function (queryResults) {
                    var result = { uids: [] };
                    queryResults.forEach(function (queryResult) {
                        result.uids = result.uids.concat(queryResult.uids);
                    });
                    return result;
                });
            };
            this._getAttribute = function (args) {
                var firstNode = args ? ElementInteractionActions._getFirstNode(args) : undefined;
                if (firstNode) {
                    return Promise.resolve(firstNode.getAttributeValueIfLoaded(args.name));
                }
                return Promise.resolve();
            };
            this._getAttributes = function (args) {
                var firstNode = args ? ElementInteractionActions._getFirstNode(args) : undefined;
                if (firstNode) {
                    return Promise.resolve(firstNode.getAttributesValueIfLoaded(args.names));
                }
                return Promise.resolve();
            };
            this._setAttribute = function (args) {
                var newAttribute = args.newAttribute;
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        node.setAttribute(newAttribute);
                    });
                }
                return Promise.resolve();
            };
            this._select = function (args) {
                var firstNode = args ? ElementInteractionActions._getFirstNode(args) : undefined;
                if (firstNode) {
                    firstNode.select();
                }
                return Promise.resolve();
            };
            this._expand = function (args) {
                var promises = [];
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        var getLoadAndToggle = node.childGroupViewModel().GetAndLoadChildren().then(function () {
                            if (node.canExpand() && !node.isExpanded()) {
                                node.toggle();
                            }
                        });
                        promises.push(getLoadAndToggle);
                    });
                }
                return Promise.all(promises);
            };
            // Note: Only handles a single node in the query, fails if more than one given
            this._loadMoreChildren = function (args) {
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    if (nodes && nodes.length === 1) {
                        var node = nodes[0];
                        if (node.canLoadMoreChildren()) {
                            return node.childGroupViewModel().loadMoreChildren().then(function () {
                                var result = { uids: [] };
                                node.childGroupViewModel().children().forEach(function (node) {
                                    result.uids.push(node.uid);
                                });
                                return Promise.resolve(result);
                            });
                        }
                        else {
                            return Promise.resolve({ noMoreChildren: true });
                        }
                    }
                    else {
                        Debug.assert(!nodes || !nodes.length, "Too many nodes given to loadMoreChildren");
                    }
                }
                return Promise.resolve();
            };
            this._refresh = function (args) {
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        node.refresh();
                    });
                }
                return Promise.resolve();
            };
            this._collapse = function (args) {
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        if (node.isExpanded()) {
                            node.toggle();
                        }
                    });
                }
                return Promise.resolve();
            };
            this._getActions = function (args) {
                var firstNode = args ? ElementInteractionActions._getFirstNode(args) : undefined;
                if (firstNode) {
                    var result = { uids: [] };
                    result.uids = firstNode.actions().map(function (actionViewModel) {
                        return actionViewModel.uid;
                    });
                    return Promise.resolve(result);
                }
                return Promise.resolve({ uids: [] });
            };
            this._getProperties = function (args) {
                var firstNode = args ? ElementInteractionActions._getFirstNode(args) : undefined;
                if (firstNode) {
                    var result = { uids: [] };
                    result.uids = firstNode.properties().map(function (propertyViewModel) {
                        return propertyViewModel.uid;
                    });
                    return Promise.resolve(result);
                }
                return Promise.resolve({ uids: [] });
            };
            this._executeDefaultAction = function (args) {
                var firstNode = args ? ElementInteractionActions._getFirstNode(args) : undefined;
                if (firstNode) {
                    firstNode.executeDefaultAction("ElementInteractionAction");
                }
                return Promise.resolve();
            };
            this._refreshChildren = function (args) {
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        node.resetAndRefreshChildren();
                    });
                }
                return Promise.resolve();
            };
            this._refreshDynamicAttributes = function (args) {
                var promises = [];
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        promises.push(node.refreshDynamicAttributes(args.attributes));
                    });
                }
                return Promise.all(promises);
            };
            this._addChild = function (args) {
                var addedChildNode = args.addedChildNode;
                var promises = [];
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        promises.push(node.addChildNode(addedChildNode));
                    });
                }
                return Promise.all(promises);
            };
            this._addChildByUid = function (args) {
                var promises = [];
                if (args) {
                    var uid = args.uid;
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        promises.push(node.addChildByUid(uid));
                    });
                }
                return Promise.all(promises);
            };
            this._findChildByName = function (args) {
                var nameToSelect = args.nameToSelect;
                var promises = [];
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        promises.push(node.findChildNodeByName(nameToSelect));
                    });
                }
                return Promise.all(promises);
            };
            this._delete = function (args) {
                if (args) {
                    var nodes = ElementInteractionActions._getNodes(args);
                    nodes.forEach(function (node) {
                        if (node.getResourceUid().split(NodeUid.delimiter)[0] === "Azure.QuickAccess") {
                            // only the quick access manager should remove quick access nodes
                            _this._host.executeProviderOperation("Azure.Actions.Storage.refreshQuickAccess");
                        }
                        else {
                            node.deleteNode();
                        }
                    });
                }
                return Promise.resolve();
            };
            this._scopedSearch = function (args) {
                if (args) {
                    var node = ElementInteractionActions._getNodes(args)[0];
                    node.scopedSearch();
                }
                return Promise.resolve();
            };
            this._makeSearchResult = function (args) {
                if (args) {
                    var uid = args.uid;
                    NodeViewModel.makeSearchResult(uid);
                }
                return Promise.resolve();
            };
            this._explorerInteractionExecutor = explorerInteractionExecutor;
            this._host = host;
        }
        return ElementInteractionActions;
    }());
    ElementInteractionActions.query = "CloudExplorer.ElementInteraction.query";
    ElementInteractionActions.childrenQuery = "CloudExplorer.ElementInteraction.childrenQuery";
    ElementInteractionActions.getAttribute = "CloudExplorer.ElementInteraction.getAttribute";
    ElementInteractionActions.getAttributes = "CloudExplorer.ElementInteraction.getAttributes";
    ElementInteractionActions.setAttribute = "CloudExplorer.ElementInteraction.setAttribute";
    ElementInteractionActions.select = "CloudExplorer.ElementInteraction.select";
    ElementInteractionActions.expand = "CloudExplorer.ElementInteraction.expand";
    ElementInteractionActions.refresh = "CloudExplorer.ElementInteraction.refresh";
    ElementInteractionActions.collapse = "CloudExplorer.ElementInteraction.collapse";
    ElementInteractionActions.getActions = "CloudExplorer.ElementInteraction.getActions";
    ElementInteractionActions.executeDefaultAction = "CloudExplorer.ElementInteraction.executeDefaultAction";
    ElementInteractionActions.getProperties = "CloudExplorer.ElementInteraction.getProperties";
    ElementInteractionActions.refreshChildren = "CloudExplorer.ElementInteraction.refreshChildren";
    ElementInteractionActions.loadMoreChildren = "CloudExplorer.ElementInteraction.loadMoreChildren";
    ElementInteractionActions.refresDynamicAttributes = "CloudExplorer.ElementInteraction.refreshDynamicAttributes";
    ElementInteractionActions.addChild = "CloudExplorer.ElementInteraction.addChild";
    ElementInteractionActions.addChildByUid = "CloudExplorer.ElementInteraction.addChildByUid";
    ElementInteractionActions.findChildByName = "CloudExplorer.ElementInteraction.findChildByName";
    ElementInteractionActions.deleteSelf = "CloudExplorer.ElementInteraction.delete";
    ElementInteractionActions.scopedSearch = "CloudExplorer.ElementInteraction.scopedSearch";
    ElementInteractionActions.makeSearchResult = "CloudExplorer.ElementInteraction.makeSearchResult";
    ElementInteractionActions._getQueryResultFromArgs = function (args) {
        return args ? (args.queryResult || args.target) : null;
    };
    ElementInteractionActions._getFirstNode = function (args) {
        var queryResult = ElementInteractionActions._getQueryResultFromArgs(args);
        if (queryResult && queryResult.uids && queryResult.uids[0]) {
            return NodeViewModel.getNode(queryResult.uids[0]);
        }
        return;
    };
    ElementInteractionActions._getNodes = function (args) {
        var queryResult = ElementInteractionActions._getQueryResultFromArgs(args);
        var nodeViewModels = queryResult ? NodeViewModel.getNodes(queryResult.uids) : [];
        return nodeViewModels;
    };
    return ElementInteractionActions;
});

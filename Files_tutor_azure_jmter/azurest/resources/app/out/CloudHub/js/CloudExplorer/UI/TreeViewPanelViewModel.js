/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "CloudExplorer/TreeNode/SearchHandler", "es6-promise", "knockout", "jquery", "CloudExplorer/CloudExplorerConstants", "Providers/CloudExplorer/Resources/CloudExplorerResources", "CloudExplorer/UI/BasePanelViewModel", "CloudExplorer/UI/NodeGroupViewModel", "CloudExplorer/UI/NodeViewModel", "CloudExplorer/TreeNode/NodeQueryHandler", "CloudExplorer/TreeNode/Path", "CloudExplorer/UI/SearchViewModel", "CloudExplorer/TreeNode/SearchResultsQueue", "Common/Utilities"], function (require, exports, SearchHandler_1, rsvp, ko, $, CloudExplorerConstants, CloudExplorerResources, BasePanelViewModel, NodeGroupViewModel, NodeViewModel, NodeQueryHandler, Path_1, SearchViewModel, SearchResultsQueue, Utilities) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * View Model for the Tree View Panel.
     */
    var TreeViewPanelViewModel = (function (_super) {
        __extends(TreeViewPanelViewModel, _super);
        function TreeViewPanelViewModel(panel, hostViewModel, detailsPanelViewModel) {
            var _this = _super.call(this, panel, hostViewModel, true) || this;
            _this._childGroupViewModel = ko.observable();
            _this.nodeDetailsPanel = ko.observable();
            _this.searchViewModel = ko.observable();
            _this.selectedNode = ko.observable();
            _this.noNodesText = ko.observable();
            _this.searchingText = ko.observable();
            _this.treeViewAriaLabel = ko.observable();
            _this.collapseAllText = ko.observable();
            _this.invalidPathText = ko.observable();
            _this.defaultActionMode = 1 /* DoubleClick */;
            _this.isExecutingSearch = ko.observable(false);
            _this.invalidPath = ko.observable(false);
            _this._searchResultsQueue = new SearchResultsQueue();
            _this._initialized = false;
            _this._attributes = {};
            _this.setInitialFocus = function () {
                $("input[role='search']").focus();
                return Promise.resolve(null);
            };
            _this.runningSearch = ko.pureComputed(function () {
                return _this.isExecutingSearch() || !_this._searchResultsQueue.isEmpty();
            });
            _this.isStorageExplorer = ko.observable(Utilities.isRunningOnElectron());
            _this.executeElementQuery = function (selector, caseInsensitive) {
                var result = { uids: [] };
                var matches = [];
                return _this._childGroupViewModel().GetAndLoadChildren().then(function () {
                    var adapter = !!caseInsensitive ? NodeViewModel.caseInsensitiveAdapter : NodeViewModel.adapter;
                    _this._childGroupViewModel().children().forEach(function (nodeViewModel) {
                        matches = matches.concat(ccs.select(selector, nodeViewModel, adapter));
                    });
                    result.uids = matches.map(function (nodeViewModel) {
                        return nodeViewModel.uid;
                    });
                    return result;
                });
            };
            _this.isLoading = ko.pureComputed(function () {
                var childGroupViewModel = _this._childGroupViewModel();
                return !childGroupViewModel || (childGroupViewModel.length() === 0 && childGroupViewModel.loadingMoreChildren());
            });
            _this.isLoadingSearchResults = ko.pureComputed(function () {
                var childGroupViewModel = _this._childGroupViewModel();
                return !childGroupViewModel || (childGroupViewModel.length() === 0 && _this.isExecutingSearch());
            });
            _this.isEmpty = ko.pureComputed(function () {
                var childGroupViewModel = _this._childGroupViewModel();
                return childGroupViewModel && childGroupViewModel.length() === 0;
            });
            _this.initialize = function () {
                if (!_this._initialized) {
                    _this._initialized = true;
                    _this.refreshChildren();
                }
                return Promise.resolve();
            };
            _this.onKeyDown = function (data, event) {
                var selectedNode = _this.selectedNode();
                if (selectedNode && !selectedNode.isPlaceholder()) {
                    // event.key is not supported in Chrome so fallback to keyCode
                    // see: http://www.w3schools.com/jsref/event_key_key.asp
                    // Note that IE and Chrome use different strings for some of the
                    // event.key values.  ArrowDown etc appears to be the newest standard.
                    var keyPressed = event.key || event.keyCode;
                    switch (keyPressed) {
                        case "Down":
                        case "ArrowDown":
                        case CloudExplorerConstants.keyCodes.DownArrow:
                            selectedNode.selectNext();
                            return false;
                        case "Up":
                        case "ArrowUp":
                        case CloudExplorerConstants.keyCodes.UpArrow:
                            selectedNode.selectPrevious();
                            return false;
                        case "Right":
                        case "ArrowRight":
                        case CloudExplorerConstants.keyCodes.RightArrow:
                            selectedNode.dig();
                            return false;
                        case "Left":
                        case "ArrowLeft":
                        case CloudExplorerConstants.keyCodes.LeftArrow:
                            selectedNode.unDig();
                            return false;
                        case "Enter":
                        case CloudExplorerConstants.keyCodes.Enter:
                            selectedNode.executeDefaultAction("Enter");
                            return false;
                        case "Spacebar":
                        case " ":
                        case CloudExplorerConstants.keyCodes.Spacebar:
                            selectedNode.executeDefaultAction("Spacebar");
                            return false;
                        case "ContextMenu":
                        case CloudExplorerConstants.keyCodes.ContextMenu:
                            _this.openContextMenu(selectedNode, event);
                            return false;
                        default:
                            // Pass keyboard events to selected node if the panel doesn't handle it.
                            return selectedNode.onKeyDown(data, event);
                    }
                }
                return true;
            };
            _this.refresh = function () {
                var refreshPromise = Promise.resolve(null);
                if (_this._initialized) {
                    // Unselect current node so DetailPane is clear
                    // TODO: Try to re-select previously selected node
                    _this.selectedNode(null);
                    _this.refreshChildren();
                    _this.searchViewModel().clearSearch();
                }
                else {
                    refreshPromise = _this.initialize();
                }
                return refreshPromise;
            };
            _this.collapseAll = function () {
                if (_this._initialized) {
                    _this.selectNode(null);
                    _this._childGroupViewModel().collapseAllChildren();
                    _this._ensureAtLeastOneNodeSelected();
                }
            };
            _this.scrollToSelected = function (includeChildren) {
                var $selected;
                if (includeChildren) {
                    $selected = $(".panel.active .selected");
                }
                else {
                    $selected = $(".panel.active .selected .self");
                }
                if ($selected && $selected.size() > 0) {
                    var selectedPosition = $selected.position();
                    var selectedHeight = $selected.height();
                    var scrollableHeight = $(".panel.active .scrollable").height();
                    if (selectedPosition.top < 0 || selectedHeight > scrollableHeight) {
                        $selected[0].scrollIntoView(true);
                    }
                    else if (selectedPosition.top + selectedHeight > scrollableHeight) {
                        $selected[0].scrollIntoView(false);
                    }
                }
            };
            _this.setFocus = function () {
                $(".panel.active .treeView li.node.selected").focus();
            };
            _this.reset = function () {
                if (_this._initialized && !_this.isLoading() && !_this.isLoadingSearchResults()) {
                    // Set the initialized flag to false so
                    // next time initialized method is call will
                    // execute the panel query.
                    _this._initialized = false;
                    // Unselect the node
                    _this.selectNode(null);
                    // Remove current nodes.
                    _this._childGroupViewModel(null);
                    _this.searchViewModel().reset();
                }
                return Promise.resolve();
            };
            _this.selectNode = function (node) {
                var selectedNode = _this.selectedNode();
                var $selectedNode = $(".panel.active .treeView li.node.selected");
                if (selectedNode) {
                    selectedNode.selected(false);
                }
                if (node) {
                    node.selected(true);
                    _this.expandParents(node);
                }
                else {
                    // Make sure the old node is unfocused if there's no new node to focus to
                    // (otherwise let the browser unfocus the old one as part of focusing to the new node).
                    $selectedNode.blur();
                }
                _this.selectedNode(node);
                _this.setFocus();
            };
            _this.expandParents = function (node) {
                if (node) {
                    var parent = node.parent();
                    if (parent) {
                        _this.expandParents(node.parent());
                        parent.childGroupViewModel().expand();
                    }
                }
            };
            _this.openContextMenu = function (node, e) {
                _this.selectNode(node);
                _this._hostViewModel().openContextMenu(node, e);
            };
            _this.resolveAttributes = function (requiresAttributes) {
                return Promise.resolve(_this.mapAttributesToValues(requiresAttributes));
            };
            _this.resolveSynchronousAttributes = function (requiresAttributes) {
                return _this.mapAttributesToValues(requiresAttributes);
            };
            _this.mapAttributesToValues = function (requiresAttributes) {
                var attributeValues = {};
                if (requiresAttributes) {
                    requiresAttributes.forEach(function (argString) {
                        attributeValues[argString] = _this._attributes[argString];
                    });
                }
                return attributeValues;
            };
            _this.resolveSearchQuery = function (searchQuery) {
                if (_this._scopedPath) {
                    _this._scopedPath.cancel();
                    _this._scopedPath = null;
                    _this.invalidPath(false);
                }
                _this._scopedPath = Path_1.default.parsePathFromString(searchQuery);
                if (!!_this._scopedPath) {
                    // user entered some sort of path
                    if (_this._scopedPath.isSearchFromRoot()) {
                        // same as a non path search
                        _this.prepareForSearch(_this._scopedPath.getSearchTerm().toLowerCase());
                    }
                    else if (_this._scopedPath.isOnlyRoot()) {
                        // nothing to do
                        _this.cleanupSearch();
                    }
                    else {
                        // user entered in some sort of path
                        _this.isExecutingSearch(true);
                        _this._scopedPath.followPath(0, _this._nodeQueryHandler.getEnumerator())
                            .then(function (nodes) {
                            if (!!nodes && nodes.length > 0) {
                                if (_this._scopedPath.getSearchTerm() === "") {
                                    // no search term defined, so scope to the end of the path
                                    _this.isExecutingSearch(false);
                                    _this._scopeToNodes(nodes);
                                }
                                else {
                                    // search term defined, start searching at the end of the path
                                    _this.prepareForSearch(_this._scopedPath.getSearchTerm().toLowerCase(), nodes);
                                }
                            }
                            else {
                                _this.isExecutingSearch(false);
                                _this.invalidPath(true);
                            }
                        })
                            .catch(function () {
                            // promise is rejected if followPath was cancelled
                            _this.isExecutingSearch(false);
                        });
                    }
                }
                else {
                    // normal search scenario
                    _this.prepareForSearch(searchQuery.toLowerCase());
                }
            };
            _this.prepareForSearch = function (searchString, startingNodes) {
                _this.cleanupSearch();
                _this.isExecutingSearch(searchString.length > 0);
                if (_this._searchHandler) {
                    _this._searchHandler.cancel();
                    _this._searchHandler = null;
                    if (!_this.isExecutingSearch() && !!_this.selectedNode()) {
                        // if a search won't be executed after resetting the searchHandler
                        _this.selectedNode().childGroupViewModel().setExpandedBeforeSearch();
                    }
                    _this._childGroupViewModel().showAllChildren();
                }
                if (_this.isExecutingSearch()) {
                    window.setTimeout(function () {
                        if (!!startingNodes && startingNodes.length > 0) {
                            _this._executeSearch(searchString, startingNodes);
                        }
                        else {
                            _this._childGroupViewModel().onlyShowSearchResults();
                            _this._executeSearch(searchString);
                        }
                    }, 100);
                }
                else {
                    _this.cleanupSearch();
                }
            };
            _this._executeSearch = function (searchString, startingNodes) {
                _this._searchResultsQueue.clear();
                _this._childGroupViewModel().onlyShowSearchResults();
                var startingEnumerators = [];
                if (!!startingNodes && startingNodes.length > 0) {
                    startingNodes.forEach(function (node) {
                        startingEnumerators.push(node.getSearchEnumerator(searchString));
                    });
                }
                else {
                    startingEnumerators.push(_this._nodeQueryHandler.getEnumerator());
                }
                _this._searchHandler = new SearchHandler_1.default(startingEnumerators, searchString);
                _this._searchHandler.matchNext(200, function (node, toMatch) {
                    return node.getDisplayName().then(function (name) {
                        return name.toLowerCase().indexOf(toMatch) >= 0;
                    });
                }, function (node) {
                    _this._searchResultsQueue.push(node);
                    window.setTimeout(function () {
                        // since we found a result, wait a litttle bit before calling _loadSearchResultsToViewModels
                        // that way, hopefully more results will be in the queue once the timeout finishes
                        _this._loadSearchResultsToViewModels(searchString);
                    }, 100);
                })
                    .then(function () {
                    _this.isExecutingSearch(false);
                });
            };
            _this.cleanupSearch = function () {
                _this._searchResultsQueue.clear();
                _this._childGroupViewModel().showAllChildren();
                if (!!_this.selectedNode()) {
                    _this.selectedNode().select();
                }
                _this.isExecutingSearch(false);
            };
            _this._loadSearchResultsToViewModels = function (searchString) {
                var nodesToLoad = _this._searchResultsQueue.splice(0, 10);
                nodesToLoad.forEach(function (node) {
                    var nodeViewModel = _this.addSearchNode(node);
                    nodeViewModel.childGroupViewModel().onlyShowSearchResults();
                    node.getDisplayName().then(function (name) {
                        var beginIndex = name.toLowerCase().indexOf(searchString);
                        var endIndex = (beginIndex + searchString.length) - 1;
                        if (beginIndex >= 0) {
                            nodeViewModel.addHighlightLocation({ "start": beginIndex, "end": endIndex });
                        }
                    });
                });
            };
            _this._ensureAtLeastOneNodeSelected = function () {
                var childGroupViewModel = _this._childGroupViewModel();
                var firstChild = !!childGroupViewModel && childGroupViewModel.length && childGroupViewModel.getChild(0);
                if (firstChild && !_this.selectedNode()) {
                    // If the tree isn't empty, we must always have a selected item, or the user won't be able to 
                    // tab to the tree nodes.
                    firstChild.select();
                }
            };
            _this.addSearchNode = function (addNode) {
                var parent = addNode.getParent();
                var parentGroupViewModel = _this._childGroupViewModel();
                if (parent) {
                    var parentViewModel = _this.addSearchNode(parent);
                    parentGroupViewModel = parentViewModel.childGroupViewModel();
                    parentGroupViewModel.onlyShowSearchResults();
                    parentGroupViewModel.expand();
                }
                else {
                    parentGroupViewModel.onlyShowSearchResults();
                }
                var searchMatchViewModel = parentGroupViewModel.addSearchMatchNode(addNode);
                return searchMatchViewModel;
            };
            _this._scopeToNodes = function (scopedNodes) {
                _this.cleanupSearch();
                scopedNodes.forEach(function (scopedNode) {
                    _this.addSearchNode(scopedNode);
                });
            };
            _this.refreshSearchOnNode = function (node) {
                var path = Path_1.default.parsePathFromString(_this.searchViewModel().searchQuery());
                var searchTerm = "";
                if (!!path) {
                    searchTerm = path.getSearchTerm();
                }
                else {
                    searchTerm = _this.searchViewModel().searchQuery();
                }
                if (_this.isExecutingSearch()) {
                    _this._searchHandler.addToSearch(node.getSearchEnumerator(searchTerm));
                }
                else if (searchTerm !== "") {
                    _this.isExecutingSearch(true);
                    _this._executeSearch(searchTerm, [node]);
                }
            };
            _this.childGroupViewModel = ko.computed(function () {
                return _this._childGroupViewModel();
            });
            _this.refreshChildren = function () {
                var oldChildGroupViewModel = _this._childGroupViewModel();
                _this._nodeQueryHandler = new NodeQueryHandler(_this._host, _this, _this._host, null, _this._panel.panelQuery);
                _this._childGroupViewModel(new NodeGroupViewModel(null, _this, _this._host, _this._nodeQueryHandler.getEnumerator(), _this._host, true));
                if (oldChildGroupViewModel) {
                    oldChildGroupViewModel.dispose();
                }
            };
            _this._host = hostViewModel.host;
            _this.nodeDetailsPanel(detailsPanelViewModel);
            _this.searchViewModel(new SearchViewModel(panel, _this._host));
            _this.searchViewModel().searchQuery.subscribe(_this.resolveSearchQuery);
            _this.isActive.subscribe(function (visible) {
                var node = (visible) ? _this.selectedNode() : null;
                _this.nodeDetailsPanel().updateNode(node);
                if (_this._searchHandler) {
                    if (visible) {
                        _this._searchHandler.resume();
                    }
                    else {
                        _this._searchHandler.pause();
                    }
                }
            });
            _this.selectedNode.subscribe(function (node) {
                var panel = _this.nodeDetailsPanel();
                if (panel) {
                    panel.updateNode(node);
                }
            });
            _this.isEmpty.subscribe(function () {
                _this._ensureAtLeastOneNodeSelected();
            });
            _this._host.resolveResources(CloudExplorerResources.namespace, ["TreeView.AriaLabel", "TreeView.NoNodes", "TreeView.Searching", "TreeView.InvalidPath", "ActionLinks.CollapseAll.Name"])
                .then(function (values) {
                _this.collapseAllText(values["ActionLinks.CollapseAll.Name"]);
                _this.noNodesText(values["TreeView.NoNodes"]);
                _this.searchingText(values["TreeView.Searching"]);
                _this.treeViewAriaLabel(values["TreeView.AriaLabel"]);
                _this.invalidPathText(values["TreeView.InvalidPath"]);
            });
            return _this;
        }
        return TreeViewPanelViewModel;
    }(BasePanelViewModel));
    return TreeViewPanelViewModel;
});

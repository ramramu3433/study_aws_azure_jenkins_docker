/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "es6-promise", "Common/Errors", "CloudExplorer/UI/NodeViewModel", "CloudExplorer/UI/LoadMoreNodeViewModel", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Common/Utilities", "CloudExplorer/UI/NodeChildrenSet"], function (require, exports, ko, rsvp, Errors, NodeViewModel, LoadMoreNodeViewModel, CloudExplorerActions, Utilities, NodeChildrenSet_1) {
    "use strict";
    var Promise = rsvp.Promise;
    /*
     * Node Group representation
     */
    var NodeGroupViewModel = (function () {
        function NodeGroupViewModel(owningNode, panel, host, childrenEnumerator, resourceResolver, expanded) {
            if (expanded === void 0) { expanded = false; }
            var _this = this;
            this._childrenSet = new NodeChildrenSet_1.default();
            this._searchChildrenSet = new NodeChildrenSet_1.default();
            this._defaultChunkSizeToLoad = 25;
            this._chunkSizeToLoad = this._defaultChunkSizeToLoad;
            this._chunkSizeToLoadAfterInitial = 100;
            this._owningNode = ko.observable();
            this._pendingErrorMessage = ko.observable("");
            this._onlyShowSearchMatches = ko.observable(false);
            // TODO marayerm: figure out how to set type as "boolean | undefined"
            this._deleteOcurredDuringSearch = undefined;
            this._wasExpandedBeforeSearch = undefined;
            this.isExpanded = ko.observable(false);
            this.loadingMoreChildren = ko.observable(false);
            // Indicates that more children can be loaded (whether or not they're currently being loaded)
            this.canLoadMoreChildren = ko.observable(false);
            this.showingSearchResults = ko.computed(function () {
                if (_this._onlyShowSearchMatches()) {
                    return true;
                }
                return false;
            });
            this.hasChildren = ko.pureComputed(function () {
                if (!_this._onlyShowSearchMatches()) {
                    return _this._childrenSet.getChildren().length !== 0 || _this.canLoadMoreChildren() || _this.loadingMoreChildren();
                }
                else {
                    // prevents nodes being expandable during search if they have no descendents who are also search results
                    return _this._searchChildrenSet.getChildren().length !== 0;
                }
            });
            // Indicates that load/loading children node should be included in the children results
            this._showLoadMoreNode = ko.pureComputed(function () {
                // If it's possible to load more children
                return !_this._onlyShowSearchMatches() && _this.canLoadMoreChildren() || _this.loadingMoreChildren();
            });
            this.loadMoreChildren = function () {
                _this.loadingMoreChildren(true);
                // Give UI a chance to modify the "loading" label before continuing
                return Utilities.delay(0).then(function () {
                    var telemetryProperties = {};
                    var loadChildrenPromise = _this._enumerator.mapNext(function (node) {
                        _this._updateNodeTelemetryProperties(telemetryProperties, _this._host, node);
                        return NodeViewModel.createNodeViewModel(node, _this._owningNode(), _this._panel, _this._host);
                    }, _this._chunkSizeToLoad).then(function (childrenViewModels) {
                        _this._chunkSizeToLoad = _this._chunkSizeToLoadAfterInitial;
                        if (childrenViewModels && childrenViewModels.length > 0) {
                            childrenViewModels.forEach(function (childViewModel) {
                                _this._addChildNodeViewModel(childViewModel);
                            });
                            _this._host.telemetry.sendEvent("CloudHub.resources", telemetryProperties);
                            if (_this._onlyShowSearchMatches()) {
                                return Promise.all([_this._childrenSet.sort(), _this._searchChildrenSet.sort()]);
                            }
                            else {
                                return _this._childrenSet.sort();
                            }
                        }
                        ;
                    });
                    loadChildrenPromise.then(function () { _this._cancelLoading(); }, function () { _this._cancelLoading(); });
                    loadChildrenPromise.then(null, function (err) {
                        _this._showError(err, "NodeViewModel.GetChildren", "Unable to retrieve child resources.");
                    });
                    return loadChildrenPromise;
                });
            };
            this.children = ko.computed(function () {
                var children;
                if (_this._onlyShowSearchMatches()) {
                    children = _this._searchChildrenSet.getChildren();
                }
                else {
                    children = _this._childrenSet.getChildren();
                }
                if (_this._showLoadMoreNode() && _this._owningNode()) {
                    children.push(_this._getLoadMoreNodeViewModel());
                }
                return children;
            });
            this.canExpand = ko.pureComputed(function () {
                return _this.hasChildren() || !!_this._pendingErrorMessage();
            });
            this.paddingLeftPx = ko.pureComputed(function () {
                if (_this._owningNode()) {
                    return _this._owningNode().paddingLeftPx();
                }
                else {
                    return "45px";
                }
            });
            this._getAndLoadChildrenPromise = null;
            this.GetAndLoadChildren = function () {
                if (!_this.canLoadMoreChildren()) {
                    _this._getAndLoadChildrenPromise = Promise.resolve();
                }
                else if (!_this._getAndLoadChildrenPromise) {
                    _this._getAndLoadChildrenPromise = _this.loadMoreChildren();
                }
                return _this._getAndLoadChildrenPromise;
            };
            this._owningNode(owningNode);
            this._panel = panel;
            this._host = host;
            this._resourceResolver = resourceResolver;
            this._enumerator = childrenEnumerator;
            this.canLoadMoreChildren(this._enumerator && this._enumerator.hasNext());
            var onfirstExpandSubscription = this.isExpanded.subscribe(function (value) {
                if (value && !_this._onlyShowSearchMatches()) {
                    _this._onFirstExpand(value);
                    onfirstExpandSubscription.dispose();
                }
            });
            this.isExpanded(expanded);
        }
        NodeGroupViewModel.prototype.sortChildren = function () {
            this._currentChildrenSet().sort();
        };
        NodeGroupViewModel.prototype.expand = function () {
            if (!this.isExpanded()) {
                this.toggle();
            }
        };
        NodeGroupViewModel.prototype.collapse = function () {
            if (this.isExpanded()) {
                this.toggle();
            }
        };
        NodeGroupViewModel.prototype.toggle = function () {
            this._toggle();
        };
        NodeGroupViewModel.prototype.addChildNode = function (addedNode) {
            var addedNodeViewModel = this._getNodeViewModelForNode(addedNode);
            if (this._onlyShowSearchMatches()) {
                this._addSearchMatchNodeViewModel(addedNodeViewModel);
            }
            return this._addChildNodeViewModel(addedNodeViewModel);
        };
        ;
        NodeGroupViewModel.prototype._getLoadMoreNodeViewModel = function () {
            if (!this._loadMoreNodeViewModelInstance) {
                this._loadMoreNodeViewModelInstance =
                    new LoadMoreNodeViewModel(this._owningNode(), this._owningNode().uid, this._panel, this._host, this._resourceResolver);
            }
            return this._loadMoreNodeViewModelInstance;
        };
        NodeGroupViewModel.prototype._addChildNodeViewModel = function (addedNodeViewModel) {
            this._childrenSet.addChild(addedNodeViewModel);
            return addedNodeViewModel;
        };
        NodeGroupViewModel.prototype.unshiftChild = function (nodeViewModel) {
            return this._currentChildrenSet().unshiftChild(nodeViewModel);
        };
        ;
        NodeGroupViewModel.prototype.shiftChild = function () {
            return this._currentChildrenSet().shiftChild();
        };
        ;
        NodeGroupViewModel.prototype.length = function () {
            return this.children().length;
        };
        NodeGroupViewModel.prototype.getChild = function (index) {
            return this.children()[index];
        };
        NodeGroupViewModel.prototype.onlyShowSearchResults = function () {
            if (this._wasExpandedBeforeSearch === undefined) {
                this._wasExpandedBeforeSearch = this.isExpanded();
            }
            this._onlyShowSearchMatches(true);
        };
        ;
        NodeGroupViewModel.prototype.showAllChildren = function () {
            this._onlyShowSearchMatches(false);
            if (this._wasExpandedBeforeSearch !== undefined) {
                if (this._wasExpandedBeforeSearch !== this.isExpanded()) {
                    this.toggle();
                }
            }
            if (this._deleteOcurredDuringSearch !== undefined) {
                if (this._deleteOcurredDuringSearch) {
                    // Since a delete happened, we have to reset the query handler
                    // to get rid of the deleted node in the cache
                    this._owningNode().resetAndRefreshChildren();
                }
            }
            var oldChildren = this._searchChildrenSet.clearChildren();
            oldChildren.forEach(function (child) {
                child.clearHighlightLocations();
                child.childGroupViewModel().showAllChildren();
            });
            this._wasExpandedBeforeSearch = undefined;
            this._deleteOcurredDuringSearch = undefined;
        };
        ;
        NodeGroupViewModel.prototype.addSearchMatchNode = function (addedNode) {
            var viewModel = this._getNodeViewModelForNode(addedNode);
            return this._addSearchMatchNodeViewModel(viewModel);
        };
        ;
        NodeGroupViewModel.prototype._addSearchMatchNodeViewModel = function (addedNodeViewModel) {
            if (!this._searchChildrenSet.contains(addedNodeViewModel)) {
                this._searchChildrenSet.addChild(addedNodeViewModel);
                this._searchChildrenSet.sort();
                this.expand();
            }
            return addedNodeViewModel;
        };
        ;
        NodeGroupViewModel.prototype.deleteChild = function (indexOfChildToDelete) {
            var deletedChild = this._currentChildrenSet().deleteChildByIndex(indexOfChildToDelete);
            if (!deletedChild) {
                // invalid index
                return;
            }
            this._notCurrentChildrenSet().deleteChildByNodeUid(deletedChild.uid);
            NodeViewModel.removeFromNodeCache(deletedChild.uid);
            this._deleteOcurredDuringSearch = this._onlyShowSearchMatches() || this._deleteOcurredDuringSearch;
        };
        ;
        /**
         * Sets this NodeGroupViewModel, and all of its parent NodeGroupViewModel's to have been marked
         * as expanded before search. So when the search is canceled, this node will be visible.
         */
        NodeGroupViewModel.prototype.setExpandedBeforeSearch = function () {
            this._wasExpandedBeforeSearch = true;
            if (!!this._owningNode() && !!this._owningNode().parent() && !!this._owningNode().parent().childGroupViewModel()) {
                var parentGroupViewModel = this._owningNode().parent().childGroupViewModel();
                if (!parentGroupViewModel._searchChildrenSet.contains(this._owningNode())) {
                    return;
                }
                if (parentGroupViewModel._childrenSet.getLength() === 0) {
                    // Execute onFirstExpand incase this NodeGroupViewModel had not been expanded before the search
                    // happended. If you don't then the NodeGroupViewModel will just have one child and look weird.
                    parentGroupViewModel._onFirstExpand(true);
                }
                parentGroupViewModel._addChildNodeViewModel(this._owningNode());
                // Recurse up to the parentGroupViewModel
                parentGroupViewModel.setExpandedBeforeSearch();
            }
        };
        NodeGroupViewModel.prototype._currentChildrenSet = function () {
            if (this._onlyShowSearchMatches()) {
                return this._searchChildrenSet;
            }
            else {
                return this._childrenSet;
            }
        };
        NodeGroupViewModel.prototype._notCurrentChildrenSet = function () {
            if (this._onlyShowSearchMatches()) {
                return this._childrenSet;
            }
            else {
                return this._searchChildrenSet;
            }
        };
        NodeGroupViewModel.prototype._getNodeViewModelForNode = function (node) {
            // see if we already have a NodeViewModel for this Node in the cache
            var viewModel = NodeViewModel.getNode(node.uid);
            if (!viewModel) {
                // see if we can get the a NodeViewModel for the Node from this
                // NodeGroupViewModel's childrenSet via the Node's resource UID
                viewModel = this._childrenSet.getChildByResourceUid(node.getResourceUid());
            }
            if (!viewModel) {
                // see if we can get the a NodeViewModel for the Node from this
                // NodeGroupViewModel's searchChildrenSet via the Node's resource UID
                viewModel = this._searchChildrenSet.getChildByResourceUid(node.getResourceUid());
            }
            if (!viewModel) {
                // couldn't get via resource's UID, so make a new NodeViewModel
                viewModel = NodeViewModel.createNodeViewModel(node, this._owningNode(), this._panel, this._host);
            }
            return viewModel;
        };
        NodeGroupViewModel.prototype._toggle = function () {
            var newExpandedState = !this.isExpanded();
            this.isExpanded(newExpandedState);
        };
        ;
        NodeGroupViewModel.prototype.collapseAllChildren = function () {
            if (this.isExpanded() && !!this._owningNode()) {
                this.toggle();
            }
            this.children().forEach(function (child) {
                child.childGroupViewModel().collapseAllChildren();
            });
        };
        NodeGroupViewModel.prototype.dispose = function () {
            this._searchChildrenSet.disposeAll();
            this._childrenSet.disposeAll();
        };
        ;
        NodeGroupViewModel.prototype._cancelLoading = function () {
            this.loadingMoreChildren(false);
            this.canLoadMoreChildren(this._enumerator && this._enumerator.hasNext());
        };
        ;
        NodeGroupViewModel.prototype._onFirstExpand = function (isExpanded) {
            var _this = this;
            if (isExpanded) {
                this.GetAndLoadChildren().then(function () { _this._handlePendingError(); }, function () { _this._handlePendingError(); });
            }
        };
        ;
        NodeGroupViewModel.prototype._handlePendingError = function () {
            if (this._pendingErrorMessage()) {
                this._host.executeAction(CloudExplorerActions.showErrorMessageBox, { message: this._pendingErrorMessage() });
                this._pendingErrorMessage("");
            }
        };
        ;
        NodeGroupViewModel.prototype._showError = function (err, telemetryErrorName, simpleMessage) {
            var _this = this;
            if (err.name === Errors.errorNames.ActionableError) {
                this._host.errorsManager.handleActionableError(err, null)
                    .then(function (accepted) {
                    if (accepted) {
                        var owningNode = _this._owningNode();
                        if (owningNode) {
                            owningNode.resetAndRefreshChildren();
                        }
                        else {
                            // If there is no owning node we assume this is the root node.
                            // Refresh the whole panel.
                            _this._panel.refresh();
                        }
                    }
                });
            }
            else if (err.name === Errors.errorNames.TryableActionError) {
                this._host.errorsManager.handleActionableError(err, null);
            }
            else {
                var errorToLog;
                var errorMessage;
                if (err.name === Errors.errorNames.DisplayableError) {
                    errorToLog = err.error;
                    errorMessage = err.message;
                }
                else {
                    errorToLog = err;
                    errorMessage = Utilities.getErrorMessage(err, simpleMessage);
                }
                var telemetryError = {
                    name: telemetryErrorName,
                    error: errorToLog
                };
                if (this.isExpanded()) {
                    this._host.executeAction(CloudExplorerActions.showErrorMessageBox, { message: errorMessage });
                }
                else {
                    this._pendingErrorMessage(this._pendingErrorMessage() + errorMessage);
                }
                this._host.telemetry.sendError(telemetryError);
            }
        };
        ;
        NodeGroupViewModel.prototype._updateNodeTelemetryProperties = function (telemetryProperties, host, node) {
            if (!!node && !!node.Properties) {
                node.Properties.forEach(function (currentProperties) {
                    if (currentProperties.name === "type") {
                        if (telemetryProperties[currentProperties.value] == null) {
                            telemetryProperties[currentProperties.value] = 0;
                        }
                        telemetryProperties[currentProperties.value] += 1;
                    }
                });
            }
            else {
                var unspecificResourceType = "Unspecified Resource Type";
                if (telemetryProperties[unspecificResourceType] == null) {
                    telemetryProperties[unspecificResourceType] = 0;
                }
                telemetryProperties[unspecificResourceType] += 1;
            }
            ;
        };
        ;
        return NodeGroupViewModel;
    }());
    return NodeGroupViewModel;
});

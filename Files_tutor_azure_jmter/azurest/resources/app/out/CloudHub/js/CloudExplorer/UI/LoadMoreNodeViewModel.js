/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "Providers/Azure/Resources/AzureResources", "CloudExplorer/UI/NodeViewModel", "Providers/CloudExplorer/Resources/CloudExplorerResources", "CloudExplorer/TreeNode/Node"], function (require, exports, ko, AzureResources, NodeViewModel, CloudExplorerResources, Node) {
    "use strict";
    /*
     * View model of a node which says either "Load More" or "Loading...", depending on the node state
     */
    var LoadMoreNodeViewModel = (function (_super) {
        __extends(LoadMoreNodeViewModel, _super);
        function LoadMoreNodeViewModel(parent, parentUid, panel, host, resourceResolver) {
            var _this = _super.call(this, LoadMoreNodeViewModel._generateNewNode(host), parent, panel, host, "loadMoreItemTemplate") || this;
            _this._loadingText = ko.observable();
            /**
             * @override
             */
            _this._getBaseDisplayName = function () {
                return _this._currentDisplayText();
            };
            /**
             * @override
             */
            _this.viewModelActions = function () {
                return [
                    _this.loadMoreAction()
                ];
            };
            /**
             * @override
             */
            _this.handleClick = function () {
                // Clicking on Load More should immediately cause execution
                _this.executeDefaultAction("singleClick");
            };
            _this.loadMoreAction = function () {
                return {
                    displayName: {
                        resource: { resourceId: "Actions.Resources.LoadMore", namespace: AzureResources.commonNamespace }
                    },
                    isDefault: true,
                    namespace: "CloudExplorer.ElementInteraction.loadMoreChildren",
                    boundArguments: {
                        target: {
                            value: {
                                uids: [_this._parentUid]
                            }
                        }
                    }
                };
            };
            _this._superViewModelActions = _this.viewModelActions;
            _this._parentUid = parentUid;
            _this.isLoadingSiblings = ko.pureComputed(function () { return !!parent && parent.isLoadingMoreChildren(); });
            _this._currentDisplayText = ko.pureComputed(function () { return _this.isLoadingSiblings() ? _this._loadingText() : _this._displayNameValue(); });
            resourceResolver.resolveResources(CloudExplorerResources.namespace, ["NodeGroup.Loading"])
                .then(function (values) {
                _this._loadingText(values["NodeGroup.Loading"]);
            });
            return _this;
        }
        LoadMoreNodeViewModel._generateNewNode = function (host) {
            return new Node(host, {
                displayName: {
                    resource: { resourceId: "Actions.Resources.LoadMore", namespace: AzureResources.commonNamespace }
                },
                uid: "#LoadMore" + (LoadMoreNodeViewModel._uid++).toString()
            }, null /* parent */);
        };
        ;
        return LoadMoreNodeViewModel;
    }(NodeViewModel));
    LoadMoreNodeViewModel._uid = 0;
    return LoadMoreNodeViewModel;
});

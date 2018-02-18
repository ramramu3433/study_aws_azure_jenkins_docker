/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "CloudExplorer/TreeNode/BindingHandler", "Common/Debug", "CloudExplorer/TreeNode/NodeAttributeResolver", "CloudExplorer/TreeNode/NodeQueryHandler", "CloudExplorer/TreeNode/EnumeratorGroup", "CloudExplorer/TreeNode/NodeUid"], function (require, exports, BindingHandler_1, Debug, NodeAttributeResolver, NodeQueryHandler, EnumeratorGroup, NodeUid) {
    "use strict";
    var Node = (function () {
        function Node(host, nodeData, parentNode) {
            var _this = this;
            this._hasRunInit = false;
            this._init = function () {
                if (!_this._hasRunInit) {
                    _this._hasRunInit = true;
                    _this._attributeResolver = new NodeAttributeResolver(_this._nodeData.attributes, _this._nodeData.loaders, _this._host, _this._host);
                    _this._nodeQueryHandler = new NodeQueryHandler(_this._host, _this._attributeResolver, _this._host, _this._nodeData.children, _this._nodeData.childrenQuery, _this);
                    _this._searchNodeQueryHandler = new NodeQueryHandler(_this._host, _this._attributeResolver, _this._host, _this._nodeData.children, _this._nodeData.searchQuery, _this);
                    _this._displayNameBinding = new BindingHandler_1.default(_this._nodeData.displayName, _this._attributeResolver, _this._host);
                    _this._deepSearchSupportedBinding = new BindingHandler_1.default(_this._nodeData.deepSearchSupported, _this._attributeResolver, _this._host, true);
                    _this._statusBinding = new BindingHandler_1.default(_this._nodeData.status, _this._attributeResolver, _this._host);
                    _this._canSearchChildren = _this._deepSearchSupportedBinding.value() && !!_this._nodeData && !!_this._nodeData.childrenQuery;
                }
            };
            this.getDisplayName = function () {
                _this._init();
                return _this._displayNameBinding.updateValue().then(function () {
                    return _this._displayNameBinding.value();
                });
            };
            this.canSearchChildren = function () {
                _this._init();
                return _this._canSearchChildren;
            };
            this.getDeepSearchSupported = function () {
                _this._init();
                return _this._deepSearchSupportedBinding.value();
            };
            this.searchQuerySupported = function () {
                // only support searching beyond getting all children if there is a
                // search query
                return !!_this._nodeData.searchQuery;
            };
            this.getStatus = function () {
                _this._init();
                return _this._statusBinding.updateValue().then(function () {
                    return _this._statusBinding.value();
                });
            };
            this.getAttributeResolver = function () {
                _this._init();
                return _this._attributeResolver;
            };
            this.resetChildren = function () {
                _this._init();
                _this._nodeQueryHandler = new NodeQueryHandler(_this._host, _this._attributeResolver, _this._host, _this._nodeData.children, _this._nodeData.childrenQuery, _this);
                _this._searchNodeQueryHandler = new NodeQueryHandler(_this._host, _this._attributeResolver, _this._host, _this._nodeData.children, _this._nodeData.searchQuery, _this);
            };
            this.hasQueriedForChildren = function () {
                return (!!_this._nodeQueryHandler && _this._nodeQueryHandler.hasRanAQuery())
                    || (!!_this._searchNodeQueryHandler && _this._searchNodeQueryHandler.hasRanAQuery());
            };
            this.getSearchEnumerator = function (searchString) {
                _this._init();
                if (!_this._canSearchChildren) {
                    return undefined;
                }
                if (_this.searchQuerySupported()) {
                    _this._attributeResolver.setAttribute({ name: "searchQuery", value: searchString });
                    return new EnumeratorGroup([
                        new NodeQueryHandler(_this._host, _this._attributeResolver, _this._host, [], _this._nodeData.childrenQuery, _this, true).getEnumerator(),
                        new NodeQueryHandler(_this._host, _this._attributeResolver, _this._host, [], _this._nodeData.searchQuery, _this, true).getEnumerator()
                    ]);
                }
                else {
                    return new EnumeratorGroup([
                        new NodeQueryHandler(_this._host, _this._attributeResolver, _this._host, [], _this._nodeData.childrenQuery, _this, true).getEnumerator()
                    ]);
                }
            };
            this.getChildrenEnumerator = function () {
                _this._init();
                return _this._nodeQueryHandler.getEnumerator();
            };
            this.isLeafNode = function () {
                return !_this._nodeData.children && !_this._nodeData.childrenQuery;
            };
            this.getParent = function () {
                return _this._parentNode;
            };
            this.addChildNode = function (nodeToAdd) {
                _this._nodeQueryHandler.addNode(nodeToAdd);
                _this._searchNodeQueryHandler.addNode(nodeToAdd);
            };
            this.getResourceUid = function () {
                return _this._resourceUid.toString();
            };
            this._host = host;
            this._nodeData = nodeData;
            this.Icon = nodeData.icon;
            this.ThemeSource = nodeData.themeSrc;
            this.Properties = nodeData.properties;
            this.Actions = nodeData.actions;
            this.PreExpanded = nodeData.preExpanded;
            this._parentNode = parentNode;
            // special cases: this will give us a reference to the "Quick Access" & "Recently Used" nodes through
            // the NodeViewModel node cache
            if (this._nodeData.uid === "Azure.QuickAccess" || this._nodeData.uid === "Azure.RecentlyUsed") {
                this.uid = this._nodeData.uid;
            }
            else {
                this.uid = "Node:" + Node._nextUid++;
            }
            // construct the resource uid, and || with this.uid incase someone forgot to set nodeData.uid
            // may result in duplicates, but better than having nodes not show up
            Debug.assert(!!nodeData.uid, "uid expected!"); // assert so in debug mode we can catch these cases
            var nodeDataUid = nodeData.uid || this.uid;
            if (!!parentNode && parentNode._resourceUid) {
                this._resourceUid = new NodeUid(nodeDataUid, parentNode._resourceUid);
            }
            else {
                this._resourceUid = new NodeUid(nodeDataUid);
            }
        }
        return Node;
    }());
    Node._nextUid = 0;
    return Node;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "es6-promise"], function (require, exports, ko, es6_promise_1) {
    "use strict";
    /*
     * Contains the children of a NodeGroupViewModel. Has an array of the children, and a
     * hash map of children uid -> boolean to easily keep track of whether or not a node
     * has been added.
     */
    var NodeChildrenSet = (function () {
        function NodeChildrenSet() {
            // children (NodeViewModel) in the set
            this._children = ko.observableArray();
            // map of Node/NodeViewModel uid -> NodeViewModel
            // don't try to be smart by making the value index, unshiftChild adds from the front
            this._nodeUidToNodeViewModel = {};
            // map of resource uid -> NodeViewModel
            // don't try to be smart by making the value index, unshiftChild adds from the front
            this._resourceUidToNodeViewModel = {};
            this._children([]);
        }
        NodeChildrenSet.prototype.getChildren = function () {
            // Use slice to return a "clone" of the array, this way people aren't
            // modifying the actual underlying array. If you want to do something to
            // the underlying array, then a function should be written in here
            // to ensure the validity of _childrenAddedByNodeUid. If you need to access a child
            // directly or get the length of the _children array, consider using getChild
            // or getLength instead.
            return this._children().slice(0);
        };
        NodeChildrenSet.prototype.getChild = function (index) {
            return this._children()[index];
        };
        NodeChildrenSet.prototype.getLength = function () {
            return this._children().length;
        };
        NodeChildrenSet.prototype.addChild = function (newChild) {
            if (!this.contains(newChild)) {
                var nodeResourceUid = newChild.getResourceUid();
                if (!!nodeResourceUid) {
                    // If the node has a UID for the resource it represents, track that as well to prevent search duplicates.
                    this._resourceUidToNodeViewModel[nodeResourceUid] = newChild;
                }
                this._nodeUidToNodeViewModel[newChild.uid] = newChild;
                this._children.push(newChild);
            }
        };
        NodeChildrenSet.prototype.unshiftChild = function (nodeViewModel) {
            if (!this.contains(nodeViewModel)) {
                var nodeResourceUid = nodeViewModel.getResourceUid();
                if (!!nodeResourceUid) {
                    // If the node has a UID for the resource it represents, track that as well to prevent search duplicates.
                    this._resourceUidToNodeViewModel[nodeResourceUid] = nodeViewModel;
                }
                this._nodeUidToNodeViewModel[nodeViewModel.uid] = nodeViewModel;
                this._children.unshift(nodeViewModel);
            }
            return this._children().length;
        };
        NodeChildrenSet.prototype.getChildByResourceUid = function (resourceUid) {
            if (!!resourceUid) {
                return this._resourceUidToNodeViewModel[resourceUid];
            }
            return null;
        };
        NodeChildrenSet.prototype.contains = function (node) {
            var nodeResourceUid = node.getResourceUid();
            var nodeUid = node.uid;
            if (!!nodeResourceUid) {
                return !!this._nodeUidToNodeViewModel[nodeUid] || !!this._resourceUidToNodeViewModel[nodeResourceUid];
            }
            return !!this._nodeUidToNodeViewModel[nodeUid];
        };
        NodeChildrenSet.prototype.clearChildren = function () {
            var oldChildren = this._children().slice(0);
            this._nodeUidToNodeViewModel = {};
            this._resourceUidToNodeViewModel = {};
            this._children([]);
            return oldChildren;
        };
        NodeChildrenSet.prototype.sort = function () {
            var _this = this;
            // Sort after displayName has been resolved for all nodes
            return es6_promise_1.Promise.all(this._children().map(function (nodeViewModel) { return nodeViewModel.displayNameReady; }))
                .then(function () {
                _this._children.sort(NodeChildrenSet.compareViewModels);
            });
        };
        NodeChildrenSet.prototype.disposeAll = function () {
            this._children().forEach(function (nodeViewModel) {
                nodeViewModel.dispose();
            });
            this._resourceUidToNodeViewModel = {};
            this._nodeUidToNodeViewModel = {};
            this._children([]);
        };
        NodeChildrenSet.prototype.deleteChildByIndex = function (indexOfChildToDelete) {
            if (indexOfChildToDelete >= 0 && indexOfChildToDelete < this._children().length) {
                var deletedChild = this._children()[indexOfChildToDelete];
                var resoureUidOfChildToDelete = deletedChild.getResourceUid();
                this._children.splice(indexOfChildToDelete, 1); // Only delete one child node.
                delete this._nodeUidToNodeViewModel[deletedChild.uid];
                if (!!resoureUidOfChildToDelete) {
                    delete this._resourceUidToNodeViewModel[resoureUidOfChildToDelete];
                }
                return deletedChild;
            }
            else {
                return null;
            }
        };
        NodeChildrenSet.prototype.deleteChildByNodeUid = function (nodeUidOfChildToDelete) {
            // find the index of this child then delete it
            for (var index = 0; index < this._children().length; index++) {
                if (this._children()[index].uid === nodeUidOfChildToDelete) {
                    return this.deleteChildByIndex(index);
                }
            }
            return null;
        };
        NodeChildrenSet.prototype.shiftChild = function () {
            if (this._children().length === 0) {
                // same behavior as Array.shift
                return undefined;
            }
            var shiftedViewModel = this._children.shift();
            delete this._nodeUidToNodeViewModel[shiftedViewModel.uid];
            var resoureUidOfChildToDelete = shiftedViewModel.getResourceUid();
            if (!!resoureUidOfChildToDelete) {
                delete this._resourceUidToNodeViewModel[resoureUidOfChildToDelete];
            }
            return shiftedViewModel;
        };
        return NodeChildrenSet;
    }());
    NodeChildrenSet.compareViewModels = function (left, right) {
        var leftString = left.displayName().toLowerCase();
        var rightString = right.displayName().toLowerCase();
        // A list of special nodes that should always stay on top of the sort result.
        // Values are node's uid, in the order of appearance.
        var specialOrderUids = ["Azure.QuickAccess", "Azure.RecentlyUsed"];
        if (specialOrderUids.some(function (value) { return value === left.uid; }) && specialOrderUids.some(function (value) { return value === right.uid; })) {
            // Both left and right nodes are in the special order list, sort by special order.
            var indexLeft = specialOrderUids.indexOf(left.uid);
            var indexRight = specialOrderUids.indexOf(right.uid);
            return indexLeft === indexRight ? 0 : (indexLeft < indexRight) ? -1 : 1;
        }
        else if (specialOrderUids.some(function (value) { return value === left.uid; })) {
            return -1; // Only left node is in special list.
        }
        else if (specialOrderUids.some(function (value) { return value === right.uid; })) {
            return 1;
        }
        return leftString === rightString ? 0 : (leftString < rightString) ? -1 : 1;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = NodeChildrenSet;
});

define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TreeNodeComponent = (function () {
        function TreeNodeComponent(data) {
            return data.data;
        }
        return TreeNodeComponent;
    }());
    exports.TreeNodeComponent = TreeNodeComponent;
    var ResourceTree = (function () {
        function ResourceTree() {
            return {
                viewModel: TreeNodeComponent,
                template: {
                    require: "text!ResourceTree.html"
                }
            };
        }
        return ResourceTree;
    }());
    exports.ResourceTree = ResourceTree;
    var DatabaseTreeNode = (function () {
        function DatabaseTreeNode() {
            return {
                viewModel: TreeNodeComponent,
                template: {
                    require: "text!DatabaseTreeNode.html"
                }
            };
        }
        return DatabaseTreeNode;
    }());
    exports.DatabaseTreeNode = DatabaseTreeNode;
    var CollectionTreeNode = (function () {
        function CollectionTreeNode() {
            return {
                viewModel: TreeNodeComponent,
                template: {
                    require: "text!CollectionTreeNode.html"
                }
            };
        }
        return CollectionTreeNode;
    }());
    exports.CollectionTreeNode = CollectionTreeNode;
    var StoredProcedureTreeNode = (function () {
        function StoredProcedureTreeNode() {
            return {
                viewModel: TreeNodeComponent,
                template: {
                    require: "text!StoredProcedureTreeNode.html"
                }
            };
        }
        return StoredProcedureTreeNode;
    }());
    exports.StoredProcedureTreeNode = StoredProcedureTreeNode;
    var UserDefinedFunctionTreeNode = (function () {
        function UserDefinedFunctionTreeNode() {
            return {
                viewModel: TreeNodeComponent,
                template: {
                    require: "text!UserDefinedFunctionTreeNode.html"
                }
            };
        }
        return UserDefinedFunctionTreeNode;
    }());
    exports.UserDefinedFunctionTreeNode = UserDefinedFunctionTreeNode;
    var TriggerTreeNode = (function () {
        function TriggerTreeNode() {
            return {
                viewModel: TreeNodeComponent,
                template: {
                    require: "text!TriggerTreeNode.html"
                }
            };
        }
        return TriggerTreeNode;
    }());
    exports.TriggerTreeNode = TriggerTreeNode;
    var CollectionTreeNodeContextMenu = (function () {
        function CollectionTreeNodeContextMenu() {
            return {
                viewModel: TreeNodeComponent,
                template: {
                    require: "text!CollectionTreeNodeContextMenu.html"
                }
            };
        }
        return CollectionTreeNodeContextMenu;
    }());
    exports.CollectionTreeNodeContextMenu = CollectionTreeNodeContextMenu;
});

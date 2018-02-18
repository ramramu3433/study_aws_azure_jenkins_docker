define(["require", "exports", "knockout", "../../Contracts/ViewModels", "../Tabs/UserDefinedFunctionTab", "../Menus/ContextMenu"], function (require, exports, ko, ViewModels, UserDefinedFunctionTab, ContextMenu) {
    "use strict";
    var UserDefinedFunction = (function () {
        function UserDefinedFunction(container, collection, data) {
            var _this = this;
            this.onKeyDown = function (source, event) {
                if (event.key === "Delete") {
                    _this.delete(source, event);
                    return false;
                }
                return true;
            };
            this.onKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.open();
                    return false;
                }
                return true;
            };
            this.nodeKind = "UserDefinedFunction";
            this.container = container;
            this.collection = collection;
            this.self = data._self;
            this.rid = data._rid;
            this.id = ko.observable(data.id);
            this.body = ko.observable(data.body);
            this.contextMenu = new ContextMenu(this.container, this.rid);
        }
        UserDefinedFunction.create = function (source, event) {
            var id = source.container.openedTabs().filter(function (tab) { return tab.tabKind === ViewModels.CollectionTabKind.UserDefinedFunctions; }).length + 1;
            var userDefinedFunction = {
                id: "",
                body: "function userDefinedFunction(){}"
            };
            var userDefinedFunctionTab = new UserDefinedFunctionTab({
                resource: userDefinedFunction,
                isNew: true,
                tabKind: ViewModels.CollectionTabKind.UserDefinedFunctions,
                title: "",
                tabPath: "",
                documentClientUtility: source.container.documentClientUtility,
                isRunningOnDaytona: false,
                selfLink: "",
                isActive: ko.observable(false)
            });
            source.container.openedTabs.push(userDefinedFunctionTab);
            // Activate
            userDefinedFunctionTab.onTabClick();
            // Hide Context Menu (if necessary)
            source.contextMenu.hide(source, event);
        };
        UserDefinedFunction.prototype.open = function () {
            var _this = this;
            this.select();
            var userDefinedFunctionTab = this.container.openedTabs().filter(function (tab) { return tab.node.rid === _this.rid; })[0];
            if (!userDefinedFunctionTab) {
                var userDefinedFunctionData = {
                    _rid: this.rid,
                    _self: this.self,
                    id: this.id(),
                    body: this.body()
                };
                userDefinedFunctionTab = new UserDefinedFunctionTab({
                    resource: userDefinedFunctionData,
                    isNew: true,
                    tabKind: ViewModels.CollectionTabKind.UserDefinedFunctions,
                    title: "",
                    tabPath: "",
                    documentClientUtility: userDefinedFunctionTab.documentClientUtility,
                    isRunningOnDaytona: false,
                    selfLink: "",
                    isActive: ko.observable(false)
                });
                this.container.openedTabs.push(userDefinedFunctionTab);
            }
            // Activate
            userDefinedFunctionTab.onTabClick();
        };
        UserDefinedFunction.prototype.select = function () {
            this.container.selectedNode(this);
        };
        UserDefinedFunction.prototype.delete = function (source, event) {
            var _this = this;
            // Hide Context Menu (if necessary)
            this.contextMenu.hide(source, event);
            var userDefinedFunctionData = {
                _rid: this.rid,
                _self: this.self,
                id: this.id(),
                body: this.body()
            };
            this.container.documentClientUtility.deleteUserDefinedFunction(userDefinedFunctionData, null /*options*/).then(function () {
                _this.collection.children.remove(_this);
            }, function (reason) {
            });
        };
        return UserDefinedFunction;
    }());
    return UserDefinedFunction;
});

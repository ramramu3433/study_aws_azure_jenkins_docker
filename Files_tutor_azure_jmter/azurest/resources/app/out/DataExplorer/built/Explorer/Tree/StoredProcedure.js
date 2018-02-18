define(["require", "exports", "knockout", "../../Contracts/ViewModels", "../Tabs/StoredProcedureTab", "../Menus/ContextMenu"], function (require, exports, ko, ViewModels, StoredProcedureTab, ContextMenu) {
    "use strict";
    var StoredProcedure = (function () {
        function StoredProcedure(container, collection, data) {
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
            this.nodeKind = "StoredProcedure";
            this.container = container;
            this.collection = collection;
            this.self = data._self;
            this.rid = data._rid;
            this.id = ko.observable(data.id);
            this.body = ko.observable(data.body);
            this.contextMenu = new ContextMenu(this.container, this.rid);
        }
        StoredProcedure.create = function (source, event) {
            var openedTabs = source.container.openedTabs();
            var id = openedTabs.filter(function (tab) { return tab.tabKind === ViewModels.CollectionTabKind.StoredProcedures; }).length + 1;
            var storedProcedure = {
                id: "",
                body: "function storedProcedure(){}"
            };
            var storedProcedureTab = new StoredProcedureTab({
                resource: storedProcedure,
                isNew: true,
                tabKind: ViewModels.CollectionTabKind.StoredProcedures,
                title: "",
                tabPath: "",
                documentClientUtility: source.container.documentClientUtility,
                isRunningOnDaytona: false,
                selfLink: "",
                isActive: ko.observable(false)
            });
            source.container.openedTabs.push(storedProcedureTab);
            // Activate
            storedProcedureTab.onTabClick();
            // Hide Context Menu (if necessary)
            source.contextMenu.hide(source, event);
        };
        StoredProcedure.prototype.select = function () {
            this.container.selectedNode(this);
        };
        StoredProcedure.prototype.open = function () {
            var _this = this;
            this.select();
            var openedTabs = this.container.openedTabs();
            var storedProcedureTab = openedTabs.filter(function (tab) { return tab.node.rid === _this.rid; })[0];
            if (!storedProcedureTab) {
                var storedProcedureData = {
                    _rid: this.rid,
                    _self: this.self,
                    id: this.id(),
                    body: this.body()
                };
                storedProcedureTab = new StoredProcedureTab({
                    resource: storedProcedureData,
                    isNew: true,
                    tabKind: ViewModels.CollectionTabKind.StoredProcedures,
                    title: "",
                    tabPath: "",
                    documentClientUtility: storedProcedureTab.documentClientUtility,
                    isRunningOnDaytona: false,
                    selfLink: "",
                    isActive: ko.observable(false)
                });
                this.container.openedTabs.push(storedProcedureTab);
            }
            // Activate
            storedProcedureTab.onTabClick();
        };
        StoredProcedure.prototype.delete = function (source, event) {
            var _this = this;
            // Hide Context Menu (if necessary)
            this.contextMenu.hide(source, event);
            var storedProcedureData = {
                _rid: this.rid,
                _self: this.self,
                id: this.id(),
                body: this.body()
            };
            this.container.documentClientUtility.deleteStoredProcedure(storedProcedureData, null /*options*/).then(function () {
                _this.container.openedTabs.remove(function (tab) { return tab.node.rid === _this.rid; });
                _this.collection.children.remove(_this);
            }, function (reason) {
            });
        };
        return StoredProcedure;
    }());
    return StoredProcedure;
});

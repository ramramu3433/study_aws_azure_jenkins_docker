define(["require", "exports", "knockout", "../../Contracts/ViewModels", "../Tabs/TriggerTab", "../Menus/ContextMenu"], function (require, exports, ko, ViewModels, TriggerTab, ContextMenu) {
    "use strict";
    var Trigger = (function () {
        function Trigger(container, collection, data) {
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
            this.nodeKind = "Trigger";
            this.container = container;
            this.collection = collection;
            this.self = data._self;
            this.rid = data._rid;
            this.id = ko.observable(data.id);
            this.body = ko.observable(data.body);
            this.triggerOperation = ko.observable(data.triggerOperation);
            this.triggerType = ko.observable(data.triggerType);
            this.contextMenu = new ContextMenu(this.container, this.rid);
        }
        Trigger.prototype.select = function () {
            this.container.selectedNode(this);
        };
        Trigger.create = function (source, event) {
            var id = source.container.openedTabs().filter(function (tab) { return tab.tabKind === ViewModels.CollectionTabKind.Triggers; }).length + 1;
            var trigger = {
                id: "",
                body: "function trigger(){}",
                triggerOperation: "All",
                triggerType: "Pre"
            };
            var triggerTab = new TriggerTab({
                resource: trigger,
                isNew: true,
                tabKind: ViewModels.CollectionTabKind.Triggers,
                title: "",
                tabPath: "",
                documentClientUtility: source.container.documentClientUtility,
                isRunningOnDaytona: false,
                selfLink: "",
                isActive: ko.observable(false),
                triggerOperation: "",
                triggerType: ""
            });
            source.container.openedTabs.push(triggerTab);
            // Activate
            triggerTab.onTabClick();
            // Hide Context Menu (if necessary)
            source.contextMenu.hide(source, event);
        };
        Trigger.prototype.open = function () {
            var _this = this;
            this.select();
            var triggerTab = this.container.openedTabs().filter(function (tab) { return tab.node.rid === _this.rid; })[0];
            if (!triggerTab) {
                var triggerData = {
                    _rid: this.rid,
                    _self: this.self,
                    id: this.id(),
                    body: this.body(),
                    triggerOperation: this.triggerOperation(),
                    triggerType: this.triggerType()
                };
                triggerTab = new TriggerTab({
                    resource: triggerData,
                    isNew: true,
                    tabKind: ViewModels.CollectionTabKind.Triggers,
                    title: "",
                    tabPath: "",
                    documentClientUtility: triggerTab.documentClientUtility,
                    isRunningOnDaytona: false,
                    selfLink: "",
                    isActive: ko.observable(false),
                    triggerOperation: "",
                    triggerType: ""
                });
                this.container.openedTabs.push(triggerTab);
            }
            // Activate
            triggerTab.onTabClick();
        };
        Trigger.prototype.delete = function (source, event) {
            var _this = this;
            // Hide Context Menu (if necessary)
            this.contextMenu.hide(source, event);
            var triggerData = {
                _rid: this.rid,
                _self: this.self,
                id: this.id(),
                body: this.body(),
                triggerOperation: this.triggerOperation(),
                triggerType: this.triggerType()
            };
            this.container.documentClientUtility.deleteTrigger(triggerData, null /*options*/).then(function () {
                _this.collection.children.remove(_this);
            }, function (reason) {
            });
        };
        return Trigger;
    }());
    return Trigger;
});

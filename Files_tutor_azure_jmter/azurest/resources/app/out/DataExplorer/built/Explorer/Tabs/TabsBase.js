define(["require", "exports", "knockout", "q", "../../Common/ThemeUtility"], function (require, exports, ko, Q, ThemeUtility_1) {
    "use strict";
    var TabsBase = (function () {
        function TabsBase(options) {
            var _this = this;
            var id = new Date().getTime().toString();
            this._theme = ThemeUtility_1.default.getMonacoTheme(options.theme);
            this.documentClientUtility = options.documentClientUtility;
            this.daytonaContext = options.daytonaContext;
            this.node = options.node;
            this.collection = options.collection;
            this.isActive = options.isActive;
            this.isMouseOver = ko.observable(false);
            this.tabId = "tab" + id;
            this.tabKind = options.tabKind;
            this.tabTitle = ko.observable(options.title);
            this.tabPath = ko.observable(options.tabPath);
            this.nextTab = ko.observable();
            this.previousTab = ko.observable();
            this.closeButtonTabIndex = ko.computed(function () { return _this.isActive() ? 0 : null; });
            this.isRunningOnDaytona = options.isRunningOnDaytona;
            this.isActive.subscribe(function (isActive) {
                if (isActive) {
                    _this.onActivate();
                }
            });
            this.closeTabButton = {
                enabled: ko.computed(function () {
                    return true;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            if (!options.isRunningOnDaytona) {
                var openedTabs = this.collection.container.openedTabs();
                if (openedTabs && openedTabs.length && openedTabs.length > 0) {
                    var lastTab = openedTabs[openedTabs.length - 1];
                    lastTab && lastTab.nextTab(this);
                    this.previousTab(lastTab);
                }
            }
        }
        TabsBase.prototype.onCloseTabButtonClick = function () {
            var _this = this;
            // if the tab is running on Daytona, the function should not be called, just in case
            if (this.isRunningOnDaytona) {
                return Q();
            }
            var openedTabs = this.collection.container.openedTabs();
            var previousTab = this.previousTab();
            var nextTab = this.nextTab();
            previousTab && previousTab.nextTab(nextTab);
            nextTab && nextTab.previousTab(previousTab);
            this.collection.container.openedTabs.remove(function (tab) { return tab.tabId === _this.tabId; });
            var tabToActivate = nextTab || previousTab;
            if (!tabToActivate) {
                this.collection.container.selectedNode(null);
            }
            else {
                tabToActivate.isActive(true);
                this.collection.container.selectedNode(tabToActivate.node);
                tabToActivate.collection.selectedSubnodeKind(tabToActivate.tabKind);
            }
            return Q();
        };
        TabsBase.prototype.onTabClick = function () {
            // TODO need to refactor
            if (this.isRunningOnDaytona) {
                return Q();
            }
            for (var i = 0; i < this.collection.container.openedTabs().length; i++) {
                var tab = this.collection.container.openedTabs()[i];
                tab.isActive(false);
            }
            this.collection.selectedSubnodeKind(null);
            if (!this.collection.isCollectionExpanded()) {
                this.collection.container.selectedNode(this.collection);
            }
            else {
                this.collection.container.selectedNode(this.node);
            }
            this.isActive(true);
            return Q();
        };
        TabsBase.prototype.onSpaceOrEnterKeyPress = function (event, callback) {
            if (event.key === " " || event.key === "Enter") {
                callback();
                event.stopPropagation();
            }
        };
        TabsBase.prototype.onKeyPress_Activate = function (source, event) {
            var _this = this;
            this.onSpaceOrEnterKeyPress(event, function () { return _this.onTabClick(); });
        };
        TabsBase.prototype.onKeyPress_Close = function (source, event) {
            var _this = this;
            this.onSpaceOrEnterKeyPress(event, function () { return _this.onCloseTabButtonClick(); });
        };
        TabsBase.prototype.onActivate = function () {
            return Q();
        };
        TabsBase.prototype.refresh = function () {
            location.reload();
            return Q();
        };
        /** Renders a Javascript object to be displayed inside Monaco Editor */
        TabsBase.prototype.renderObjectForEditor = function (value, replacer, space) {
            return JSON.stringify(value, replacer, space);
        };
        return TabsBase;
    }());
    return TabsBase;
});

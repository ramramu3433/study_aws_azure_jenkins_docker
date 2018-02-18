"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var DaytonaTabViewModel_1 = require("./DaytonaTabViewModel");
var TabViewModel_1 = require("./TabViewModel");
var IsolatedEnvironment_1 = require("./IsolatedEnvironment");
var WebviewTabViewModel_1 = require("./WebviewTabViewModel");
var $ = require("jquery");
var ko = require("knockout");
var host = global.host;
var TabPanelViewModel = (function () {
    function TabPanelViewModel(canCloseTabs, canCollapse) {
        if (canCloseTabs === void 0) { canCloseTabs = true; }
        if (canCollapse === void 0) { canCollapse = false; }
        var _this = this;
        this.activeTab = ko.observable();
        this.temporaryTab = ko.observable();
        this.cachedTabs = ko.observableArray();
        this.openTabs = ko.observableArray();
        this.canCloseTabs = ko.observable(true);
        this.isCollapsed = ko.observable(false);
        this.canCollapse = ko.observable(false);
        this.showExpander = ko.computed(function () { return _this.canCollapse(); });
        this.expanderIcon = ko.computed(function () { return _this.isCollapsed() ? "../../images/ExpandChevronUp.svg" : "../../images/ExpandChevronDown.svg"; });
        this.onCollapse = function (callback) {
            _this._collapseCallback = callback;
        };
        this.collapse = function () {
            _this.isCollapsed(true);
            if (_this._collapseCallback) {
                _this._collapseCallback();
            }
        };
        this.onExpand = function (callback) {
            _this._expandCallback = callback;
        };
        this.expand = function () {
            _this.isCollapsed(false);
            if (_this._expandCallback) {
                _this._expandCallback();
            }
        };
        this.toggle = function () {
            if (_this.isCollapsed()) {
                _this.expand();
            }
            else {
                _this.collapse();
            }
        };
        this.scrollToFocusedTab = function () {
            var $selected = $(".tab:focus");
            _this.scrollToTab($selected);
        };
        this.openTabContextMenu = function (tab, event) {
            var hasOtherTabs = _this.openTabs().length > 1 || (_this.openTabs().length === 1 && !!_this.temporaryTab());
            var menuItems = [
                {
                    id: "close",
                    type: "normal",
                    label: "Close",
                    enabled: true,
                    visible: _this.canCloseTabs()
                },
                {
                    id: "close-others",
                    type: "normal",
                    label: "Close Others",
                    enabled: hasOtherTabs,
                    visible: _this.canCloseTabs()
                },
                {
                    id: "close-all",
                    type: "normal",
                    label: "Close All",
                    enabled: true,
                    visible: _this.canCloseTabs()
                },
                {
                    type: "separator",
                    visible: _this.canCloseTabs()
                },
                {
                    id: "keep-open",
                    type: "normal",
                    label: "Keep Open",
                    enabled: tab.isTemporary(),
                    visible: _this.canCloseTabs()
                }
            ];
            host.executeOperation("MenuManager.showMenu", { menuItems: menuItems }).then(function (id) {
                switch (id) {
                    case "close":
                        _this.closeTab(tab);
                        break;
                    case "close-others":
                        _this.closeOtherTabs(tab);
                        break;
                    case "close-all":
                        _this.closeAllTabs();
                        break;
                    case "keep-open":
                        _this.promoteTemporaryTab();
                        break;
                }
            });
        };
        /**
         * Ensures the specified tab becomes the active tab.
         */
        this.openTab = function (tab, promoteTab) {
            if (promoteTab === void 0) { promoteTab = false; }
            if (_this.isCollapsed()) {
                _this.expand();
            }
            if (tab === _this.temporaryTab() && promoteTab) {
                _this.promoteTemporaryTab();
            }
            else if (!_this.isOpenTab(tab)) {
                if (promoteTab) {
                    tab.isTemporary(false);
                    _this.openTabs.push(tab);
                }
                else {
                    _this.setTemporaryTab(tab);
                }
            }
            // Delay is a workaround for delays in other components and frees up thread to update UI.
            setTimeout(function () {
                // Update Cloud Explorer to select the node associated with the active tab.
                host.executeOperation("CloudExplorer.ElementInteraction.select", { target: tab.cloudExplorerNodeID() }).then(function () { return _this.setActiveTab(tab); });
                _this.scrollToOpenTab();
            }, 100);
        };
        this.closeAllTabs = function () {
            _this.openTabs([]);
            _this.setTemporaryTab(null);
            _this.setActiveTab(null);
        };
        this.closeOtherTabs = function (tab) {
            if (tab.isTemporary()) {
                _this.openTabs([]);
            }
            else {
                _this.openTabs([tab]);
                if (_this.temporaryTab()) {
                    _this.setTemporaryTab(null);
                }
            }
            _this.openTab(tab, false);
        };
        /**
         * Closes the specified tab.
         *
         * Daytona plugins may host long-running activites that can outlive
         * the tab. To prevent these activities from being lost, only tabs are
         * removed. The underlying tabs are not deleted.
         *
         * Webviews should not host any long-running activities, so they will be
         * completely removed.
         */
        this.closeTab = function (tab) {
            var isClosedTabTemporary = tab.isTemporary();
            if (tab === _this.temporaryTab()) {
                _this.setTemporaryTab(null);
            }
            else {
                _this.openTabs.remove(tab);
            }
            if (_this.isActiveTab(tab)) {
                // Select another tab to be opened if the closed tab was the active tab
                if (_this.openTabs().length > 0) {
                    // Open one of the permanent tabs
                    var index = _this.openTabs.indexOf(tab);
                    if (!isClosedTabTemporary) {
                        _this.openTab(_this.openTabs()[0]);
                    }
                    else if (index - 1 > 0) {
                        _this.openTab(_this.openTabs()[index - 1]);
                    }
                    else {
                        _this.openTab(_this.openTabs()[0]);
                    }
                }
                else if (_this.temporaryTab()) {
                    // Open the temporary tab if there are no other tabs available
                    _this.openTab(_this.temporaryTab());
                }
                else {
                    _this.setActiveTab(null);
                }
            }
            if (!tab.cacheOnClose) {
                _this.cachedTabs.remove(tab);
            }
        };
        this.closeActiveTab = function () {
            _this.closeTab(_this.activeTab());
        };
        this.enterKeyDown = function (tab, event) {
            if (event.key === "Enter" && event.srcElement.className === "tab-button close-tab-icon") {
                _this.closeTab(tab);
            }
            else if (event.key === "Enter" && event.srcElement.className === "tab-button preview-tab-icon") {
                _this.promoteTemporaryTab();
            }
            return true;
        };
        this.getActiveTabInfo = function () {
            if (_this.activeTab()) {
                return _this.activeTab().parameters;
            }
            return null;
        };
        this.tabKeyDown = function (tab, event) {
            if (event.key === "Enter" && (event.srcElement.className === "tab active" || event.srcElement.className === "tab" || event.srcElement.className === "tab temporary")) {
                _this.openTab(tab);
            }
            return true;
        };
        this.tabFocus = function (tab, event) {
            _this.scrollToFocusedTab();
            return false;
        };
        /**
         * Shows a tab for the specified resource.
         */
        this.showTab = function (name, resourcePath, options) {
            var tab = _this.findOpenTab(resourcePath);
            var needToPromote = !options.temporaryTab || options.newTab || false;
            if (!tab || options.newTab) {
                tab = _this.createNewTab(name, resourcePath, options);
                _this.cachedTabs.push(tab);
            }
            _this.openTab(tab, needToPromote);
        };
        /**
         * Promotes the current temporary tab (if any) to a permanent tab.
         */
        this.promoteTemporaryTab = function () {
            if (_this.temporaryTab()) {
                _this.openTabs.unshift(_this.temporaryTab());
                _this.setTemporaryTab(null);
            }
        };
        this.canCloseTabs(canCloseTabs);
        this.canCollapse(canCollapse);
    }
    TabPanelViewModel.prototype.scrollToOpenTab = function () {
        var $selected = $(".tab.active");
        this.scrollToTab($selected);
    };
    TabPanelViewModel.prototype.scrollToTab = function ($tab) {
        if ($tab && $tab.length > 0) {
            var scrollableWidth = $(".tab-container").width();
            var scrollableLeft = $(".tab-container").scrollLeft();
            var scrollableRight = scrollableLeft + scrollableWidth;
            var tabPositionLeft = scrollableLeft + $tab.position().left;
            var tabWidth = $tab.outerWidth(true);
            var tabRight = tabPositionLeft + tabWidth;
            if (tabPositionLeft < scrollableLeft) {
                $(".tab-container").scrollLeft(tabPositionLeft);
            }
            else if (tabRight > scrollableRight) {
                var differenceToMove = tabRight - scrollableRight;
                $(".tab-container").scrollLeft(scrollableLeft + differenceToMove);
            }
        }
    };
    TabPanelViewModel.prototype.isOpenTab = function (tab) {
        return this.openTabs.indexOf(tab) >= 0;
    };
    TabPanelViewModel.prototype.findOpenTab = function (path) {
        if (this.temporaryTab() && path === this.temporaryTab().fullName()) {
            return this.temporaryTab();
        }
        else {
            return this.openTabs().filter(function (tab) { return path === tab.fullName(); })[0] || null;
        }
    };
    TabPanelViewModel.prototype.isActiveTab = function (fullNameOrTab) {
        if (fullNameOrTab instanceof TabViewModel_1.default) {
            return fullNameOrTab === this.activeTab();
        }
        else {
            return !!this.activeTab() && fullNameOrTab === this.activeTab().fullName();
        }
    };
    TabPanelViewModel.prototype.onThemeChanged = function (newTheme) {
        if (!!this.temporaryTab()) {
            this.temporaryTab().setTheme(newTheme);
        }
        this.openTabs().forEach(function (tab) {
            tab.setTheme(newTheme);
        });
    };
    TabPanelViewModel.prototype.onZoomChanged = function (zoomFactor) {
        this.openTabs().forEach(function (tab) {
            if (tab.environment === IsolatedEnvironment_1.default.Webview) {
                tab.setZoom(zoomFactor);
            }
        });
    };
    TabPanelViewModel.prototype.createNewTab = function (displayName, fullName, options) {
        var tab;
        if (options.environment === IsolatedEnvironment_1.default.DaytonaIframe) {
            tab = new DaytonaTabViewModel_1.default(displayName, fullName, options);
        }
        else {
            tab = new WebviewTabViewModel_1.default(displayName, fullName, options);
        }
        return tab;
    };
    TabPanelViewModel.prototype.setActiveTab = function (tab) {
        if (tab === this.activeTab()) {
            return;
        }
        var previousActiveTab = this.activeTab();
        if (!!previousActiveTab) {
            previousActiveTab.isActive(false);
        }
        if (!!tab) {
            tab.isActive(true);
        }
        this.activeTab(tab);
    };
    TabPanelViewModel.prototype.setTemporaryTab = function (tab) {
        if (tab === this.temporaryTab()) {
            return;
        }
        var previousTemporaryTab = this.temporaryTab();
        if (!!previousTemporaryTab) {
            previousTemporaryTab.isTemporary(false);
        }
        if (!!tab) {
            tab.isTemporary(true);
        }
        this.temporaryTab(tab);
    };
    return TabPanelViewModel;
}());
exports.default = TabPanelViewModel;

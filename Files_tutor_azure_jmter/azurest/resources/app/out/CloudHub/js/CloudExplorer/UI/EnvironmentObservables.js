/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "jquery"], function (require, exports, ko, $) {
    "use strict";
    /*
     * A helper object for making some dom properties observable.
     */
    var EnvironmentObservables = (function () {
        function EnvironmentObservables() {
            var _this = this;
            this.windowHeight = ko.observable(0);
            this.windowWidth = ko.observable(0);
            this.contextMenuHeight = ko.observable(0);
            this.contextMenuWidth = ko.observable(0);
            this.headerHeight = ko.observable(0);
            this.footerHeight = ko.observable(0);
            this.activePanelFooterHeight = ko.observable(0);
            this.searchBarHeight = ko.observable(0);
            this.actionLinksHeight = ko.observable(0);
            this.subscriptionHeight = ko.observable(0);
            this.accountPickerHeight = ko.observable(0);
            this.scrollableRegionHeight = ko.observable(0);
            this.scrollableContentHeight = ko.observable(0);
            this.backgroundColor = ko.observable();
            this.isHighContrastWhite = ko.observable(false);
            this.isHighContrastBlack = ko.observable(false); // High Contrast Black or High Contrast #{1,2}
            this.isHighContrast = ko.observable(false);
            this.$contextMenu = $(".context-menu");
            this.$body = $("body");
            this.$header = $("body > .header");
            this.$footer = $("body > .footer");
            this.$activePanelFooter = $(".panel.active > .footer.strip");
            this.$searchBar = $(".panel.active > .search");
            this.$actionLinks = $(".panel.active > .action-links");
            this.$window = $(window);
            this.$scrollableRegion = $(".panel.active > .scrollable");
            this.$scrollableContent = $(".panel.active .scrollableContent");
            this.updateWindowSizeProperties = function () {
                _this.windowHeight(_this.$window.height());
                _this.windowWidth(_this.$window.width());
            };
            this.updateScrollableArea = function () {
                _this.$scrollableRegion = $(".panel.active > .scrollable");
                _this.$scrollableContent = $(".panel.active .scrollableContent");
            };
            this.updateContextMenu = function () {
                _this.$contextMenu = $(".context-menu");
                _this.contextMenuHeight(_this.$contextMenu.height());
                _this.contextMenuWidth(_this.$contextMenu.width());
            };
            this.updateActivePanel = function () {
                _this.$activePanelFooter = $(".panel.active > .footer.strip");
                _this.activePanelFooterHeight(_this.$activePanelFooter.outerHeight(true));
                _this.$searchBar = $(".panel.active > .search");
                _this.searchBarHeight(_this.$searchBar.outerHeight(true));
                _this.$actionLinks = $(".panel.active > .action-links");
                _this.actionLinksHeight(_this.$actionLinks.outerHeight(true));
            };
            this.updateMonitoredProperties = function () {
                _this.headerHeight(_this.$header.outerHeight(true));
                _this.footerHeight(_this.$footer.outerHeight(true));
                _this.activePanelFooterHeight(_this.$activePanelFooter.outerHeight(true));
                _this.searchBarHeight(_this.$searchBar.outerHeight(true));
                _this.$actionLinks = $(".panel.active > .action-links");
                _this.actionLinksHeight(_this.$actionLinks.outerHeight(true));
                _this.scrollableRegionHeight(_this.$scrollableRegion.height());
                _this.scrollableContentHeight(_this.$scrollableContent.height());
                _this.backgroundColor(_this.$body.css("background-color"));
                // Note: Microsoft IE/Edge don't trigger "-ms-high-contrast: black-on-white" if High Contrast #1/2 are used, so
                // we'll need to just detect any high contrast via CSS, then determine black or white by checking the background color
                var highContrastTest = $("#hidden-high-contrast-test").css("background-color");
                _this.isHighContrast(highContrastTest === "rgb(1, 2, 3)");
                _this.isHighContrastBlack(_this.isHighContrast() && _this.backgroundColor() === "rgb(0, 0, 0)");
                _this.isHighContrastWhite(_this.isHighContrast && !_this.isHighContrastBlack());
            };
            window.setInterval(this.updateMonitoredProperties, 250);
            $(window).resize(this.updateMonitoredProperties);
            $(window).resize(this.updateWindowSizeProperties);
            this.updateWindowSizeProperties();
            this.updateMonitoredProperties();
        }
        return EnvironmentObservables;
    }());
    return EnvironmentObservables;
});

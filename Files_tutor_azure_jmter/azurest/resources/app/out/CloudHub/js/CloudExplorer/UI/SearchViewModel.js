/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "Providers/CloudExplorer/Resources/CloudExplorerResources"], function (require, exports, ko, CloudExplorerResources) {
    "use strict";
    /**
     * Search bar representation
     */
    var SearchViewModel = (function () {
        function SearchViewModel(panel, resourceResolver) {
            var _this = this;
            /* Observables */
            this.searchQuery = ko.observable();
            this.searchPlaceholder = ko.observable();
            this.searchValue = ko.observable();
            this.delayedValue = ko.pureComputed(this.searchValue)
                .extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 750 } });
            this.isSearching = ko.observable(false);
            this.searchViewAriaLabel = ko.observable();
            this.clearSearch = function () {
                // If there is text to clear
                if (_this.searchQuery()) {
                    // Clear search box and execute initial query
                    _this.searchValue("");
                    _this._setFocus();
                }
                // TODO: Add telemetry
            };
            this.setSearchValueWithFocus = function (searchQuery) {
                // Set the search value
                _this.searchValue(searchQuery);
                // Wait a brief moment before setting focus.
                setTimeout(function () {
                    _this._setFocus();
                }, 10);
            };
            this.hasSearchValue = ko.pureComputed(function () {
                if (!_this.delayedValue()) {
                    return false;
                }
                return true;
            });
            this.reset = function () {
                // Make the filter empty so all resources are returned
                _this.searchValue("");
                _this.searchQuery("");
            };
            this._setFocus = function () {
                var inputElement = $(".panel.active > .search input");
                var origInput = inputElement.val();
                inputElement.focus().val("").focus().val(origInput);
            };
            this.startSearch = function () {
                // Don't search for the previous search query (when switching panels)
                if (_this.searchValue() === _this.searchQuery()) {
                    return;
                }
                // Edge case: avoid executing initial query when focus goes to
                // and empty search box
                if (!_this.searchValue() && !_this.isSearching()) {
                    return;
                }
                _this.searchQuery(_this.searchValue());
                _this.isSearching(true);
                // If the search box is empty, don't expand the nodes
                if (!_this.searchValue()) {
                    _this.isSearching(false);
                }
            };
            this.delayedValue.subscribe(this.startSearch);
            this._panel = panel;
            resourceResolver.resolveResources(CloudExplorerResources.namespace, ["View.Azure.Search.AriaLabel",
                "View.Azure.SearchForResources.Placeholder"])
                .then(function (values) {
                _this.searchViewAriaLabel(values["View.Azure.Search.AriaLabel"]);
                var placeholder = values["View.Azure.SearchForResources.Placeholder"];
                _this.searchPlaceholder(placeholder);
            });
        }
        return SearchViewModel;
    }());
    return SearchViewModel;
});

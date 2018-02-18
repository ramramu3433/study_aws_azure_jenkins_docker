/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore", "StorageExplorer/StorageExplorerConstants"], function (require, exports, ko, _, StorageExplorerConstants) {
    "use strict";
    var DataTableViewModel = (function () {
        function DataTableViewModel(telemetry) {
            /* Observables */
            this.items = ko.observableArray();
            this.selected = ko.observableArray();
            this.downloadSize = 1000;
            // Used by table redraw throttling
            this.pollingInterval = 1000;
            this.redrawInterval = 500;
            this.pendingRedraw = false;
            this.lastRedrawTime = new Date().getTime();
            this.items([]);
            this.selected([]);
            this.telemetry = telemetry;
            // Late bound
            this.dataTableOperationManager = null;
        }
        DataTableViewModel.prototype.bind = function (dataTableOperationManager) {
            this.dataTableOperationManager = dataTableOperationManager;
        };
        DataTableViewModel.prototype.clearLastSelected = function () {
            this.lastSelectedItem = null;
            this.lastSelectedAnchorItem = null;
        };
        DataTableViewModel.prototype.clearCache = function () {
            this.cache.clear();
            this.continuationToken = null;
            this.allDownloaded = false;
        };
        DataTableViewModel.prototype.clearSelection = function () {
            this.selected.removeAll();
        };
        // Redraws the table, but guarantees that multiple sequential calls will not incur
        // another redraw until a certain time interval has passed.
        DataTableViewModel.prototype.redrawTableThrottled = function () {
            var _this = this;
            if (!this.pendingRedraw) {
                this.pendingRedraw = true;
                var current = new Date().getTime();
                var timeSinceLastRedraw = current - this.lastRedrawTime;
                var redraw = function () {
                    _this.table.draw(false /*reset*/);
                    _this.lastRedrawTime = new Date().getTime();
                    _this.pendingRedraw = false;
                };
                if (timeSinceLastRedraw > this.redrawInterval) {
                    redraw();
                }
                else {
                    var timeUntilNextRedraw = this.redrawInterval - timeSinceLastRedraw;
                    setTimeout(function () { return redraw(); }, timeUntilNextRedraw);
                }
            }
        };
        DataTableViewModel.prototype.focusDataTable = function () {
            this.dataTableOperationManager.focusTable();
        };
        DataTableViewModel.prototype.getItemFromSelectedItems = function (itemKeys) {
            var _this = this;
            return _.find(this.selected(), function (item) {
                return _this.matchesKeys(item, itemKeys);
            });
        };
        DataTableViewModel.prototype.getItemFromCurrentPage = function (itemKeys) {
            var _this = this;
            return _.find(this.items(), function (item) {
                return _this.matchesKeys(item, itemKeys);
            });
        };
        DataTableViewModel.prototype.getItemIndexFromCurrentPage = function (itemKeys) {
            var _this = this;
            return _.findIndex(this.items(), function (item) {
                return _this.matchesKeys(item, itemKeys);
            });
        };
        DataTableViewModel.prototype.getItemIndexFromAllPages = function (itemKeys) {
            var _this = this;
            return _.findIndex(this.cache.data, function (item) {
                return _this.matchesKeys(item, itemKeys);
            });
        };
        DataTableViewModel.prototype.getItemsFromAllPagesWithinRange = function (start, end) {
            return this.cache.data.slice(start, end);
        };
        DataTableViewModel.prototype.isItemSelected = function (itemKeys) {
            var _this = this;
            return _.some(this.selected(), function (item) {
                return _this.matchesKeys(item, itemKeys);
            });
        };
        DataTableViewModel.prototype.isItemCached = function (itemKeys) {
            var _this = this;
            return _.some(this.cache.data, function (item) {
                return _this.matchesKeys(item, itemKeys);
            });
        };
        DataTableViewModel.prototype.getAllItemsInCurrentPage = function () {
            return this.items();
        };
        DataTableViewModel.prototype.getAllItemsInCache = function () {
            return this.cache.data;
        };
        DataTableViewModel.prototype.sortColumns = function (sortOrder, oSettings) {
            var self = this;
            this.clearSelection();
            this.cache.data.sort(function (a, b) {
                return self.dataComparer(a, b, sortOrder, oSettings);
            });
            this.cache.sortOrder = sortOrder;
        };
        DataTableViewModel.prototype.renderPage = function (renderCallBack, draw, startIndex, pageSize, oSettings, postRenderTasks) {
            var _this = this;
            if (postRenderTasks === void 0) { postRenderTasks = null; }
            this.updatePaginationControls(oSettings);
            // pageSize < 0 means to show all data
            var endIndex = pageSize < 0 ? this.cache.length : startIndex + pageSize;
            var renderData = this.cache.data.slice(startIndex, endIndex);
            this.items(renderData);
            var render = {
                draw: draw,
                aaData: renderData,
                recordsTotal: this.cache.length,
                recordsFiltered: this.cache.length
            };
            if (!!postRenderTasks) {
                postRenderTasks(startIndex, pageSize)
                    .then(function () {
                    _this.table.rows().invalidate();
                });
            }
            renderCallBack(render);
        };
        DataTableViewModel.prototype.matchesKeys = function (item, itemKeys) {
            var _this = this;
            return itemKeys.every(function (property) {
                var itemValue = item[property.key];
                if (itemValue && property.subkey) {
                    itemValue = itemValue[property.subkey];
                    if (!itemValue) {
                        itemValue = "";
                    }
                }
                else if (property.subkey) {
                    itemValue = "";
                }
                return _this.stringCompare(itemValue, property.value);
            });
        };
        /**
         * Default string comparison is case sensitive as most Azure resources' names are case sensitive.
         * Override this if a name, i.e., Azure File/Directory name, is case insensitive.
         */
        DataTableViewModel.prototype.stringCompare = function (s1, s2) {
            return s1 === s2;
        };
        DataTableViewModel.prototype.updatePaginationControls = function (oSettings) {
            var pageInfo = this.table.page.info();
            var pageSize = pageInfo.length;
            var paginateElement = $(oSettings.nTableWrapper).find(StorageExplorerConstants.htmlSelectors.paginateSelector);
            if (this.allDownloaded) {
                if (this.cache.length <= pageSize) {
                    // Hide pagination controls if everything fits in one page!.
                    paginateElement.hide();
                }
                else {
                    // Enable pagination controls.
                    paginateElement.show();
                    oSettings.oLanguage.oPaginate.sLast = DataTableViewModel.lastPageLabel;
                }
            }
            else {
                // Enable pagination controls and show load more button.
                paginateElement.show();
                oSettings.oLanguage.oPaginate.sLast = DataTableViewModel.loadMoreLabel;
            }
        };
        return DataTableViewModel;
    }());
    DataTableViewModel.lastPageLabel = ">>"; // Localize
    DataTableViewModel.loadMoreLabel = "Load more"; // Localize
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DataTableViewModel;
});

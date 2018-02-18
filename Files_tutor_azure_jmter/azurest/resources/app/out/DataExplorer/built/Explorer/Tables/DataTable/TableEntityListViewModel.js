var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "knockout", "underscore", "q", "./DataTableViewModel", "./DataTableContextMenu", "./DataTableUtilities", "./TableEntityCache", "../Constants", "../Utilities", "../TableEntityProcessor", "../../../Common/ErrorParserUtility"], function (require, exports, ko, _, Q, DataTableViewModel_1, DataTableContextMenu_1, DataTableUtilities, TableEntityCache_1, Constants, Utilities, TableEntityProcessor, ErrorParserUtility) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Storage Table Entity List ViewModel
     */
    var TableEntityListViewModel = (function (_super) {
        __extends(TableEntityListViewModel, _super);
        function TableEntityListViewModel(tableCommands, queryTablesTab) {
            var _this = _super.call(this) || this;
            _this.useSetting = true;
            _this.tableQuery = {};
            _this.isCancelled = false;
            _this.headers = Constants.dataTable.defaultHeaders;
            _this.cache = new TableEntityCache_1.default();
            _this.queryErrorMessage = ko.observable();
            _this.queryTablesTab = queryTablesTab;
            // Enable Context menu for the data table.
            DataTableContextMenu_1.default.contextMenuFactory(_this, tableCommands);
            _this.id = "tableEntityListViewModel" + _this.queryTablesTab.tabId;
            _this.oDataQuery = ko.observable();
            _this.sqlQuery = ko.observable("SELECT * FROM c");
            return _this;
        }
        TableEntityListViewModel.prototype.getTableEntityKeys = function (partitionKey, rowKey) {
            return [
                { key: Constants.EntityKeyNames.PartitionKey, value: partitionKey },
                { key: Constants.EntityKeyNames.RowKey, value: rowKey }
            ];
        };
        TableEntityListViewModel.prototype.reloadTable = function (useSetting, resetHeaders) {
            if (useSetting === void 0) { useSetting = true; }
            if (resetHeaders === void 0) { resetHeaders = true; }
            this.clearCache();
            this.clearSelection();
            this.isCancelled = false;
            this.useSetting = useSetting;
            if (resetHeaders) {
                this.updateHeaders(Constants.dataTable.defaultHeaders);
            }
            return this.table.ajax.reload();
        };
        TableEntityListViewModel.prototype.updateHeaders = function (newHeaders, notifyColumnChanges, enablePrompt) {
            if (notifyColumnChanges === void 0) { notifyColumnChanges = false; }
            if (enablePrompt === void 0) { enablePrompt = true; }
            this.headers = newHeaders;
            if (notifyColumnChanges) {
                this.clearCache();
                this.clearSelection();
                this.notifyColumnChanges(enablePrompt, this.queryTablesTab);
            }
        };
        /**
         * This callback function called by datatable to fetch the next page of data and render.
         * sSource - ajax URL of data source, ignored in our case as we are not using ajax.
         * aoData - details about the next page of data datatable expected to render.
         * fnCallback - is the render callback with data to render.
         * oSetting: current settings used for table initialization.
         */
        TableEntityListViewModel.prototype.renderNextPageAndupdateCache = function (sSource, aoData, fnCallback, oSettings) {
            var tablePageSize;
            var draw;
            var prefetchNeeded = true;
            var columnSortOrder;
            // Threshold(pages) for triggering cache prefetch.
            // If number remaining pages in cache falls below prefetchThreshold prefetch will be triggered.
            var prefetchThreshold = 10;
            var tableQuery = this.tableQuery;
            for (var index in aoData) {
                var data = aoData[index];
                if (data.name === "length") {
                    tablePageSize = data.value;
                }
                if (data.name === "start") {
                    this.tablePageStartIndex = data.value;
                }
                if (data.name === "draw") {
                    draw = data.value;
                }
                if (data.name === "order") {
                    columnSortOrder = data.value;
                }
            }
            // Try cache if valid.
            if (this.isCacheValid(tableQuery)) {
                // Check if prefetch needed.
                if ((this.tablePageStartIndex + tablePageSize <= this.cache.length) || this.allDownloaded) {
                    prefetchNeeded = false;
                    if (columnSortOrder &&
                        (!this.cache.sortOrder || !_.isEqual(this.cache.sortOrder, columnSortOrder))) {
                        this.sortColumns(columnSortOrder, oSettings);
                    }
                    this.renderPage(fnCallback, draw, this.tablePageStartIndex, tablePageSize, oSettings);
                    if (!this.allDownloaded &&
                        this.tablePageStartIndex > 0 &&
                        (this.cache.length - this.tablePageStartIndex + tablePageSize) < prefetchThreshold * tablePageSize) {
                        prefetchNeeded = true;
                    }
                }
                else {
                    prefetchNeeded = true;
                }
            }
            else {
                this.clearCache();
            }
            if (prefetchNeeded) {
                var downloadSize = tableQuery.top || this.downloadSize;
                this.prefetchAndRender(tableQuery, this.tablePageStartIndex, tablePageSize, downloadSize, draw, fnCallback, oSettings, columnSortOrder);
            }
        };
        TableEntityListViewModel.prototype.addEntityToCache = function (entity) {
            var _this = this;
            // Delay the add operation if we are fetching data from server, so as to avoid race condition.
            if (this.cache.serverCallInProgress) {
                return Utilities.delay(this.pollingInterval).then(function () {
                    return _this.updateCachedEntity(entity);
                });
            }
            // Find the first item which is greater than the added entity.
            var oSettings = this.table.context[0];
            var index = _.findIndex(this.cache.data, function (data) {
                return _this.dataComparer(data, entity, _this.cache.sortOrder, oSettings) > 0;
            });
            // If no such item, then insert at last.
            var insertIndex = Utilities.ensureBetweenBounds(index < 0 ? this.cache.length : index, 0, this.cache.length);
            this.cache.data.splice(insertIndex, 0, entity);
            // Finally, select newly added entity
            this.clearSelection();
            this.selected.push(entity);
            return Promise.resolve();
        };
        TableEntityListViewModel.prototype.updateCachedEntity = function (entity) {
            var _this = this;
            // Delay the add operation if we are fetching data from server, so as to avoid race condition.
            if (this.cache.serverCallInProgress) {
                return Utilities.delay(this.pollingInterval).then(function () {
                    return _this.updateCachedEntity(entity);
                });
            }
            var oldEntityIndex = _.findIndex(this.cache.data, function (data) {
                return (data.PartitionKey._ === entity.PartitionKey._) && (data.RowKey._ === entity.RowKey._);
            });
            this.cache.data.splice(oldEntityIndex, 1, entity);
            return Promise.resolve();
        };
        TableEntityListViewModel.prototype.removeEntitiesFromCache = function (entities) {
            var _this = this;
            if (!entities) {
                return Promise.resolve();
            }
            // Delay the remove operation if we are fetching data from server, so as to avoid race condition.
            if (this.cache.serverCallInProgress) {
                return Utilities.delay(this.pollingInterval).then(function () {
                    return _this.removeEntitiesFromCache(entities);
                });
            }
            entities.forEach(function (entity) {
                var cachedIndex = _.findIndex(_this.cache.data, function (e) {
                    return (e.PartitionKey._ === entity.PartitionKey._) && (e.RowKey._ === entity.RowKey._);
                });
                if (cachedIndex >= 0) {
                    _this.cache.data.splice(cachedIndex, 1);
                }
            });
            this.clearSelection();
            // Show last available page if there is not enough data
            var pageInfo = this.table.page.info();
            if (this.cache.length <= pageInfo.start) {
                var availablePages = Math.ceil(this.cache.length / pageInfo.length);
                var pageToShow = availablePages > 0 ? availablePages - 1 : 0;
                this.table.page(pageToShow);
            }
            return Promise.resolve();
        };
        TableEntityListViewModel.prototype.dataComparer = function (item1, item2, sortOrder, oSettings) {
            var sort;
            var itemA;
            var itemB;
            var length = ($.isArray(sortOrder) ? sortOrder.length : 0); // sortOrder can be null
            var rowA = item1;
            var rowB = item2;
            for (var k = 0; k < length; k++) {
                sort = sortOrder[k];
                var col = oSettings.aoColumns[sort.column].mData;
                // If the value is null or undefined, show them at last
                var isItem1NullOrUndefined = _.isNull(rowA[col]) || _.isUndefined(rowA[col]);
                var isItem2NullOrUndefined = _.isNull(rowB[col]) || _.isUndefined(rowB[col]);
                if (isItem1NullOrUndefined || isItem2NullOrUndefined) {
                    if (isItem1NullOrUndefined && isItem2NullOrUndefined) {
                        return 0;
                    }
                    return isItem1NullOrUndefined ? 1 : -1;
                }
                switch (rowA[col].$) {
                    case Constants.EdmType.Int32:
                    case Constants.EdmType.Int64:
                        itemA = parseInt(rowA[col]._, 0);
                        itemB = parseInt(rowB[col]._, 0);
                        break;
                    case Constants.EdmType.Double:
                        itemA = parseFloat(rowA[col]._);
                        itemB = parseFloat(rowB[col]._);
                        break;
                    case Constants.EdmType.DateTime:
                        itemA = new Date(rowA[col]._);
                        itemB = new Date(rowB[col]._);
                        break;
                    default:
                        itemA = rowA[col]._.toLowerCase();
                        itemB = rowB[col]._.toLowerCase();
                }
                var compareResult = itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
                if (compareResult !== 0) {
                    return sort.dir === "asc" ? compareResult : -compareResult;
                }
            }
            return 0;
        };
        TableEntityListViewModel.prototype.isCacheValid = function (tableQuery) {
            // Return false if either cache has no data or the search criteria don't match!
            if (!this.cache || !this.cache.data || this.cache.length === 0) {
                return false;
            }
            if (!tableQuery && !this.cache.tableQuery) {
                return true;
            }
            // Compare by value using JSON representation
            if (JSON.stringify(this.cache.tableQuery) !== JSON.stringify(tableQuery)) {
                return false;
            }
            return true;
        };
        // Override as table entity has special keys for a Data Table row.
        /**
         * @override
         */
        TableEntityListViewModel.prototype.matchesKeys = function (item, itemKeys) {
            var _this = this;
            return itemKeys.every(function (property) {
                return _this.stringCompare(item[property.key]._, property.value);
            });
        };
        TableEntityListViewModel.prototype.prefetchAndRender = function (tableQuery, tablePageStartIndex, tablePageSize, downloadSize, draw, renderCallBack, oSettings, columnSortOrder) {
            var _this = this;
            this.queryErrorMessage(null);
            if (this.cache.serverCallInProgress) {
                return;
            }
            this.prefetchData(tableQuery, downloadSize, /* currentRetry */ 0).then(function (result) {
                if (!result) {
                    return;
                }
                var entities = result.Results;
                var selectedHeadersUnion = DataTableUtilities.getPropertyIntersectionFromTableEntities(entities);
                var newHeaders = _.difference(selectedHeadersUnion, _this.headers);
                if (newHeaders.length > 0) {
                    // Any new columns found will be added into headers array, which will trigger a re-render of the DataTable.
                    // So there is no need to call it here.
                    _this.updateHeaders(_this.headers.concat(newHeaders), /* notifyColumnChanges */ true);
                    _this.items(result.Results);
                }
                else {
                    if (columnSortOrder) {
                        _this.sortColumns(columnSortOrder, oSettings);
                    }
                    _this.renderPage(renderCallBack, draw, tablePageStartIndex, tablePageSize, oSettings);
                }
                if (result.ExceedMaximumRetries) {
                    var message = "We are having trouble getting your data. Please try again."; // localize
                }
            }).catch(function (error) {
                var parsedErrors = ErrorParserUtility.parse(error);
                var errors = parsedErrors.map(function (error) {
                    return {
                        message: error.message,
                        start: (error.location) ? error.location.start : undefined,
                        end: (error.location) ? error.location.end : undefined,
                        code: error.code,
                        severity: error.severity
                    };
                });
                _this.queryErrorMessage(errors[0].message);
                DataTableUtilities.turnOffProgressIndicator();
            });
        };
        /**
         * Keep recursively prefetching items if:
         *  1. Continuation token is not null
         *  2. And prefetched items hasn't reach predefined cache size.
         *  3. And retry times hasn't reach the predefined maximum retry number.
         *
         * It is possible for a query to return no results but still return a continuation header (e.g. if the query takes too long).
         * If this is the case, we try to fetch entities again.
         * Note that this also means that we can get less entities than the requested download size in a successful call.
         * See Microsoft Azure API Documentation at: https://msdn.microsoft.com/en-us/library/azure/dd135718.aspx
         */
        TableEntityListViewModel.prototype.prefetchData = function (tableQuery, downloadSize, currentRetry) {
            var _this = this;
            if (currentRetry === void 0) { currentRetry = 0; }
            if (!this.cache.serverCallInProgress) {
                this.cache.serverCallInProgress = true;
                this.allDownloaded = false;
                this.lastPrefetchTime = new Date().getTime();
                var time = this.lastPrefetchTime;
                var promise;
                if (this._documentIterator && this.continuationToken) {
                    var deferred = Q.defer();
                    this.queryTablesTab.container.documentClientUtility.nextIteratorItem(this._documentIterator, downloadSize, [], deferred);
                    promise = deferred.promise.then(function (documents) {
                        var entities = TableEntityProcessor.convertDocumentsToEntities(documents);
                        var finalEntities = {
                            Results: entities,
                            ContinuationToken: _this._documentIterator.hasMoreResults()
                        };
                        return Promise.resolve(finalEntities);
                    });
                }
                else {
                    promise = this.queryTablesTab.container.documentClientUtility.queryDocuments(this.queryTablesTab.collection, this.sqlQuery(), null /*options*/)
                        .then(function (iterator) {
                        _this._documentIterator = iterator;
                        var deferred = Q.defer();
                        _this.queryTablesTab.container.documentClientUtility.nextIteratorItem(iterator, downloadSize, [], deferred);
                        return deferred.promise.then(function (documents) {
                            var entities = TableEntityProcessor.convertDocumentsToEntities(documents);
                            var finalEntities = {
                                Results: entities,
                                ContinuationToken: _this._documentIterator.hasMoreResults()
                            };
                            return Promise.resolve(finalEntities);
                        });
                    });
                }
                return promise.then(function (result) {
                    var actualDownloadSize = 0;
                    // If we hit this, it means another service call is triggered. We only handle the latest call.
                    // And as another service call is during process, we don't set serverCallInProgress to false here.
                    // Thus, end the prefetch.
                    if (_this.lastPrefetchTime !== time) {
                        return Promise.resolve(null);
                    }
                    var entities = result.Results;
                    actualDownloadSize = entities.length;
                    // Queries can fetch no results and still return a continuation header. See prefetchAndRender() method.
                    _this.continuationToken = _this.isCancelled ? null : result.ContinuationToken;
                    if (!_this.continuationToken) {
                        _this.allDownloaded = true;
                    }
                    if (_this.isCacheValid(tableQuery)) {
                        // Append to cache.
                        _this.cache.data = _this.cache.data.concat(entities.slice(0));
                    }
                    else {
                        // Create cache.
                        _this.cache.data = entities;
                    }
                    _this.cache.tableQuery = tableQuery;
                    _this.cache.serverCallInProgress = false;
                    var nextDownloadSize = downloadSize - actualDownloadSize;
                    if (nextDownloadSize === 0 && tableQuery.top) {
                        _this.allDownloaded = true;
                    }
                    // There are three possible results for a prefetch:
                    // 1. Continuation token is null or fetched items' size reaches predefined.
                    // 2. Continuation token is not null and fetched items' size hasn't reach predefined.
                    //  2.1 Retry times has reached predefined maximum.
                    //  2.2 Retry times hasn't reached predefined maximum.
                    // Correspondingly,
                    // For #1, end prefetch.
                    // For #2.1, set prefetch exceeds maximum retry number and end prefetch.
                    // For #2.2, go to next round prefetch.
                    if (_this.allDownloaded || nextDownloadSize === 0) {
                        return Promise.resolve(result);
                    }
                    if (currentRetry >= TableEntityListViewModel._maximumNumberOfPrefetchRetries) {
                        result.ExceedMaximumRetries = true;
                        return Promise.resolve(result);
                    }
                    return _this.prefetchData(tableQuery, nextDownloadSize, currentRetry + 1);
                }).catch(function (error) {
                    _this.cache.serverCallInProgress = false;
                    return Promise.reject(error);
                });
            }
            return null;
        };
        return TableEntityListViewModel;
    }(DataTableViewModel_1.default));
    // This is the number of retry attempts to fetch entities when the Azure Table service returns no results with a continuation token.
    // This number should ideally accommodate the service default timeout for queries of 30s, where each individual query execution can
    // take *up* to 5s (see https://msdn.microsoft.com/en-us/library/azure/dd135718.aspx).
    // To be on the safe side, we are setting the total number of attempts to 120, assuming up to 4 queries per second (120q = 30s * 4q/s).
    // Experimentation also validates this "safe number": queries against a 10 million entity table took up to 13 fetch attempts.
    TableEntityListViewModel._maximumNumberOfPrefetchRetries = 120 - 1;
    exports.default = TableEntityListViewModel;
});

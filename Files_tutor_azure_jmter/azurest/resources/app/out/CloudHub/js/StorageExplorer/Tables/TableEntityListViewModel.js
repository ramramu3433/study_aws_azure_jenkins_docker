/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "knockout", "underscore", "StorageExplorer/Common/Base/DataTableViewModel", "StorageExplorer/Common/DataTableUtilities", "Common/Debug", "StorageExplorer/Tables/TableEntityCache", "StorageExplorer/StorageExplorerConstants", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Common/Utilities"], function (require, exports, ko, _, DataTableViewModel_1, DataTableUtilities, Debug, TableEntityCache_1, StorageExplorerConstants, StorageActionsHelper, Utilities) {
    "use strict";
    /**
     * Storage Table Entity List ViewModel
     */
    var TableEntityListViewModel = (function (_super) {
        __extends(TableEntityListViewModel, _super);
        function TableEntityListViewModel(tableExplorerContext, telemetry) {
            var _this = _super.call(this, telemetry) || this;
            _this.useSetting = true;
            _this.tableQuery = {};
            _this.isCancelled = false;
            _this.headers = StorageExplorerConstants.dataTable.defaultHeaders;
            _this.tableExplorerContext = tableExplorerContext;
            _this.cache = new TableEntityCache_1.default(telemetry);
            _this.queryErrorMessage = ko.observable();
            return _this;
        }
        TableEntityListViewModel.prototype.getTableEntityKeys = function (partitionKey, rowKey) {
            return [
                { key: StorageExplorerConstants.EntityKeyNames.PartitionKey, value: partitionKey },
                { key: StorageExplorerConstants.EntityKeyNames.RowKey, value: rowKey }
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
                this.updateHeaders(StorageExplorerConstants.dataTable.defaultHeaders);
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
                this.notifyColumnChanges(enablePrompt);
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
                    case StorageExplorerConstants.EdmType.Int32:
                    case StorageExplorerConstants.EdmType.Int64:
                        itemA = parseInt(rowA[col]._, 0);
                        itemB = parseInt(rowB[col]._, 0);
                        break;
                    case StorageExplorerConstants.EdmType.Double:
                        itemA = parseFloat(rowA[col]._);
                        itemB = parseFloat(rowB[col]._);
                        break;
                    case StorageExplorerConstants.EdmType.DateTime:
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
            return __awaiter(this, void 0, void 0, function () {
                var result, entities, selectedHeadersUnion, newHeaders, message, error_1, closeEditor, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.queryErrorMessage(null);
                            if (this.cache.serverCallInProgress) {
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.prefetchData(tableQuery, downloadSize, /* currentRetry */ 0)];
                        case 2:
                            result = _a.sent();
                            if (!result) {
                                return [2 /*return*/];
                            }
                            entities = result.Results;
                            selectedHeadersUnion = DataTableUtilities.getPropertyIntersectionFromTableEntities(entities);
                            newHeaders = _.difference(selectedHeadersUnion, this.headers);
                            if (newHeaders.length > 0) {
                                // Any new columns found will be added into headers array, which will trigger a re-render of the DataTable.
                                // So there is no need to call it here.
                                this.updateHeaders(this.headers.concat(newHeaders), /* notifyColumnChanges */ true);
                            }
                            else {
                                if (columnSortOrder) {
                                    this.sortColumns(columnSortOrder, oSettings);
                                }
                                this.renderPage(renderCallBack, draw, tablePageStartIndex, tablePageSize, oSettings);
                            }
                            if (result.ExceedMaximumRetries) {
                                message = "We are having trouble getting your data. Please try again.";
                                this.tableExplorerContext.hostProxy.executeOperation("Environment.showInfobarMessage", [message, null, StorageExplorerConstants.InfoBarTypes.errorLink]);
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            closeEditor = true;
                            switch (error_1.name) {
                                case TableEntityListViewModel._knownRenderErrors.TableQuerySyntaxError:
                                case TableEntityListViewModel._knownRenderErrors.TableQuerySemanticError:
                                    DataTableUtilities.turnOffProgressIndicator();
                                    this.queryErrorMessage(error_1.message);
                                    closeEditor = false; // Query syntax error, we'll keep the editor open so users can correct the error and query again.
                                    break;
                            }
                            if (closeEditor) {
                                message = Utilities.getErrorMessage(error_1);
                                this.tableExplorerContext.hostProxy.executeOperation("Environment.showInfobarMessage", [message, null, StorageExplorerConstants.InfoBarTypes.errorLink]);
                                StorageActionsHelper.closeTargetStorageEditor(this.tableExplorerContext.hostProxy, this.telemetry, this.tableExplorerContext.tableReference.connectionString, 2 /* table */, this.tableExplorerContext.tableReference.tableName);
                            }
                            return [3 /*break*/, 4];
                        case 4:
                            ;
                            return [2 /*return*/];
                    }
                });
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
            if (currentRetry === void 0) { currentRetry = 0; }
            return __awaiter(this, void 0, void 0, function () {
                var time, result, actualDownloadSize, entities, nextDownloadSize, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this.cache.serverCallInProgress) return [3 /*break*/, 5];
                            this.cache.serverCallInProgress = true;
                            this.allDownloaded = false;
                            this.lastPrefetchTime = new Date().getTime();
                            time = this.lastPrefetchTime;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.tableExplorerContext.tableActions.listTableEntitiesSegmented(this.tableExplorerContext.tableReference, this.continuationToken || null, downloadSize, tableQuery)];
                        case 2:
                            result = _a.sent();
                            actualDownloadSize = 0;
                            // If we hit this, it means another service call is triggered. We only handle the latest call.
                            // And as another service call is during process, we don't set serverCallInProgress to false here.
                            // Thus, end the prefetch.
                            if (this.lastPrefetchTime !== time) {
                                return [2 /*return*/, Promise.resolve(null)];
                            }
                            entities = result.Results;
                            actualDownloadSize = entities.length;
                            // Queries can fetch no results and still return a continuation header. See prefetchAndRender() method.
                            this.continuationToken = this.isCancelled ? null : result.ContinuationToken;
                            if (!this.continuationToken) {
                                this.allDownloaded = true;
                            }
                            if (this.isCacheValid(tableQuery)) {
                                // Append to cache.
                                this.cache.data = this.cache.data.concat(entities.slice(0));
                            }
                            else {
                                // Create cache.
                                this.cache.data = entities;
                            }
                            this.cache.tableQuery = tableQuery;
                            this.cache.serverCallInProgress = false;
                            // Telemetry cache size growth.
                            this.telemetry.sendEvent("StorageExplorer.tableEntitiesCache", {
                                "Action": "Grow",
                                "Size": this.cache.length.toString()
                            });
                            nextDownloadSize = downloadSize - actualDownloadSize;
                            if (nextDownloadSize === 0 && tableQuery.top) {
                                this.allDownloaded = true;
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
                            if (this.allDownloaded || nextDownloadSize === 0) {
                                return [2 /*return*/, Promise.resolve(result)];
                            }
                            if (currentRetry >= TableEntityListViewModel._maximumNumberOfPrefetchRetries) {
                                result.ExceedMaximumRetries = true;
                                return [2 /*return*/, Promise.resolve(result)];
                            }
                            return [2 /*return*/, this.prefetchData(tableQuery, nextDownloadSize, currentRetry + 1)];
                        case 3:
                            error_2 = _a.sent();
                            this.cache.serverCallInProgress = false;
                            Debug.error(error_2);
                            return [2 /*return*/, Promise.reject(error_2)];
                        case 4:
                            ;
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return TableEntityListViewModel;
    }(DataTableViewModel_1.default));
    // This is the number of retry attempts to fetch entities when the Azure Table service returns no results with a continuation token.
    // This number should ideally accommodate the service default timeout for queries of 30s, where each individual query execution can
    // take *up* to 5s (see https://msdn.microsoft.com/en-us/library/azure/dd135718.aspx).
    // To be on the safe side, we are setting the total number of attempts to 120, assuming up to 4 queries per second (120q = 30s * 4q/s).
    // Experimentation also validates this "safe number": queries against a 10 million entity table took up to 13 fetch attempts.
    TableEntityListViewModel._maximumNumberOfPrefetchRetries = 120 - 1;
    TableEntityListViewModel._knownRenderErrors = {
        TableQuerySyntaxError: "TableQuerySyntaxError",
        TableQuerySemanticError: "TableQuerySemanticError"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableEntityListViewModel;
});

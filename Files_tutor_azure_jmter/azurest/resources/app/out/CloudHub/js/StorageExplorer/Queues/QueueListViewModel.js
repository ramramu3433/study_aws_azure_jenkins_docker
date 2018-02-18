/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore", "StorageExplorer/Common/Base/DataTableViewModel", "StorageExplorer/Queues/QueueMessageCache", "StorageExplorer/StorageExplorerConstants", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Common/Utilities"], function (require, exports, _, DataTableViewModel_1, QueueMessageCache_1, StorageExplorerConstants, StorageActionsHelper, Utilities) {
    "use strict";
    /**
     * Storage Queue Message List ViewModel
     */
    var QueueListViewModel = (function (_super) {
        __extends(QueueListViewModel, _super);
        function QueueListViewModel(queueExplorerContext, telemetry) {
            var _this = _super.call(this, telemetry) || this;
            // Override as for queue it's the max number of messages allowed to peek one time.
            /**
             * @override
             */
            _this.downloadSize = 32;
            _this.queueExplorerContext = queueExplorerContext;
            _this.cache = new QueueMessageCache_1.default(telemetry);
            _this.telemetry = telemetry;
            return _this;
        }
        QueueListViewModel.prototype.getMessageKey = function (messageId) {
            return [{ key: StorageExplorerConstants.MessageKeyNames.MessageId, value: messageId }];
        };
        /*
        *  This callback function called by datatable to fetch the next page of data and render.
        *  sSource - ajax URL of data source, ignored in our case as we are not using ajax.
        *  aoData - details about the next page of data datatable expected to render.
        *  fnCallback - is the render callback with data to render.
        *  oSetting: current settings used for table initialization.
        */
        QueueListViewModel.prototype.renderNextPageAndupdateCache = function (sSource, aoData, fnCallback, oSettings) {
            var _this = this;
            var tablePageSize;
            var tablePageStartIndex;
            var draw;
            var searchData;
            var prefetchNeeded = true;
            var columnSortOrder;
            // Threshold(pages) for triggering cache prefetch.
            // If number remaining pages in cache falls below prefetchThreshold prefetch will be triggered.
            var prefetchThreshold = 10;
            for (var index in aoData) {
                var data = aoData[index];
                if (data.name === "length") {
                    tablePageSize = data.value;
                }
                if (data.name === "start") {
                    tablePageStartIndex = data.value;
                }
                if (data.name === "draw") {
                    draw = data.value;
                }
                if (data.name === "search") {
                    searchData = data.value;
                }
                if (data.name === "order") {
                    columnSortOrder = data.value;
                }
            }
            // Try cache if valid.
            if (this.isCacheValid()) {
                // Check if prefetch needed.
                if ((tablePageStartIndex + tablePageSize <= this.cache.length) || this.allDownloaded) {
                    prefetchNeeded = false;
                    if (columnSortOrder &&
                        (!this.cache.sortOrder || !_.isEqual(this.cache.sortOrder, columnSortOrder))) {
                        this.sortColumns(columnSortOrder, oSettings);
                    }
                    this.renderPage(fnCallback, draw, tablePageStartIndex, tablePageSize, oSettings);
                    if (!this.allDownloaded &&
                        (this.cache.length - tablePageStartIndex + tablePageSize) < prefetchThreshold * tablePageSize) {
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
                // When rendering first page, load the first page first  and then fetch the remaining pages in the background.
                var downloadSize = (tablePageStartIndex === 0) ? tablePageSize : this.downloadSize;
                this.prefetchAndRender(searchData, tablePageStartIndex, tablePageSize, downloadSize, draw, fnCallback, oSettings, columnSortOrder)
                    .then(function () {
                    if (!_this.allDownloaded && (_this.downloadSize > downloadSize)) {
                        _this.prefetchAndRender(searchData, tablePageStartIndex, tablePageSize, _this.downloadSize - downloadSize, draw, fnCallback, oSettings, columnSortOrder);
                    }
                });
            }
        };
        QueueListViewModel.prototype.addMessageToCache = function (message) {
            var _this = this;
            // Delay the add operation if we are fetching data from server, so as to avoid race condition.
            if (this.cache.serverCallInProgress) {
                return Utilities.delay(this.pollingInterval).then(function () {
                    return _this.updateCachedMessage(message);
                });
            }
            // Find the first item which is greater than the added message.
            var oSettings = this.table.context[0];
            var index = _.findIndex(this.cache.data, function (data) {
                return _this.dataComparer(data, message, _this.cache.sortOrder, oSettings) > 0;
            });
            // If no such item, then insert at last.
            var insertIndex = Utilities.ensureBetweenBounds(index < 0 ? this.cache.length : index, 0, this.cache.length);
            this.cache.data.splice(insertIndex, 0, message);
            // Finally, select newly added message
            this.clearSelection();
            this.selected.push(message);
            return Promise.resolve();
        };
        QueueListViewModel.prototype.updateCachedMessage = function (message) {
            var _this = this;
            // Delay the add operation if we are fetching data from server, so as to avoid race condition.
            if (this.cache.serverCallInProgress) {
                return Utilities.delay(this.pollingInterval).then(function () {
                    return _this.updateCachedMessage(message);
                });
            }
            var oldMMessageIndex = this.getItemIndexFromAllPages(this.getMessageKey(message.MessageId));
            this.cache.data.splice(oldMMessageIndex, 1, message);
            return Promise.resolve();
        };
        QueueListViewModel.prototype.removeMessagesFromCache = function (messages) {
            var _this = this;
            if (!messages) {
                return Promise.resolve();
            }
            // Delay the remove operation if we are fetching data from server, so as to avoid race condition.
            if (this.cache.serverCallInProgress) {
                return Utilities.delay(this.pollingInterval).then(function () {
                    return _this.removeMessagesFromCache(messages);
                });
            }
            messages.forEach(function (message) {
                var cachedIndex = _this.getItemIndexFromAllPages(_this.getMessageKey(message.MessageId));
                if (cachedIndex >= 0) {
                    _this.cache.data.splice(cachedIndex, 1);
                }
            });
            this.clearSelection();
            // Show last available page if there is no enough data
            var pageInfo = this.table.page.info();
            if (this.cache.length <= pageInfo.start) {
                var availablePages = Math.ceil(this.cache.length / pageInfo.length);
                var pageToShow = availablePages > 0 ? availablePages - 1 : 0;
                this.table.page(pageToShow);
            }
            return Promise.resolve();
        };
        QueueListViewModel.prototype.reloadTable = function () {
            this.clearCache();
            this.clearSelection();
            this.table.ajax.reload();
        };
        QueueListViewModel.prototype.dataComparer = function (item1, item2, sortOrder, oSettings) {
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
                switch (oSettings.aoColumns[sort.column].sType) {
                    case "num":
                        itemA = parseInt(rowA[col], 0);
                        itemB = parseInt(rowB[col], 0);
                        break;
                    case "date":
                        itemA = new Date(rowA[col]);
                        itemB = new Date(rowB[col]);
                        break;
                    default:
                        itemA = rowA[col].toLowerCase();
                        itemB = rowB[col].toLowerCase();
                }
                var compareResult = itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
                if (compareResult !== 0) {
                    return sort.dir === "asc" ? compareResult : -compareResult;
                }
            }
            return 0;
        };
        QueueListViewModel.prototype.isCacheValid = function () {
            // Return false if either cache has no data or the search criteria don't match!
            if (!this.cache || !this.cache.data || this.cache.length === 0) {
                return false;
            }
            return true;
        };
        QueueListViewModel.prototype.prefetchAndRender = function (searchData, startIndex, pageSize, downloadSize, draw, renderCallBack, oSettings, columnSortOrder) {
            var _this = this;
            if (!this.cache.serverCallInProgress) {
                this.cache.serverCallInProgress = true;
                this.allDownloaded = false;
                this.lastPrefetchTime = new Date().getTime();
                var time = this.lastPrefetchTime;
                return this.queueExplorerContext.queueActions.peekQueueMessages(this.queueExplorerContext.queueReference, downloadSize)
                    .then(function (result) {
                    // If we hit this, it means another service call is triggered. We only hanlde the latest call.
                    // And as another service call is during process, we don't set serverCallInProgress to false here.
                    if (_this.lastPrefetchTime !== time) {
                        return;
                    }
                    var messages = result.messages;
                    _this.topMessageId = messages.length ? messages[0].MessageId : null;
                    // this._continuationToken = result.ContinuationToken; // CONSIDER: Here we set what to get next fetch
                    if (!messages.length || messages.length < downloadSize) {
                        _this.allDownloaded = true;
                    }
                    // Cache the data along with search prefix.
                    if (_this.isCacheValid()) {
                        // Append to cache.
                        _this.cache.data = _this.cache.data.concat(messages.slice(0));
                    }
                    else {
                        // Create cache.
                        _this.cache.data = messages;
                    }
                    if (columnSortOrder) {
                        _this.sortColumns(columnSortOrder, oSettings);
                    }
                    _this.cache.searchPrefix = searchData.value;
                    _this.cache.serverCallInProgress = false;
                    _this.renderPage(renderCallBack, draw, startIndex, pageSize, oSettings);
                    // Telemetry cache size growth.
                    _this.telemetry.sendEvent("StorageExplorer.messagesCache", {
                        "Action": "Grow",
                        "Size": _this.cache.length.toString()
                    });
                    return;
                })
                    .catch(function (error) {
                    var message = Utilities.getErrorMessage(error);
                    _this.queueExplorerContext.hostProxy.executeOperation("Environment.showInfobarMessage", [message, null /*link*/, StorageExplorerConstants.InfoBarTypes.errorLink]);
                    StorageActionsHelper.closeTargetStorageEditor(_this.queueExplorerContext.hostProxy, _this.telemetry, _this.queueExplorerContext.queueReference.connectionString, 3 /* queue */, _this.queueExplorerContext.queueReference.queueName);
                });
            }
        };
        return QueueListViewModel;
    }(DataTableViewModel_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueueListViewModel;
});

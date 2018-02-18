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
define(["require", "exports", "knockout", "underscore", "underscore.string", "StorageExplorer/Common/Base/DataTableViewModel", "StorageExplorer/Common/DragDropManager", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities", "Common/Utilities"], function (require, exports, ko, _, _string, DataTableViewModel_1, DragDropManager, StorageExplorerConstants, StorageExplorerUtilities, Utilities) {
    "use strict";
    /**
     * Storage Blob List ViewModel
     */
    var FlobListViewModel = (function (_super) {
        __extends(FlobListViewModel, _super);
        function FlobListViewModel(telemetry) {
            var _this = _super.call(this, telemetry) || this;
            _this.searchText = "";
            /**
             * The path of folder this view model presents.
             * Path segmentes are forward-slash delimited.
             * The path includes a trailing forward slash.
             * An empty string denotes the top-level, root folder.
             */
            _this.currentFolderPath = ko.observable("");
            _this.currentFile = ko.observable("");
            _this.filePrefix = ko.observable("");
            new DragDropManager();
            return _this;
        }
        /**
         * Navigate to the specified folder.
         */
        FlobListViewModel.prototype.navigateToFolder = function (folderPath) {
            this.navigateToFile(folderPath, "");
        };
        FlobListViewModel.prototype.navigateToFile = function (folderPath, file) {
            this.clearLastSelected();
            if (this.currentFolderPath() !== folderPath || this.currentFile() !== file) {
                if (!_string.isBlank(folderPath)) {
                    folderPath = StorageExplorerUtilities.ensureTrailingSlash(folderPath);
                }
                this.currentFolderPath(folderPath);
                this.currentFile(file);
                this.table.draw();
            }
            else {
                // When navigating to the current folder, simply return focus to data table.
                this.focusDataTable();
            }
        };
        FlobListViewModel.prototype.getFlobKeys = function (name, contentType, snapshot) {
            if (!snapshot) {
                snapshot = "";
            }
            return [
                { key: "FullName", value: name },
                { key: "ContentType", value: contentType },
                { key: "Blob", subkey: "Snapshot", value: snapshot }
            ];
        };
        FlobListViewModel.prototype.removeFlobFromCache = function (flob) {
            var _this = this;
            if (!flob) {
                return Promise.resolve();
            }
            // Delay the remove operation if we are fetching data from server, so as to avoid race condition.
            if (this.cache.serverCallInProgress) {
                return Utilities.delay(this.pollingInterval).then(function () {
                    return _this.removeFlobFromCache(flob);
                });
            }
            var cacheIndex = this.getItemIndexFromAllPages(this.getFlobKeys(flob.FullName, flob.ContentType, flob.Blob ? flob.Blob.Snapshot : undefined));
            if (cacheIndex >= 0) {
                this.cache.data.splice(cacheIndex, 1);
            }
            this.selected.remove(function (fb) {
                return fb.FullName === flob.FullName && fb.ContentType === flob.ContentType;
            });
            // Show last available page if there is no enough data
            var pageInfo = this.table.page.info();
            if (this.cache.length <= pageInfo.start) {
                var availablePages = Math.ceil(this.cache.length / pageInfo.length);
                var pageToShow = availablePages > 0 ? availablePages - 1 : 0;
                this.table.page(pageToShow);
            }
            return Promise.resolve();
        };
        FlobListViewModel.prototype.addFlobToCurrentFolder = function (flob) {
            var _this = this;
            // Skip if the flob is not within current folder
            if (!_string.startsWith(flob.FullName, this.currentFolderPath())) {
                return Promise.resolve();
            }
            // skip if snapshot and not in snapshot mode
            if (this.currentFile() !== flob.FileName && flob.Blob && flob.Blob.Snapshot) {
                return Promise.resolve();
            }
            // Skip if the flob should be filtered by prefix search
            if (this.cache.searchPrefix && !_string.startsWith(flob.FullName, this.cache.searchPrefix)) {
                return Promise.resolve();
            }
            // Delay the add operation if we are fetching data from server, so as to avoid race condition.
            if (this.cache.serverCallInProgress) {
                return Utilities.delay(this.pollingInterval).then(function () {
                    return _this.addFlobToCurrentFolder(flob);
                });
            }
            var flobFolder = StorageExplorerUtilities.getFolderFromFilePath(flob.FullName);
            var splittedFlobFolder = Utilities.splitPath(Utilities.removeTrailingSlash(flobFolder));
            var splittedCurrentFolder = Utilities.splitPath(Utilities.removeTrailingSlash(this.currentFolderPath()));
            // The flob is under a sub folder of current folder, add the sub folder if it doesn't exist.
            if (splittedFlobFolder.length > splittedCurrentFolder.length) {
                var subFolder = this.constructVirtualDirectoryFromFlob(flob, splittedCurrentFolder.length);
                var folderExist = this.isItemCached(this.getFlobKeys(subFolder.FullName, StorageExplorerConstants.ContentTypes.Folder, undefined));
                if (!folderExist) {
                    this.insertFlobToCache(subFolder);
                }
            }
            else {
                this.insertFlobToCache(flob);
            }
            return Promise.resolve();
        };
        /**
         * Fetches and renders the next page of data.
         * @param sSource Ajax URL of data source. Ignored, because aren't using Ajax.
         * @param aoData Details about the next page of data DataTables expects to render.
         * @param fnCallback The render callback.
         * @param oSetting Current settings used for table initialization.
         */
        FlobListViewModel.prototype.renderNextPageAndupdateCache = function (sSource, aoData, fnCallback, oSettings) {
            var tablePageSize;
            var tablePageStartIndex;
            var draw;
            var prefetchNeeded = true;
            var columnSortOrder;
            // Threshold (pages) for triggering cache prefetch.
            // If number remaining pages in cache falls below prefetchThreshold prefetch will be triggered.
            var prefetchThreshold = 10;
            var directoryOrPrefix = this.currentFolderPath();
            var searchPrefix = this.currentFolderPath() + this.currentFile();
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
                if (data.name === "order") {
                    columnSortOrder = data.value;
                }
                if (data.name === "search") {
                    // This is needed for folder navigation.
                    var searchValue = data.value;
                    if (searchValue && searchValue.value) {
                        searchPrefix = searchPrefix.concat(searchValue.value);
                    }
                }
            }
            // Try cache if valid.
            if (this.isCacheValid(searchPrefix)) {
                // Check if prefetch needed.
                if ((tablePageStartIndex + tablePageSize <= this.cache.length) || this.allDownloaded) {
                    prefetchNeeded = false;
                    if (columnSortOrder && (!this.cache.sortOrder || !_.isEqual(this.cache.sortOrder, columnSortOrder))) {
                        this.sortColumns(columnSortOrder, oSettings);
                    }
                    this.renderPage(fnCallback, draw, tablePageStartIndex, tablePageSize, oSettings, this.postRenderTasks);
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
                this.prefetchAndRender(directoryOrPrefix, searchPrefix, tablePageStartIndex, tablePageSize, this.downloadSize, draw, fnCallback, oSettings, columnSortOrder);
            }
        };
        /**
         * Performs a search on the table.
         * @param searchText The text to seearch for.
         */
        FlobListViewModel.prototype.search = function (searchText) {
            this.searchText = searchText;
            this.table.search(this.searchText).draw();
        };
        /**
         * Find the blob/file to delete in cache given info about the deleted blob/file.
         */
        FlobListViewModel.prototype.getCacheEntryForDeletedFlob = function (flobPath, isFolder, snapshot) {
            var parentFolder;
            var currentFolderPath = this.currentFolderPath();
            if (isFolder) {
                parentFolder = Utilities.getDirectoryFromPath(Utilities.removeTrailingSlash(flobPath));
                flobPath = Utilities.appendSlash(flobPath);
            }
            else {
                parentFolder = Utilities.getDirectoryFromPath(flobPath);
            }
            parentFolder = Utilities.appendSlash(parentFolder);
            if (this.isBlobs()) {
                // Blobs - skip if the blob is not under current folder
                if (!_string.startsWith(parentFolder, currentFolderPath)) {
                    return null;
                }
            }
            else {
                // Files - skip if the path is not exactly in the current directory
                if (!this.stringCompare(parentFolder, currentFolderPath)) {
                    return null;
                }
            }
            var splitFlobFolder = Utilities.splitPath(Utilities.removeTrailingSlash(parentFolder));
            var splitCurrentFolder = Utilities.splitPath(Utilities.removeTrailingSlash(currentFolderPath));
            // If the blob is under a subfolder of current folder, then remove the subfolder if it's empty.
            if (!isFolder && (splitFlobFolder.length > splitCurrentFolder.length)) {
                // Can't handle folders here, no easy way to know when all of the blobs underneath it have
                // been deleted.  Caller will have to handle.
                return null;
            }
            else {
                // The blob is the direct child of current folder
                var compare;
                if (snapshot) {
                    compare = function (vmFlob) { return (vmFlob.FullName === flobPath && vmFlob.Blob && vmFlob.Blob.Snapshot === snapshot); };
                }
                else {
                    compare = function (vmFlob) { return (vmFlob.FullName === flobPath); };
                }
                var index = _.findIndex(this.items(), compare);
                return index >= 0 ? this.items()[index] : null;
            }
        };
        FlobListViewModel.prototype.removeDeletedFlobFromDisplay = function (flobPath, snapshot) {
            var _this = this;
            var deletedFlob = this.getCacheEntryForDeletedFlob(flobPath, false /*isFolder*/, snapshot);
            if (deletedFlob) {
                this.removeFlobFromCache(deletedFlob).then(function () {
                    _this.redrawTableThrottled();
                });
            }
        };
        FlobListViewModel.prototype.removeDeletedFolderFromDisplay = function (folderPath) {
            var _this = this;
            var deletedFlob = this.getCacheEntryForDeletedFlob(folderPath, true /*isFolder*/, null);
            if (deletedFlob) {
                this.removeFlobFromCache(deletedFlob).then(function () {
                    _this.redrawTableThrottled();
                });
            }
        };
        FlobListViewModel.prototype.isFiles = function () { return !this.isBlobs(); };
        FlobListViewModel.prototype.dataComparer = function (item1, item2, sortOrder, oSettings) {
            var sort;
            var itemA;
            var itemB;
            var len = sortOrder.length;
            var rowA = item1;
            var rowB = item2;
            // Keep folders shown before blobs
            var isRowAFolder = rowA.ContentType === StorageExplorerConstants.ContentTypes.Folder;
            var isRowBFolder = rowB.ContentType === StorageExplorerConstants.ContentTypes.Folder;
            if (isRowAFolder !== isRowBFolder) {
                return isRowAFolder ? -1 : 1;
            }
            for (var k = 0; k < len; k++) {
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
        FlobListViewModel.prototype.isCacheValid = function (searchPrefix) {
            // Return false if either cache has no data or search prefix doesn't match!.
            if (!this.cache || !this.cache.data || this.cache.length === 0) {
                return false;
            }
            // Return true if both current data directory and directory is undefined or null.
            if (!searchPrefix && !this.cache.searchPrefix) {
                return true;
            }
            // Return false if current data (directory) doesn't match!
            if (this.cache.searchPrefix !== searchPrefix) {
                return false;
            }
            return true;
        };
        /**
         * Recursively prefetches Azure items and renders them in batches.
         *
         * Continually prefetches items if:
         *  - The next continuation token is not null.
         *  - Prefetched items haven't filled the cache.
         *
         * There are three possible results for a prefetch:
         *  1. Continuation token is not null, fetched items' size is less than the predefined requested size.
         *  2. Continuation token is not null, fetched items' size is the same as the predefined requested size.
         *  3. Continuation token is null
         *
         * Correspondingly:
         *  - For #1, do another prefetch with size equal to requested size minus fetched size.
         *  - For #2 & #3, end prefetch.
         *
         * @param directoryorPrefix The path of the directory from which to prefetch items.
         */
        FlobListViewModel.prototype.prefetchAndRender = function (directory, searchPrefix, startIndex, pageSize, downloadSize, draw, renderCallBack, oSettings, columnSortOrder) {
            return __awaiter(this, void 0, void 0, function () {
                var nextDownloadSize;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prefetchAndRenderCore(directory, searchPrefix, startIndex, pageSize, downloadSize, draw, renderCallBack, oSettings, columnSortOrder)];
                        case 1:
                            nextDownloadSize = _a.sent();
                            if (!this.allDownloaded && nextDownloadSize > 0) {
                                this.prefetchAndRender(directory, searchPrefix, startIndex, pageSize, nextDownloadSize, draw, renderCallBack, oSettings, columnSortOrder);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Create a virtual directory view model given a flob and a specific level (root folder as zero).
         * E.g., given a flob's full name "a/b/c.txt", create virtual directory at level 1 will generate a directory with
         * full name "a/b/" and file name "b".
         */
        FlobListViewModel.prototype.constructVirtualDirectoryFromFlob = function (flob, level) {
            var flobFolder = StorageExplorerUtilities.getFolderFromFilePath(flob.FullName);
            var splittedFlobFolder = Utilities.splitPath(Utilities.removeTrailingSlash(flobFolder));
            var subFolderName = splittedFlobFolder[level];
            var subFolderFullNameNoTrailingSlash = splittedFlobFolder.slice(0, level + 1).join("/");
            var subFolderFullName = Utilities.appendSlash(subFolderFullNameNoTrailingSlash);
            return {
                FullName: subFolderFullName,
                FileName: subFolderName,
                Uri: flob.Uri.substring(0, flob.Uri.length - flob.FileName.length),
                ContentType: StorageExplorerConstants.ContentTypes.Folder,
                LastModified: undefined,
                Size: undefined,
                Blob: {
                    Snapshot: "",
                    BlobType: "",
                    LeaseDuration: "",
                    LeaseState: "",
                    LeaseStatus: "",
                    metadata: {
                        microsoftazurecompute_diskname: null,
                        microsoftazurecompute_disktype: null,
                        microsoftazurecompute_resourcegroupname: null,
                        microsoftazurecompute_vmname: null
                    }
                }
            };
        };
        /**
         * Insert flob to current cache and keep it sorted.
         */
        FlobListViewModel.prototype.insertFlobToCache = function (flob) {
            var _this = this;
            // If the flob already exist, remove and insert to keep table sorted. Also update the item in selection.
            var flobCacheIndex = this.getItemIndexFromAllPages(this.getFlobKeys(flob.FullName, flob.ContentType, flob.Blob ? flob.Blob.Snapshot : undefined));
            if (flobCacheIndex >= 0) {
                this.cache.data.splice(flobCacheIndex, 1);
                var oldSelectedFlob = this.getItemFromSelectedItems(this.getFlobKeys(flob.FullName, flob.ContentType, flob.Blob ? flob.Blob.Snapshot : undefined));
                if (oldSelectedFlob) {
                    this.selected.replace(oldSelectedFlob, flob);
                }
            }
            // Find the first item which is greater than flob.
            var oSettings = this.table.context[0];
            var index = _.findIndex(this.cache.data, function (data) {
                return _this.dataComparer(data, flob, _this.cache.sortOrder, oSettings) > 0;
            });
            // If no such item, then insert at last.
            var insertIndex = index < 0 ? this.cache.length : index;
            this.cache.data.splice(insertIndex, 0, flob);
        };
        return FlobListViewModel;
    }(DataTableViewModel_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobListViewModel;
});

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
define(["require", "exports", "StorageExplorer/Common/Base/FlobsCache", "StorageExplorer/Common/Base/FlobListViewModel", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, FlobsCache_1, FlobListViewModel_1, StorageExplorerConstants, Utilities) {
    "use strict";
    /**
     * Storage File List ViewModel
     */
    var FileListViewModel = (function (_super) {
        __extends(FileListViewModel, _super);
        function FileListViewModel(fileExplorerContext) {
            var _this = _super.call(this, fileExplorerContext.telemetry) || this;
            _this.fileExplorerContext = fileExplorerContext;
            _this.cache = new FlobsCache_1.default(_this.telemetry, "StorageExplorer.filesCache");
            return _this;
        }
        // IFolderHierarchyViewModel
        FileListViewModel.prototype.getContainerResourceName = function () {
            return this.fileExplorerContext.shareReference.shareName;
        };
        FileListViewModel.prototype.isBlobs = function () { return false; };
        FileListViewModel.prototype.prefetchAndRenderCore = function (directory, searchPrefix, startIndex, pageSize, downloadSize, draw, renderCallBack, oSettings, columnSortOrder) {
            return __awaiter(this, void 0, void 0, function () {
                var time, operationArgs, result, actualDownloadSize, files, nextDownloadSize, error_1, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this.cache.serverCallInProgress) return [3 /*break*/, 4];
                            this.cache.serverCallInProgress = true;
                            this.allDownloaded = false;
                            this.lastPrefetchTime = new Date().getTime();
                            time = this.lastPrefetchTime;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            operationArgs = {
                                shareReference: this.fileExplorerContext.shareReference,
                                directory: directory,
                                prefix: this.searchText,
                                currentToken: !this.continuationToken ? null : this.continuationToken,
                                numResults: downloadSize
                            };
                            return [4 /*yield*/, this.fileExplorerContext.hostProxy.executeProviderOperation("Azure.Storage.Files.listFilesAndDirectoriesSegmented", operationArgs)];
                        case 2:
                            result = _a.sent();
                            actualDownloadSize = 0;
                            if (this.lastPrefetchTime !== time) {
                                return [2 /*return*/, 0];
                            }
                            files = result.Directories.concat(result.Files);
                            actualDownloadSize = files.length;
                            this.continuationToken = result.ContinuationToken;
                            if (!this.continuationToken) {
                                this.allDownloaded = true;
                            }
                            // Cache the data along with current directory.
                            if (this.isCacheValid(searchPrefix)) {
                                // Append to cache.
                                this.cache.data = this.cache.data.concat(files.slice(0));
                            }
                            else {
                                // Create cache.
                                this.cache.data = files;
                            }
                            if (columnSortOrder) {
                                this.sortColumns(columnSortOrder, oSettings);
                            }
                            this.cache.searchPrefix = searchPrefix;
                            this.cache.serverCallInProgress = false;
                            // No need to render the Datatable when there is no new file/directory downloaded.
                            if (this.allDownloaded || actualDownloadSize > 0) {
                                this.renderPage(renderCallBack, draw, startIndex, pageSize, oSettings);
                            }
                            // Telemetry cache size growth.
                            this.telemetry.sendEvent("StorageExplorer.filesCache", {
                                "Action": "Grow",
                                "Size": this.cache.length.toString()
                            });
                            nextDownloadSize = downloadSize - actualDownloadSize;
                            return [2 /*return*/, nextDownloadSize];
                        case 3:
                            error_1 = _a.sent();
                            message = Utilities.getErrorMessage(error_1);
                            this.fileExplorerContext.hostProxy.executeOperation("Environment.showInfobarMessage", [message, null /*link*/, StorageExplorerConstants.InfoBarTypes.errorLink]);
                            if (this.isCacheValid(searchPrefix)) {
                                // Append nothing to cache.
                                this.cache.data = this.cache.data.concat([]);
                            }
                            else {
                                // Create empty cache.
                                this.cache.data = [];
                            }
                            this.renderPage(renderCallBack, draw, startIndex, pageSize, oSettings);
                            this.allDownloaded = true;
                            this.cache.serverCallInProgress = false;
                            return [2 /*return*/, 0];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        // Override the one in base class as for file, name is case insensitive.
        /**
         * @override
         */
        FileListViewModel.prototype.stringCompare = function (s1, s2) {
            s1 = s1 || "";
            s2 = s2 || "";
            return s1.toUpperCase() === s2.toUpperCase();
        };
        FileListViewModel.prototype.postRenderTasks = function (startIndex, pageSize) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // do nothing
                    return [2 /*return*/];
                });
            });
        };
        return FileListViewModel;
    }(FlobListViewModel_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileListViewModel;
});

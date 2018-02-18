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
define(["require", "exports", "StorageExplorer/Blobs/BlobsCache", "StorageExplorer/Common/VMDiskInfoLoader", "StorageExplorer/Common/Base/FlobListViewModel", "Providers/Azure//BlobQueryProviderConfig", "StorageExplorer/StorageExplorerConstants", "Providers/StorageExplorer/Actions/StorageActionsHelper", "Common/Utilities"], function (require, exports, BlobsCache_1, VMDiskInfoLoader_1, FlobListViewModel_1, BlobQueryProviderConfig_1, StorageExplorerConstants, StorageActionsHelper, Utilities) {
    "use strict";
    /**
     * Storage Blob List ViewModel
     */
    var BlobListViewModel = (function (_super) {
        __extends(BlobListViewModel, _super);
        function BlobListViewModel(blobExplorerContext) {
            var _this = _super.call(this, blobExplorerContext.telemetry) || this;
            _this.showSnapshot = false;
            _this.blobExplorerContext = blobExplorerContext;
            _this.cache = new BlobsCache_1.default(_this.telemetry);
            // Adding subscription so that addressbar info and snapshot mode get disabled with breadcrumb and navigation changes.
            _this.currentFile.subscribe(function (value) {
                if (value.length > 0) {
                    _this.showSnapshot = true;
                    // Localize - if we localize, we need to make this more flexible, use a formatting string
                    _this.filePrefix("Snapshots for ");
                }
                else {
                    _this.showSnapshot = false;
                    _this.filePrefix("");
                }
            });
            return _this;
        }
        // IFolderHierarchyViewModel
        BlobListViewModel.prototype.getContainerResourceName = function () {
            return this.blobExplorerContext.containerReference.containerName;
        };
        BlobListViewModel.prototype.navigateToSnapshots = function (folderPath, file) {
            _super.prototype.navigateToFile.call(this, folderPath, file);
        };
        BlobListViewModel.prototype.isBlobs = function () { return true; };
        /**
         * Core of Prefetch blobs and render them in DataTable.
         * Return the number of blobs need downloaded for next round of prefetch.
         */
        BlobListViewModel.prototype.prefetchAndRenderCore = function (directoryOrPrefix, searchPrefix, startIndex, pageSize, downloadSize, draw, renderCallBack, oSettings, columnSortOrder) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var time, operationArgs, result, actualDownloadSize, blobs, nextDownloadSize, error_1, message;
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
                            operationArgs = {
                                containerReference: this.blobExplorerContext.containerReference,
                                prefix: searchPrefix,
                                currentToken: !this.continuationToken ? null : this.continuationToken,
                                numResults: downloadSize,
                                callerName: "listBlobsSegmented",
                                include: this.showSnapshot ? BlobQueryProviderConfig_1.ListBlobsInclude.NoFoldersAndSnapshots : BlobQueryProviderConfig_1.ListBlobsInclude.Directory
                            };
                            return [4 /*yield*/, this.blobExplorerContext.hostProxy.executeProviderOperation("Azure.Storage.Blobs.listBlobsSegmented", operationArgs)];
                        case 2:
                            result = _a.sent();
                            actualDownloadSize = 0;
                            if (this.lastPrefetchTime !== time) {
                                return [2 /*return*/, 0];
                            }
                            if (this.showSnapshot) {
                                // Filter out any files that are in subfolders and aren't actually snapshots of the specified file.
                                blobs = this.cache.ensureOnlySnapshotsAndNoDuplicates(searchPrefix, result.Results);
                            }
                            else {
                                blobs = this.cache.ensureNoDuplicates(result.Results);
                            }
                            actualDownloadSize = blobs.length;
                            this.continuationToken = result.ContinuationToken;
                            if (!this.continuationToken) {
                                this.allDownloaded = true;
                            }
                            // Cache the data along with search prefix.
                            if (this.isCacheValid(searchPrefix)) {
                                // Append to cache.
                                this.cache.data = this.cache.data.concat(blobs.slice(0));
                            }
                            else {
                                // Create cache.
                                this.cache.data = blobs;
                            }
                            if (columnSortOrder) {
                                this.sortColumns(columnSortOrder, oSettings);
                            }
                            this.cache.searchPrefix = searchPrefix;
                            this.cache.serverCallInProgress = false;
                            // No need to render the Datatable when there is no new blobs downloaded.
                            if (this.allDownloaded || actualDownloadSize > 0) {
                                this.renderPage(renderCallBack, draw, startIndex, pageSize, oSettings, function (startIndex, pageSize) {
                                    return _this.postRenderTasks(startIndex, pageSize);
                                });
                            }
                            // Telemetry cache size growth.
                            this.telemetry.sendEvent("StorageExplorer.blobsCache", {
                                "Action": "Grow",
                                "Size": this.cache.length.toString()
                            });
                            nextDownloadSize = downloadSize - actualDownloadSize;
                            return [2 /*return*/, nextDownloadSize];
                        case 3:
                            error_1 = _a.sent();
                            message = Utilities.getErrorMessage(error_1);
                            this.blobExplorerContext.hostProxy.executeOperation("Environment.showInfobarMessage", [message, null /*link*/, StorageExplorerConstants.InfoBarTypes.errorLink]);
                            StorageActionsHelper.closeTargetStorageEditor(this.blobExplorerContext.hostProxy, this.telemetry, this.blobExplorerContext.containerReference.connectionString, 0 /* blobContainer */, this.blobExplorerContext.containerReference.containerName);
                            throw error_1;
                        case 4:
                            ;
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        BlobListViewModel.prototype.postRenderTasks = function (startIndex, pageSize) {
            return __awaiter(this, void 0, void 0, function () {
                var diskInfoLoader, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(!!this && !!this.blobExplorerContext)) return [3 /*break*/, 4];
                            diskInfoLoader = new VMDiskInfoLoader_1.default(this.blobExplorerContext.hostProxy, this.blobExplorerContext.containerReference);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, diskInfoLoader.processDiscs(this.cache.data.slice(startIndex, pageSize))];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return BlobListViewModel;
    }(FlobListViewModel_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobListViewModel;
});

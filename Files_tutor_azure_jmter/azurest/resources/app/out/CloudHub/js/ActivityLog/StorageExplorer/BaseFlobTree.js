/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
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
define(["require", "exports", "Common/AzureStorageUtilities", "Common/Errors", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, AzureStorageUtilities, Errors, StorageExplorerConstants, Utilities) {
    "use strict";
    function doWork(array) {
        return __awaiter(this, void 0, void 0, function () {
            var i, work;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < array.length)) return [3 /*break*/, 4];
                        work = array[i];
                        return [4 /*yield*/, work()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /*
     * Base implementation for a blob or file container
     */
    var BaseFlobTree = (function () {
        function BaseFlobTree(host, name) {
            this._host = host;
            this._name = name;
        }
        BaseFlobTree.prototype.getName = function () {
            return this._name;
        };
        BaseFlobTree.prototype.isFolderEmpty = function (folderPath) {
            var _this = this;
            var containsAtLeastOneItem = function (continuationToken) {
                return _this._listFlatItemsSegmented(folderPath, continuationToken, 1)
                    .then(function (result) {
                    if (result.Results && result.Results.length) {
                        return true;
                    }
                    else if (result.ContinuationToken) {
                        return containsAtLeastOneItem(result.ContinuationToken);
                    }
                    else {
                        return false;
                    }
                });
            };
            return containsAtLeastOneItem(null)
                .then(function (notEmpty) {
                return !notEmpty;
            });
        };
        BaseFlobTree.prototype.isEmpty = function () {
            return this.isFolderEmpty("");
        };
        /**
         * Enumerates all items within the given items or paths, recursively.
         * onChunk() is called with each group discovered (size of each group is abitrary,
         * may be 0 or more items each chunk).
         * Includes folders if supported by the flob type.
         * If sourceItemsOrPaths is null, all items in the basePath are enumerated.
         */
        BaseFlobTree.prototype.enumerateItemsRecursively = function (sourceItemsOrPaths, basePath, requireSize, cancelToken, onChunk) {
            if (sourceItemsOrPaths) {
                return this._enumerateSelectedItemsRecursively(sourceItemsOrPaths, basePath, requireSize, cancelToken, onChunk);
            }
            else {
                return this._enumerateAllItemsRecursively(basePath, requireSize, cancelToken, onChunk);
            }
        };
        /**
         * Enumerates all items in the given path
         */
        BaseFlobTree.prototype._enumerateAllItemsRecursively = function (basePath, requireSize, cancelToken, onChunk) {
            return this._enumerateAllFlatItemsRecursively(basePath, cancelToken, function (flobs) {
                var flobsToCache = BaseFlobTree._flobContainerItemsToCachableFlobs(flobs);
                return onChunk(flobsToCache);
            });
        };
        /**
         * Enumerates the source items and all items within each of the source items which are folders.
         * Can pass in IFlobContainerItem items or strings (for strings, a "/" at the end indicates a folder),
         * but retrieving the size is only possible when passing in container items instead of strings.
         */
        BaseFlobTree.prototype._enumerateSelectedItemsRecursively = function (sourceItemsOrPaths, basePath, requireSize, cancelToken, onChunkDiscovered) {
            var _this = this;
            var discoverSubItemsInSingleItemRecursively = function (flobOrFolder, basePath, requireSize) {
                cancelToken.throwIfCanceled();
                var addFolder = function (folderPath) {
                    return _this._enumerateAllFlatItemsRecursively(folderPath, cancelToken, function (flobs) {
                        var flobsToCache = BaseFlobTree._flobContainerItemsToCachableFlobs(flobs);
                        return onChunkDiscovered(flobsToCache);
                    }).then(function () {
                        // Add the folder afterwards (depth-first)
                        if (_this.listsFoldersInEnumeration()) {
                            var flobFolder = BaseFlobTree._folderPathToCachableFlob(folderPath);
                            return onChunkDiscovered([flobFolder]);
                        }
                    });
                };
                if (flobOrFolder.relativePath) {
                    var clipboardItem = flobOrFolder;
                    var path = basePath + clipboardItem.relativePath;
                    if (path.length && path[path.length - 1] === "/") {
                        // It's a folder or directory
                        return addFolder(path);
                    }
                    else {
                        // Simple flob - just add it
                        if (requireSize) {
                            throw new Errors.InvalidOperationError("Internal error: Cannot retrieve size from just a blob/file path without querying Azure");
                        }
                        return onChunkDiscovered([{ fullName: path, size: undefined, snapshot: clipboardItem.snapshot }]);
                    }
                }
                else {
                    // It must be an IFlobContainerItem
                    var item = flobOrFolder;
                    if (item.ContentType === StorageExplorerConstants.ContentTypes.Folder) {
                        // Folder
                        var folderPath = Utilities.appendSlash(item.FullName);
                        return addFolder(folderPath);
                    }
                    else {
                        // Flob - just add it
                        return onChunkDiscovered([BaseFlobTree._flobContainerItemToCachableFlob(item)]);
                    }
                }
            };
            var work = sourceItemsOrPaths.map(function (item) {
                return function () { return discoverSubItemsInSingleItemRecursively(item, basePath, requireSize); };
            });
            return doWork(work);
        };
        BaseFlobTree.prototype._releaseEnumeration = function (continuationToken) {
            // Nothing to do in default case
        };
        /**
         * Enumerates all file/blob items with the given prefix, including those inside subfolders, with their
         * full names including paths.  Calls onChunk with each batch of items found.
         */
        BaseFlobTree.prototype._enumerateAllFlatItemsRecursively = function (prefixOrFolder, cancelToken, onChunk) {
            var _this = this;
            var downloadSize = 500; // If we do too many at once, the client library spends too much time with the CPU processing the results TODO: increase when blob/file listing moved to separate process
            var downloadOneSegment = function (continuationToken) {
                if (cancelToken.isCanceled) {
                    _this._releaseEnumeration(continuationToken);
                    cancelToken.throwIfCanceled();
                }
                return _this._listFlatItemsSegmented(prefixOrFolder, continuationToken, downloadSize)
                    .then(function (result) {
                    cancelToken.throwIfCanceled();
                    var nextContinuationToken = result.ContinuationToken;
                    var items = result.Results;
                    var needToRecurseOnSubfolders = !result.ContainsSubItems;
                    // Does the API do recursion into the subfolders for us, or do we have to do it manually?
                    var subfolderWork = [];
                    if (needToRecurseOnSubfolders) {
                        // We need to recurse manually into subfolders
                        items.forEach(function (flob) {
                            if (flob.ContentType === StorageExplorerConstants.ContentTypes.Folder) {
                                subfolderWork.push(function () { return _this._enumerateAllFlatItemsRecursively(flob.FullName, cancelToken, onChunk); });
                            }
                        });
                    }
                    return doWork(subfolderWork).then(function () {
                        cancelToken.throwIfCanceled();
                        // After all subfolders have enumerated, we can process the current items (depth-first)
                        var flobsForCallback = [];
                        if (!_this.listsFoldersInEnumeration()) {
                            // if we aren't supposed to include folders, then make sure to
                            // to remove any folders we found while enumerating
                            for (var i = 0; i < items.length; i++) {
                                if (!Utilities.isPathAFolder(items[i].FullName)) {
                                    flobsForCallback.push(items[i]);
                                }
                            }
                        }
                        else {
                            flobsForCallback = items;
                        }
                        return onChunk(flobsForCallback).then(function () {
                            if (nextContinuationToken) {
                                return downloadOneSegment(nextContinuationToken);
                            }
                        });
                    });
                });
            };
            return downloadOneSegment(null);
        };
        BaseFlobTree.prototype.processError = function (error) {
            return AzureStorageUtilities.processError(error);
        };
        BaseFlobTree._folderPathToCachableFlob = function (folderPath) {
            return {
                fullName: folderPath,
                size: 0,
                snapshot: "" // Directories don't have snapshots
            };
        };
        BaseFlobTree._flobContainerItemsToCachableFlobs = function (flobs) {
            return flobs.map(BaseFlobTree._flobContainerItemToCachableFlob);
        };
        BaseFlobTree._flobContainerItemToCachableFlob = function (item) {
            return {
                fullName: item.FullName,
                size: Number(item.Size),
                snapshot: item.Blob ? item.Blob.Snapshot : undefined
            };
        };
        return BaseFlobTree;
    }());
    exports.BaseFlobTree = BaseFlobTree;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BaseFlobTree;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Common/Base/CacheBase", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, CacheBase_1, StorageExplorerUtilities) {
    "use strict";
    var TableEntityCache = (function (_super) {
        __extends(TableEntityCache, _super);
        function TableEntityCache(telemetry) {
            var _this = _super.call(this) || this;
            _this.data = null;
            _this._tableQuery = null;
            _this.serverCallInProgress = false;
            _this.sortOrder = null;
            _this._telemetry = telemetry;
            return _this;
        }
        Object.defineProperty(TableEntityCache.prototype, "tableQuery", {
            get: function () {
                return StorageExplorerUtilities.copyTableQuery(this._tableQuery);
            },
            set: function (tableQuery) {
                this._tableQuery = StorageExplorerUtilities.copyTableQuery(tableQuery);
            },
            enumerable: true,
            configurable: true
        });
        TableEntityCache.prototype.preClear = function () {
            // Log telemetry clear cache.
            this._telemetry.sendEvent("StorageExplorer.tableCache", {
                "Action": "Clear",
                "Size": this.length.toString()
            });
            this.tableQuery = null;
        };
        return TableEntityCache;
    }(CacheBase_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableEntityCache;
});

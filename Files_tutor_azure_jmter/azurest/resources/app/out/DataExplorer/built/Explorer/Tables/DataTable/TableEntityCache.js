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
define(["require", "exports", "../Utilities", "./CacheBase"], function (require, exports, Utilities, CacheBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TableEntityCache = (function (_super) {
        __extends(TableEntityCache, _super);
        function TableEntityCache() {
            var _this = _super.call(this) || this;
            _this.data = null;
            _this._tableQuery = null;
            _this.serverCallInProgress = false;
            _this.sortOrder = null;
            return _this;
        }
        Object.defineProperty(TableEntityCache.prototype, "tableQuery", {
            get: function () {
                return Utilities.copyTableQuery(this._tableQuery);
            },
            set: function (tableQuery) {
                this._tableQuery = Utilities.copyTableQuery(tableQuery);
            },
            enumerable: true,
            configurable: true
        });
        TableEntityCache.prototype.preClear = function () {
            this.tableQuery = null;
        };
        return TableEntityCache;
    }(CacheBase_1.default));
    exports.default = TableEntityCache;
});

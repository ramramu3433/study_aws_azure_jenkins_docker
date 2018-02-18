/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Common/Base/CacheBase"], function (require, exports, CacheBase_1) {
    "use strict";
    var QueueMessageCache = (function (_super) {
        __extends(QueueMessageCache, _super);
        function QueueMessageCache(telemetry) {
            var _this = _super.call(this) || this;
            _this._telemetry = telemetry;
            _this.searchPrefix = null;
            return _this;
        }
        QueueMessageCache.prototype.preClear = function () {
            // Log telemetry clear cache.
            this._telemetry.sendEvent("StorageExplorer.queueMessageCache", {
                "Action": "Clear",
                "Size": this.length.toString()
            });
            this.searchPrefix = null;
        };
        return QueueMessageCache;
    }(CacheBase_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueueMessageCache;
});

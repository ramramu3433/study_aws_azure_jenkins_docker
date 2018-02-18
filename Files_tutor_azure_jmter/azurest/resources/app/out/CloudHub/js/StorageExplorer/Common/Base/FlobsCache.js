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
    var FlobsCache = (function (_super) {
        __extends(FlobsCache, _super);
        function FlobsCache(telemetry, eventName) {
            var _this = _super.call(this) || this;
            _this._telemetry = telemetry;
            _this._eventName = eventName;
            _this.searchPrefix = null;
            return _this;
        }
        FlobsCache.prototype.preClear = function () {
            // Log telemetry clear cache.
            this._telemetry.sendEvent(this._eventName, {
                "Action": "Clear",
                "Size": this.length.toString()
            });
            this.searchPrefix = null;
        };
        return FlobsCache;
    }(CacheBase_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobsCache;
});

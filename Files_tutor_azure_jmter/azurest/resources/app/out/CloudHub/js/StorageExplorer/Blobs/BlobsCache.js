/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Common/Base/FlobsCache", "StorageExplorer/Common/Utils/StringSet"], function (require, exports, FlobsCache_1, StringSet_1) {
    "use strict";
    /**
     * BlobsCache
     */
    var BlobsCache = (function (_super) {
        __extends(BlobsCache, _super);
        function BlobsCache(telemetry) {
            var _this = _super.call(this, telemetry, "StorageExplorer.blobsCache") || this;
            _this.tryAdd = function (blob) {
                var added = false;
                var fullName = blob.FullName;
                var snapshot = blob.Blob ? blob.Blob.Snapshot : undefined;
                if (!_this._cachedBlobsSet.has(fullName + snapshot)) {
                    _this._cachedBlobsSet.add(fullName + snapshot);
                    added = true;
                }
                return added;
            };
            _this._cachedBlobsSet = new StringSet_1.default();
            return _this;
        }
        BlobsCache.prototype.ensureNoDuplicates = function (blobs) {
            return blobs.filter(this.tryAdd);
        };
        BlobsCache.prototype.ensureOnlySnapshotsAndNoDuplicates = function (fullName, blobs) {
            var _this = this;
            return blobs.filter(function (blob) {
                if (blob.FullName === fullName) {
                    return _this.tryAdd(blob);
                }
                return false;
            });
        };
        BlobsCache.prototype.preClear = function () {
            _super.prototype.preClear.call(this);
            this._cachedBlobsSet = new StringSet_1.default();
        };
        return BlobsCache;
    }(FlobsCache_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobsCache;
});

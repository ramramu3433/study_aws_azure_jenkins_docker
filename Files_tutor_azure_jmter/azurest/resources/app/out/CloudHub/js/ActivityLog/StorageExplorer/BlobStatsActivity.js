/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "ActivityLog/StorageExplorer/FlobStatsActivity"], function (require, exports, AzureStorageUtilities, FlobStatsActivity_1) {
    "use strict";
    /**
     * Class to handle a group activity log entry for blob copies or renames
     */
    var BlobStatsActivity = (function (_super) {
        __extends(BlobStatsActivity, _super);
        function BlobStatsActivity(host, activityLogManager, container, items, // null for entire container
            folder, telemetryActions) {
            var _this = _super.call(this, host, activityLogManager, container, items, folder, {
                telemetryEventName: "StorageExplorer.BlobStatsActivity",
                telemetry: telemetryActions,
                flobType: AzureStorageUtilities.FlobTypes.Blob
            }) || this;
            /** @override */
            _this._iterationTemplate = "Inspecting %s blobs in %s";
            _this._stats = {
                totalBlobs: 0,
                totalBytes: 0
            };
            return _this;
        }
        /** @override */
        BlobStatsActivity.prototype._addToStatistics = function (flob) {
            this._stats.totalBlobs += 1;
            this._stats.totalBytes += flob.size;
        };
        /** @override */
        BlobStatsActivity.prototype._getStats = function (isFinal) {
            var totalBlobs = this._stats.totalBlobs;
            var totalBytes = this._stats.totalBytes;
            this._telemetryInfo.telemetry.sendEvent(this._items ? "BlobStats.Selection" : "BlobStats.FullContainer", {
                isFinal: String(isFinal),
                totalBlobs: String(totalBlobs),
                totalBytes: String(totalBytes)
            });
            // toLocaleString() will add commas to numbers
            var totalBlobsString = totalBlobs.toLocaleString();
            var totalBytesString = totalBytes.toLocaleString();
            return [totalBlobsString + " blobs", totalBytesString + " bytes (not including snapshots)"];
        };
        return BlobStatsActivity;
    }(FlobStatsActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobStatsActivity;
});

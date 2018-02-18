/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "ActivityLog/StorageExplorer/FlobStatsActivity", "Common/Utilities"], function (require, exports, AzureStorageUtilities, FlobStatsActivity_1, Utilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for blob copies or renames
     */
    var FileStatsActivity = (function (_super) {
        __extends(FileStatsActivity, _super);
        function FileStatsActivity(host, activityLogManager, container, items, // null for entire container
            folder, telemetryActions) {
            var _this = _super.call(this, host, activityLogManager, container, items, folder, {
                telemetryEventName: "StorageExplorer.BlobStatsActivity",
                telemetry: telemetryActions,
                flobType: AzureStorageUtilities.FlobTypes.Blob
            }) || this;
            /** @override */
            _this._iterationTemplate = "Inspecting %s files in %s";
            _this._stats = {
                totalFiles: 0,
                totalBytes: 0,
                totalDirectories: 0
            };
            return _this;
        }
        /**
         * @override
         */
        FileStatsActivity.prototype._addToStatistics = function (flob) {
            if (Utilities.isPathAFolder(flob.fullName)) {
                this._stats.totalDirectories += 1;
            }
            else {
                this._stats.totalFiles += 1;
                this._stats.totalBytes += flob.size;
            }
        };
        /**
         * @override
         */
        FileStatsActivity.prototype._getStats = function (isFinal) {
            var totalFiles = this._stats.totalFiles;
            var totalDirectories = this._stats.totalDirectories;
            var totalBytes = this._stats.totalBytes;
            this._telemetryInfo.telemetry.sendEvent(this._items ? "FileStats.Selection" : "FileStats.FullShare", {
                isFinal: String(isFinal),
                totalFiles: String(totalFiles),
                totalDirectories: String(totalDirectories),
                totalBytes: String(totalBytes)
            });
            // toLocaleString() will add commas to numbers
            var totalFilesString = totalFiles.toLocaleString();
            var totalDirectoriesString = totalDirectories.toLocaleString();
            var totalBytesString = totalBytes.toLocaleString();
            return [totalFilesString + " files", totalDirectoriesString + " subdirectories", totalBytesString + " bytes"];
        };
        return FileStatsActivity;
    }(FlobStatsActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileStatsActivity;
});

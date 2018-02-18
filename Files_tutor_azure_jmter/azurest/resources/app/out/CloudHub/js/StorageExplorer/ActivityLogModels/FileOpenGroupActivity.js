/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/ActivityLogModels/FileDownloadGroupActivity", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, FileDownloadGroupActivity_1, StorageExplorerUtilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for opening Azure files
     */
    var FileOpenGroupActivity = (function (_super) {
        __extends(FileOpenGroupActivity, _super);
        function FileOpenGroupActivity(sourceShareReference, sourceAzureFileFolder, destinationDiskFolder, activityLogManager, host, telemetry) {
            var _this = _super.call(this, sourceShareReference, sourceAzureFileFolder, destinationDiskFolder, true, // defaultOverwriteIfExists
            null, // transformDownloadFileNameAndPath
            activityLogManager, host, telemetry) || this;
            /**
             * @override
             */
            _this._singularCountBasedTitleTemplate = "Opening %d file from '%s' (downloading to '%s')"; // Localize
            /**
             * @override
             */
            _this._pluralCountBasedTitleTemplate = "Opening %d files from '%s' (downloading to '%s')"; // Localize
            return _this;
        }
        /**
         * @override
         */
        FileOpenGroupActivity.prototype._createDownloadActivity = function (toDownload) {
            var _this = this;
            var downloadActivity = _super.prototype._createDownloadActivity.call(this, toDownload);
            downloadActivity.success.then(function () {
                // When each file finishes downloading, open it
                return StorageExplorerUtilities.tryOpenFileOnDiskSafely(_this._host, downloadActivity.destinationFilePath);
            });
            return downloadActivity;
        };
        return FileOpenGroupActivity;
    }(FileDownloadGroupActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileOpenGroupActivity;
});

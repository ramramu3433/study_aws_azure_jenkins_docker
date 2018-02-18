/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "StorageExplorer/ActivityLogModels/DiskFolderCreateActivity", "StorageExplorer/ActivityLogModels/FileDownloadActivity", "ActivityLog/StorageExplorer/FileFlobContainer", "StorageExplorer/ActivityLogModels/FlobDownloadGroupActivity", "Common/Utilities"], function (require, exports, AzureStorageUtilities, DiskFolderCreateActivity_1, FileDownloadActivity_1, FileFlobContainer_1, FlobDownloadGroupActivity_1, Utilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for downloads
     */
    var FileDownloadGroupActivity = (function (_super) {
        __extends(FileDownloadGroupActivity, _super);
        function FileDownloadGroupActivity(sourceShareReference, sourceDirectory, destDiskFolder, defaultOverwriteIfExists, 
            // Null to downlaod to same filename as the Azure file name
            transformDownloadFileNameAndPath, activityLogManager, host, telemetry) {
            var _this = _super.call(this, FileDownloadGroupActivity.EnumerationTitle, FileDownloadGroupActivity.TitleTemplate, new FileFlobContainer_1.default(host, sourceShareReference), sourceDirectory, destDiskFolder, defaultOverwriteIfExists, transformDownloadFileNameAndPath, activityLogManager, host, {
                telemetryEventName: "StorageExplorer.FileDownloadGroupActivity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.File
            }) || this;
            _this._sourceShareReference = sourceShareReference;
            return _this;
        }
        /**
         * @override
         */
        FileDownloadGroupActivity.prototype._createDownloadActivity = function (toDownload) {
            var flobPath = toDownload.fullName;
            var size = toDownload.size;
            var downloadPath = this._getDownloadPath(flobPath);
            var activity;
            if (Utilities.isPathAFolder(flobPath)) {
                // It's a directory - create it (even if the source directory is empty)
                activity = new DiskFolderCreateActivity_1.default(this._diskFolderCreator, downloadPath, this._telemetryInfo.telemetry);
                activity.initialize();
            }
            else {
                var downloadActivity = new FileDownloadActivity_1.default(this._host, this._sourceShareReference, this._diskFolderCreator, flobPath, downloadPath, size, this._telemetryInfo.telemetry);
                downloadActivity.initialize();
                // TODO: why isn't this in upload?
                if (this._defaultOverwriteIfExists) {
                    downloadActivity.overwrite();
                }
                activity = downloadActivity;
            }
            return activity;
        };
        return FileDownloadGroupActivity;
    }(FlobDownloadGroupActivity_1.default));
    FileDownloadGroupActivity.EnumerationTitle = "Downloading files..."; // Localize
    FileDownloadGroupActivity.TitleTemplate = {
        // Localize
        singularDoing: "Downloading file from '%0s' to '%1s'",
        pluralDoing: "Downloading %0s files/directories from '%1s' to '%2s'",
        singularDone: "Downloaded file from '%0s' to '%1s'",
        pluralDone: "Downloaded %0s files/directories from '%1s' to '%2s'"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileDownloadGroupActivity;
});

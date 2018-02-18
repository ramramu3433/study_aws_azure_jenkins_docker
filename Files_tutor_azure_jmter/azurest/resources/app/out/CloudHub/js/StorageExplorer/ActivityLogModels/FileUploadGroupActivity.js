var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "StorageExplorer/ActivityLogModels/DirectoryCreateActivity", "ActivityLog/StorageExplorer/FileFlobContainer", "StorageExplorer/ActivityLogModels/FileUploadActivity", "StorageExplorer/ActivityLogModels/FlobUploadGroupActivity", "StorageExplorer/Common/StorageExplorerUtilities", "Common/Utilities"], function (require, exports, AzureStorageUtilities, DirectoryCreateActivity_1, FileFlobContainer_1, FileUploadActivity_1, FlobUploadGroupActivity_1, StorageExplorerUtilities, Utilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for uploads
     */
    var FileUploadGroupActivity = (function (_super) {
        __extends(FileUploadGroupActivity, _super);
        function FileUploadGroupActivity(rootSourceDiskFolder, destShareReference, rootDestDirectory, activityLogManager, host, telemetry, fileListViewModel) {
            var _this = _super.call(this, FileUploadGroupActivity.TitleTemplate, rootSourceDiskFolder, new FileFlobContainer_1.default(host, destShareReference), rootDestDirectory, activityLogManager, host, {
                telemetryEventName: "StorageExplorer.FileUploadGroupActivity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.File
            }) || this;
            _this._destShareReference = destShareReference;
            _this._fileListViewModel = fileListViewModel;
            return _this;
        }
        /**
         * @override
         */
        FileUploadGroupActivity.prototype._createUploadActivity = function (toUpload) {
            var _this = this;
            // "fullName" is relative to the source folder
            var sourcePath = Utilities.JoinFilePaths(this._rootSourceDiskFolder, toUpload.fullName);
            var fileSize = toUpload.size;
            var destPath = this._getFlobPath(sourcePath, this._rootSourceDiskFolder, this._rootDestFolder);
            var activity;
            var isFolder = Utilities.isPathAFolder(destPath);
            if (isFolder) {
                // Destination is a directory - create it (even if the source directory is empty)
                activity = new DirectoryCreateActivity_1.default(this._host, this._destContainer, destPath, this._fileListViewModel, this._telemetryInfo.telemetry);
                activity.initialize();
            }
            else {
                activity = new FileUploadActivity_1.default(this._host, this._destShareReference, destPath, sourcePath, fileSize, this._telemetryInfo.telemetry);
                activity.initialize();
            }
            activity.success.then(function () {
                // Update the current view once the upload is completed
                return StorageExplorerUtilities.getFileShareItem(_this._host, _this._destShareReference, destPath, isFolder).then(function (item) {
                    _this._fileListViewModel.addFlobToCurrentFolder(item).then(function () {
                        _this._fileListViewModel.redrawTableThrottled();
                    });
                });
            });
            return activity;
        };
        return FileUploadGroupActivity;
    }(FlobUploadGroupActivity_1.default));
    FileUploadGroupActivity.TitleTemplate = {
        // Localize
        singularDoing: "Uploading file/directory from '%0s' to '%1s'",
        pluralDoing: "Uploading %0s files/directories from '%1s' to '%2s'",
        singularDone: "Uploaded file/directory from '%0s' to '%1s'",
        pluralDone: "Uploaded %0s files/directories from '%1s' to '%2s'"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileUploadGroupActivity;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "ActivityLog/StorageExplorer/FileFlobContainer", "StorageExplorer/ActivityLogModels/FlobDownloadActivity"], function (require, exports, AzureStorageUtilities, FileFlobContainer_1, FlobDownloadActivity_1) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an Azure file download operation
     */
    var FileDownloadActivity = (function (_super) {
        __extends(FileDownloadActivity, _super);
        function FileDownloadActivity(host, sourceShareReference, diskFolderCreator, sourceAzureFilePath, destFilePath, // Folder doesn't need to already exist
            fileSize, telemetry) {
            return _super.call(this, host, new FileFlobContainer_1.default(host, sourceShareReference), diskFolderCreator, sourceAzureFilePath, destFilePath, fileSize, "", {
                telemetryEventName: "StorageExplorer.FileDownloadActivity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.File
            }) || this;
        }
        /**
         * @override
         */
        FileDownloadActivity.prototype._getTransferProgress = function () {
            return this._container.getDownloadProgress(this._progressId);
        };
        /**
         * @override
         */
        FileDownloadActivity.prototype._releaseTransfer = function () {
            return this._container.releaseDownload(this._progressId);
        };
        return FileDownloadActivity;
    }(FlobDownloadActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileDownloadActivity;
});

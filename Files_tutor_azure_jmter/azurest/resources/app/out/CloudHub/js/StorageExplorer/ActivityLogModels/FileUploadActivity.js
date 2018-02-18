/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "ActivityLog/StorageExplorer/FileFlobContainer", "StorageExplorer/ActivityLogModels/FlobUploadActivity"], function (require, exports, AzureStorageUtilities, FileFlobContainer_1, FlobUploadActivity_1) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an Azure file upload operation
     */
    var FileUploadActivity = (function (_super) {
        __extends(FileUploadActivity, _super);
        function FileUploadActivity(host, shareReference, destPath, sourceFilePath, size, telemetry) {
            var _this = _super.call(this, host, new FileFlobContainer_1.default(host, shareReference), destPath, null /*blobType*/, sourceFilePath, size, {
                telemetryEventName: "StorageExplorer.FileUploadActivity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.File
            }) || this;
            /**
             * @override
             */
            _this.DestinationExistsErrorMessage = "A file with the given name already exists."; // Localize
            return _this;
        }
        /**
         * @override
         */
        FileUploadActivity.prototype._supportsThrowingIfExists = function () {
            // File APIs don't currently support condition headers, so overwriteIfExists must always be true
            return false;
        };
        /**
         * @override
         */
        FileUploadActivity.prototype._getTransferProgress = function () {
            return this._container.getUploadProgress(this._progressId);
        };
        /**
         * @override
         */
        FileUploadActivity.prototype._releaseTransfer = function () {
            return this._container.releaseUpload(this._progressId);
        };
        return FileUploadActivity;
    }(FlobUploadActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileUploadActivity;
});

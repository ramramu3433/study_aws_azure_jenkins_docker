/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "StorageExplorer/ActivityLogModels/FlobTransferActivity", "Common/Errors", "StorageExplorer/Common/StorageExplorerUtilities", "Providers/CloudExplorer/ProviderWrappers/EnvironmentPW"], function (require, exports, _string, FlobTransferActivity_1, Errors, StorageExplorerUtilities, EnvironmentPW) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a blob/file download operation
     */
    var FlobDownloadActivity = (function (_super) {
        __extends(FlobDownloadActivity, _super);
        function FlobDownloadActivity(host, container, diskFolderCreator, sourceFlobPath, destFilePath, // Folder doesn't need to already exist
            size, snapshot, telemetryInfo) {
            var _this = _super.call(this, host, container, _string.sprintf("Downloading '%s' to '%s'", sourceFlobPath, destFilePath), telemetryInfo, size) || this;
            _this._diskFolderCreator = diskFolderCreator;
            _this._sourceFlobPath = sourceFlobPath;
            _this._destFilePath = destFilePath;
            _this._snapshot = snapshot;
            return _this;
        }
        /**
         * @override
         */
        FlobDownloadActivity.prototype._startTransfer = function (overwrite) {
            return this._download(overwrite);
        };
        /**
         * @override
         */
        FlobDownloadActivity.prototype._requestCancelTransfer = function () {
            return this._cancelDownload();
        };
        /**
         * @override
         */
        FlobDownloadActivity.prototype._createProgressIdCore = function () {
            // Unique id to use to track progress on this upload
            return "download" + this.TelemetryFlobType + "|" + this._sourceFlobPath + "|" + this._snapshot + "|" + this._destFilePath + "|" + new Date().toISOString();
        };
        FlobDownloadActivity.prototype._download = function (overwrite) {
            var _this = this;
            var downloadFolder = StorageExplorerUtilities.getFolderFromFilePath(this._destFilePath);
            return this._diskFolderCreator.ensureLocalFolderExists(downloadFolder).then(function () {
                return _this._host.executeOperation("Environment.doesFileExist", [_this._destFilePath]).then(function (exists) {
                    if (exists && !overwrite) {
                        throw new Errors.DestinationExistsError("A file with the given name already exists"); // Localize
                    }
                    // At this point either the file does not exist, or we have permission to overwrite it
                    // First delete the destination if it exists
                    var deleteIfNeededPromise = exists ?
                        EnvironmentPW.deleteFile(_this._host, _this._destFilePath)
                        : Promise.resolve();
                    return deleteIfNeededPromise.then(function () {
                        // Now download the flob with temporary *.partial extension,
                        // then only once the file has been fully downloaded error-free,
                        // rename it to the final name.
                        // This way the user can tell if a file on disk was fully downloaded or just partially.
                        // 
                        // For files that will be downloaded in a single chunk, we don't need to worry about a temporary *.partial file
                        var downloadThenRename = _this._size > FlobDownloadActivity.LargeFlobThresholdBytes;
                        var downloadPath = downloadThenRename ?
                            _this._destFilePath + ".partial" :
                            _this._destFilePath;
                        return _this._container.downloadToLocalFile(_this._sourceFlobPath, downloadPath, _this._size, _this._progressId, _this._snapshot).then(function () {
                            // Now rename the downloaded file if we downloaded to *.partial
                            // (destination is overwritten if it exists)
                            if (downloadThenRename) {
                                return EnvironmentPW.renameFile(_this._host, downloadPath, _this._destFilePath);
                            }
                        });
                    });
                });
            });
        };
        FlobDownloadActivity.prototype._cancelDownload = function () {
            return this._container.abortDownload(this._progressId);
        };
        Object.defineProperty(FlobDownloadActivity.prototype, "destinationFilePath", {
            get: function () {
                return this._destFilePath;
            },
            enumerable: true,
            configurable: true
        });
        return FlobDownloadActivity;
    }(FlobTransferActivity_1.default));
    exports.FlobDownloadActivity = FlobDownloadActivity;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobDownloadActivity;
});

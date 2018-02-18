/// <reference path="../../../Scripts/global.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/DiskFlobTree", "ActivityLog/StorageExplorer/FlobGroupActivity", "ActivityLog/StorageExplorer/GroupedActivityWithConflicts", "ActivityLog/StorageExplorer/SelectSequence", "StorageExplorer/Common/StorageExplorerUtilities", "Common/Utilities"], function (require, exports, DiskFlobTree_1, FlobGroupActivity_1, GroupedActivityWithConflicts_1, SelectSequence, StorageExplorerUtilities, Utilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for uploads
     */
    var FlobUploadGroupActivity = (function (_super) {
        __extends(FlobUploadGroupActivity, _super);
        function FlobUploadGroupActivity(titleTemplate, rootSourceDiskFolder, destContainer, rootDestFolder, activityLogManager, host, telemetryInfo) {
            var _this = _super.call(this, FlobUploadGroupActivity.EnumerationTitle, titleTemplate, GroupedActivityWithConflicts_1.default.dialogOperationTypes.upload, host, activityLogManager, telemetryInfo) || this;
            /**
             * @override
             */
            _this._canHaveConflicts = true;
            _this._rootSourceDiskFolder = rootSourceDiskFolder;
            _this._destContainer = destContainer;
            _this._rootDestFolder = rootDestFolder;
            return _this;
        }
        /**
         * @override
         */
        FlobUploadGroupActivity.prototype._getSourceDisplayName = function () {
            return this._rootSourceDiskFolder;
        };
        /**
         * @override
         */
        FlobUploadGroupActivity.prototype._getDestDisplayName = function () {
            return this._getLocationDisplayPath(this._destContainer, this._rootDestFolder);
        };
        /**
         * Uploads a folder without displaying a dialog
         */
        FlobUploadGroupActivity.prototype.startUploadingFolder = function () {
            try {
                // Upload all files to the same folder
                return this._startUploadingCore(null);
            }
            catch (error) {
                this._showError(error, "StorageExplorer.startUploadFilesTo" + this.TelemetryFlobType + "sTask");
            }
        };
        /**
         * Uploads files
         */
        FlobUploadGroupActivity.prototype.startUploadingFiles = function (relativeFilePaths) {
            try {
                // Upload all files to the same folder
                return this._startUploadingCore(relativeFilePaths);
            }
            catch (error) {
                this._showError(error, "StorageExplorer.startUploadFilesTo" + this.TelemetryFlobType + "sTask");
            }
        };
        FlobUploadGroupActivity.prototype._startUploadingCore = function (relativePaths // null for all
        ) {
            var _this = this;
            var enumerationActivity = this._createEnumerationActivity(FlobUploadGroupActivity.EnumerationTitle, "StorageExplorer.Discover" + this.TelemetryFlobType + "sToUpload", function (cancelToken) { return _this._enumerateItemsToUpload(relativePaths, cancelToken); });
            this.addTemporaryChildActivity(enumerationActivity);
        };
        /**
         * Adds an activity to enumerate all blobs to download
         */
        FlobUploadGroupActivity.prototype._enumerateItemsToUpload = function (relativePaths, cancelToken) {
            var _this = this;
            var tree = new DiskFlobTree_1.default(this._host, this._rootSourceDiskFolder);
            return this.createFlobDiscoverySequence(tree, relativePaths && relativePaths.map(function (relativePath) { return ({ relativePath: relativePath, snapshot: null }); }), false /* requireSize */, "", // basePath (relative to the container's root, which is this._rootSourceDiskFolder)
            cancelToken)
                .then(function (flobsSequence) {
                // Transform this sequence into one that creates activity log entries for the items to upload
                var activitiesSequence = new SelectSequence(flobsSequence, function (flob) { return _this._createUploadActivity(flob); });
                // Set up to automatically create each download as a child activity when ready
                _this.addChildSequence(activitiesSequence);
                _this.areAllChildrenAdded = true;
                // The enumeration activity isn't completed until all possible items have been added to the sequence
                // (although not necessarily completed or even started).
                return activitiesSequence.waitUntilAddItemsAdded();
            });
        };
        /**
         * Get a valid blob/file name+path from a file path, relative to a base folder, and prepended with
         * an optional destination blob folder or file directory.
         */
        FlobUploadGroupActivity.prototype._getFlobPath = function (diskPath, baseDiskFolder, destFlobFolder) {
            baseDiskFolder = Utilities.appendSlash(baseDiskFolder);
            destFlobFolder = Utilities.appendSlash(destFlobFolder);
            var flobNameRelativeToBaseFileFolder = diskPath.substr(baseDiskFolder.length);
            var finalFlobPath = (destFlobFolder ? destFlobFolder : "") + flobNameRelativeToBaseFileFolder;
            finalFlobPath = StorageExplorerUtilities.convertFilePathToFlobPath(finalFlobPath);
            // Decode folder/file names that we encoded when downloading
            finalFlobPath = this._transformUploadFileNameAndPath(finalFlobPath);
            return finalFlobPath;
        };
        // TODO: share
        FlobUploadGroupActivity.prototype._showError = function (error, telemetryCategory) {
            var telemetryError = {
                name: telemetryCategory,
                error: error
            };
            this._telemetryInfo.telemetry.sendError(telemetryError);
            var message = Utilities.getErrorMessage(error);
            this._host.executeOperation("Environment.showMessageBox", ["Storage Explorer", message, "error"]);
        };
        FlobUploadGroupActivity.prototype._transformUploadFileNameAndPath = function (relativeBlobPath) {
            var segments = Utilities.splitPath(relativeBlobPath);
            segments = segments.map(function (segment) {
                try {
                    segment = decodeURIComponent(segment);
                }
                catch (error) {
                }
                return segment;
            });
            return segments.join("/");
        };
        return FlobUploadGroupActivity;
    }(FlobGroupActivity_1.default));
    FlobUploadGroupActivity.EnumerationTitle = "Uploading files..."; // Localize
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobUploadGroupActivity;
});

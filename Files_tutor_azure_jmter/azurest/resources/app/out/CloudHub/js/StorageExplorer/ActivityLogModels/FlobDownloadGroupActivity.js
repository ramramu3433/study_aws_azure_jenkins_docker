/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/Utilities", "StorageExplorer/Common/DiskFolderCreator", "StorageExplorer/ActivityLogModels/FlobDownloadActivity", "ActivityLog/StorageExplorer/FlobGroupActivity", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/GroupedActivityWithConflicts", "ActivityLog/StorageExplorer/SelectSequence", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, Utilities, DiskFolderCreator_1, FlobDownloadActivity_1, FlobGroupActivity_1, ExtendedStatus, GroupedActivityWithConflicts_1, SelectSequence, StorageExplorerUtilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for downloads
     */
    var FlobDownloadGroupActivity = (function (_super) {
        __extends(FlobDownloadGroupActivity, _super);
        function FlobDownloadGroupActivity(enumerationTitle, titleTemplate, sourceContainer, sourceFlobFolder, destDiskFolder, defaultOverwriteIfExists, 
            // Null to download to same filename as the flob short name
            transformDownloadFileNameAndPath, activityLogManager, host, telemetryInfo) {
            var _this = _super.call(this, enumerationTitle, titleTemplate, GroupedActivityWithConflicts_1.default.dialogOperationTypes.download, host, activityLogManager, telemetryInfo) || this;
            _this._showInFolderEnabled = false;
            /**
             * @override
             */
            _this._canHaveConflicts = true;
            _this._enumerationTitle = enumerationTitle;
            _this._sourceContainer = sourceContainer;
            _this._sourceFlobFolder = sourceFlobFolder;
            _this._destDiskFolder = destDiskFolder;
            _this._defaultOverwriteIfExists = defaultOverwriteIfExists;
            var defaultTransform = _this._getLegalFilePath;
            _this._transformDownloadFileNameAndPath = function (relativePath) {
                var newPath = transformDownloadFileNameAndPath ?
                    transformDownloadFileNameAndPath(relativePath) :
                    relativePath;
                return _this._getLegalFilePath(newPath);
            };
            // Due to the asynchronous nature of node.js and its filesystem
            // module, we want to be careful to not make a bunch of
            // asynchronous calls to check for existence and create folders,
            // so we cache the results for each check.
            _this._diskFolderCreator = new DiskFolderCreator_1.default(_this._host);
            return _this;
        }
        FlobDownloadGroupActivity.prototype.start = function (items) {
            var _this = this;
            var enumerationActivity = this._createEnumerationActivity(this._enumerationTitle, "StorageExplorer.Discover" + this.TelemetryFlobType + "sToDownload", function (cancelToken) { return _this._enumerateItemsToDownload(items, cancelToken); });
            this.addTemporaryChildActivity(enumerationActivity);
        };
        FlobDownloadGroupActivity.prototype._showItemInFolder = function (path) {
            this._host.executeOperation("Environment.showItemInFolder", [path]);
        };
        /**
         * @override
         */
        FlobDownloadGroupActivity.prototype.onChildPropertyChanged = function (child, propertyName) {
            var _this = this;
            _super.prototype.onChildPropertyChanged.call(this, child, propertyName);
            if (child.extendedStatus() === ExtendedStatus.Success) {
                // If it's a download activity (i.e., if it's not the enumeration
                // activity).
                if (child instanceof FlobDownloadActivity_1.default && !this._showInFolderEnabled) {
                    var destinationFilePath = child.destinationFilePath;
                    // Once any child is downloaded, display the "Open" action
                    this._addOrRemoveAction(FlobDownloadGroupActivity.OpenFolderDisplayName, function () { return _this._showItemInFolder(destinationFilePath); }, true);
                    this._showInFolderEnabled = true;
                }
            }
        };
        /**
         * @override
         */
        FlobDownloadGroupActivity.prototype._getSourceDisplayName = function () {
            return this._getLocationDisplayPath(this._sourceContainer, this._sourceFlobFolder);
        };
        /**
         * @override
         */
        FlobDownloadGroupActivity.prototype._getDestDisplayName = function () {
            return this._destDiskFolder;
        };
        FlobDownloadGroupActivity.prototype._getDownloadPath = function (flobPath) {
            // Get download path, including any subfolders underneath
            //   the current folder in the view.
            var relativeBlobPath = this._getRelativeFlobPath(this._sourceFlobFolder, flobPath);
            var downloadRelativePath = this._transformDownloadFileNameAndPath(relativeBlobPath);
            var downloadPath = Utilities.JoinFilePaths(this._destDiskFolder, downloadRelativePath);
            downloadPath = StorageExplorerUtilities.convertBlobPathToFilePath(downloadPath);
            return downloadPath;
        };
        ;
        FlobDownloadGroupActivity.prototype._getRelativeFlobPath = function (rootFlobPath, flobPath) {
            // Normalize both
            rootFlobPath = StorageExplorerUtilities.ensureTrailingSlash(rootFlobPath.replace(/\\/g, "/"));
            flobPath = flobPath.replace(/\\/g, "/");
            if (flobPath.length > rootFlobPath.length) {
                if (flobPath.substr(0, rootFlobPath.length).toLowerCase() === rootFlobPath.toLowerCase()) {
                    return flobPath.substr(rootFlobPath.length);
                }
            }
            return flobPath;
        };
        /**
         * Adds an activity to enumerate all blobs to download
         */
        FlobDownloadGroupActivity.prototype._enumerateItemsToDownload = function (items, cancelToken) {
            var _this = this;
            return this.createFlobDiscoverySequence(this._sourceContainer, items, false /* requireSize */, "" /* basePath */, cancelToken)
                .then(function (flobsSequence) {
                // Transform this sequence into one that creates activity log entries for the items to download
                var activitiesSequence = new SelectSequence(flobsSequence, function (flob) { return _this._createDownloadActivity(flob); });
                // Set up to automatically create each download as a child activity when ready
                _this.addChildSequence(activitiesSequence);
                _this.areAllChildrenAdded = true;
                // The enumeration activity isn't completed until all possible items have been added to the sequence
                // (although not necessarily completed or even started).
                return activitiesSequence.waitUntilAddItemsAdded();
            });
        };
        FlobDownloadGroupActivity.prototype._getLegalFilePath = function (relativeBlobPath) {
            var _this = this;
            var segments = Utilities.splitPath(relativeBlobPath);
            segments = segments.map(function (segment) {
                // Encode names/folders` which don't appear to be safe
                return _this._isFileOrFolderNameFullySafe(segment) ?
                    segment :
                    _this._encodeUnsafeName(segment);
            });
            return segments.join(Utilities.getEnvironmentPathSeparator());
        };
        FlobDownloadGroupActivity.prototype._encodeUnsafeName = function (name) {
            var encoded = encodeURIComponent(name);
            // encodeURIComponent doesn't handle '*'
            encoded = encoded.replace(/[*]/g, "%2A");
            return encoded;
        };
        /**
         * Determines if a given file/folder name (not path) is definitely
         * in the safe range of values.  Returning false does not necessarily mean
         * it's illegal (determining that correctly is very hard), just that it's
         * not in the range we consider in the fully safe whitelisted range.
         */
        FlobDownloadGroupActivity.prototype._isFileOrFolderNameFullySafe = function (name) {
            if (name.match(/(^[\s.])|([\s.]$)/)) {
                // Begins or ends with whitespace or period
                return false;
            }
            // Otherwise, contains only safe chracters for all platforms
            //  (not perfect, but I think good enough)
            return !!name.match(/^[ !@#$%^&()\-_=+[\]{};'.0-9a-zA-Z~`\u00a1-\uffffff]*$/);
        };
        return FlobDownloadGroupActivity;
    }(FlobGroupActivity_1.default));
    FlobDownloadGroupActivity.OpenFolderDisplayName = "Show in folder"; // localize
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobDownloadGroupActivity;
});

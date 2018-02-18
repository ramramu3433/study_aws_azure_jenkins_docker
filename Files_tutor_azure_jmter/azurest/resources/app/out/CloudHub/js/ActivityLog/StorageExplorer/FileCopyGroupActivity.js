/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "StorageExplorer/ActivityLogModels/DirectoryCopyActivity", "ActivityLog/StorageExplorer/FileCopyActivity", "ActivityLog/StorageExplorer/FlobCopyGroupActivity", "Common/Utilities"], function (require, exports, AzureStorageUtilities, DirectoryCopyActivity_1, FileCopyActivity_1, FlobCopyGroupActivity_1, Utilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for Azure file copies or renames
     */
    var FileCopyGroupActivity = (function (_super) {
        __extends(FileCopyGroupActivity, _super);
        function FileCopyGroupActivity(copyType, sourceContainer, sourceAccountUri, sourceShareSasToken, sourceFolder, destContainer, destFolder, host, activityLogManager, telemetry, mungeDestinationName, // No munging if null
            listViewModel, copyTitleTemplate, renameTitleTemplate, overwrite) {
            return _super.call(this, copyType, FileCopyGroupActivity.CopyEnumerationTitle, FileCopyGroupActivity.RenameEnumerationTitle, null /* promoteEnumerationTitle */, copyTitleTemplate || FileCopyGroupActivity.CopyTitleTemplate, renameTitleTemplate || FileCopyGroupActivity.RenameTitleTemplate, null /* promoteTitleTemplate */, sourceContainer, sourceAccountUri, sourceShareSasToken, sourceFolder, destContainer, destFolder, host, listViewModel, activityLogManager, {
                telemetryEventName: "StorageExplorer.FileCopyGroupActivity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.File
            }, mungeDestinationName, overwrite) || this;
        }
        FileCopyGroupActivity.prototype._createCopyActivity = function (sourcePath, sourceSnapshot, /* unused */ destPath, overwrite) {
            var activity;
            var isFolder = Utilities.isPathAFolder(destPath);
            if (isFolder) {
                // Destination is a directory - create it (even if the source directory is empty)
                activity = new DirectoryCopyActivity_1.default(this._host, this._copyType, this._sourceContainer, Utilities.getDirectoryFromPath(sourcePath), this._destContainer, destPath, this._listViewModel, this._telemetryInfo.telemetry);
                activity.initialize();
            }
            else {
                var fileCopyActivity = new FileCopyActivity_1.default(this._host, this._sourceContainer, this._sourceAccountUri, this._sourceContainerSasToken, sourcePath, this._destContainer, destPath, this._copyType, this._listViewModel, this._telemetryInfo.telemetry);
                activity = fileCopyActivity;
                activity.initialize();
                if (overwrite) {
                    fileCopyActivity.overwrite();
                }
            }
            return activity;
        };
        return FileCopyGroupActivity;
    }(FlobCopyGroupActivity_1.default));
    FileCopyGroupActivity.CopyEnumerationTitle = "Copying files..."; // Localize
    FileCopyGroupActivity.RenameEnumerationTitle = "Renaming files..."; // Localize
    FileCopyGroupActivity.CopyTitleTemplate = {
        // Localize
        singularDoing: "Copying file from '%0s' to '%1s'",
        pluralDoing: "Copying %0s files/directories from '%1s' to '%2s'",
        singularDone: "Copied file from '%0s' to '%1s'",
        pluralDone: "Copied %0s files/directories from '%1s' to '%2s'"
    };
    FileCopyGroupActivity.RenameTitleTemplate = {
        // Localize
        singularDoing: "Renaming file from '%0s' to '%1s'",
        pluralDoing: "Renaming %0s files/directories from '%1s' to '%2s'",
        singularDone: "Renamed file from '%0s' to '%1s'",
        pluralDone: "Renamed %0s files/directories from '%1s' to '%2s'"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileCopyGroupActivity;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "StorageExplorer/ActivityLogModels/DirectoryDeleteActivity", "StorageExplorer/ActivityLogModels/FileDeleteActivity", "StorageExplorer/ActivityLogModels/FlobDeleteGroupActivity", "ActivityLog/StorageExplorer/FileFlobContainer", "Common/Utilities"], function (require, exports, AzureStorageUtilities, DirectoryDeleteActivity_1, FileDeleteActivity_1, FlobDeleteGroupActivity_1, FileFlobContainer_1, Utilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for downloads
     */
    var FileDeleteGroupActivity = (function (_super) {
        __extends(FileDeleteGroupActivity, _super);
        function FileDeleteGroupActivity(host, activityLogManager, fileListViewModel, shareReference, telemetry) {
            return _super.call(this, host, activityLogManager, {
                telemetryEventName: "StorageExplorer.FileDeleteGroupActivity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.File
            }, FileDeleteGroupActivity.EnumerationTitle, FileDeleteGroupActivity.TitleTemplate, new FileFlobContainer_1.default(host, shareReference), fileListViewModel) || this;
        }
        /**
         * @override
         */
        FileDeleteGroupActivity.prototype._createDeleteActivity = function (item) {
            var activity;
            var isFolder = Utilities.isPathAFolder(item.fullName);
            if (isFolder) {
                activity = new DirectoryDeleteActivity_1.default(this._host, this._container, item.fullName, this._listViewModel, this._telemetryInfo.telemetry);
                activity.initialize();
            }
            else {
                activity = new FileDeleteActivity_1.default(this._host, this._container, item.fullName, this._listViewModel, this._telemetryInfo.telemetry);
                activity.initialize();
            }
            return activity;
        };
        ;
        return FileDeleteGroupActivity;
    }(FlobDeleteGroupActivity_1.default));
    FileDeleteGroupActivity.EnumerationTitle = "Deleting files..."; // Localize
    FileDeleteGroupActivity.TitleTemplate = {
        // Localize
        singularDoing: "Deleting file from '%0s'",
        pluralDoing: "Deleting %0s files/directories from '%1s'",
        singularDone: "Deleted file from '%0s'",
        pluralDone: "Deleted %0s files/directories from '%1s'"
    };
    return FileDeleteGroupActivity;
});

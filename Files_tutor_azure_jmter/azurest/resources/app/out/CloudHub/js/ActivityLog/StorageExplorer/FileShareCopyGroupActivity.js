/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/FileCopyGroupActivity"], function (require, exports, FileCopyGroupActivity_1) {
    "use strict";
    /**
     * Class to handle a group activity log entry for file share copies or renames
     */
    var FileShareContainerGroupActivity = (function (_super) {
        __extends(FileShareContainerGroupActivity, _super);
        function FileShareContainerGroupActivity(copyType, sourceContainer, sourceContainerUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, host, activityLogManager, telemetry, mungeDestinationName, // No munging if null
            fileListViewModel) {
            var _this = _super.call(this, copyType, sourceContainer, sourceContainerUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, host, activityLogManager, telemetry, mungeDestinationName, fileListViewModel, FileShareContainerGroupActivity.CopyShareTitleTemplate, FileShareContainerGroupActivity.RenameShareTitleTemplate) || this;
            /**
             * @override
             */
            _this._canHaveConflicts = true;
            return _this;
        }
        return FileShareContainerGroupActivity;
    }(FileCopyGroupActivity_1.default));
    FileShareContainerGroupActivity.CopyShareTitleTemplate = {
        // Localize
        singularDoing: "Copying file share with 1 file from '%0s' to '%1s'",
        pluralDoing: "Copying file share with %0s files/directories from '%1s' to '%2s'",
        singularDone: "Copied file share with 1 file/directory from '%0s' to '%1s'",
        pluralDone: "Copied file share with %0s files/directories from '%1s' to '%2s'"
    };
    FileShareContainerGroupActivity.RenameShareTitleTemplate = {
        // Localize
        singularDoing: "Renaming file share with 1 file/directory from '%0s' to '%1s'",
        pluralDoing: "Renaming file share with %0s files/directories from '%1s' to '%2s'",
        singularDone: "Renamed file share with 1 file/directory from '%0s' to '%1s'",
        pluralDone: "Renamed file share with %0s files/directories from '%1s' to '%2s'"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileShareContainerGroupActivity;
});

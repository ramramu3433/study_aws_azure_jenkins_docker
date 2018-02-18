/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/BlobCopyGroupActivity"], function (require, exports, BlobCopyGroupActivity_1) {
    "use strict";
    /**
     * Class to handle a group activity log entry for blob container copies or renames
     */
    var BlobContainerCopyGroupActivity = (function (_super) {
        __extends(BlobContainerCopyGroupActivity, _super);
        function BlobContainerCopyGroupActivity(copyType, sourceContainer, sourceContainerUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, host, activityLogManager, telemetry, mungeDestinationName, // No munging if null
            blobListViewModel) {
            return _super.call(this, copyType, sourceContainer, sourceContainerUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, host, activityLogManager, telemetry, mungeDestinationName, blobListViewModel, BlobContainerCopyGroupActivity.CopyContainerTitleTemplate, BlobContainerCopyGroupActivity.RenameContainerTitleTemplate) || this;
        }
        return BlobContainerCopyGroupActivity;
    }(BlobCopyGroupActivity_1.default));
    BlobContainerCopyGroupActivity.CopyContainerTitleTemplate = {
        // Localize
        singularDoing: "Copying blob container and 1 blob from '%0s' to '%1s'",
        pluralDoing: "Copying blob container and %0s blobs from '%1s' to '%2s'",
        singularDone: "Copied blob container and 1 blob from '%0s' to '%1s'",
        pluralDone: "Copied blob container and %0s blobs from '%1s' to '%2s'"
    };
    BlobContainerCopyGroupActivity.RenameContainerTitleTemplate = {
        // Localize
        singularDoing: "Renaming blob container and 1 blob from '%0s' to '%1s'",
        pluralDoing: "Renaming blob container and %0s blobs from '%1s' to '%2s'",
        singularDone: "Renamed blob container and 1 blob from '%0s' to '%1s'",
        pluralDone: "Renamed blob container and %0s blobs from '%1s' to '%2s'"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobContainerCopyGroupActivity;
});

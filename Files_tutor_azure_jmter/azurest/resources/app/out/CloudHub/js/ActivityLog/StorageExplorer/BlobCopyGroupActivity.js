/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "ActivityLog/StorageExplorer/BlobCopyActivity", "ActivityLog/StorageExplorer/FlobCopyActivity", "ActivityLog/StorageExplorer/FlobCopyGroupActivity"], function (require, exports, AzureStorageUtilities, BlobCopyActivity_1, FlobCopyActivity_1, FlobCopyGroupActivity_1) {
    "use strict";
    /**
     * Class to handle a group activity log entry for blob copies or renames
     */
    var BlobCopyGroupActivity = (function (_super) {
        __extends(BlobCopyGroupActivity, _super);
        function BlobCopyGroupActivity(copyType, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, host, activityLogManager, telemetry, mungeDestinationName, // No munging if null
            blobListViewModel, copyTitleTemplate, renameTitleTemplate, promoteTitleTemplate, overwrite) {
            if (overwrite === void 0) { overwrite = false; }
            var _this = _super.call(this, copyType, BlobCopyGroupActivity.CopyEnumerationTitle, BlobCopyGroupActivity.RenameEnumerationTitle, BlobCopyGroupActivity.PromoteEnumerationTitle, copyTitleTemplate || BlobCopyGroupActivity.CopyTitleTemplate, renameTitleTemplate || BlobCopyGroupActivity.RenameTitleTemplate, promoteTitleTemplate || BlobCopyGroupActivity.PromoteTitleTemplate, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, host, blobListViewModel, activityLogManager, {
                telemetryEventName: "StorageExplorer.Blob" + FlobCopyActivity_1.default.getTelemetryCopyType(copyType) + "GroupActivity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.Blob
            }, mungeDestinationName, overwrite) || this;
            /**
             * @override
             */
            _this._canHaveConflicts = true;
            return _this;
        }
        BlobCopyGroupActivity.prototype._createCopyActivity = function (sourcePath, sourceSnapshot, destPath, overwrite) {
            var activity = new BlobCopyActivity_1.default(this._host, this._sourceContainer, this._sourceAccountUri, this._sourceContainerSasToken, sourcePath, sourceSnapshot, this._destContainer, destPath, this._copyType, this._listViewModel, this._telemetryInfo.telemetry, overwrite);
            activity.initialize();
            return activity;
        };
        ;
        return BlobCopyGroupActivity;
    }(FlobCopyGroupActivity_1.default));
    BlobCopyGroupActivity.CopyEnumerationTitle = "Copying blobs..."; // Localize
    BlobCopyGroupActivity.RenameEnumerationTitle = "Renaming blobs..."; // Localize
    BlobCopyGroupActivity.PromoteEnumerationTitle = "Promoting blobs..."; // Localize
    BlobCopyGroupActivity.CopyTitleTemplate = {
        // Localize
        singularDoing: "Copying blob from '%0s' to '%1s'",
        pluralDoing: "Copying %0s blobs from '%1s' to '%2s'",
        singularDone: "Copied blob from '%0s' to '%1s'",
        pluralDone: "Copied %0s blobs from '%1s' to '%2s'"
    };
    BlobCopyGroupActivity.RenameTitleTemplate = {
        // Localize
        singularDoing: "Renaming blob from '%0s' to '%1s'",
        pluralDoing: "Renaming %0s blobs from '%1s' to '%2s'",
        singularDone: "Renamed blob from '%0s' to '%1s'",
        pluralDone: "Renamed %0s blobs from '%1s' to '%2s'"
    };
    BlobCopyGroupActivity.PromoteTitleTemplate = {
        // Localize
        singularDoing: "Promoting blob '%0s'",
        pluralDoing: "Promoting blobs '%0s'",
        singularDone: "Promoted blob '%0s'",
        pluralDone: "Promoted blobs '%0s'"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobCopyGroupActivity;
});

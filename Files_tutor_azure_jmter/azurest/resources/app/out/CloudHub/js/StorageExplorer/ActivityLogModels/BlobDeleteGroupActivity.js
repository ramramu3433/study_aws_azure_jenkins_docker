/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "Common/AzureStorageUtilities", "StorageExplorer/ActivityLogModels/BlobDeleteActivity", "ActivityLog/StorageExplorer/BlobFlobContainer", "StorageExplorer/ActivityLogModels/FlobDeleteGroupActivity"], function (require, exports, _string, AzureStorageUtilities, BlobDeleteActivity_1, BlobFlobContainer_1, FlobDeleteGroupActivity_1) {
    "use strict";
    /**
     * Class to handle a group activity log entry for downloads
     */
    var BlobDeleteGroupActivity = (function (_super) {
        __extends(BlobDeleteGroupActivity, _super);
        function BlobDeleteGroupActivity(host, activityLogManager, listViewModel, containerReference, telemetry) {
            return _super.call(this, host, activityLogManager, {
                telemetryEventName: "StorageExplorer.BlobDeleteGroupActivity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.Blob
            }, BlobDeleteGroupActivity.EnumerationTitle, BlobDeleteGroupActivity.TitleTemplate, new BlobFlobContainer_1.default(host, containerReference), listViewModel) || this;
        }
        BlobDeleteGroupActivity.prototype._getTitle = function (count) {
            return count === 1 ?
                "Deleting 1 blob" :
                _string.sprintf("Deleting %d blobs", count); // Localize
        };
        /**
         * @override
         */
        BlobDeleteGroupActivity.prototype._createDeleteActivity = function (blob) {
            var activity = new BlobDeleteActivity_1.default(this._host, this._container, blob.fullName, this._listViewModel, blob.snapshot, this._telemetryInfo.telemetry);
            activity.initialize();
            return activity;
        };
        return BlobDeleteGroupActivity;
    }(FlobDeleteGroupActivity_1.default));
    BlobDeleteGroupActivity.EnumerationTitle = "Deleting blobs..."; // Localize
    BlobDeleteGroupActivity.TitleTemplate = {
        // Localize
        singularDoing: "Deleting blob from '%0s'",
        pluralDoing: "Deleting %0s blobs from '%1s'",
        singularDone: "Deleted blob from '%0s'",
        pluralDone: "Deleted %0s blobs from '%1s'"
    };
    return BlobDeleteGroupActivity;
});

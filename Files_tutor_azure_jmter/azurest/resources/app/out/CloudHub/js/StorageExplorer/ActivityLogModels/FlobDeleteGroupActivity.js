/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/ActivityLogModels/FlobDeleter", "ActivityLog/StorageExplorer/FlobGroupActivity", "ActivityLog/StorageExplorer/SelectSequence"], function (require, exports, FlobDeleter, FlobGroupActivity_1, SelectSequence) {
    "use strict";
    /**
     * Class to handle a group activity log entry for downloads
     */
    var FlobDeleteGroupActivity = (function (_super) {
        __extends(FlobDeleteGroupActivity, _super);
        function FlobDeleteGroupActivity(host, activityLogManager, telemetryInfo, enumerationTitle, titleTemplate, container, listViewModel) {
            var _this = _super.call(this, enumerationTitle, titleTemplate, null, // resolveDialogOperationType
            host, activityLogManager, telemetryInfo) || this;
            /**
             * @override
             */
            _this._canHaveConflicts = false;
            _this._container = container;
            _this._listViewModel = listViewModel;
            _this._enumerationTitle = enumerationTitle;
            return _this;
        }
        FlobDeleteGroupActivity.prototype.start = function () {
            var _this = this;
            this.allCompletedOrCancelledPromise.then(function () {
                // After all the deletions have completed, check each folder in the view
                // and remove any which are now empty.
                // Trying to do this check along the way, without having a full list of
                // all blobs in memory at one time, is difficult.  This will handle most
                // scenarios well enough.
                FlobDeleter.removeEmptyVirtualFoldersFromView(_this._container, _this._listViewModel);
            });
            var enumerationActivity = this._createEnumerationActivity(this._enumerationTitle, "StorageExplorer.Discover" + this.TelemetryFlobType + "sToDelete", this._enumerateItemsToDelete.bind(this));
            this.addTemporaryChildActivity(enumerationActivity);
        };
        /**
         * @override
         */
        FlobDeleteGroupActivity.prototype._getSourceDisplayName = function () {
            return this._getLocationDisplayPath(this._container, this._listViewModel.currentFolderPath());
        };
        /**
         * @override
         */
        FlobDeleteGroupActivity.prototype._getDestDisplayName = function () {
            return null;
        };
        /**
         * Enumerate all blobs/files to delete, and set them up to be automatically performed by the group activity
         */
        FlobDeleteGroupActivity.prototype._enumerateItemsToDelete = function (cancelToken) {
            var _this = this;
            return this.createFlobDiscoverySequence(this._container, this._listViewModel.selected(), false /* requireSize */, "" /* basePath */, cancelToken)
                .then(function (flobsSequence) {
                // Create a sequence that creates activity log entries for the items to delete
                var activitiesSequence = new SelectSequence(flobsSequence, function (flob) {
                    return _this._createDeleteActivity(flob);
                });
                // Set up to automatically create each deletion as a child activity when ready
                _this.addChildSequence(activitiesSequence);
                _this.areAllChildrenAdded = true;
                return activitiesSequence.waitUntilAddItemsAdded();
            });
        };
        return FlobDeleteGroupActivity;
    }(FlobGroupActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobDeleteGroupActivity;
});

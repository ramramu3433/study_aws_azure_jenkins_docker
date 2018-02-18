/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "ActivityLog/StorageExplorer/ActionBasedActivity", "Common/Debug", "Providers/StorageExplorer/ProviderWrappers/FilePW", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, _string, ActionBasedActivity_1, Debug, FilePW_1, StorageExplorerUtilities) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an Azure directory creation operation
     */
    var DirectoryBaseActivity = (function (_super) {
        __extends(DirectoryBaseActivity, _super);
        function DirectoryBaseActivity(host, listViewModel, title, telemetryInfo) {
            var _this = _super.call(this, title, telemetryInfo) || this;
            _this._provider = new FilePW_1.default(host);
            _this._listViewModel = listViewModel;
            return _this;
        }
        /**
         * @override
         */
        DirectoryBaseActivity.prototype._isCancelableCore = function () {
            // No cancel once started
            return false;
        };
        DirectoryBaseActivity.prototype._createDirectory = function (container, directoryPath) {
            var _this = this;
            var shareReference = {
                connectionString: container.getConnectionString(),
                shareName: container.getName()
            };
            var createPromise = this._provider.createDirectory(shareReference, directoryPath, true /*createParentDirectories*/);
            createPromise.then(function () {
                return _this._showDestinationInView(shareReference, directoryPath);
            });
            return createPromise;
        };
        DirectoryBaseActivity.prototype._createDirectoryFromExisting = function (sourceContainer, sourceDirectory, targetContainer, targetDirectory) {
            var _this = this;
            var sourceReference = {
                connectionString: sourceContainer.getConnectionString(),
                shareName: sourceContainer.getName()
            };
            var targetReference = {
                connectionString: targetContainer.getConnectionString(),
                shareName: targetContainer.getName()
            };
            var copyPromise = this._provider.createDirectoryFromExisting(sourceReference, sourceDirectory, targetReference, targetDirectory);
            copyPromise.then(function () { return _this._showDestinationInView(targetReference, targetDirectory); });
            return copyPromise;
        };
        DirectoryBaseActivity.prototype._showDestinationInView = function (shareReference, directoryPath) {
            var _this = this;
            // Update the current view once the create is completed
            if (this._listViewModel) {
                return StorageExplorerUtilities.getFileShareItem(this._provider.host, shareReference, directoryPath, true /*isFolder*/).then(function (item) {
                    // Update view
                    _this._listViewModel.addFlobToCurrentFolder(item).then(function () {
                        _this._listViewModel.redrawTableThrottled();
                    });
                });
            }
        };
        /**
         * Is <descendent> a descendent of <ancestor>?
         */
        DirectoryBaseActivity.prototype._isDescendentOf = function (descendent, ancestorDirectory) {
            return _string.startsWith(descendent.toLowerCase(), ancestorDirectory.toLowerCase());
        };
        DirectoryBaseActivity.prototype._getPathToBeDeletedByActivity = function (activity) {
            var deletionActivity = activity;
            // Does it actually have the getPathToBeDeleted method?
            var isDeletionActivity = !!deletionActivity.getAzureFilePathToBeDeleted;
            return isDeletionActivity && deletionActivity.getAzureFilePathToBeDeleted();
        };
        /**
         * @override
         */
        DirectoryBaseActivity.prototype.isReadyToStart = function (incompleteActivities) {
            var _this = this;
            var directoryDeletedByThisActivity = this._getPathToBeDeletedByActivity(this);
            if (directoryDeletedByThisActivity) {
                // We have to wait until all files and directories in this directory have been deleted before this
                // activity can be allowed to start, otherwise it will fail when trying to delete the directory.
                //
                // Since we guarantee that our order of deletion activities is depth first, that means we just need
                // to check the currently started but incomplete activities to make sure none of them are for files/folders that are
                // descendents of this directory ('cause if it comes after us in the order, then it can't be a descendent of us).
                var isDependentOnActiveActivity = false;
                Debug.log("");
                incompleteActivities.forEach(function (incompleteActivity) {
                    if (incompleteActivity !== _this) {
                        var pathToBeDeletedByIncompleteActivity = _this._getPathToBeDeletedByActivity(incompleteActivity);
                        if (pathToBeDeletedByIncompleteActivity
                            && _this._isDescendentOf(pathToBeDeletedByIncompleteActivity, directoryDeletedByThisActivity)) {
                            // The incomplete activity will delete a descendent of the directory we want to delete, so we can't start until it finishes
                            Debug.log("Waiting for deletion of " + pathToBeDeletedByIncompleteActivity + " before deleting " + directoryDeletedByThisActivity);
                            isDependentOnActiveActivity = true;
                        }
                    }
                });
                return !isDependentOnActiveActivity;
            }
            else {
                return true;
            }
        };
        return DirectoryBaseActivity;
    }(ActionBasedActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DirectoryBaseActivity;
});

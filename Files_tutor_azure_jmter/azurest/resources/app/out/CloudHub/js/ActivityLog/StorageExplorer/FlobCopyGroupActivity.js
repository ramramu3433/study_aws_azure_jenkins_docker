/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/CopyType", "StorageExplorer/ActivityLogModels/FlobDeleter", "ActivityLog/StorageExplorer/FlobCopyActivity", "ActivityLog/StorageExplorer/FlobGroupActivity", "ActivityLog/StorageExplorer/GroupedActivityWithConflicts", "ActivityLog/StorageExplorer/SelectSequence", "ActivityLog/StorageExplorer/SimpleActionBasedActivity", "Common/Utilities"], function (require, exports, CopyType_1, FlobDeleter, FlobCopyActivity_1, FlobGroupActivity_1, GroupedActivityWithConflicts_1, SelectSequence, SimpleActionBasedActivity_1, Utilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for blob copies or renames
     */
    var FlobCopyGroupActivity = (function (_super) {
        __extends(FlobCopyGroupActivity, _super);
        function FlobCopyGroupActivity(copyType, copyEnumerationTitle, renameEnumerationTitle, promoteEnumerationTitle, copyTitleTemplate, renameTitleTemplate, promoteTitleTemplate, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFolder, destContainer, destFolder, host, listViewModel, activityLogManager, telemetryInfo, mungeDestinationName, // No munging if null
            overwrite) {
            var _this = _super.call(this, copyType === CopyType_1.default.Rename ? renameEnumerationTitle : (copyType === CopyType_1.default.Promote ? promoteEnumerationTitle : copyEnumerationTitle), copyType === CopyType_1.default.Rename ? renameTitleTemplate : (copyType === CopyType_1.default.Promote ? promoteTitleTemplate : copyTitleTemplate), GroupedActivityWithConflicts_1.default.dialogOperationTypes.copy, host, activityLogManager, telemetryInfo) || this;
            /**
             * @override
             */
            _this._canHaveConflicts = true;
            _this._copyType = copyType;
            _this._enumerationTitle = _this.title();
            _this._sourceContainer = sourceContainer;
            _this._sourceAccountUri = sourceAccountUri;
            _this._sourceContainerSasToken = sourceContainerSasToken;
            _this._sourceFolder = sourceFolder;
            _this._destContainer = destContainer;
            _this._destFolder = destFolder;
            _this._listViewModel = listViewModel;
            _this._overwrite = overwrite;
            // Do no munging of destination name if null passed in
            _this._mungeDestinationName = mungeDestinationName || (function (destPath) { return destPath; });
            if (FlobCopyActivity_1.default._shouldDeleteOriginalItemsAfterCopy(_this._copyType)
                && _this._sourceContainer.supportsVirtualFolders()) {
                // After all the renames have completed, check each folder in the view
                // and remove any which are now empty.
                // Trying to do this check along the way, without having a full list of
                // all blobs in memory at one time, is difficult.  This will handle most
                // scenarios well enough.
                _this.allCompletedOrCancelledPromise.then(function () {
                    FlobDeleter.removeEmptyVirtualFoldersFromView(_this._sourceContainer, _this._listViewModel);
                });
            }
            return _this;
        }
        FlobCopyGroupActivity.prototype.startCopyingItems = function (items, basePath, completionSequence) {
            var _this = this;
            var enumerationActivity = this._createEnumerationActivity(this._enumerationTitle, "StorageExplorer.Discover" + this.TelemetryFlobType + "sTo" + this.TelemetryCopyType, function (cancelToken) { return _this._enumerateItemsToCopy(items, basePath, completionSequence, cancelToken); });
            this.addTemporaryChildActivity(enumerationActivity);
        };
        FlobCopyGroupActivity.prototype.startCopyingContainer = function (storageAccountNodeId, groupNodeType, copyContainerProperties, completionSequence, onContainerCreated) {
            var _this = this;
            // First ensure the container has been created
            var createContainerActivity = this._createActivityToCreateDestinationContainer(storageAccountNodeId, groupNodeType, copyContainerProperties);
            this.addTemporaryChildActivity(createContainerActivity);
            createContainerActivity.success
                .then(function () {
                if (onContainerCreated) {
                    onContainerCreated();
                }
                // Then start copying the items in the container
                _this.startCopyingItems(null, "", completionSequence);
            });
        };
        Object.defineProperty(FlobCopyGroupActivity.prototype, "TelemetryCopyType", {
            /**
             * Returns "Copy" or "Rename" (to be used only for telemetry/internal use, not end-user strings)
             */
            get: function () {
                return FlobCopyActivity_1.default.getTelemetryCopyType(this._copyType);
            },
            enumerable: true,
            configurable: true
        });
        FlobCopyGroupActivity.prototype._getSourceDisplayName = function () {
            return this._getLocationDisplayPath(this._sourceContainer, this._sourceFolder);
        };
        FlobCopyGroupActivity.prototype._getDestDisplayName = function () {
            return this._getLocationDisplayPath(this._destContainer, this._destFolder);
        };
        /**
         * Adds an activity to enumerate all blobs to copy
         *
         * completionSequence: Sequence of items to add after the
         * enumeration completes (but before all the activities complete).
         */
        FlobCopyGroupActivity.prototype._enumerateItemsToCopy = function (items, basePath, completionSequence, cancelToken) {
            var _this = this;
            return this.createFlobDiscoverySequence(this._sourceContainer, items, false /* requireSize */, basePath, cancelToken)
                .then(function (flobsSequence) {
                // Create a sequence that creates activity log entries for the items to copy
                var activitiesSequence = new SelectSequence(flobsSequence, function (flob) {
                    var flobPathRelativeToSource = flob.fullName.substr(_this._sourceFolder.length);
                    var sourcePath = Utilities.JoinAzurePaths(_this._sourceFolder, flobPathRelativeToSource);
                    var sourceSnapshot = flob.snapshot;
                    var destPath = Utilities.JoinAzurePaths(_this._destFolder, flobPathRelativeToSource);
                    var mungedDestPath = _this._mungeDestinationName(destPath);
                    return _this._createCopyActivity(sourcePath, sourceSnapshot, mungedDestPath, _this._overwrite);
                });
                // Set up to automatically create each copy as a child activity when ready
                _this.addChildSequence(activitiesSequence);
                // Add any other requested sequences
                if (completionSequence) {
                    _this.addChildSequence(completionSequence);
                }
                _this.areAllChildrenAdded = true;
                return activitiesSequence.waitUntilAddItemsAdded();
            });
        };
        /**
         * Create the activity of initializing the destination container for paste blob container.
         * If there is no such container, create one. Otherwise, get the container and show in the list.
         */
        FlobCopyGroupActivity.prototype._createActivityToCreateDestinationContainer = function (storageAccountNodeId, groupNodeType, copyContainerProperties) {
            var _this = this;
            var initializeAction = function () {
                return _this._destContainer.exists()
                    .then(function (exists) {
                    if (!exists) {
                        if (copyContainerProperties) {
                            return _this._sourceContainer.copy(storageAccountNodeId, groupNodeType, _this._destContainer, true /* doNotOpenInEditor */);
                        }
                        else {
                            return _this._destContainer.safeCreate(storageAccountNodeId, groupNodeType, true /* doNotOpenInEditor */);
                        }
                    }
                });
            };
            // Localize
            var destinationName = this._destContainer.getName();
            var activity = new SimpleActionBasedActivity_1.default("Creating new container '" + destinationName + "'", // Localize
            {
                telemetryEventName: "StorageExplorer.InitializingContainerFor" + this.TelemetryFlobType + "Copy",
                telemetry: this._telemetryInfo.telemetry
            }, initializeAction);
            activity.initialize();
            return activity;
        };
        return FlobCopyGroupActivity;
    }(FlobGroupActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobCopyGroupActivity;
});

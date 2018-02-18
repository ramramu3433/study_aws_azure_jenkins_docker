/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/CachedSequenceBuilder", "Common/CancelSource", "ActivityLog/StorageExplorer/FlobTelemetryStats", "ActivityLog/StorageExplorer/GroupedActivityWithConflicts", "ActivityLog/StorageExplorer/SimpleActionBasedActivity", "Common/Utilities"], function (require, exports, CachedSequenceBuilder_1, CancelSource_1, FlobTelemetryStats_1, GroupedActivityWithConflicts_1, SimpleActionBasedActivity_1, Utilities) {
    "use strict";
    /**
     * Base class to handle a group activity log entry for file/blob activities
     */
    var FlobGroupActivity = (function (_super) {
        __extends(FlobGroupActivity, _super);
        function FlobGroupActivity(initialTitle, titleTemplate, resolveDialogOperationType, host, activityLogManager, telemetryInfo) {
            var _this = _super.call(this, initialTitle, resolveDialogOperationType, telemetryInfo.flobType, host, activityLogManager, telemetryInfo) || this;
            _this._titleTemplate = titleTemplate;
            _this._telemetryStats = new FlobTelemetryStats_1.default(_this._telemetryInfo.telemetry, _this._telemetryInfo.telemetryEventName, _this.TelemetryFlobType);
            return _this;
        }
        Object.defineProperty(FlobGroupActivity.prototype, "TelemetryFlobType", {
            /**
             * Returns "File" or "Blob" (to be used only for telemetry/internal use, not end-user strings)
             */
            get: function () {
                return this._telemetryInfo.flobType;
            },
            enumerable: true,
            configurable: true
        });
        FlobGroupActivity.prototype._getLocationDisplayPath = function (container, path, selectedItems) {
            return container.getLocationDisplayPath(path, selectedItems);
        };
        FlobGroupActivity.prototype.addToTelemetryStats = function (flob) {
            var size = flob.size || flob.Size;
            this.addSizeToStats(size);
        };
        FlobGroupActivity.prototype.addSizeToStats = function (size) {
            if (size !== null && size !== undefined && !isNaN(size)) {
                this._telemetryStats.add(Number(size));
            }
        };
        FlobGroupActivity.prototype.sendStatsTelemetry = function () {
            this._telemetryStats.sendTelemetry();
        };
        FlobGroupActivity.prototype._createEnumerationActivity = function (enumerationTitle, telemetryEventName, enumerate) {
            var cancelSource = new CancelSource_1.default();
            var requestCancel = function () {
                cancelSource.cancel();
                return Promise.resolve();
            };
            var activity = new SimpleActionBasedActivity_1.default(enumerationTitle, {
                telemetryEventName: telemetryEventName,
                telemetry: this._telemetryInfo.telemetry
            }, function () { return enumerate(cancelSource.token); }, requestCancel);
            activity.hideInParent = true;
            activity.initialize();
            // We don't currently handle retry well for the enumeration activity.
            activity.canRetry(false);
            return activity;
        };
        /**
         * Discovers all blobs/files/folders/directories in the given set of items, and
         * starts caching them to disk as a sequence.
         *
         * IMPORTANT: Right now, the delete Azure files/directories code depends on this code
         * processing files in strict depth-first order.
         */
        FlobGroupActivity.prototype.createFlobDiscoverySequence = function (tree, sourceItemsOrPaths, // null for entire container
            requireSize, basePath, cancelToken) {
            // Create a cache for the discovery results
            var cache = new CachedSequenceBuilder_1.default(this._host, this._telemetryInfo.telemetry);
            // Add each chunk one at a time to our cache
            var onChunkDiscovered = function (chunk) {
                return cache.addRange(chunk.flobs);
            };
            // Start enumerating in the background
            this.discoverFlobsChunked(tree, sourceItemsOrPaths, requireSize, basePath, cancelToken, onChunkDiscovered).then(function () {
                // Tell the cache there are no more items in the sequence
                cache.close();
            });
            // Start reading from the front of the cache as a sequence, and return that.  It will start enumerating once discovery starts finding items.
            return cache.read();
        };
        /**
         * Same as discoverFlobsIntoSequence, but does not create a cache on disk, just calls a callback with each chunk of results
         */
        FlobGroupActivity.prototype.discoverFlobsChunked = function (tree, sourceItemsOrPaths, // null for entire container
            requireSize, basePath, cancelToken, onChunkDiscovered) {
            var _this = this;
            var count = {
                totalFlobs: 0,
                totalFolders: 0
            };
            var onChunkDiscoveredWrapper = function (flobs) {
                // Update the count in the activity log
                var folders = flobs.filter(function (flob) { return Utilities.isPathAFolder(flob.fullName); }).length;
                count.totalFlobs += (flobs.length - folders);
                count.totalFolders += folders;
                // Gather statistics on the flobs discovered
                flobs.forEach(function (flob) { return _this.addToTelemetryStats(flob); });
                // Show count in title
                if (_this.TelemetryFlobType) {
                    _this._setTitleBasedOnCount(count.totalFlobs, false);
                }
                // Call the passed-in onChunk
                var chunk = {
                    flobs: flobs,
                    count: count
                };
                return onChunkDiscovered(chunk);
            };
            return tree.enumerateItemsRecursively(sourceItemsOrPaths, basePath, requireSize, cancelToken, onChunkDiscoveredWrapper).then(function () {
                // The enumeration has completed.
                _this._setTitleBasedOnCount(count.totalFlobs, true);
                _this.sendStatsTelemetry();
            });
        };
        /**
         * @override
         */
        FlobGroupActivity.prototype._setTitleBasedOnCount = function (count, isCountFinal) {
            _super.prototype._setTitleBasedOnCountCore.call(this, this._titleTemplate, count, isCountFinal, this._getSourceDisplayName(), this._getDestDisplayName());
        };
        return FlobGroupActivity;
    }(GroupedActivityWithConflicts_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobGroupActivity;
});

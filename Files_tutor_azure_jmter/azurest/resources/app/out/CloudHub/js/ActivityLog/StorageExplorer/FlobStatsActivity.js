/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "ActivityLog/StorageExplorer/ActionBasedActivity", "Common/CancelSource", "Common/Utilities"], function (require, exports, _string, ActionBasedActivity_1, CancelSource_1, Utilities) {
    "use strict";
    /**
     * Class to handle a group activity log entry for blob copies or renames
     */
    var FlobStatsActivity = (function (_super) {
        __extends(FlobStatsActivity, _super);
        function FlobStatsActivity(host, activityLogManager, container, items, // null for entire container
            folder, telemetryInfo) {
            var _this = _super.call(this, "Inspecting...", telemetryInfo) || this;
            _this._cancelSource = new CancelSource_1.default();
            _this._container = container;
            _this._folder = folder;
            _this._items = items;
            _this._sourceDisplayName = container.getLocationDisplayPath(folder, items);
            return _this;
        }
        FlobStatsActivity.prototype._setTitleAndMessage = function (count, isFinal) {
            var source = this._sourceDisplayName;
            var stats = this._getStatsMessage(isFinal);
            if (!this._currentError()) {
                if (isFinal) {
                    this.title("Statistics for " + source + ": " + stats);
                    this.mainMessage(null);
                }
                else {
                    var countString = String(count) + (isFinal ? "" : "+");
                    this.title(_string.sprintf(this._iterationTemplate, countString, source));
                    this.mainMessage(stats);
                }
            }
        };
        /**
         * @override
         */
        FlobStatsActivity.prototype._doActionCore = function () {
            var _this = this;
            var count = 0;
            var onChunkDiscovered = function (flobs) {
                flobs.forEach(function (flob) {
                    if (!Utilities.isPathAFolder(flob.fullName)) {
                        ++count;
                    }
                    _this._addToStatistics(flob);
                });
                _this._setTitleAndMessage(count, false);
                return Promise.resolve();
            };
            this.success.then(function () {
                // Done
                _this._setTitleAndMessage(count, true);
            });
            return this._container.enumerateItemsRecursively(this._items, this._folder, true /*requireSize*/, this._cancelSource.token, onChunkDiscovered);
        };
        /** @virtual */
        FlobStatsActivity.prototype._getStatsMessage = function (isFinal) {
            var stats = this._getStats(isFinal);
            return stats.join("; ");
        };
        /** @override */
        FlobStatsActivity.prototype._isCancelableCore = function () {
            return true;
        };
        /** @override */
        FlobStatsActivity.prototype._requestCancelCore = function () {
            this._cancelSource.cancel();
            return Promise.resolve();
        };
        return FlobStatsActivity;
    }(ActionBasedActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobStatsActivity;
});

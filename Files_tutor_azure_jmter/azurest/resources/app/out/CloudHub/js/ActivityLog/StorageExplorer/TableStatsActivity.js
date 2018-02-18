/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "ActivityLog/StorageExplorer/ActionBasedActivity", "Common/CancelSource", "Common/ConnectionString", "Common/Continuator", "StorageExplorer/Common/StorageExplorerUtilities", "Providers/StorageExplorer/ProviderWrappers/TablePW"], function (require, exports, _string, ActionBasedActivity_1, CancelSource_1, ConnectionString_1, Continuator, StorageExplorerUtilities, TablePW_1) {
    "use strict";
    var batchSize = 1000; // 1000 is a limit set by Azure
    /**
     * Class to handle a group activity log entry for blob copies or renames
     */
    var TableStatsActivity = (function (_super) {
        __extends(TableStatsActivity, _super);
        function TableStatsActivity(host, telemetry, tableReference, query) {
            if (query === void 0) { query = {}; }
            var _this = _super.call(this, "Inspecting entities...", {
                telemetryEventName: "TableStatsActivity",
                telemetry: telemetry
            }) || this;
            _this._cancelSource = new CancelSource_1.default();
            _this._stats = {
                count: 0
            };
            _this._host = host;
            _this._tablePW = new TablePW_1.default(host);
            _this._telemetry = telemetry;
            _this._tableReference = tableReference;
            _this._query = StorageExplorerUtilities.copyTableQuery(query);
            // Only need to select rowKey/partionKey in order to count entities.
            // If we want to add an option to count property names, we'll have to use the
            //   origial select.
            _this._query.select = [];
            var accountName = new ConnectionString_1.default(tableReference.connectionString).getAccountName();
            _this._sourceDisplayName = accountName + "/" + tableReference.tableName;
            if (query && query.filter) {
                _this._sourceDisplayName = _this._sourceDisplayName + " (\"" + query.filter + "\")";
            }
            return _this;
        }
        TableStatsActivity.prototype._setTitleAndMessage = function (count, isFinal) {
            var source = this._sourceDisplayName;
            var stats = this._getStats(isFinal).join("; ");
            if (isFinal) {
                this.title("Statistics for " + source + ": " + stats);
                this.mainMessage(null);
            }
            else {
                var countString = String(count) + (isFinal ? "" : "+");
                this.title(_string.sprintf("Inspecting " + countString + " entities in " + source, countString, source));
            }
        };
        /** @override */
        TableStatsActivity.prototype._doActionCore = function () {
            var _this = this;
            this.success.then(function () {
                // Done
                _this._setTitleAndMessage(_this._stats.count, true);
            });
            return Continuator.runAllContinuations(function (continuationToken) { return _this._tablePW.listEntitiesSegmented(_this._tableReference.connectionString, _this._tableReference.tableName, continuationToken, batchSize, _this._query).then(function (result) {
                _this._stats.count += result.Results.length;
                _this._setTitleAndMessage(_this._stats.count, false);
                return result.ContinuationToken;
            }); }, this._cancelSource.token);
        };
        TableStatsActivity.prototype._getStats = function (isFinal) {
            var count = this._stats.count;
            return [count + " entities"];
        };
        /** @override */
        TableStatsActivity.prototype._isCancelableCore = function () {
            return true;
        };
        /** @override */
        TableStatsActivity.prototype._requestCancelCore = function () {
            this._cancelSource.cancel();
            return Promise.resolve();
        };
        return TableStatsActivity;
    }(ActionBasedActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableStatsActivity;
});

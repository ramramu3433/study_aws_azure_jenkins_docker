/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "es6-promise", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/RetryableActivity", "Providers/StorageExplorer/ProviderWrappers/TablePW", "../../Common/Utilities"], function (require, exports, ko, rsvp, ExtendedStatus, RetryableActivity, TablePW_1, Utilities) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Class to handle the Activity Log lifecycle of table copy operation
     */
    // CONSIDER: This should inherit from ActionBasedActivity
    var TableDeleteActivity = (function (_super) {
        __extends(TableDeleteActivity, _super);
        function TableDeleteActivity(tableName, connectionString, entitiesToDelete, host, telemetry) {
            var _this = 
            // Localize
            _super.call(this, "Deleting entities...") || this;
            _this._retryable = ko.observable();
            _this._host = host;
            _this._tablePW = new TablePW_1.default(_this._host);
            _this._tableName = tableName;
            _this._connectionString = connectionString;
            _this._entitiesToDelete = entitiesToDelete || [];
            _this._telemetry = telemetry;
            _this.initialize();
            return _this;
        }
        TableDeleteActivity.prototype.start = function (accountName) {
            var _this = this;
            this.extendedStatus(ExtendedStatus.InProgress);
            this.title(this.getInProgressTitle(accountName));
            this.mainMessage(this.selectedEntitiesMessage + " selected"); // Localize
            return this._deleteEntities().then(function () {
                _this.extendedStatus(ExtendedStatus.Success);
                _this.title(_this.getFinishedTitle(accountName));
                _this.mainMessage(_this.selectedEntitiesMessage + " deleted"); // Localize
                return true;
            }).catch(function (error) {
                _this._handleError(error);
            });
        };
        TableDeleteActivity.prototype._deleteEntities = function () {
            return this._tablePW.deleteEntities(this._connectionString, this._tableName, this._entitiesToDelete);
        };
        TableDeleteActivity.prototype._handleError = function (error, retryStep) {
            var _this = this;
            this.extendedStatus(ExtendedStatus.Error);
            this.mainMessage("Failed: " + Utilities.getErrorMessage(error));
            this._telemetry.sendError({
                name: "StorageExplorer.Table.deleteEntitiesFailed",
                error: error,
                properties: {
                    entitiesToDelete: this._entitiesToDelete.length.toString()
                }
            });
            if (retryStep) {
                this._retryable(true);
                return new Promise(function (resolve, reject) {
                    _this._retryStep = function () {
                        retryStep().then(resolve, reject);
                    };
                });
            }
        };
        Object.defineProperty(TableDeleteActivity.prototype, "selectedEntitiesMessage", {
            get: function () {
                return this._entitiesToDelete.length + " " + (this._entitiesToDelete.length > 1 ? "entities" : "entity"); // Localize?
            },
            enumerable: true,
            configurable: true
        });
        TableDeleteActivity.prototype.getInProgressTitle = function (accountName) {
            return "Deleting entities from table '" + accountName + "/" + this._tableName + "'"; // Localize
        };
        TableDeleteActivity.prototype.getFinishedTitle = function (accountName) {
            return "Deleted entities from table '" + accountName + "/" + this._tableName + "'"; // Localize
        };
        TableDeleteActivity.prototype._canRetryCore = function () {
            // Disable retry until the whole experience is working properly
            return false; // return super._canRetryCore() && this._retryable();
        };
        TableDeleteActivity.prototype._canCancelCore = function () {
            // This happens all at once, there is no batching.
            return false;
        };
        return TableDeleteActivity;
    }(RetryableActivity));
    return TableDeleteActivity;
});

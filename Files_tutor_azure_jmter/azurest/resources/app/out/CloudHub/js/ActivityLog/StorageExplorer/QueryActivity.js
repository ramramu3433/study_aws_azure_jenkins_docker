/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/ExtendedStatus", "ActivityLog/StorageExplorer/ObservableActivity", "Common/Utilities"], function (require, exports, ExtendedStatus, ObservableActivity, Utilities) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an operation that can
     *   be canceled or retried.
     */
    var QueryActivity = (function (_super) {
        __extends(QueryActivity, _super);
        function QueryActivity(title, host, telemetry, filePath) {
            var _this = _super.call(this, title) || this;
            _this._host = host;
            _this._telemetry = telemetry;
            _this._filePath = filePath;
            return _this;
        }
        /**
         * Starts the activity
         */
        QueryActivity.prototype.start = function (filePath) {
            var queryName = Utilities.getFileNameFromPath(filePath);
            this.extendedStatus(ExtendedStatus.InProgress);
            this.title(this.getInProgressTitle(queryName));
        };
        QueryActivity.prototype.finished = function (filePath) {
            var _this = this;
            var queryName = Utilities.getFileNameFromPath(filePath);
            this.extendedStatus(ExtendedStatus.Success);
            this.title(this.getFinishedTitle(queryName)); // Localize
            this._addOrRemoveAction(QueryActivity.openInFolderAction, function () { return _this._host.executeOperation("Environment.showItemInFolder", [_this._filePath]); }, 
            /*add*/ true);
        };
        /**
         * Handles an error case showing the error message and retry if necessary.
         */
        QueryActivity.prototype._handleError = function (error, customizedMessage) {
            var mainMessageCore = customizedMessage || "The file you are trying to open is an invalid query."; // Localize
            this.extendedStatus(ExtendedStatus.Error);
            this.mainMessage("Failed: " + Utilities.getErrorMessage(mainMessageCore)); // Localize
            this._telemetry.sendError({
                name: "StorageExplorer.Table.openQueryFailed",
                error: error
            });
        };
        return QueryActivity;
    }(ObservableActivity));
    QueryActivity.openInFolderAction = "Show in folder"; // Localize
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueryActivity;
});

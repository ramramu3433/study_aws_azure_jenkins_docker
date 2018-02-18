/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/QueryActivity"], function (require, exports, QueryActivity_1) {
    "use strict";
    /**
     * Represents a handle in the Activity Log to a table export operation.
     */
    var SaveQueryActivity = (function (_super) {
        __extends(SaveQueryActivity, _super);
        function SaveQueryActivity(host, telemetry, filePath) {
            return _super.call(this, "Saving query...", host, telemetry, filePath) || this;
        }
        SaveQueryActivity.prototype.getInProgressTitle = function (queryName) {
            return "Saving query '" + queryName + "' to '" + this._filePath + "'"; // Localize
        };
        SaveQueryActivity.prototype.getFinishedTitle = function (queryName) {
            return "Saved query '" + queryName + "' to '" + this._filePath + "'"; // Localize
        };
        return SaveQueryActivity;
    }(QueryActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SaveQueryActivity;
});

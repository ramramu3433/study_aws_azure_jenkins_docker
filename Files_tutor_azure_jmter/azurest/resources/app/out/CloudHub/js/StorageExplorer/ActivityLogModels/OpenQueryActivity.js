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
    var OpenQueryActivity = (function (_super) {
        __extends(OpenQueryActivity, _super);
        function OpenQueryActivity(host, telemetry, filePath) {
            return _super.call(this, "Opening query...", host, telemetry, filePath) || this;
        }
        OpenQueryActivity.prototype.getInProgressTitle = function (queryName) {
            return "Opening query '" + queryName + "' from '" + this._filePath + "'"; // Localize
        };
        OpenQueryActivity.prototype.getFinishedTitle = function (queryName) {
            return "Opened query '" + queryName + "' from '" + this._filePath + "'"; // Localize
        };
        return OpenQueryActivity;
    }(QueryActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = OpenQueryActivity;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/OverwritableActivity"], function (require, exports, OverwritableActivity_1) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a blob operation that
     * can have destination blob already exists errors.
     */
    var FlobOverwritableActivity = (function (_super) {
        __extends(FlobOverwritableActivity, _super);
        function FlobOverwritableActivity(title, actionWithOverwrite, telemetryInfo, requestCancel) {
            var _this = _super.call(this, title, telemetryInfo) || this;
            _this._flobTelemetryInfo = telemetryInfo;
            return _this;
        }
        Object.defineProperty(FlobOverwritableActivity.prototype, "TelemetryFlobType", {
            /**
             * Returns "File" or "Blob" (to be used only for telemetry/internal use, not end-user strings)
             */
            get: function () {
                return (this._flobTelemetryInfo).flobType;
            },
            enumerable: true,
            configurable: true
        });
        return FlobOverwritableActivity;
    }(OverwritableActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobOverwritableActivity;
});

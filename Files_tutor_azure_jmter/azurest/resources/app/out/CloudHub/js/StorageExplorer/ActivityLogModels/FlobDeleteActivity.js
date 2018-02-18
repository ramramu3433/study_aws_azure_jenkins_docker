/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "ActivityLog/StorageExplorer/ActionBasedActivity", "StorageExplorer/ActivityLogModels/FlobDeleter"], function (require, exports, _string, ActionBasedActivity_1, FlobDeleter) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a file delete operation
     */
    var FlobDeleteActivity = (function (_super) {
        __extends(FlobDeleteActivity, _super);
        function FlobDeleteActivity(host, container, flobPath, listViewModel, snapshot, telemetryInfo) {
            var _this = _super.call(this, _string.sprintf("Deleting '%s'", flobPath), telemetryInfo) || this;
            _this._container = container;
            _this._flobPath = flobPath;
            _this._listViewModel = listViewModel;
            _this._snapshot = snapshot;
            return _this;
        }
        Object.defineProperty(FlobDeleteActivity.prototype, "_condenseTelemetry", {
            /**
             * @override
             */
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @override
         */
        FlobDeleteActivity.prototype._isCancelableCore = function () {
            // Can't cancel once delete has started
            return false;
        };
        /**
         * @override
         */
        FlobDeleteActivity.prototype._doActionCore = function () {
            return FlobDeleter.deleteFlobAndUpdateView(this._container, this._flobPath, this._listViewModel, this._snapshot);
        };
        return FlobDeleteActivity;
    }(ActionBasedActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobDeleteActivity;
});

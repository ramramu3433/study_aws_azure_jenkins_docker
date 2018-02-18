/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/StorageExplorer/ActionBasedActivity"], function (require, exports, ActionBasedActivity_1) {
    "use strict";
    /**
     * A way to create a simple action-based activity by passing in a function
     */
    var SimpleActionBasedActivity = (function (_super) {
        __extends(SimpleActionBasedActivity, _super);
        function SimpleActionBasedActivity(title, telemetryInfo, simpleAction, simpleRequestCancel) {
            var _this = _super.call(this, title, telemetryInfo) || this;
            _this._simpleAction = simpleAction;
            _this._simpleRequestCancel = simpleRequestCancel;
            return _this;
        }
        /**
         * @override
         */
        SimpleActionBasedActivity.prototype._doActionCore = function () {
            return this._simpleAction();
        };
        /**
         * @override
         */
        SimpleActionBasedActivity.prototype._isCancelableCore = function () {
            return !!this._simpleRequestCancel;
        };
        /**
         * @override
         */
        SimpleActionBasedActivity.prototype._requestCancelCore = function () {
            return this._simpleRequestCancel();
        };
        return SimpleActionBasedActivity;
    }(ActionBasedActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SimpleActionBasedActivity;
});

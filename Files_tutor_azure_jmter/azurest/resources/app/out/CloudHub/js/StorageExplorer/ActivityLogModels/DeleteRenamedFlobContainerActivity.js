/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "ActivityLog/StorageExplorer/ActionBasedActivity"], function (require, exports, _string, ActionBasedActivity_1) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of deleting a renamed flob container
     */
    var DeleteRenamedFlobContainerActivity = (function (_super) {
        __extends(DeleteRenamedFlobContainerActivity, _super);
        function DeleteRenamedFlobContainerActivity(host, container, containerNodeType, telemetry) {
            var _this = _super.call(this, _string.sprintf("Deleting '%s'", container.getName()), {
                telemetry: telemetry,
                telemetryEventName: "StorageExplorer." + (container.isBlobContainer() ? "Blob" : "File") + "DeleteActivity"
            }) || this;
            _this._container = container;
            _this._containerNodeType = containerNodeType;
            return _this;
        }
        Object.defineProperty(DeleteRenamedFlobContainerActivity.prototype, "_condenseTelemetry", {
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
        DeleteRenamedFlobContainerActivity.prototype._doActionCore = function () {
            var _this = this;
            // Only delete if empty
            return this._container.isEmpty().then(function (isEmpty) {
                if (!isEmpty) {
                    throw new Error("Could not delete source '" + _this._container.getName() + "' because it is not empty."); // Localize
                }
                return _this._container.safeDelete(_this._containerNodeType, true /*skipPrompt*/);
            });
        };
        /**
         * @override
         */
        DeleteRenamedFlobContainerActivity.prototype._isCancelableCore = function () {
            return false;
        };
        DeleteRenamedFlobContainerActivity.prototype.isReadyToStart = function (incompleteActivities) {
            // We can't delete the container if *any* other activities are active
            if (incompleteActivities.length) {
                return false;
            }
            return true;
        };
        return DeleteRenamedFlobContainerActivity;
    }(ActionBasedActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DeleteRenamedFlobContainerActivity;
});

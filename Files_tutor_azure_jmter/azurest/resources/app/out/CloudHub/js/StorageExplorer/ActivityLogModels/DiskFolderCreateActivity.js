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
     * Class to handle the Activity Log lifecycle of a disk folder creation operation
     */
    var DiskFolderCreateActivity = (function (_super) {
        __extends(DiskFolderCreateActivity, _super);
        function DiskFolderCreateActivity(diskFolderCreator, diskFolderPath, telemetry) {
            var _this = _super.call(this, _string.sprintf("Creating disk folder '%s'", diskFolderPath), {
                telemetryEventName: "StorageExplorer.DiskFolderCreateActivity",
                telemetry: telemetry
            }) || this;
            _this._diskFolderCreator = diskFolderCreator;
            _this._diskFolderPath = diskFolderPath;
            return _this;
        }
        /**
         * @override
         */
        DiskFolderCreateActivity.prototype._doActionCore = function () {
            return this._createDiskFolder(this._diskFolderCreator, this._diskFolderPath);
        };
        /**
         * @override
         */
        DiskFolderCreateActivity.prototype._isCancelableCore = function () {
            // No cancel once started
            return false;
        };
        DiskFolderCreateActivity.prototype._createDiskFolder = function (diskFolderCreator, diskFolderPath) {
            return diskFolderCreator.ensureLocalFolderExists(diskFolderPath);
        };
        return DiskFolderCreateActivity;
    }(ActionBasedActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DiskFolderCreateActivity;
});

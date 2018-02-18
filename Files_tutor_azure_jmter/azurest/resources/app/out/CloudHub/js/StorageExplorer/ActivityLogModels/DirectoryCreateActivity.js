/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "StorageExplorer/ActivityLogModels/DirectoryBaseActivity"], function (require, exports, _string, DirectoryBaseActivity_1) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an Azure directory creation operation
     */
    var DirectoryCreateActivity = (function (_super) {
        __extends(DirectoryCreateActivity, _super);
        function DirectoryCreateActivity(host, container, directoryPath, listViewModel, telemetry) {
            var _this = _super.call(this, host, listViewModel, _string.sprintf("Creating directory '%s'", directoryPath), {
                telemetryEventName: "StorageExplorer.DirectoryCreateActivity",
                telemetry: telemetry
            }) || this;
            _this._container = container;
            _this._directoryPath = directoryPath;
            return _this;
        }
        /**
         * @override
         */
        DirectoryCreateActivity.prototype._mustWaitForDescendentDeletionsToFinish = function () {
            return false;
        };
        /**
         * @override
         */
        DirectoryCreateActivity.prototype._doActionCore = function () {
            return this._createDirectory(this._container, this._directoryPath);
        };
        return DirectoryCreateActivity;
    }(DirectoryBaseActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DirectoryCreateActivity;
});

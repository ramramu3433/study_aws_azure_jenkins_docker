/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "StorageExplorer/ActivityLogModels/DirectoryBaseActivity", "StorageExplorer/ActivityLogModels/FlobDeleter", "Common/Utilities"], function (require, exports, _string, DirectoryBaseActivity_1, FlobDeleter, Utilities) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an Azure directory deletion operation
     */
    var DirectoryDeleteActivity = (function (_super) {
        __extends(DirectoryDeleteActivity, _super);
        function DirectoryDeleteActivity(host, container, directoryPath, listViewModel, telemetry) {
            var _this = _super.call(this, host, listViewModel, _string.sprintf("Deleting directory '%s'", directoryPath), {
                telemetryEventName: "StorageExplorer.DirectoryDeleteActivity",
                telemetry: telemetry
            }) || this;
            _this._container = container;
            _this._directoryPath = directoryPath;
            return _this;
        }
        /**
         * @override
         */
        DirectoryDeleteActivity.prototype._doActionCore = function () {
            return FlobDeleter.deleteFlobFolderAndUpdateView(this._container, this._directoryPath, this._listViewModel);
        };
        DirectoryDeleteActivity.prototype.getAzureFilePathToBeDeleted = function () {
            // We delete an Azure directory
            return Utilities.appendSlash(this._directoryPath);
        };
        return DirectoryDeleteActivity;
    }(DirectoryBaseActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DirectoryDeleteActivity;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "ActivityLog/StorageExplorer/CopyType", "StorageExplorer/ActivityLogModels/DirectoryBaseActivity", "StorageExplorer/ActivityLogModels/FlobDeleter", "Common/Utilities"], function (require, exports, _string, CopyType_1, DirectoryBaseActivity_1, FlobDeleter, Utilities) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of an Azure directory creation operation
     */
    var DirectoryCopyActivity = (function (_super) {
        __extends(DirectoryCopyActivity, _super);
        function DirectoryCopyActivity(host, copyType, sourceContainer, sourceDirectoryPath, destContainer, destDirectoryPath, listViewModel, telemetry) {
            var _this = _super.call(this, host, listViewModel, _string.sprintf(copyType === CopyType_1.default.Copy ?
                "Copying directory '%s'" : "Renaming directory '%s'", sourceDirectoryPath), {
                telemetryEventName: "StorageExplorer.Directory" + (copyType === CopyType_1.default.Copy ? "Copy" : "Rename") + "Activity",
                telemetry: telemetry
            }) || this;
            _this._copied = false;
            _this._copyType = copyType;
            _this._sourceContainer = sourceContainer;
            _this._sourceDirectoryPath = sourceDirectoryPath;
            _this._destContainer = destContainer;
            _this._destDirectoryPath = destDirectoryPath;
            return _this;
        }
        /**
         * @override
         */
        DirectoryCopyActivity.prototype._doActionCore = function () {
            var _this = this;
            var createPromise = this._copied ?
                Promise.resolve(null) :
                this._createDirectoryFromExisting(this._sourceContainer, this._sourceDirectoryPath, this._destContainer, this._destDirectoryPath);
            return createPromise
                .then(function () {
                _this._copied = true;
                if (_this._copyType === CopyType_1.default.Rename) {
                    return FlobDeleter.deleteFlobFolderAndUpdateView(_this._sourceContainer, _this._sourceDirectoryPath, _this._listViewModel);
                }
            });
        };
        DirectoryCopyActivity.prototype.getAzureFilePathToBeDeleted = function () {
            // We delete an Azure directory
            return Utilities.appendSlash(this._sourceDirectoryPath);
        };
        return DirectoryCopyActivity;
    }(DirectoryBaseActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DirectoryCopyActivity;
});

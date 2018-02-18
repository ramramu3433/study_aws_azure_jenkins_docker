/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "ActivityLog/StorageExplorer/CopyType", "ActivityLog/StorageExplorer/FlobCopyActivity"], function (require, exports, AzureStorageUtilities, CopyType_1, FlobCopyActivity_1) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a file copy or rename operation
     */
    // CONSIDER: Doesn't need the overwritable aspect, just ActionBasedActivity functionality
    var FileCopyActivity = (function (_super) {
        __extends(FileCopyActivity, _super);
        function FileCopyActivity(host, sourceContainer, sourceAccountUri, sourceShareSasToken, sourceFilePath, destContainer, destFilePath, copyType, listViewModel, telemetry) {
            var _this = _super.call(this, host, sourceContainer, sourceAccountUri, sourceShareSasToken, sourceFilePath, "" /* snapshot */, destContainer, destFilePath, copyType, listViewModel, {
                telemetryEventName: "StorageExplorer.File" + FlobCopyActivity_1.default.getTelemetryCopyType(copyType) + "Activity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.File
            }) || this;
            /**
             * @override
             */
            _this.DestinationExistsErrorMessage = "A file with the given name already exists."; // Localize
            return _this;
        }
        FileCopyActivity.prototype.getAzureFilePathToBeDeleted = function () {
            if (this._copyType === CopyType_1.default.Rename) {
                // We delete the source file if we're renaming
                return this._srcFlobPath;
            }
            else {
                return null;
            }
        };
        /**
         * @override
         */
        FileCopyActivity.prototype._supportsThrowingIfExists = function () {
            // File APIs don't currently support condition headers, so overwriteIfExists must always be true
            return false;
        };
        return FileCopyActivity;
    }(FlobCopyActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileCopyActivity;
});

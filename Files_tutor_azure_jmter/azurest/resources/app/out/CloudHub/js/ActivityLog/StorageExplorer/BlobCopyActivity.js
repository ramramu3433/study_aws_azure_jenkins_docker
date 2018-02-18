/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Common/AzureStorageUtilities", "ActivityLog/StorageExplorer/FlobCopyActivity"], function (require, exports, AzureStorageUtilities, FlobCopyActivity_1) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a blob copy or rename operation
     */
    // CONSIDER: Doesn't need the overwritable aspect, just ActionBasedActivity functionality
    var BlobCopyActivity = (function (_super) {
        __extends(BlobCopyActivity, _super);
        function BlobCopyActivity(host, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFlobPath, sourceSnapshot, destContainer, destFlobPath, copyType, listViewModel, telemetry, overwrite) {
            if (overwrite === void 0) { overwrite = false; }
            var _this = _super.call(this, host, sourceContainer, sourceAccountUri, sourceContainerSasToken, sourceFlobPath, sourceSnapshot, destContainer, destFlobPath, copyType, listViewModel, {
                telemetryEventName: "StorageExplorer.Blob" + FlobCopyActivity_1.FlobCopyActivity.getTelemetryCopyType(copyType) + "Activity",
                telemetry: telemetry,
                flobType: AzureStorageUtilities.FlobTypes.Blob
            }, overwrite) || this;
            /**
             * @override
             */
            _this.DestinationExistsErrorMessage = "A blob with the given name already exists."; // Localize
            return _this;
        }
        /**
         * @override
         */
        BlobCopyActivity.prototype._supportsThrowingIfExists = function () {
            return true;
        };
        return BlobCopyActivity;
    }(FlobCopyActivity_1.FlobCopyActivity));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobCopyActivity;
});

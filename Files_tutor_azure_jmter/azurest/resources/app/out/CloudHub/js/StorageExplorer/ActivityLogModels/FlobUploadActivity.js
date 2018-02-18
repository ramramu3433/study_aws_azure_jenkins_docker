/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "underscore.string", "StorageExplorer/ActivityLogModels/FlobTransferActivity", "Common/Errors"], function (require, exports, _string, FlobTransferActivity_1, Errors) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a flob upload operation
     */
    var FlobUploadActivity = (function (_super) {
        __extends(FlobUploadActivity, _super);
        function FlobUploadActivity(host, container, destPath, blobType, sourceFilePath, size, telemetryInfo) {
            var _this = _super.call(this, host, container, _string.sprintf("Uploading from '%s' to '%s'", sourceFilePath, destPath), telemetryInfo, size) || this;
            // abstract
            _this.DestinationExistsErrorMessage = "DestinationExistsErrorMessage";
            // If the size exceed this thredshold, then we will check the existence of the destination flob before uploading.
            // We simply take the number from azure-storage lib "DEFAULT_SINGLE_BLOB_PUT_THRESHOLD_IN_BYTES".
            _this.CheckFlobExistenceThresholdInBytes = 32 * 1024 * 1024;
            _this._sourceFilePath = sourceFilePath;
            _this._destPath = destPath;
            _this._blobType = blobType;
            return _this;
        }
        /**
         * @override
         */
        FlobUploadActivity.prototype._startTransfer = function (overwrite) {
            return this._upload(overwrite);
        };
        /**
         * @override
         */
        FlobUploadActivity.prototype._requestCancelTransfer = function () {
            return this._cancelUpload();
        };
        /**
         * @override
         */
        FlobUploadActivity.prototype._createProgressIdCore = function () {
            // Unique id to use to track progress on this upload
            return "upload" + this.TelemetryFlobType + "|" + this._sourceFilePath + "|" + this._destPath + "|" + new Date().toISOString();
        };
        FlobUploadActivity.prototype._upload = function (overwrite) {
            // Check the existence of destination flob before upload if:
            //   1) It's larger than a certain threshhold (otherwise the file exists exception will occur only after a lengthy upload)
            //   2) If the flob type doesn't support condition headers (and hence doesn't support overwriteIfExists==false)
            //
            // Using overwriteIfExists==false is preferred because it's faster (no need ask Azure if the file exists) unless the file is large.
            var _this = this;
            var checkExistencePromise = Promise.resolve(false);
            if (!overwrite &&
                (!this._supportsThrowingIfExists() || (this._size > this.CheckFlobExistenceThresholdInBytes))) {
                checkExistencePromise = this._container.itemExists(this._destPath, null);
            }
            return checkExistencePromise.then(function (exist) {
                if (!exist) {
                    return _this._container.uploadFromLocalFile(_this._sourceFilePath, _this._size, _this._destPath, _this._blobType, overwrite || !_this._supportsThrowingIfExists(), _this._progressId);
                }
                else {
                    return Promise.reject(new Errors.DestinationExistsError(_this.DestinationExistsErrorMessage));
                }
            });
        };
        FlobUploadActivity.prototype._cancelUpload = function () {
            return this._container.abortUpload(this._progressId);
        };
        return FlobUploadActivity;
    }(FlobTransferActivity_1.FlobTransferActivity));
    exports.FlobUploadActivity = FlobUploadActivity;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobUploadActivity;
});

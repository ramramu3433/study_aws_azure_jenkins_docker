/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "ActivityLog/ActivityLogEntry", "ActivityLog/ActivityLogStatus"], function (require, exports, ActivityLogEntry, ActivityLogStatus) {
    "use strict";
    var FileUploadEntry = (function (_super) {
        __extends(FileUploadEntry, _super);
        function FileUploadEntry(fileName) {
            if (fileName === void 0) { fileName = ""; }
            var _this = _super.call(this, "Uploading file to '" + fileName + "'", ActivityLogStatus.Pending) || this;
            _this._handleCancelAction = function () {
                _this.status = ActivityLogStatus.Canceled;
                _this.message = "Canceled by user";
                _this.actions = {
                    "Retry": _this._handleRetryAction
                };
            };
            _this._handleOpenAction = function () {
                // console.warn("Clicked open");
            };
            _this._handleDownloadAction = function () {
                // console.warn("Clicked download");
            };
            _this._handleRetryAction = function () {
                // console.warn("Clicked retry");
            };
            _this.succeed = function () {
                if (_this.status === ActivityLogStatus.Success) {
                    _this.actions = {
                        "Open": _this._handleOpenAction,
                        "Download": _this._handleDownloadAction
                    };
                    _this.status = ActivityLogStatus.Success;
                }
            };
            _this.actions = {
                "Cancel": _this._handleCancelAction
            };
            return _this;
        }
        return FileUploadEntry;
    }(ActivityLogEntry));
    return FileUploadEntry;
});

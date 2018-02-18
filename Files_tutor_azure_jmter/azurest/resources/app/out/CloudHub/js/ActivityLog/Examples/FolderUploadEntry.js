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
    var FolderUploadEntry = (function (_super) {
        __extends(FolderUploadEntry, _super);
        function FolderUploadEntry(folderName) {
            if (folderName === void 0) { folderName = ""; }
            var _this = _super.call(this, "Long running process on '" + folderName + "'", ActivityLogStatus.Pending) || this;
            _this.cancel = function () {
                // console.warn("Cancel all clicked");
            };
            _this.succeed = function () {
                _this.status = ActivityLogStatus.Success;
                _this.actions = {};
            };
            _this.addFile = function (entry) {
                _this.addChild(entry);
            };
            _this.actions = {
                "Cancel all": _this.cancel
            };
            return _this;
        }
        return FolderUploadEntry;
    }(ActivityLogEntry));
    return FolderUploadEntry;
});

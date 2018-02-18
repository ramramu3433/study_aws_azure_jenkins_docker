/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/ActivityLogModels/FlobDeleteActivity"], function (require, exports, FlobDeleteActivity_1) {
    "use strict";
    /**
     * Class to handle the Activity Log lifecycle of a file delete operation
     */
    var FileDeleteActivity = (function (_super) {
        __extends(FileDeleteActivity, _super);
        function FileDeleteActivity(host, container, azureFilePath, listViewModel, telemetry) {
            return _super.call(this, host, container, azureFilePath, listViewModel, "" /* snapshot */, {
                telemetryEventName: "StorageExplorer.FileDeleteActivity",
                telemetry: telemetry
            }) || this;
        }
        FileDeleteActivity.prototype.getAzureFilePathToBeDeleted = function () {
            return this._flobPath;
        };
        return FileDeleteActivity;
    }(FlobDeleteActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileDeleteActivity;
});

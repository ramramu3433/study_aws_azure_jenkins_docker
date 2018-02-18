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
     * Class to handle the Activity Log lifecycle of a blob delete operation
     */
    var BlobDeleteActivity = (function (_super) {
        __extends(BlobDeleteActivity, _super);
        function BlobDeleteActivity(host, container, blobPath, listViewModel, snapshot, telemetry) {
            return _super.call(this, host, container, blobPath, listViewModel, snapshot, {
                telemetryEventName: "StorageExplorer.BlobDeleteActivity",
                telemetry: telemetry
            }) || this;
        }
        return BlobDeleteActivity;
    }(FlobDeleteActivity_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobDeleteActivity;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Common/Base/ExplorerContext", "Providers/StorageExplorer/Actions/FileActions"], function (require, exports, ExplorerContext_1, FileActions) {
    "use strict";
    /**
     * Storage explorer action context
     */
    var FileExplorerContext = (function (_super) {
        __extends(FileExplorerContext, _super);
        function FileExplorerContext() {
            var _this = _super.call(this) || this;
            _this.fileActions = new FileActions(null /* azureConnection*/, _this.hostProxy, _this.activityLogManager, _this.telemetry);
            _this.shareReference = {
                shareName: _this.pluginParameters.shareName,
                connectionString: _this.pluginParameters.connectionString
            };
            return _this;
        }
        return FileExplorerContext;
    }(ExplorerContext_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileExplorerContext;
});

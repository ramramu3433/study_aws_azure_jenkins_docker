/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Common/Base/ExplorerContext", "Providers/StorageExplorer/Actions/BlobActions"], function (require, exports, ExplorerContext_1, BlobActions) {
    "use strict";
    /**
     * Storage explorer action context
     */
    var BlobExplorerContext = (function (_super) {
        __extends(BlobExplorerContext, _super);
        function BlobExplorerContext() {
            var _this = _super.call(this) || this;
            _this.blobActions = new BlobActions(null /* azureConnection */, _this.hostProxy, _this.activityLogManager, _this.telemetry);
            _this.containerReference = {
                containerName: _this.pluginParameters.containerName,
                connectionString: _this.pluginParameters.connectionString,
                subscription: _this.pluginParameters.subscription
            };
            return _this;
        }
        return BlobExplorerContext;
    }(ExplorerContext_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BlobExplorerContext;
});

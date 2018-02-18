/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Common/Base/ExplorerContext", "Providers/StorageExplorer/Actions/QueueActions"], function (require, exports, ExplorerContext_1, QueueActions) {
    "use strict";
    /**
     * Storage explorer queues action context
     */
    var QueueExplorerContext = (function (_super) {
        __extends(QueueExplorerContext, _super);
        function QueueExplorerContext() {
            var _this = _super.call(this) || this;
            _this.queueActions = new QueueActions(null /* azureConnection*/, _this.hostProxy, _this.activityLogManager, _this.telemetry);
            _this.queueReference = {
                queueName: _this.pluginParameters.queueName,
                connectionString: _this.pluginParameters.connectionString
            };
            return _this;
        }
        return QueueExplorerContext;
    }(ExplorerContext_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueueExplorerContext;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Settings/ColumnSettingsManager", "Common/ConnectionString", "StorageExplorer/Common/Base/ExplorerContext", "Providers/StorageExplorer/Actions/TableActions", "StorageExplorer/Settings/SettingsManager"], function (require, exports, ColumnSettingsManager_1, ConnectionString_1, ExplorerContext_1, TableActions, SettingsManager_1) {
    "use strict";
    /**
     * Storage explorer tables action context
     */
    var TableExplorerContext = (function (_super) {
        __extends(TableExplorerContext, _super);
        function TableExplorerContext() {
            var _this = _super.call(this) || this;
            _this.tableActions = new TableActions(null /* azureConnection*/, _this.hostProxy, _this.activityLogManager, _this.telemetry);
            _this.tableReference = {
                tableName: _this.pluginParameters.tableName,
                connectionString: _this.pluginParameters.connectionString
            };
            var connectionType = _this.pluginParameters.connectionType;
            var parsedConnectionString = new ConnectionString_1.default(_this.tableReference.connectionString);
            var settingId = {
                storageAccount: {
                    accountName: parsedConnectionString.getAccountName(),
                    endpointsDomain: parsedConnectionString.getEndpointsDomain(),
                    connectionType: connectionType
                },
                containerType: 1 /* Table */,
                resourceName: _this.tableReference.tableName
            };
            _this.columnSettingsManager = new ColumnSettingsManager_1.default(new SettingsManager_1.default(_this.telemetry, 1 /* localStorage */), settingId);
            return _this;
        }
        return TableExplorerContext;
    }(ExplorerContext_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableExplorerContext;
});

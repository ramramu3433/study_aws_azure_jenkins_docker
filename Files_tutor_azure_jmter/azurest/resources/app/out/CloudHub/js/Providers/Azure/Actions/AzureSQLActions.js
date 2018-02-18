/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Azure/Resources/AzureResources", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Common/Errors"], function (require, exports, AzureResources, CloudExplorerActions, Errors) {
    "use strict";
    var AzureSQLActions = (function () {
        function AzureSQLActions(host) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureSQLActions.showSQLServerObjectExplorerNamespace, _this.showSQLServerObjectExplorer);
            };
            /**
             * Action for showing the SQL server object explorer.
             */
            this.showSQLServerObjectExplorer = function (args) {
                var subscription = JSON.parse(args.subscription), subscriptionId = subscription.id, serverName = args.server, databaseName = args.name, administratorLogin = args.administratorLogin;
                return _this._host.executeOperation("Azure.showSqlServerObjectExplorer", [subscriptionId, serverName, databaseName, administratorLogin])
                    .then(null, function (err) {
                    if (err.name === "SSDTNotInstalledError") {
                        return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.SqlDatabases.NotInstalled", "Actions.Common.DownloadLatest"])
                            .then(function (resources) {
                            throw new Errors.ActionableError(err, resources["Actions.SqlDatabases.NotInstalled"], resources["Actions.Common.DownloadLatest"], CloudExplorerActions.openUrlNamespace, {
                                url: "https://go.microsoft.com/fwlink/?LinkID=618545"
                            });
                        });
                    }
                    else {
                        throw err;
                    }
                });
            };
            this._host = host;
        }
        return AzureSQLActions;
    }());
    AzureSQLActions.showSQLServerObjectExplorerNamespace = "Azure.SQL.showSQLServerObjectExplorer";
    return AzureSQLActions;
});

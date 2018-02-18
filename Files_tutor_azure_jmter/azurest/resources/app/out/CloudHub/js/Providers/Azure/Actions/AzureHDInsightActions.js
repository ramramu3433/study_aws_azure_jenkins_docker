/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Errors", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Common/UIActions", "es6-promise"], function (require, exports, Errors, CloudExplorerActions, UIActions, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /* tslint:enable */
    var AzureHDInsightActions = (function () {
        function AzureHDInsightActions(hostProxy) {
            var _this = this;
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureHDInsightActions.writeHiveQueryNamespace, _this.writeHiveQuery);
                actionBindingManager.addActionBinding(AzureHDInsightActions.viewJobsNamespace, _this.viewJobs);
                actionBindingManager.addActionBinding(AzureHDInsightActions.viewStormTopologiesNamespace, _this.viewStormTopologies);
                actionBindingManager.addActionBinding(AzureHDInsightActions.viewHadoopServicelogTableNamespace, _this.viewHadoopServicelogTable);
                actionBindingManager.addActionBinding(AzureHDInsightActions.viewContainerNamespace, _this.viewContainer);
                actionBindingManager.addActionBinding(AzureHDInsightActions.createTableNamespace, _this.createTable);
                actionBindingManager.addActionBinding(AzureHDInsightActions.viewTableDataNamespace, _this.viewTableData);
            };
            this.writeHiveQuery = function (args) {
                return _this._host.executeOperation("Azure.Actions.HDInsight.WriteHiveQuery", [{ clusterName: args.name }]).
                    then(null, function (error) { AzureHDInsightActions.handleError(error); });
            };
            this.viewJobs = function (args) {
                return _this._host.executeOperation("Azure.Actions.HDInsight.ViewJobs", [{ clusterName: args.name }]).
                    then(null, function (error) { AzureHDInsightActions.handleError(error); });
            };
            this.viewStormTopologies = function (args) {
                return _this._host.executeOperation("Azure.Actions.HDInsight.ViewStormTopologies", [{ clusterName: args.name }]).
                    then(null, function (error) { AzureHDInsightActions.handleError(error); });
            };
            this.viewHadoopServicelogTable = function (args) {
                return _this._host.executeOperation("Azure.Actions.HDInsight.ViewHadoopServicelogTable", [{ clusterName: args.clusterName, logTableName: args.logTableName }]).
                    then(null, function (error) { AzureHDInsightActions.handleError(error); });
            };
            this.viewContainer = function (args) {
                return _this._host.executeOperation("Azure.Actions.HDInsight.ViewContainer", [{
                        clusterName: args.clusterName,
                        storageName: args.storageName,
                        containerName: args.containerName,
                        key: args.key,
                        defaultStorageTag: args.defaultStorageTag
                    }]).
                    then(null, function (error) { AzureHDInsightActions.handleError(error); });
            };
            this.createTable = function (args) {
                return _this._host.executeOperation("Azure.Actions.HDInsight.CreateTable", [{ clusterName: args.clusterName, databaseName: args.databaseName }]).
                    then(null, function (error) { AzureHDInsightActions.handleError(error); });
            };
            this.viewTableData = function (args) {
                return _this._host.executeOperation("Azure.Actions.HDInsight.ViewTableData", [{
                        clusterName: args.clusterName,
                        databaseName: args.databaseName,
                        tableName: args.tableName
                    }]).
                    then(null, function (error) { AzureHDInsightActions.handleError(error); });
            };
            this._host = hostProxy;
            this._uiActions = new UIActions(this._host);
        }
        return AzureHDInsightActions;
    }());
    AzureHDInsightActions.writeHiveQueryNamespace = "Azure.HDInsight.writeHiveQuery";
    AzureHDInsightActions.viewJobsNamespace = "Azure.HDInsight.viewJobs";
    AzureHDInsightActions.viewStormTopologiesNamespace = "Azure.HDInsight.viewStormTopologies";
    AzureHDInsightActions.viewHadoopServicelogTableNamespace = "Azure.HDInsight.viewHadoopServicelogTable";
    AzureHDInsightActions.viewContainerNamespace = "Azure.HDInsight.viewContainer";
    AzureHDInsightActions.createTableNamespace = "Azure.HDInsight.createTable";
    AzureHDInsightActions.viewTableDataNamespace = "Azure.HDInsight.viewTableData";
    AzureHDInsightActions.handleError = function (error) {
        var errorToThrow = error;
        if (error.name === "DataLakePackageNotInstalled") {
            errorToThrow = new Errors.ActionableError(error, "Cloud Explorer and the Data Lake Tools are out of sync.  To resolve this, please try to update Cloud Explorer in Tools -> Extensions and Updates -> Updates -> Visual Studio Gallery, and install the latest ", "Azure Data Lake Tools.", CloudExplorerActions.openUrlNamespace, {
                url: "https://go.microsoft.com/fwlink/?LinkID=616477"
            });
        }
        else {
            errorToThrow = new Errors.DisplayableError(error.message, error);
        }
        throw errorToThrow;
    };
    return AzureHDInsightActions;
});

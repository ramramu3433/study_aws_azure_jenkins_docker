/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/AzureDataFactoryConstants", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Common/Errors", "Common/UIActions", "URIjs/URITemplate", "Common/Utilities", "underscore.string"], function (require, exports, AzureConstants, AzureDataFactoryConstants, CloudExplorerActions, Errors, UIActions, URITemplate, Utilities, _string) {
    "use strict";
    var underscore = {
        string: _string
    };
    var AzureDataFactoryActions = (function () {
        function AzureDataFactoryActions(azureConnection, host) {
            var _this = this;
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureDataFactoryActions.openFileEditorActionNamespace, _this.openFileEditor);
                actionBindingManager.addActionBinding(AzureDataFactoryActions.exportDataFactoryActionNamespace, _this.exportDataFactory);
                actionBindingManager.addActionBinding(AzureDataFactoryActions.addToProjectActionNamespace, _this.addToProject);
                actionBindingManager.addActionBinding(AzureDataFactoryActions.deleteDataFactoryActionNamespace, _this.deleteDataFactory);
                actionBindingManager.addActionBinding(AzureDataFactoryActions.deleteDataFactoryChildResourceActionNamespace, _this.deleteDataFactoryChildResource);
            };
            /**
             * Action to open data factory LinkedService/Table/Pipeline in Visual Studio Editor.
             */
            this.openFileEditor = function (args) {
                var type = args.type;
                var version = args.version;
                return _this.getDataFactoryJsonResult(args).then(function (response) {
                    var parsedResponse = JSON.parse(response);
                    return _this._host.executeOperation(AzureDataFactoryActions._prepDataFactoryJson, [response, type, version])
                        .then(function (formattedJson) {
                        var openFileArgs = {
                            contents: formattedJson,
                            fileName: parsedResponse.name + ".json",
                            isReadOnly: true
                        };
                        return _this._host.executeOperation(CloudExplorerActions.openFileEditorNamespace, [openFileArgs]);
                    });
                });
            };
            /**
             * Action to export an azure data factory to a newly creating data factory project in visual studio solution.
             */
            this.exportDataFactory = function (args) {
                var id = args.id;
                var name = args.name;
                var subscription = JSON.parse(args.subscription);
                return _this._host.executeOperation(AzureDataFactoryActions._exportDataFactory, [id, name, subscription])
                    .then(null, function (error) {
                    AzureDataFactoryActions.handleError(error);
                });
            };
            /**
             * Action to export an azure data factory to a data factory project in Visual Studio Editor.
             */
            this.addToProject = function (args) {
                var id = args.id;
                var name = args.name;
                var type = args.type;
                var subscription = JSON.parse(args.subscription);
                var url = AzureDataFactoryActions._uriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: id,
                    apiVersion: AzureDataFactoryConstants.apiVersion.currentVersion
                });
                return _this._host.executeOperation(AzureDataFactoryActions._addToDataFactoryProject, [url, name, type, _this.getHeaders(), subscription])
                    .then(null, function (error) {
                    AzureDataFactoryActions.handleError(error);
                });
            };
            /**
             * Action to delete an azure data factory.
             */
            this.deleteDataFactory = function (args) {
                var id = args.id;
                var name = args.name;
                var subscription = JSON.parse(args.subscription);
                var url = AzureDataFactoryActions._uriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: id,
                    apiVersion: AzureDataFactoryConstants.apiVersion.currentVersion
                });
                var prompt = underscore.string.sprintf("This will permanently delete Azure Data Factory '%0s' and its resources.\r\n\r\n"
                    + "Are you sure you want to delete it? ", name);
                return _this.confirmDelete(prompt).then(function (result) {
                    if (result) {
                        return _this._host.executeOperation(AzureDataFactoryActions._deleteDataFactoryResource, [url, subscription, _this.getHeaders()])
                            .then(function () {
                            var nodeQuery = [
                                { name: "type", value: AzureConstants.resourceTypes.DataFactories },
                                { name: "name", value: name }
                            ];
                            return _this._uiActions.deleteNode(nodeQuery);
                        }).then(null, function (error) {
                            AzureDataFactoryActions.handleError(error);
                        });
                    }
                });
            };
            /**
             * Action to delete a child resource LinkedService/DataSet/Pipeline from an azure data factory.
             */
            this.deleteDataFactoryChildResource = function (args) {
                var dataFactoryName = args.dataFactoryName;
                var id = args.id;
                var subscription = JSON.parse(args.subscription);
                var name = args.name;
                var nodeType = args.nodeType;
                var type = args.type;
                var url = AzureDataFactoryActions._uriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: id,
                    apiVersion: AzureDataFactoryConstants.apiVersion.currentVersion
                });
                var prompt = underscore.string.sprintf("This will permanently delete %0s '%1s' from Azure Data Factory '%2s'.\r\n\r\n"
                    + "Are you sure you want to delete it? ", type, name, dataFactoryName);
                return _this.confirmDelete(prompt).then(function (result) {
                    if (result) {
                        return _this._host.executeOperation(AzureDataFactoryActions._deleteDataFactoryResource, [url, subscription, _this.getHeaders()])
                            .then(function () {
                            var nodeQuery = [
                                { name: "dataFactoryName", value: dataFactoryName },
                                { name: "nodeType", value: nodeType },
                                { name: "name", value: name }
                            ];
                            return _this._uiActions.deleteNode(nodeQuery);
                        }).then(null, function (error) {
                            AzureDataFactoryActions.handleError(error);
                        });
                    }
                });
            };
            this.getDataFactoryJsonResult = function (args) {
                var id = args.id;
                var subscription = JSON.parse(args.subscription);
                var url = AzureDataFactoryActions._uriTemplate.expand({
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: id,
                    apiVersion: AzureDataFactoryConstants.apiVersion.currentVersion
                });
                return _this._azureConnection.webRequest(url.toString(), subscription, "GET", _this.getHeaders()).then(function (response) { return response; });
            };
            /**
             * Verify the user wants to delete something
             */
            this.confirmDelete = function (prompt) {
                return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: prompt, iconType: "critical" }]);
            };
            this.getHeaders = function () {
                var headers = {
                    "x-ms-client-request-id": Utilities.guid(),
                    "x-ms-retry-count": "0"
                };
                return headers;
            };
            this._azureConnection = azureConnection;
            this._host = host;
            this._uiActions = new UIActions(this._host);
        }
        return AzureDataFactoryActions;
    }());
    AzureDataFactoryActions.handleError = function (error) {
        var errorToThrow = error;
        if (error.name === "DataFactoryPackageNotInstalled") {
            errorToThrow = new Errors.ActionableError(error, "Azure Data Factory Plugin is not installed.", "Download the latest version", CloudExplorerActions.openUrlNamespace, {
                url: "https://visualstudiogallery.msdn.microsoft.com/site/search?" +
                    "query=azure%20data%20factory&f%5B0%5D.Value=azure%20data%20factory&f%5B0%5D.Type=SearchText&ac=5"
            });
        }
        else if (error.name === "NoDataFactoryProjectOpen") {
            errorToThrow = new Errors.DisplayableError("No project is open in solution explorer. " +
                "Open a project before trying to export.", error);
        }
        else if (error.name === "UnNamedSolution") {
            errorToThrow = new Errors.DisplayableError("Please save the solution with a name before exporting to an existing solution.", error);
        }
        else if (error.name === "MultipleDataFactoryProjectOpen") {
            errorToThrow = new Errors.DisplayableError("Multiple projects are open in solution explorer. " +
                "Close all except the one you want to use for this operation.", error);
        }
        else if (error.name === "DeleteDataFactoryResourceError") {
            errorToThrow = new Errors.DisplayableError(error.message, error);
        }
        throw errorToThrow;
    };
    AzureDataFactoryActions.openFileEditorActionNamespace = "Azure.Actions.DataFactory.openFileEditorAction";
    AzureDataFactoryActions.exportDataFactoryActionNamespace = "Azure.Actions.DataFactory.exportDataFactoryAction";
    AzureDataFactoryActions.addToProjectActionNamespace = "Azure.Actions.DataFactory.addToProjectAction";
    AzureDataFactoryActions.deleteDataFactoryActionNamespace = "Azure.Actions.DataFactory.deleteDataFactoryAction";
    AzureDataFactoryActions.deleteDataFactoryChildResourceActionNamespace = "Azure.Actions.DataFactory.deleteDataFactoryChildResource";
    AzureDataFactoryActions._uriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}?api-version={+apiVersion}");
    AzureDataFactoryActions._prepDataFactoryJson = "Azure.prepDataFactoryJson";
    AzureDataFactoryActions._exportDataFactory = "Azure.exportDataFactory";
    AzureDataFactoryActions._addToDataFactoryProject = "Azure.addToDataFactoryProject";
    AzureDataFactoryActions._deleteDataFactoryResource = "Azure.deleteDataFactoryResource";
    return AzureDataFactoryActions;
});

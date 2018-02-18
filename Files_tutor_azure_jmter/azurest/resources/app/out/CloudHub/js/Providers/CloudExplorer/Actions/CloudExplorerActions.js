/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../../Scripts/global.d.ts" />
    var CloudExplorerActions = (function () {
        function CloudExplorerActions(host, themeProvider, panelInteractor) {
            var _this = this;
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(CloudExplorerActions.closeInfoBarNamespace, _this._closeInfoBar);
                actionBindingManager.addActionBinding(CloudExplorerActions.getSettingsNamespace, _this._getSettings);
                actionBindingManager.addActionBinding(CloudExplorerActions.openFileEditorNamespace, _this._openFileEditor);
                actionBindingManager.addActionBinding(CloudExplorerActions.openServerExplorerNamespace, _this._openServerExplorer);
                actionBindingManager.addActionBinding(CloudExplorerActions.openUrlNamespace, _this._openUrl);
                actionBindingManager.addActionBinding(CloudExplorerActions.setSettingsNamespace, _this._setSettings);
                actionBindingManager.addActionBinding(CloudExplorerActions.showErrorMessageBox, _this._showErrorMessageBox);
                actionBindingManager.addActionBinding(CloudExplorerActions.showInfobarMessageNamespace, _this._showInfobarMessage);
                actionBindingManager.addActionBinding(CloudExplorerActions.showMessageBox, _this._showMessageBox);
                actionBindingManager.addActionBinding(CloudExplorerActions.themeImagesNamespace, _this._themeImages);
                actionBindingManager.addActionBinding(CloudExplorerActions.getTheme, _this._themeProvider.getTheme);
                actionBindingManager.addActionBinding(CloudExplorerActions.openPanel, _this._openPanel);
                actionBindingManager.addActionBinding(CloudExplorerActions.resetPanel, _this._resetPanel);
                actionBindingManager.addActionBinding(CloudExplorerActions.refreshPanel, _this._refreshPanel);
                actionBindingManager.addActionBinding(CloudExplorerActions.openPanelByName, _this._openPanelByName);
                actionBindingManager.addActionBinding(CloudExplorerActions.curentPanel, _this._getCurrentPanel);
            };
            this._closeInfoBar = function () {
                return _this._host.executeOperation("Environment.closeInfoBar");
            };
            this._getSettings = function (args) {
                var namespace = args.namespace;
                return _this._host.executeOperation("Environment.getSettings", [namespace]);
            };
            this._openFileEditor = function (args) {
                var contents = args.contents;
                var fileName = args.fileName;
                var isReadOnly = args.isReadOnly;
                return _this._host.executeOperation("Environment.openFileEditor", [fileName, contents, isReadOnly]);
            };
            this._openServerExplorer = function () {
                return _this._host.executeOperation("Environment.openServerExplorer");
            };
            this._openUrl = function (args) {
                var url = args.url;
                return _this._host.executeProviderOperation("Environment.Browser.openUrl", { url: url });
            };
            this._setSettings = function (args) {
                var settings = args.settings;
                return _this._host.executeOperation("Environment.saveSettings", [settings]);
            };
            this._showErrorMessageBox = function (args) {
                var message = args.message;
                return _this._host.executeOperation("Environment.showMessageBox", ["Cloud Explorer has encountered an unexpected error:", message, "error"]);
            };
            this._showInfobarMessage = function (args) {
                var link = args.link;
                var message = args.message;
                return _this._host.executeOperation("Environment.showInfobarMessage", [message, link]);
            };
            this._showMessageBox = function (args) {
                var message = args.message;
                var title = args.title;
                return _this._host.executeOperation("Environment.showMessageBox", [title, message, "warning"]);
            };
            this._themeImages = function () {
                return _this._host.executeOperation("Environment.themeImages");
            };
            this._openPanel = function (args) {
                return _this._panelInteractor.openPanel(args.panelInfo);
            };
            this._openPanelByName = function (args) {
                return _this._panelInteractor.openPanelByName(args.name);
            };
            this._getCurrentPanel = function () {
                return _this._panelInteractor.currentPanel();
            };
            this._resetPanel = function (args) {
                return _this._panelInteractor.resetPanel(args.name);
            };
            this._refreshPanel = function (args) {
                return _this._panelInteractor.refreshPanel();
            };
            this._host = host;
            this._themeProvider = themeProvider;
            this._panelInteractor = panelInteractor;
        }
        return CloudExplorerActions;
    }());
    CloudExplorerActions.closeInfoBarNamespace = "CloudExplorer.Actions.closeInfoBar";
    CloudExplorerActions.getSettingsNamespace = "CloudExplorer.Actions.getSettings";
    CloudExplorerActions.openFileEditorNamespace = "CloudExplorer.Actions.openFileEditor";
    CloudExplorerActions.openServerExplorerNamespace = "CloudExplorer.Actions.openServerExplorer";
    CloudExplorerActions.openUrlNamespace = "CloudExplorer.Actions.openUrl";
    CloudExplorerActions.setSettingsNamespace = "CloudExplorer.Actions.setSettings";
    CloudExplorerActions.showErrorMessageBox = "CloudExplorer.Actions.showErrorMessageBox";
    CloudExplorerActions.showInfobarMessageNamespace = "CloudExplorer.Actions.showInfobarMessageNamespace";
    CloudExplorerActions.showMessageBox = "CloudExplorer.Actions.showMessageBox";
    CloudExplorerActions.themeImagesNamespace = "CloudExplorer.Actions.themeImagesNamespace";
    CloudExplorerActions.getTheme = "CloudExplorer.Actions.getTheme";
    CloudExplorerActions.openPanel = "CloudExplorer.Actions.openPanel";
    CloudExplorerActions.openPanelByName = "CloudExplorer.Actions.openPanelByName";
    CloudExplorerActions.curentPanel = "CloudExplorer.Actions.currentPanel";
    CloudExplorerActions.resetPanel = "CloudExplorer.Actions.resetPanel";
    CloudExplorerActions.refreshPanel = "CloudExplorer.Actions.refreshPanel";
    return CloudExplorerActions;
});

/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "URIjs/URITemplate", "Providers/Common/PollingWebRequestParameters"], function (require, exports, URITemplate, PollingWebRequestParameters) {
    "use strict";
    var AzureGeneralActions = (function () {
        function AzureGeneralActions(azureConnection) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureGeneralActions.postActionNamespace, _this.postAction);
                actionBindingManager.addActionBinding(AzureGeneralActions.deleteActionNamespace, _this.deleteAction);
                actionBindingManager.addActionBinding(AzureGeneralActions.executeActionNamespace, _this.executeAction);
            };
            this.postAction = function (args) {
                args.method = "POST";
                return _this.executeAction(args);
            };
            this.deleteAction = function (args) {
                args.method = "DELETE";
                return _this.executeAction(args);
            };
            /**
             * Executes configurable action
             * Attributes: resourceId, subscription
             * Arguments: apiVersion, resourceAction, method (defaults to "POST")
             */
            this.executeAction = function (args) {
                var subscription = JSON.parse(args.subscription);
                var url = AzureGeneralActions.ActionUriTemplate.expand({
                    apiVersion: args.apiVersion,
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: args.id,
                    resourceAction: args.resourceAction || ""
                });
                if (args.polling) {
                    var parameters = new PollingWebRequestParameters();
                    parameters.url = url.toString();
                    parameters.subscription = subscription;
                    parameters.method = args.method || "POST";
                    parameters.statusType = args.polling.statusType;
                    parameters.initialStatusText = args.polling.initialStatusType;
                    parameters.timeOutInSeconds = args.polling.timeOutInSeconds;
                    return _this._azureConnection.pollingWebRequest(parameters);
                }
                else {
                    return _this._azureConnection.webRequest(url.toString(), subscription, args.method || "POST");
                }
            };
            this._azureConnection = azureConnection;
        }
        return AzureGeneralActions;
    }());
    AzureGeneralActions.deleteActionNamespace = "Azure.Actions.GeneralActions.DeleteAction";
    AzureGeneralActions.executeActionNamespace = "Azure.Actions.GeneralActions.ExecuteAction";
    AzureGeneralActions.postActionNamespace = "Azure.Actions.GeneralActions.PostAction";
    AzureGeneralActions.ActionUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/{+resourceAction}?api-version={+apiVersion}");
    return AzureGeneralActions;
});

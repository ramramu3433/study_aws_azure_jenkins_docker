/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureDocumentDBRequestParameters", "Common/Utilities"], function (require, exports, AzureDocumentDBRequestParameters_1, Utilities) {
    "use strict";
    /**
     * Utils to create a connection to Azure REST APIs
     */
    var AzureConnection = (function () {
        function AzureConnection(host) {
            var _this = this;
            /**
             * Executes a Azure Web Request on the host.
             */
            this.webRequest = function (url, subscription, method, headers, body) {
                return _this._host.executeOperation(AzureConnection.webRequestActionNamespace, [url, subscription, method, headers, body]);
            };
            /**
             * Executes a Azure Web Request on the host that also polls for the operation's completion status.
             */
            this.pollingWebRequest = function (parameters) {
                return _this._host.executeOperation(AzureConnection.pollingWebRequestActionNamespace, [parameters]);
            };
            /**
             * Executes a storage Request on the host.
             */
            this.storageRequest = function (parameters) {
                return _this._host.executeOperation(AzureConnection.storageRequestActionNamespace, [parameters]);
            };
            /**
             * Executes a documentdb Request on the host.
             */
            this.documentdbRequest = function (requestNamespace, endpointUrl, masterKey, resourceSelfLink, continuationToken) {
                if (Utilities.isRunningOnElectron()) {
                    var parameters = new AzureDocumentDBRequestParameters_1.default();
                    parameters.requestNamespace = requestNamespace;
                    parameters.endpointUrl = endpointUrl;
                    parameters.resourceSelfLink = resourceSelfLink;
                    parameters.masterKey = masterKey;
                    parameters.continuationToken = continuationToken;
                    return _this._host.executeOperation(AzureConnection.documentDBRequestActionNamespace, [parameters]);
                }
                else {
                    return _this._host.executeOperation(AzureConnection.documentDBRequestActionNamespace, [requestNamespace, endpointUrl, masterKey, resourceSelfLink, continuationToken]);
                }
            };
            /**
             * Executes a Azure Web Request on the host.
             */
            this.keyVaultRequest = function (domainUrl, url, subscription, method, headers, body) {
                var azureKeyVaultInfo = {
                    domainUrl: domainUrl,
                    requestUrl: url
                };
                return _this._host.executeOperation(AzureConnection.keyVaultRequestActionNamespace, [azureKeyVaultInfo, subscription, method, headers, body]);
            };
            /**
             * Executes a Azure Web Request on the host.
             */
            this.getAccountUniqueId = function (subscription) {
                return _this._host.executeOperation(AzureConnection.getAccountUniqueIdActionNamespace, [subscription]);
            };
            /**
             * Gets the Azure Subscriptions registered on the host.
             */
            this.getSelectedSubscriptions = function () {
                return _this._host.executeOperation(AzureConnection.getSelectedAzureSubscriptionsNamespace);
            };
            /**
             * Gets the Azure account selected by the user.
             */
            this.getSelectedAzureAccount = function () {
                return _this._host.executeOperation(AzureConnection.getSelectedAzureAccountNamespace);
            };
            /**
             * Gets the Azure Subscriptions registered on the host for the given account.
             */
            this.getSubscriptions = function (account) {
                return _this._host.executeOperation(AzureConnection.getSubscriptionsNamespace, [account]);
            };
            this._host = host;
        }
        return AzureConnection;
    }());
    /**
     * Azure Host WebRequest action namespace
     */
    AzureConnection.webRequestActionNamespace = "Azure.webRequest";
    /**
     * Azure Host PollingWebRequest action namespace
     */
    AzureConnection.pollingWebRequestActionNamespace = "Azure.pollingWebRequest";
    /**
     * Azure Host storageRequest action namespace
     */
    AzureConnection.storageRequestActionNamespace = "Azure.Actions.Storage.storageRequest";
    AzureConnection.keyVaultRequestActionNamespace = "Azure.keyVaultWebRequest";
    AzureConnection.getAccountUniqueIdActionNamespace = "Azure.getAccountUniqueId";
    /**
     * Azure Host documentDBRequest action namespace
     */
    AzureConnection.documentDBRequestActionNamespace = "Azure.documentDBRequest";
    /**
     * Azure Host GetSubscriptions action namespace
     */
    AzureConnection.getSubscriptionsNamespace = "Azure.getSubscriptions";
    /**
     * Host getSelectedAzureSubscriptions operation namespace.
     */
    AzureConnection.getSelectedAzureSubscriptionsNamespace = "Azure.getSelectedSubscriptions";
    /**
     * Host getSelectedAzureAccount operation namespace.
     */
    AzureConnection.getSelectedAzureAccountNamespace = "Azure.getSelectedAccount";
    return AzureConnection;
});
